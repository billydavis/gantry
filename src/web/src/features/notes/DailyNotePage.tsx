import { useState } from 'react';
import { ActionIcon, Box, Button, Group, Loader, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { noteKeys, notesApi } from './api';
import { NoteEditor } from './NoteEditor';
import { NoteDrawer } from './NoteDrawer';

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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: note, isLoading } = useQuery({
    queryKey: noteKeys.daily(activeDate),
    queryFn: () => notesApi.getDaily(activeDate),
  });

  const prev = () => navigate(`/notes/daily/${offsetDate(activeDate, -1)}`);
  const next = () => navigate(`/notes/daily/${offsetDate(activeDate, 1)}`);
  const isToday = activeDate === today;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Box>
          <Title order={2} style={{ color: 'var(--g-heading)' }}>Daily Note</Title>
          <Text size="sm" style={{ color: 'var(--g-text-muted)' }}>{formatHeading(activeDate)}</Text>
        </Box>
        <Group gap="xs">
          <Button
            leftSection={<IconPlus size={14} />}
            variant="subtle"
            size="sm"
            onClick={() => setDrawerOpen(true)}
            style={{ color: 'var(--g-text-muted)' }}
          >
            New Note
          </Button>
          <Tooltip label="Previous day">
            <ActionIcon variant="subtle" onClick={prev} style={{ color: 'var(--g-text-muted)' }}>
              <IconChevronLeft size={18} />
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
              <IconChevronRight size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {isLoading || !note ? (
        <Loader size="sm" />
      ) : (
        <NoteEditor noteId={note.id} initialContent={note.content} minHeight={580} />
      )}

      <NoteDrawer opened={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Stack>
  );
}
