import { ActionIcon, Group, Loader, Modal, Stack, Text, Tooltip } from '@mantine/core';
import { Pencil, Trophy, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { winKeys, winsApi } from './api';
import type { Win } from './types';
import { MarkdownText } from '../../components/MarkdownText';
import { TagBadge } from '../tags/TagBadge';

interface Props {
  /** The win to view, or `null` to keep the modal closed. */
  winId: string | null;
  onClose: () => void;
  /** When provided, shows an "Open in editor" button that closes the viewer and hands the loaded win off to editing. */
  onOpenEditor?: (win: Win) => void;
}

/** Read-only popup for a single win — click-through from a compact row instead of jumping straight into the edit form. */
export function WinViewerModal({ winId, onClose, onOpenEditor }: Props) {
  const { data: win, isLoading } = useQuery({
    queryKey: winId ? winKeys.detail(winId) : ['win-viewer-skip'],
    queryFn: () => winsApi.getById(winId!),
    enabled: !!winId,
  });

  const handleOpenEditor = () => {
    if (!win) return;
    onClose();
    onOpenEditor?.(win);
  };

  const date = win
    ? new Date(win.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <Modal
      opened={!!winId}
      onClose={onClose}
      withCloseButton={false}
      title={
        <Group justify="space-between" wrap="nowrap" gap="sm" style={{ width: '100%' }}>
          <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
            <Trophy size={18} style={{ color: 'var(--g-accent)', flexShrink: 0 }} />
            <Text fw={600} style={{ color: 'var(--g-heading)' }} lineClamp={1}>{win?.title ?? 'Win'}</Text>
          </Group>
          <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
            {onOpenEditor && (
              <Tooltip label="Open in editor">
                <ActionIcon variant="subtle" onClick={handleOpenEditor} disabled={!win} style={{ color: 'var(--g-text-muted)' }}>
                  <Pencil size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            <ActionIcon variant="subtle" onClick={onClose} style={{ color: 'var(--g-text-muted)' }}>
              <X size={16} />
            </ActionIcon>
          </Group>
        </Group>
      }
      size="90%"
      styles={{
        content: { background: 'var(--g-surface)' },
        header: { background: 'var(--g-surface)', borderBottom: '1px solid var(--g-border)' },
        title: { flex: 1, minWidth: 0 },
        body: { height: '80vh', padding: 16 },
      }}
    >
      <div
        style={{
          height: '100%',
          overflow: 'auto',
          background: 'var(--g-background)',
          border: '1px solid var(--g-border)',
          borderRadius: 8,
          padding: '20px 24px',
        }}
      >
        {isLoading || !win ? (
          <Loader size="sm" />
        ) : (
          <Stack gap="sm">
            <Group gap={6}>
              <Text size="sm" c="dimmed">{date}</Text>
              {win.projectName && (
                <>
                  <Text size="sm" c="dimmed">·</Text>
                  <Text size="sm" c="dimmed">{win.projectName}</Text>
                </>
              )}
            </Group>

            {win.impact && <MarkdownText content={win.impact} />}

            {win.description && <MarkdownText content={win.description} />}

            {win.tags.length > 0 && (
              <Group gap={4} wrap="wrap">
                {win.tags.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
              </Group>
            )}
          </Stack>
        )}
      </div>
    </Modal>
  );
}
