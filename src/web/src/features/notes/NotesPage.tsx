import { useState } from 'react';
import { ActionIcon, Badge, Box, Button, Group, Loader, Modal, Stack, Text, Title, Tooltip } from '@mantine/core';
import { CalendarDays, Pencil, Plus, NotebookText, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { noteKeys, notesApi } from './api';
import { useCreateNote } from './useCreateNote';
import type { Note } from './types';
import { TagBadge } from '../tags/TagBadge';
import { MarkdownViewerModal } from '../../components/MarkdownViewerModal';
import { ExpandableDescription } from '../../components/ExpandableDescription';

function noteLabel(note: Note): string {
  return note.title
    ?? (note.date
      ? new Date(note.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
      : 'Untitled note');
}

export function NotesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { createNote } = useCreateNote();
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [viewTarget, setViewTarget] = useState<Note | null>(null);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: noteKeys.lists(),
    queryFn: () => notesApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: () => notesApi.delete(deleteTarget!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      setDeleteTarget(null);
    },
  });

  const goToToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    navigate(`/notes/daily/${today}`);
  };

  return (
    <>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <NotebookText size={22} style={{ color: 'var(--g-heading)' }} />
            <Title order={2} style={{ color: 'var(--g-heading)' }}>Notes</Title>
          </Group>
          <Group gap="xs">
            <Button
              variant="default"
              leftSection={<CalendarDays size={16} />}
              onClick={goToToday}
              style={{ background: 'var(--g-surface)', color: 'var(--g-text)', border: '1px solid var(--g-border)' }}
            >
              Today's Daily Note
            </Button>
            <Button
              leftSection={<Plus size={16} />}
              onClick={() => createNote(undefined)}
              style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}
            >
              New Note
            </Button>
          </Group>
        </Group>

        {isLoading && <Loader size="sm" />}

        {!isLoading && notes.length === 0 && (
          <Box style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 8,
          }}>
            <NotebookText size={40} style={{ color: 'var(--g-text-muted)', marginBottom: 12 }} />
            <Text fw={500} style={{ color: 'var(--g-text)' }}>No notes yet</Text>
            <Text size="sm" c="dimmed" mb="md">
              Jot down a quick thought, or start today's daily note.
            </Text>
            <Button onClick={() => createNote(undefined)} style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}>
              Write your first note
            </Button>
          </Box>
        )}

        <Stack gap="sm">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => navigate(`/notes/${note.id}`)}
              onDelete={() => setDeleteTarget(note)}
              onView={() => setViewTarget(note)}
            />
          ))}
        </Stack>
      </Stack>

      <MarkdownViewerModal
        opened={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title={viewTarget ? noteLabel(viewTarget) : ''}
        content={viewTarget?.content ?? ''}
        icon={<NotebookText size={18} style={{ color: 'var(--g-accent)' }} />}
        onOpenEditor={() => viewTarget && navigate(`/notes/${viewTarget.id}`)}
      />

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

function NoteCard({ note, onEdit, onDelete, onView }: { note: Note; onEdit: () => void; onDelete: () => void; onView: () => void }) {
  return (
    <Box
      onClick={onView}
      style={{
        background: 'var(--g-surface)', border: '1px solid var(--g-border)',
        borderRadius: 6, padding: '10px 14px', cursor: 'pointer',
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group gap="sm" align="flex-start" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <NotebookText size={18} style={{ color: 'var(--g-accent)', flexShrink: 0, marginTop: 2 }} />
          <Stack gap={4} style={{ minWidth: 0 }}>
            <Group gap={6} align="center">
              <Text fw={600} style={{ color: 'var(--g-text)', wordBreak: 'break-word' }}>{noteLabel(note)}</Text>
              {note.date && (
                <Badge
                  size="sm"
                  styles={{ root: { background: 'var(--g-background)', color: 'var(--g-text-muted)', border: '1px solid var(--g-border)' } }}
                >
                  Daily
                </Badge>
              )}
            </Group>
            {note.projectName && (
              <Text size="xs" style={{ color: 'var(--g-text-muted)' }}>{note.projectName}</Text>
            )}
            {note.content && <ExpandableDescription content={note.content} />}
            {note.tags.length > 0 && (
              <Group gap={4} wrap="wrap" onClick={(e) => e.stopPropagation()}>
                {note.tags.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
              </Group>
            )}
          </Stack>
        </Group>
        <Group gap={4}>
          <Tooltip label="Edit">
            <ActionIcon variant="subtle" onClick={(e) => { e.stopPropagation(); onEdit(); }} style={{ color: 'var(--g-text-muted)' }}>
              <Pencil size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon variant="subtle" color="red" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
              <Trash2 size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Box>
  );
}
