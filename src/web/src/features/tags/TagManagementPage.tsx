import { useState } from 'react';
import { ActionIcon, Badge, Box, Group, Loader, Modal, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { Check, Combine, Tag as TagIcon, Trash2, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { tagKeys, tagsApi } from './api';
import { MergeTagModal } from './MergeTagModal';
import { ConfirmModal } from '../../components/ConfirmModal';
import { SearchInput } from '../../components/SearchInput';
import { SearchResultList } from '../search/SearchResultList';
import { ApiError } from '../../api/client';
import type { Tag } from './types';

const PRESET_COLORS = [
  '#4dabf7', '#74c0fc', '#a9e34b', '#69db7c',
  '#ffa94d', '#ff6b6b', '#cc5de8', '#f783ac',
  '#868e96', '#495057',
];

export function TagManagementPage() {
  const navigate = useNavigate();
  const { id: usageTagId } = useParams<{ id?: string }>();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState<string | null>(null);
  const [mergeSource, setMergeSource] = useState<Tag | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Tag | undefined>();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: tagKeys.list(),
    queryFn: tagsApi.list,
  });

  const filtered = tags.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: tagKeys.all });

  const updateMutation = useMutation({
    mutationFn: ({ id, name, color }: { id: string; name: string; color: string | null }) =>
      tagsApi.update(id, name, color ?? undefined),
    onSuccess: () => { invalidate(); setEditingId(null); },
    onError: (error: unknown) => {
      const message = error instanceof ApiError ? error.message : 'Failed to rename tag';
      notifications.show({ message, color: 'red' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => { invalidate(); notifications.show({ message: 'Tag deleted', color: 'green' }); setDeleteTarget(undefined); },
    onError: (error: unknown) => {
      const message = error instanceof ApiError ? error.message : 'Failed to delete tag';
      notifications.show({ message, color: 'red' });
    },
  });

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    updateMutation.mutate({ id: editingId, name: editName.trim(), color: editColor });
  };

  const { data: usageResults, isLoading: usageLoading } = useQuery({
    queryKey: tagKeys.usage(usageTagId ?? ''),
    queryFn: () => tagsApi.usage(usageTagId!),
    enabled: !!usageTagId,
  });

  const usageTag = tags.find((t) => t.id === usageTagId);

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2} style={{ color: 'var(--g-heading)' }}>Tags</Title>
      </Group>

      <SearchInput value={search} onChange={setSearch} placeholder="Search tags…" width={280} />

      {isLoading ? (
        <Loader size="sm" />
      ) : filtered.length === 0 ? (
        <Text size="sm" c="dimmed">{search ? 'No tags match your search.' : 'No tags yet — create one from any item.'}</Text>
      ) : (
        <Stack gap={6}>
          {filtered.map((tag) => (
            <Box
              key={tag.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 6,
              }}
            >
              {editingId === tag.id ? (
                <>
                  <Group gap={4} wrap="wrap" style={{ flexShrink: 0 }}>
                    {PRESET_COLORS.map((c) => (
                      <Box
                        key={c}
                        onClick={() => setEditColor(c)}
                        style={{
                          width: 16, height: 16, borderRadius: 4, background: c, cursor: 'pointer',
                          border: editColor === c ? '2px solid var(--g-text)' : '2px solid transparent',
                        }}
                      />
                    ))}
                  </Group>
                  <TextInput
                    size="xs"
                    value={editName}
                    onChange={(e) => setEditName(e.currentTarget.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                    autoFocus
                    style={{ flex: 1 }}
                    styles={{ input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' } }}
                  />
                  <ActionIcon size="sm" loading={updateMutation.isPending} onClick={saveEdit} style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}>
                    <Check size={14} />
                  </ActionIcon>
                  <ActionIcon size="sm" variant="subtle" onClick={() => setEditingId(null)} style={{ color: 'var(--g-text-muted)' }}>
                    <X size={14} />
                  </ActionIcon>
                </>
              ) : (
                <>
                  <Box
                    style={{ width: 12, height: 12, borderRadius: 3, background: tag.color ?? '#868e96', flexShrink: 0 }}
                  />
                  <Text
                    size="sm"
                    fw={500}
                    onClick={() => startEdit(tag)}
                    style={{ color: 'var(--g-text)', flex: 1, minWidth: 0, cursor: 'text' }}
                  >
                    {tag.name}
                  </Text>
                  <Tooltip label="View tagged items">
                    <Badge
                      size="sm"
                      variant="light"
                      onClick={() => navigate(`/tags/${tag.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      {tag.usageCount} {tag.usageCount === 1 ? 'item' : 'items'}
                    </Badge>
                  </Tooltip>
                  <Tooltip label="Merge into another tag">
                    <ActionIcon variant="subtle" size="sm" onClick={() => setMergeSource(tag)} style={{ color: 'var(--g-text-muted)' }}>
                      <Combine size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete">
                    <ActionIcon variant="subtle" size="sm" color="red" onClick={() => setDeleteTarget(tag)}>
                      <Trash2 size={14} />
                    </ActionIcon>
                  </Tooltip>
                </>
              )}
            </Box>
          ))}
        </Stack>
      )}

      <MergeTagModal
        opened={!!mergeSource}
        onClose={() => setMergeSource(undefined)}
        sourceTag={mergeSource}
        allTags={tags}
      />

      <ConfirmModal
        opened={!!deleteTarget}
        title="Delete tag?"
        message={
          deleteTarget
            ? deleteTarget.usageCount > 0
              ? `Delete "${deleteTarget.name}"? It's used on ${deleteTarget.usageCount} item${deleteTarget.usageCount === 1 ? '' : 's'} — they'll keep their other tags.`
              : `Delete "${deleteTarget.name}"? It's not used anywhere.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(undefined)}
      />

      <Modal
        opened={!!usageTagId}
        onClose={() => navigate('/tags')}
        title={
          <Group gap={8}>
            <TagIcon size={16} style={{ color: 'var(--g-accent)' }} />
            <Text fw={600} style={{ color: 'var(--g-heading)' }}>
              {usageTag ? `Tagged "${usageTag.name}"` : 'Tagged items'}
            </Text>
          </Group>
        }
        size="lg"
        styles={{
          content: { background: 'var(--g-surface)' },
          header: { background: 'var(--g-surface)', borderBottom: '1px solid var(--g-border)' },
        }}
      >
        {usageLoading ? (
          <Loader size="sm" />
        ) : usageResults && usageResults.length === 0 ? (
          <Text size="sm" c="dimmed">Not used anywhere.</Text>
        ) : (
          <SearchResultList results={usageResults ?? []} />
        )}
      </Modal>
    </Stack>
  );
}
