import { useState } from 'react';
import { ActionIcon, Box, Breadcrumbs, Button, Group, Loader, Modal, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { noteKeys, notesApi } from './api';
import { NoteEditor } from './NoteEditor';

export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: note, isLoading } = useQuery({
    queryKey: noteKeys.detail(id!),
    queryFn: () => notesApi.getById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => notesApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      navigate('/notes');
    },
  });

  if (isLoading) return <Loader size="sm" />;
  if (!note) return <Text c="dimmed">Note not found.</Text>;

  const title = note.title ?? (note.date ? new Date(note.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Note');

  return (
    <>
      <Stack gap="md">
        <Breadcrumbs styles={{ breadcrumb: { color: 'var(--g-text-muted)', fontSize: 13 } }}>
          <Text component={Link} to="/notes" size="sm" style={{ color: 'var(--g-text-muted)', textDecoration: 'none' }}>
            Notes
          </Text>
          {note.projectId && (
            <Text component={Link} to={`/projects/${note.projectId}`} size="sm"
              style={{ color: 'var(--g-text-muted)', textDecoration: 'none' }}>
              {note.projectName}
            </Text>
          )}
          <Text size="sm" style={{ color: 'var(--g-text)' }}>{title}</Text>
        </Breadcrumbs>

        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={2} style={{ color: 'var(--g-heading)' }}>{title}</Title>
            {note.projectName && (
              <Text size="sm" style={{ color: 'var(--g-text-muted)' }}>{note.projectName}</Text>
            )}
          </Box>
          <Tooltip label="Delete">
            <ActionIcon variant="subtle" color="red" onClick={() => setDeleteOpen(true)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <NoteEditor noteId={note.id} initialContent={note.content} minHeight={560} />
      </Stack>

      <Modal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete note"
        size="sm"
        styles={{
          content: { background: 'var(--g-surface)' },
          header: { background: 'var(--g-surface)', borderBottom: '1px solid var(--g-border)' },
          title: { color: 'var(--g-heading)', fontWeight: 600 },
        }}
      >
        <Stack gap="md" pt="sm">
          <Text size="sm" style={{ color: 'var(--g-text)' }}>
            Delete "{title}"? This can't be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setDeleteOpen(false)} style={{ color: 'var(--g-text-muted)' }}>
              Cancel
            </Button>
            <Button color="red" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
