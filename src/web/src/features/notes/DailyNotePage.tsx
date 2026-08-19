import { ActionIcon, Box, Button, Group, Loader, Stack, Text, Title, Tooltip } from '@mantine/core';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { noteKeys, notesApi } from './api';
import { NoteEditor } from './NoteEditor';
import { useCreateNote } from './useCreateNote';
import { SaveStatusText } from './SaveStatusText';
import { useNoteAutosave } from './useNoteAutosave';

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function offsetDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return toDateString(d);
}

function formatHeading(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function DailyNotePage() {
  const { date } = useParams<{ date?: string }>();
  const navigate = useNavigate();
  const today = toDateString(new Date());
  const activeDate = date ?? today;
  const { createNote } = useCreateNote();

  const { data: note, isLoading } = useQuery({
    queryKey: noteKeys.daily(activeDate),
    queryFn: () => notesApi.getDaily(activeDate),
  });

  const prev = () => navigate(`/notes/daily/${offsetDate(activeDate, -1)}`);
  const next = () => navigate(`/notes/daily/${offsetDate(activeDate, 1)}`);
  const isToday = activeDate === today;

  const { content, setContent, status } = useNoteAutosave(note);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Box>
          <Title order={2} style={{ color: 'var(--g-heading)' }}>Daily Note</Title>
          <Text size="sm" style={{ color: 'var(--g-text-muted)' }}>{formatHeading(activeDate)}</Text>
        </Box>
        <Group gap="xs">
          <Button
            leftSection={<Plus size={14} />}
            variant="subtle"
            size="sm"
            onClick={() => createNote(undefined)}
            style={{ color: 'var(--g-text-muted)' }}
          >
            New Note
          </Button>
          <Tooltip label="Previous day">
            <ActionIcon variant="subtle" onClick={prev} style={{ color: 'var(--g-text-muted)' }}>
              <ChevronLeft size={18} />
            </ActionIcon>
          </Tooltip>
          {!isToday && (
            <Tooltip label="Go to today">
              <Text
                size="sm"
                style={{ color: 'var(--g-accent)', cursor: 'pointer' }}
                onClick={() => navigate('/notes')}
              >
                Today
              </Text>
            </Tooltip>
          )}
          <Tooltip label="Next day">
            <ActionIcon variant="subtle" onClick={next} style={{ color: 'var(--g-text-muted)' }}>
              <ChevronRight size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {isLoading || !note ? (
        <Loader size="sm" />
      ) : (
        <>
          <NoteEditor value={content} onChange={setContent} minHeight={580} />
          <SaveStatusText status={status} />
        </>
      )}
    </Stack>
  );
}
