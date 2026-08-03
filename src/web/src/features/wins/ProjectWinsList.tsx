import { ActionIcon, Box, Loader, Text, Tooltip } from '@mantine/core';
import { IconTrophy, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { winKeys, winsApi } from './api';
import type { Win } from './types';

interface Props {
  projectId: string;
  onEdit: (win: Win) => void;
}

export function ProjectWinsList({ projectId, onEdit }: Props) {
  const queryClient = useQueryClient();

  const { data: wins = [], isLoading } = useQuery({
    queryKey: winKeys.list({ projectId }),
    queryFn: () => winsApi.list({ projectId }),
  });

  const deleteMutation = useMutation({
    mutationFn: winsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: winKeys.list({ projectId }) }),
  });

  if (isLoading) return <Loader size="xs" />;
  if (wins.length === 0) return <Text size="sm" c="dimmed">No wins logged for this project yet.</Text>;

  return (
    <Box style={{ background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 8, overflow: 'hidden' }}>
      {wins.map((win, i) => (
        <Box
          key={win.id}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
            borderBottom: i < wins.length - 1 ? '1px solid var(--g-border)' : 'none',
            cursor: 'pointer',
          }}
          onClick={() => onEdit(win)}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--g-background)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <IconTrophy size={15} style={{ color: 'var(--g-accent)', flexShrink: 0, marginTop: 2 }} />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text size="sm" fw={500} style={{ color: 'var(--g-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {win.title}
            </Text>
            {win.impact && (
              <Text size="xs" style={{ color: 'var(--g-text-muted)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {win.impact}
              </Text>
            )}
            <Text size="xs" c="dimmed">
              {new Date(win.date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </Text>
          </Box>
          <Tooltip label="Delete">
            <ActionIcon variant="subtle" size="sm" color="red"
              onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(win.id); }}>
              <IconTrash size={13} />
            </ActionIcon>
          </Tooltip>
        </Box>
      ))}
    </Box>
  );
}
