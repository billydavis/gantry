import { Box, Breadcrumbs, Loader, Stack, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { noteKeys, notesApi } from './api';
import { NoteEditor } from './NoteEditor';

export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: note, isLoading } = useQuery({
    queryKey: noteKeys.detail(id!),
    queryFn: () => notesApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) return <Loader size="sm" />;
  if (!note) return <Text c="dimmed">Note not found.</Text>;

  const title = note.title ?? (note.date ? new Date(note.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Note');

  return (
    <Stack gap="md">
      <Breadcrumbs styles={{ breadcrumb: { color: 'var(--g-text-muted)', fontSize: 13 } }}>
        {note.projectId && (
          <Text component={Link} to={`/projects/${note.projectId}`} size="sm"
            style={{ color: 'var(--g-text-muted)', textDecoration: 'none' }}>
            {note.projectName}
          </Text>
        )}
        <Text size="sm" style={{ color: 'var(--g-text)' }}>{title}</Text>
      </Breadcrumbs>

      <Box>
        <Title order={2} style={{ color: 'var(--g-heading)' }}>{title}</Title>
        {note.projectName && (
          <Text size="sm" style={{ color: 'var(--g-text-muted)' }}>{note.projectName}</Text>
        )}
      </Box>

      <NoteEditor noteId={note.id} initialContent={note.content} minHeight={560} />
    </Stack>
  );
}
