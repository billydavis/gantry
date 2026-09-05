import { Button, Group, Modal, Stack, Text } from '@mantine/core';

interface Props {
  opened: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Lightweight yes/no confirmation modal for actions that aren't destructive enough to warrant a typed confirmation. */
export function ConfirmModal({ opened, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }: Props) {
  return (
    <Modal
      opened={opened}
      onClose={onCancel}
      title={title}
      size="sm"
      styles={{
        content: { background: 'var(--g-surface)' },
        header: { background: 'var(--g-surface)', borderBottom: '1px solid var(--g-border)' },
        title: { color: 'var(--g-heading)', fontWeight: 600 },
      }}
    >
      <Stack gap="md" pt="sm">
        <Text size="sm" style={{ color: 'var(--g-text)' }}>{message}</Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={onCancel} style={{ color: 'var(--g-text-muted)' }}>Cancel</Button>
          <Button
            onClick={onConfirm}
            style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}
          >
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
