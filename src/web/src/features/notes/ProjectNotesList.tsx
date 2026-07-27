import { ActionIcon, Box, Loader, Text, Tooltip } from '@mantine/core';
import { IconNote, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { noteKeys, notesApi } from './api';
import type { Note } from './types';

interface Props {
  projectId: string;
  onEdit: (note: Note) => void;
}

export function ProjectNotesList({ projectId, onEdit }: Props) {
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: noteKeys.list({ projectId }),
    queryFn: () => notesApi.list({ projectId }),
  });

  const deleteMutation = useMutation({
    mutationFn: notesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: noteKeys.list({ projectId }) }),
    onError: (err: Error) => notifications.show({ message: err.message, color: 'red' }),
  });

  if (isLoading) return <Loader size="xs" />;

  if (notes.length === 0) return <Text size="sm" c="dimmed">No notes yet.</Text>;

  return (
    <Box style={{ background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 8, overflow: 'hidden' }}>
      {notes.map((note, i) => {
        const label = note.title
          ?? (note.date
            ? new Date(note.date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Untitled');
        return (
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
            <IconNote size={15} style={{ color: 'var(--g-accent)', flexShrink: 0 }} />
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={500} style={{ color: 'var(--g-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {label}
              </Text>
              <Text size="xs" c="dimmed">
                Updated {new Date(note.updatedUtc).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
            </Box>
            <Tooltip label="Delete">
              <ActionIcon variant="subtle" size="sm" color="red"
                onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(note.id); }}>
                <IconTrash size={13} />
              </ActionIcon>
            </Tooltip>
          </Box>
        );
      })}
    </Box>
  );
}
