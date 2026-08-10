import { useState } from 'react';
import { ActionIcon, Box, Button, Group, Loader, Modal, Stack, Text, Tooltip } from '@mantine/core';
import { StickyNote, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { noteKeys, notesApi } from './api';
import type { Note } from './types';

interface Props {
  projectId: string;
  onEdit: (note: Note) => void;
}

function noteLabel(note: Note): string {
  return note.title
    ?? (note.date
      ? new Date(note.date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Untitled');
}

export function ProjectNotesList({ projectId, onEdit }: Props) {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: noteKeys.list({ projectId }),
    queryFn: () => notesApi.list({ projectId }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => notesApi.delete(deleteTarget!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.list({ projectId }) });
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      setDeleteTarget(null);
    },
  });

  if (isLoading) return <Loader size="xs" />;

  if (notes.length === 0) return <Text size="sm" c="dimmed">No notes yet.</Text>;

  return (
    <>
      <Box style={{ background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 8, overflow: 'hidden' }}>
        {notes.map((note, i) => (
          <Box
            key={note.id}
            onClick={() => onEdit(note)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
              borderBottom: i < notes.length - 1 ? '1px solid var(--g-border)' : 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--g-background)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <StickyNote size={15} style={{ color: 'var(--g-accent)', flexShrink: 0 }} />
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={500} style={{ color: 'var(--g-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {noteLabel(note)}
              </Text>
              <Text size="xs" c="dimmed">
                Updated {new Date(note.updatedUtc).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
            </Box>
            <Tooltip label="Delete">
              <ActionIcon variant="subtle" size="sm" color="red"
                onClick={(e) => { e.stopPropagation(); setDeleteTarget(note); }}>
                <Trash2 size={13} />
              </ActionIcon>
            </Tooltip>
          </Box>
        ))}
      </Box>

      <Modal
        opened={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
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
            Delete "{deleteTarget ? noteLabel(deleteTarget) : ''}"? This can't be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setDeleteTarget(null)} style={{ color: 'var(--g-text-muted)' }}>
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
