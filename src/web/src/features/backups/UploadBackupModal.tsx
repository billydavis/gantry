import { useState } from 'react';
import { Button, FileInput, Group, Modal, Stack, TextInput } from '@mantine/core';
import { FileUp } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { backupsApi } from './api';

interface Props {
  opened: boolean;
  onClose: () => void;
}

export function UploadBackupModal({ opened, onClose }: Props) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState('');

  const mutation = useMutation({
    mutationFn: () => backupsApi.upload(file!, label || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      notifications.show({ message: 'Backup uploaded', color: 'green' });
      handleClose();
    },
  });

  function handleClose() {
    setFile(null);
    setLabel('');
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Upload Backup"
      size="md"
      styles={{
        content: { background: 'var(--g-surface)' },
        header: { background: 'var(--g-surface)', borderBottom: '1px solid var(--g-border)' },
        title: { color: 'var(--g-heading)', fontWeight: 600 },
      }}
    >
      <Stack gap="md" pt="sm">
        <FileInput
          label="Backup file"
          description="A .dump file produced by pg_dump (custom format)."
          placeholder="Choose file"
          accept=".dump"
          value={file}
          onChange={setFile}
          leftSection={<FileUp size={16} />}
          styles={{
            input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' },
          }}
        />
        <TextInput
          label="Label"
          description="Optional, shown in the backups list."
          placeholder="e.g. Before v2 upgrade"
          value={label}
          onChange={(e) => setLabel(e.currentTarget.value)}
          styles={{
            input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' },
          }}
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={handleClose} style={{ color: 'var(--g-text-muted)' }}>Cancel</Button>
          <Button
            disabled={!file}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
            style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}
          >
            Upload
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
