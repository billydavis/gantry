import { useState } from 'react';
import { ActionIcon, Badge, Box, Group, Loader, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconCheck, IconChevronLeft, IconChevronRight, IconTrophy } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { winKeys, winsApi } from './api';
import type { TimelineItem } from './types';

export function TimelinePage() {
  const navigate = useNavigate();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: items = [], isLoading } = useQuery({
    queryKey: winKeys.timeline(year, month),
    queryFn: () => winsApi.timeline(year, month),
  });

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const wins = items.filter(i => i.type === 'Win');
  const todos = items.filter(i => i.type === 'Todo');

  const grouped = groupByDay(items);

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={2} style={{ color: 'var(--g-heading)' }}>Timeline</Title>
        <Group gap="xs" align="center">
          <Tooltip label="Previous month">
            <ActionIcon variant="subtle" onClick={prevMonth} style={{ color: 'var(--g-text-muted)' }}>
              <IconChevronLeft size={18} />
            </ActionIcon>
          </Tooltip>
          <Text fw={600} style={{ color: 'var(--g-text)', minWidth: 160, textAlign: 'center' }}>
            {monthLabel}
          </Text>
          <Tooltip label="Next month">
            <ActionIcon variant="subtle" onClick={nextMonth} disabled={isCurrentMonth} style={{ color: 'var(--g-text-muted)' }}>
              <IconChevronRight size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Summary row */}
      <Group gap="md">
        <Box style={{ background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 8, padding: '10px 16px' }}>
          <Text size="xs" c="dimmed">Wins</Text>
          <Text fw={700} size="lg" style={{ color: 'var(--g-accent)' }}>{wins.length}</Text>
        </Box>
        <Box style={{ background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 8, padding: '10px 16px' }}>
          <Text size="xs" c="dimmed">Todos Completed</Text>
          <Text fw={700} size="lg" style={{ color: 'var(--g-success)' }}>{todos.length}</Text>
        </Box>
      </Group>

      {isLoading && <Loader size="sm" />}

      {!isLoading && items.length === 0 && (
        <Box style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 8,
        }}>
          <Text fw={500} style={{ color: 'var(--g-text)' }}>Nothing recorded this month</Text>
          <Text size="sm" c="dimmed">Complete todos or log wins to see them here.</Text>
        </Box>
      )}

      <Stack gap="xl">
        {grouped.map(({ dateLabel, items: dayItems }) => (
          <Box key={dateLabel}>
            <Text size="sm" fw={600} mb="xs" style={{ color: 'var(--g-text-muted)' }}>{dateLabel}</Text>
            <Box style={{ borderLeft: '2px solid var(--g-border)', paddingLeft: 16 }}>
              <Stack gap="sm">
                {dayItems.map((item) => (
                  <TimelineRow
                    key={`${item.type}-${item.id}`}
                    item={item}
                    onNavigate={() => item.type === 'Win'
                      ? navigate('/wins')
                      : navigate('/')}
                  />
                ))}
              </Stack>
            </Box>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}

function TimelineRow({ item, onNavigate }: { item: TimelineItem; onNavigate: () => void }) {
  const isWin = item.type === 'Win';
  return (
    <Box
      onClick={onNavigate}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 14px',
        background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 6,
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--g-background)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--g-surface)')}
    >
      <Box style={{ paddingTop: 2 }}>
        {isWin
          ? <IconTrophy size={16} style={{ color: 'var(--g-accent)' }} />
          : <IconCheck size={16} style={{ color: 'var(--g-success)' }} />
        }
      </Box>
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text size="sm" fw={500} style={{ color: 'var(--g-text)' }}>{item.title}</Text>
        {item.impact && (
          <Text size="xs" style={{ color: 'var(--g-text-muted)', fontStyle: 'italic' }}>{item.impact}</Text>
        )}
        {item.projectName && (
          <Text size="xs" c="dimmed">{item.projectName}</Text>
        )}
      </Stack>
      <Badge size="xs" variant="light" color={isWin ? 'yellow' : 'green'}>
        {isWin ? 'Win' : 'Done'}
      </Badge>
    </Box>
  );
}

function groupByDay(items: TimelineItem[]): { dateLabel: string; items: TimelineItem[] }[] {
  const map = new Map<string, TimelineItem[]>();
  for (const item of items) {
    const d = new Date(item.date + 'T12:00:00');
    const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(item);
  }
  return Array.from(map.entries()).map(([dateLabel, items]) => ({ dateLabel, items }));
}
