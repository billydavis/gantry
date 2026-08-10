import { useEffect, useState } from 'react';
import { ActionIcon, Box, Group, Popover, Text, TextInput, Tooltip } from '@mantine/core';
import { Plus, Tag as TagIcon } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tagKeys, tagsApi } from './api';
import { TagBadge } from './TagBadge';
import type { Tag } from './types';

interface Props {
  selectedTags: Tag[];
  entityType: 'projects' | 'todos' | 'notes' | 'resources' | 'wins' | 'articles';
  entityId: string;
  onChanged?: () => void;
}

const PRESET_COLORS = [
  '#4dabf7', '#74c0fc', '#a9e34b', '#69db7c',
  '#ffa94d', '#ff6b6b', '#cc5de8', '#f783ac',
  '#868e96', '#495057',
];

export function TagPicker({ selectedTags, entityType, entityId, onChanged }: Props) {
  const queryClient = useQueryClient();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  const { data: allTags = [] } = useQuery({
    queryKey: tagKeys.list(),
    queryFn: tagsApi.list,
  });

  const assignMutation = useMutation({
    mutationFn: (tagIds: string[]) => tagsApi.assign(entityType, entityId, tagIds),
    onSuccess: () => { onChanged?.(); },
  });

  const createMutation = useMutation({
    mutationFn: () => tagsApi.create(newName.trim(), newColor),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.list() });
      const newIds = [...selectedTags.map(t => t.id), created.id];
      assignMutation.mutate(newIds);
      setNewName('');
      setCreateOpen(false);
    },
  });

  const toggle = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    const newIds = isSelected
      ? selectedTags.filter(t => t.id !== tag.id).map(t => t.id)
      : [...selectedTags.map(t => t.id), tag.id];
    assignMutation.mutate(newIds);
  };

  useEffect(() => {
    if (!popoverOpen) {
      setCreateOpen(false);
      setNewName('');
    }
  }, [popoverOpen]);

  const unassigned = allTags.filter(t => !selectedTags.some(s => s.id === t.id));

  return (
    <Box>
      <Group gap={4} wrap="wrap">
        {selectedTags.map(tag => (
          <TagBadge
            key={tag.id}
            tag={tag}
            onRemove={() => toggle(tag)}
          />
        ))}

        <Popover
          opened={popoverOpen}
          onChange={setPopoverOpen}
          position="bottom-start"
          withinPortal
        >
          <Popover.Target>
            <Tooltip label="Add tag" disabled={popoverOpen} withinPortal>
              <ActionIcon
                variant="subtle"
                size="xs"
                style={{ color: 'var(--g-text-muted)' }}
                onClick={() => setPopoverOpen(v => !v)}
              >
                <TagIcon size={12} />
              </ActionIcon>
            </Tooltip>
          </Popover.Target>
          <Popover.Dropdown style={{ background: 'var(--g-surface)', border: '1px solid var(--g-border)', minWidth: 200, padding: 12 }}>
            {unassigned.length > 0 && (
              <Box mb={8}>
                <Text size="xs" c="dimmed" mb={6}>Existing tags</Text>
                <Group gap={4} wrap="wrap">
                  {unassigned.map(tag => (
                    <Box
                      key={tag.id}
                      onClick={() => toggle(tag)}
                      style={{ cursor: 'pointer' }}
                    >
                      <TagBadge tag={tag} />
                    </Box>
                  ))}
                </Group>
              </Box>
            )}

            {createOpen ? (
              <Box>
                <Text size="xs" c="dimmed" mb={6}>Create new tag</Text>
                <TextInput
                  placeholder="Tag name"
                  size="xs"
                  value={newName}
                  onChange={(e) => setNewName(e.currentTarget.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) createMutation.mutate(); }}
                  styles={{ input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' } }}
                  mb={6}
                  autoFocus
                />
                <Group gap={4} mb={6} wrap="wrap">
                  {PRESET_COLORS.map(c => (
                    <Box
                      key={c}
                      onClick={() => setNewColor(c)}
                      style={{
                        width: 18, height: 18, borderRadius: 4, background: c, cursor: 'pointer',
                        border: newColor === c ? '2px solid var(--g-text)' : '2px solid transparent',
                      }}
                    />
                  ))}
                </Group>
                <Group gap={4}>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={() => setCreateOpen(false)}
                    style={{ color: 'var(--g-text-muted)' }}
                  >
                    ×
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    loading={createMutation.isPending}
                    disabled={!newName.trim()}
                    onClick={() => createMutation.mutate()}
                    style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}
                  >
                    <Plus size={12} />
                  </ActionIcon>
                </Group>
              </Box>
            ) : (
              <Box
                onClick={() => setCreateOpen(true)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, paddingTop: unassigned.length > 0 ? 8 : 0 }}
              >
                <Plus size={12} style={{ color: 'var(--g-text-muted)' }} />
                <Text size="xs" c="dimmed">Create new tag</Text>
              </Box>
            )}
          </Popover.Dropdown>
        </Popover>
      </Group>
    </Box>
  );
}
