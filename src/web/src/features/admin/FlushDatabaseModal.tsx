import { useState } from 'react';
import { Alert, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { TriangleAlert } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { adminApi, FLUSH_CONFIRMATION_PHRASE } from './api';
import { useRecentProjects } from '../../hooks/useRecentProjects';

interface Props {
  opened: boolean;
  onClose: () => void;
}

export function FlushDatabaseModal({ opened, onClose }: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { clear: clearRecentProjects } = useRecentProjects();
  const [confirmation, setConfirmation] = useState('');

  const mutation = useMutation({
    mutationFn: () => adminApi.flushDatabase(confirmation),
    onSuccess: () => {
      clearRecentProjects();
      queryClient.invalidateQueries();
      notifications.show({ message: 'Database flushed', color: 'green' });
      handleClose();
      navigate('/');
    },
  });

  function handleClose() {
    setConfirmation('');
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Flush Database"
      size="md"
      styles={{
        content: { background: 'var(--g-surface)' },
        header: { background: 'var(--g-surface)', borderBottom: '1px solid var(--g-border)' },
        title: { color: 'var(--g-heading)', fontWeight: 600 },
      }}
    >
      <Stack gap="md" pt="sm">
        <Alert color="red" icon={<TriangleAlert size={18} />}>
          This permanently deletes all projects, todos, resources, notes, wins, and tags. This cannot be undone.
        </Alert>

        <Text size="sm" style={{ color: 'var(--g-text)' }}>
          Type <Text span fw={700}>{FLUSH_CONFIRMATION_PHRASE}</Text> to confirm.
        </Text>

        <TextInput
          value={confirmation}
          onChange={(e) => setConfirmation(e.currentTarget.value)}
          placeholder={FLUSH_CONFIRMATION_PHRASE}
          styles={{
            input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' },
          }}
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={handleClose} style={{ color: 'var(--g-text-muted)' }}>Cancel</Button>
          <Button
            color="red"
            disabled={confirmation !== FLUSH_CONFIRMATION_PHRASE}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Flush Database
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
