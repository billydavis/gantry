import { useState } from 'react';
import { Alert, Button, Group, Modal, Select, Stack, Text } from '@mantine/core';
import { TriangleAlert } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { ApiError } from '../../api/client';
import { tagsApi, tagKeys } from './api';
import type { Tag } from './types';

interface Props {
  opened: boolean;
  onClose: () => void;
  sourceTag: Tag | undefined;
  allTags: Tag[];
}

export function MergeTagModal({ opened, onClose, sourceTag, allTags }: Props) {
  const queryClient = useQueryClient();
  const [targetId, setTargetId] = useState<string | null>(null);

  const targetOptions = allTags
    .filter((t) => t.id !== sourceTag?.id)
    .map((t) => ({ value: t.id, label: t.name }));

  const mutation = useMutation({
    mutationFn: () => tagsApi.merge(sourceTag!.id, targetId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      notifications.show({ message: `Merged into "${targetOptions.find(o => o.value === targetId)?.label}"`, color: 'green' });
      handleClose();
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiError ? error.message : 'Failed to merge tags';
      notifications.show({ message, color: 'red' });
    },
  });

  function handleClose() {
    setTargetId(null);
    onClose();
  }

  if (!sourceTag) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`Merge "${sourceTag.name}"`}
      size="md"
      styles={{
        content: { background: 'var(--g-surface)' },
        header: { background: 'var(--g-surface)', borderBottom: '1px solid var(--g-border)' },
        title: { color: 'var(--g-heading)', fontWeight: 600 },
      }}
    >
      <Stack gap="md" pt="sm">
        <Alert color="yellow" icon={<TriangleAlert size={18} />}>
          Every item tagged "{sourceTag.name}" will be retagged with the tag you pick below, and "{sourceTag.name}"
          will be deleted. This cannot be undone.
        </Alert>

        <Text size="sm" style={{ color: 'var(--g-text)' }}>Merge into:</Text>

        <Select
          placeholder="Choose a tag"
          data={targetOptions}
          value={targetId}
          onChange={setTargetId}
          searchable
          styles={{
            input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' },
          }}
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={handleClose} style={{ color: 'var(--g-text-muted)' }}>Cancel</Button>
          <Button
            color="yellow"
            disabled={!targetId}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Merge
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
