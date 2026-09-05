import { ActionIcon, Badge, Group, Loader, Modal, Stack, Text, Tooltip } from '@mantine/core';
import { CircleCheck, ExternalLink, Pencil, Repeat, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { todoKeys, todosApi } from './api';
import type { Todo } from './types';
import { MarkdownText } from '../../components/MarkdownText';
import { CopyForEmailButton } from '../../components/CopyForEmailButton';
import { emailMetaParagraph } from '../../utils/emailContent';
import { TagBadge } from '../tags/TagBadge';

interface Props {
  /** The todo to view, or `null` to keep the modal closed. */
  todoId: string | null;
  onClose: () => void;
  /** When provided, shows an "Open in editor" button that closes the viewer and hands the loaded todo off to editing. */
  onOpenEditor?: (todo: Todo) => void;
}

const priorityColor = { Low: 'gray', Medium: 'yellow', High: 'red' } as const;

function formatRecurrence(todo: Todo): string | null {
  switch (todo.recurrenceType) {
    case 'Daily': return 'Repeats daily';
    case 'Weekly': return 'Repeats weekly';
    case 'Monthly': return 'Repeats monthly';
    case 'Custom': return `Repeats every ${todo.recurrenceIntervalDays} days`;
    default: return null;
  }
}

function todoEmailMetaLines(todo: Todo, due: string | null): string[] {
  return [
    todo.status,
    `${todo.priority} priority`,
    due ? `Due ${due}` : null,
    todo.projectName ?? null,
    todo.link ?? null,
    formatRecurrence(todo),
  ].filter(Boolean) as string[];
}

/** Read-only popup for a single todo — a quick way to read a long description without opening the edit form. */
export function TodoViewerModal({ todoId, onClose, onOpenEditor }: Props) {
  const { data: todo, isLoading } = useQuery({
    queryKey: todoId ? todoKeys.detail(todoId) : ['todo-viewer-skip'],
    queryFn: () => todosApi.getById(todoId!),
    enabled: !!todoId,
  });

  const handleOpenEditor = () => {
    if (!todo) return;
    onClose();
    onOpenEditor?.(todo);
  };

  const due = todo?.dueDate
    ? new Date(todo.dueDate + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <Modal
      opened={!!todoId}
      onClose={onClose}
      withCloseButton={false}
      title={
        <Group justify="space-between" wrap="nowrap" gap="sm" style={{ width: '100%' }}>
          <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
            <CircleCheck size={18} style={{ color: 'var(--g-accent)', flexShrink: 0 }} />
            <Text fw={600} style={{ color: 'var(--g-heading)' }} lineClamp={1}>{todo?.title ?? 'Todo'}</Text>
          </Group>
          <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
            {todo && (
              <CopyForEmailButton
                title={todo.title}
                content={todo.description ?? ''}
                metaHtml={emailMetaParagraph(todoEmailMetaLines(todo, due))}
                metaText={todoEmailMetaLines(todo, due).join(' · ')}
              />
            )}
            {onOpenEditor && (
              <Tooltip label="Open in editor">
                <ActionIcon variant="subtle" onClick={handleOpenEditor} disabled={!todo} style={{ color: 'var(--g-text-muted)' }}>
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
        {isLoading || !todo ? (
          <Loader size="sm" />
        ) : (
          <Stack gap="sm">
            <Group gap={6}>
              <Badge size="sm" variant="light">{todo.status}</Badge>
              <Badge size="sm" color={priorityColor[todo.priority]} variant="dot">{todo.priority}</Badge>
              {due && <Text size="sm" c="dimmed">Due {due}</Text>}
              {formatRecurrence(todo) && (
                <Badge size="sm" color="grape" variant="light" leftSection={<Repeat size={11} />}>
                  {formatRecurrence(todo)}
                </Badge>
              )}
              {todo.projectName && (
                <>
                  <Text size="sm" c="dimmed">·</Text>
                  <Text size="sm" c="dimmed">{todo.projectName}</Text>
                </>
              )}
            </Group>

            {todo.link && (
              <Group gap={4}>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={() => window.open(todo.link!, '_blank', 'noopener,noreferrer')}
                  style={{ color: 'var(--g-text-muted)' }}
                >
                  <ExternalLink size={14} />
                </ActionIcon>
                <Text size="sm" c="dimmed" style={{ wordBreak: 'break-all' }}>{todo.link}</Text>
              </Group>
            )}

            {todo.description && <MarkdownText content={todo.description} />}

            {todo.tags.length > 0 && (
              <Group gap={4} wrap="wrap">
                {todo.tags.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
              </Group>
            )}
          </Stack>
        )}
      </div>
    </Modal>
  );
}
