import { Loader, Stack, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { noteKeys, notesApi } from './api';
import { NoteEditor } from './NoteEditor';

export function ScratchPadPage() {
  const { data: note, isLoading } = useQuery({
    queryKey: noteKeys.scratchpad(),
    queryFn: notesApi.getScratchPad,
  });

  return (
    <Stack gap="md">
      <div>
        <Title order={2} style={{ color: 'var(--g-heading)' }}>Scratch Pad</Title>
        <Text size="sm" style={{ color: 'var(--g-text-muted)' }}>
          A place for transient content — SQL snippets, regex patterns, connection strings, random URLs. Autosaves.
        </Text>
      </div>

      {isLoading || !note ? (
        <Loader size="sm" />
      ) : (
        <NoteEditor noteId={note.id} initialContent={note.content} minHeight={600} />
      )}
    </Stack>
  );
}
