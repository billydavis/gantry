import { useState } from 'react';
import { Alert, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { backupsApi, RESTORE_CONFIRMATION_PHRASE } from './api';
import type { BackupSummary } from './types';
import { useRecentProjects } from '../../hooks/useRecentProjects';

interface Props {
  backup: BackupSummary | null;
  currentMigrationVersion: string | null;
  onClose: () => void;
}

export function RestoreBackupModal({ backup, currentMigrationVersion, onClose }: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { clear: clearRecentProjects } = useRecentProjects();
  const [confirmation, setConfirmation] = useState('');

  const mutation = useMutation({
    mutationFn: () => backupsApi.restore(backup!.id, confirmation),
    onSuccess: () => {
      clearRecentProjects();
      queryClient.invalidateQueries();
      notifications.show({ message: 'Database restored', color: 'green' });
      handleClose();
      navigate('/');
    },
  });

  function handleClose() {
    setConfirmation('');
    onClose();
  }

  const versionMismatch = backup !== null && backup.migrationVersion !== currentMigrationVersion;

  return (
    <Modal
      opened={backup !== null}
      onClose={handleClose}
      title="Restore Backup"
      size="md"
      styles={{
        content: { background: 'var(--g-surface)' },
        header: { background: 'var(--g-surface)', borderBottom: '1px solid var(--g-border)' },
        title: { color: 'var(--g-heading)', fontWeight: 600 },
      }}
    >
      {backup && (
        <Stack gap="md" pt="sm">
          <Text size="sm" style={{ color: 'var(--g-text)' }}>
            Restoring <Text span fw={700}>{backup.label ?? backup.fileName}</Text> from{' '}
            {new Date(backup.createdUtc).toLocaleString()}.
          </Text>

          {versionMismatch && (
            <Alert color="yellow" icon={<IconAlertTriangle size={18} />}>
              This backup was taken at migration version{' '}
              <Text span fw={700}>{backup.migrationVersion ?? 'unknown'}</Text>; the app is currently at{' '}
              <Text span fw={700}>{currentMigrationVersion ?? 'unknown'}</Text>. After restoring, pending
              migrations will run automatically to bring the schema up to date — this is normally safe, but
              consider taking a fresh backup of the current database first if you're unsure.
            </Alert>
          )}

          <Alert color="red" icon={<IconAlertTriangle size={18} />}>
            This replaces all current data with the contents of this backup and cannot be undone. The app will
            be briefly unavailable while the restore runs.
          </Alert>

          <Text size="sm" style={{ color: 'var(--g-text)' }}>
            Type <Text span fw={700}>{RESTORE_CONFIRMATION_PHRASE}</Text> to confirm.
          </Text>

          <TextInput
            value={confirmation}
            onChange={(e) => setConfirmation(e.currentTarget.value)}
            placeholder={RESTORE_CONFIRMATION_PHRASE}
            styles={{
              input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' },
            }}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" onClick={handleClose} disabled={mutation.isPending} style={{ color: 'var(--g-text-muted)' }}>Cancel</Button>
            <Button
              color="red"
              disabled={confirmation !== RESTORE_CONFIRMATION_PHRASE}
              loading={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              Restore Database
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
