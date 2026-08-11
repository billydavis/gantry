import { useState } from 'react';
import { Alert, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { TriangleAlert } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { projectsApi, projectKeys } from './api';
import type { Project } from './types';

interface Props {
  opened: boolean;
  onClose: () => void;
  project: Project | undefined;
}

export function DeleteProjectModal({ opened, onClose, project }: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [confirmation, setConfirmation] = useState('');

  const mutation = useMutation({
    mutationFn: () => projectsApi.deleteForever(project!.id, confirmation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      notifications.show({ message: 'Project permanently deleted', color: 'green' });
      handleClose();
      navigate('/projects');
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiError ? error.message : 'Failed to delete project';
      notifications.show({ message, color: 'red' });
    },
  });

  function handleClose() {
    setConfirmation('');
    onClose();
  }

  if (!project) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Delete Project Forever"
      size="md"
      styles={{
        content: { background: 'var(--g-surface)' },
        header: { background: 'var(--g-surface)', borderBottom: '1px solid var(--g-border)' },
        title: { color: 'var(--g-heading)', fontWeight: 600 },
      }}
    >
      <Stack gap="md" pt="sm">
        <Alert color="red" icon={<TriangleAlert size={18} />}>
          This permanently deletes this project and all its todos, resources, notes, and wins. This
          cannot be undone.
        </Alert>

        <Text size="sm" style={{ color: 'var(--g-text)' }}>
          Type <Text span fw={700}>{project.name}</Text> to confirm.
        </Text>

        <TextInput
          value={confirmation}
          onChange={(e) => setConfirmation(e.currentTarget.value)}
          placeholder={project.name}
          styles={{
            input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' },
          }}
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={handleClose} style={{ color: 'var(--g-text-muted)' }}>Cancel</Button>
          <Button
            color="red"
            disabled={confirmation !== project.name}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Delete Forever
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
