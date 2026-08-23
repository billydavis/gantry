import { useState } from 'react';
import {
  ActionIcon, Badge, Box, Button, Group, Loader, Stack, Text, Title, Tooltip,
} from '@mantine/core';
import { Pencil, Plus, Trash2, Trophy } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { winKeys, winsApi } from './api';
import { WinFormModal } from './WinFormModal';
import { WinViewerModal } from './WinViewerModal';
import type { Win } from './types';
import { TagPicker } from '../tags/TagPicker';
import { ExpandableDescription } from '../../components/ExpandableDescription';

export function WinsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Win | undefined>();
  const [viewingWinId, setViewingWinId] = useState<string | null>(null);

  const { data: wins = [], isLoading } = useQuery({
    queryKey: winKeys.list(),
    queryFn: () => winsApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: winsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: winKeys.lists() }),
  });

  const openCreate = () => { setEditing(undefined); setModalOpen(true); };
  const openEdit = (win: Win) => { setEditing(win); setModalOpen(true); };

  const grouped = groupByMonth(wins);

  return (
    <>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2} style={{ color: 'var(--g-heading)' }}>Wins</Title>
          <Button
            leftSection={<Plus size={16} />}
            onClick={openCreate}
            style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}
          >
            Log Win
          </Button>
        </Group>

        {isLoading && <Loader size="sm" />}

        {!isLoading && wins.length === 0 && (
          <Box style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 8,
          }}>
            <Trophy size={40} style={{ color: 'var(--g-text-muted)', marginBottom: 12 }} />
            <Text fw={500} style={{ color: 'var(--g-text)' }}>No wins logged yet</Text>
            <Text size="sm" c="dimmed" mb="md">
              Start capturing your accomplishments — they add up fast.
            </Text>
            <Button onClick={openCreate} style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}>
              Log your first win
            </Button>
          </Box>
        )}

        {grouped.map(({ label, wins: monthWins }) => (
          <Stack key={label} gap="sm">
            <Group gap="xs" align="center">
              <Text fw={600} size="sm" tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
                {label}
              </Text>
              <Badge
                size="sm"
                styles={{ root: { background: 'var(--g-background)', color: 'var(--g-text-muted)', border: '1px solid var(--g-border)' } }}
              >
                {monthWins.length}
              </Badge>
            </Group>
            <Stack gap="sm">
              {monthWins.map((win) => (
                <WinCard
                  key={win.id}
                  win={win}
                  onView={() => setViewingWinId(win.id)}
                  onEdit={() => openEdit(win)}
                  onDelete={() => deleteMutation.mutate(win.id)}
                />
              ))}
            </Stack>
          </Stack>
        ))}
      </Stack>

      <WinFormModal
        opened={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(undefined); }}
        win={editing}
      />
      <WinViewerModal
        winId={viewingWinId}
        onClose={() => setViewingWinId(null)}
        onOpenEditor={(win) => { setEditing(win); setModalOpen(true); }}
      />
    </>
  );
}

function WinCard({ win, onView, onEdit, onDelete }: { win: Win; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const queryClient = useQueryClient();
  const date = new Date(win.date + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });

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
          <Trophy size={18} style={{ color: 'var(--g-accent)', flexShrink: 0, marginTop: 2 }} />
          <Stack gap={4} style={{ minWidth: 0 }}>
            <Text fw={600} style={{ color: 'var(--g-text)', wordBreak: 'break-word' }}>{win.title}</Text>
            {win.impact && <ExpandableDescription content={win.impact} />}
            {win.description && (
              <Box style={{ marginTop: 4 }}>
                <ExpandableDescription content={win.description} />
              </Box>
            )}
            <Group gap="xs" mt={4}>
              <Text size="xs" c="dimmed">{date}</Text>
              {win.projectName && (
                <>
                  <Text size="xs" c="dimmed">·</Text>
                  <Text size="xs" c="dimmed">{win.projectName}</Text>
                </>
              )}
            </Group>
            <Box onClick={(e) => e.stopPropagation()}>
              <TagPicker
                selectedTags={win.tags}
                entityType="wins"
                entityId={win.id}
                onChanged={() => queryClient.invalidateQueries({ queryKey: winKeys.lists() })}
              />
            </Box>
          </Stack>
        </Group>
        <Group gap={4} style={{ flexShrink: 0 }}>
          <Tooltip label="Edit">
            <ActionIcon variant="subtle" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(); }} style={{ color: 'var(--g-text-muted)' }}>
              <Pencil size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon variant="subtle" size="sm" color="red" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
              <Trash2 size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Box>
  );
}

function groupByMonth(wins: Win[]): { label: string; wins: Win[] }[] {
  const map = new Map<string, Win[]>();
  for (const win of wins) {
    const d = new Date(win.date + 'T12:00:00');
    const label = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(win);
  }
  return Array.from(map.entries()).map(([label, wins]) => ({ label, wins }));
}
