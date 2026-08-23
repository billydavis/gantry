import { useState } from 'react';
import {
  ActionIcon, Badge, Box, Group, Loader,
  SegmentedControl, Stack, Text, TextInput, Tooltip,
} from '@mantine/core';
import { Circle, CircleCheck, CircleDashed, CircleX, Clock, ExternalLink, Pencil, Pin, Plus, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { todosApi, todoKeys } from './api';
import { TodoFormModal } from './TodoFormModal';
import type { Todo, TodoStatus } from './types';
import { TagPicker } from '../tags/TagPicker';
import { ExpandableDescription } from '../../components/ExpandableDescription';

interface Props {
  projectId?: string;
}

const statusIcon: Record<TodoStatus, React.ReactNode> = {
  Todo:       <Circle size={18} />,
  InProgress: <CircleDashed size={18} />,
  Waiting:    <Clock size={18} />,
  Blocked:    <CircleX size={18} />,
  Complete:   <CircleCheck size={18} />,
};

const statusColor: Record<TodoStatus, string> = {
  Todo:       'var(--g-text-muted)',
  InProgress: 'var(--g-accent)',
  Waiting:    'var(--mantine-color-yellow-6)',
  Blocked:    'var(--g-danger)',
  Complete:   'var(--g-success)',
};

const priorityColor = { Low: 'gray', Medium: 'yellow', High: 'red' } as const;

function formatDue(dueDate: string): { label: string; color: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, color: 'red' };
  if (diff === 0) return { label: 'Today', color: 'yellow' };
  if (diff === 1) return { label: 'Tomorrow', color: 'teal' };
  return { label: due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), color: 'gray' };
}

function formatMinutes(m: number): string {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

type Filter = 'Open' | 'All';

export function TodoList({ projectId }: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('Open');
  const [quickAdd, setQuickAdd] = useState('');
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  const [formOpen, setFormOpen] = useState(false);

  const queryParams = { projectId, includeCompleted: filter === 'All' };

  const { data: todos = [], isLoading } = useQuery({
    queryKey: todoKeys.list(queryParams),
    queryFn: () => todosApi.list(queryParams),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: todoKeys.all });

  const completeMutation = useMutation({
    mutationFn: todosApi.complete,
    onSuccess: invalidate,
  });

  const reopenMutation = useMutation({
    mutationFn: todosApi.reopen,
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: todosApi.delete,
    onSuccess: invalidate,
  });

  const pinMutation = useMutation({
    mutationFn: todosApi.pin,
    onSuccess: invalidate,
  });

  const createMutation = useMutation({
    mutationFn: todosApi.create,
    onSuccess: () => { invalidate(); setQuickAdd(''); },
  });

  const handleQuickAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && quickAdd.trim()) {
      createMutation.mutate({ projectId, title: quickAdd.trim(), priority: 'Medium' });
    }
  };

  const toggleComplete = (todo: Todo) => {
    if (todo.status === 'Complete') reopenMutation.mutate(todo.id);
    else completeMutation.mutate(todo.id);
  };

  const openEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setFormOpen(true);
  };

  const openCreate = () => {
    setEditingTodo(undefined);
    setFormOpen(true);
  };

  return (
    <>
      <Stack gap="sm">
        {/* Toolbar */}
        <Group justify="space-between">
          <SegmentedControl
            size="xs"
            value={filter}
            onChange={(v) => setFilter(v as Filter)}
            data={[
              { label: 'Open', value: 'Open' },
              { label: 'All', value: 'All' },
            ]}
            styles={{
              root: { background: 'var(--g-surface)', border: '1px solid var(--g-border)' },
              label: { fontSize: 12, color: 'var(--g-text-muted)' },
            }}
          />
          <Tooltip label="New todo">
            <ActionIcon
              variant="subtle"
              onClick={openCreate}
              style={{ color: 'var(--g-text-muted)' }}
            >
              <Plus size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* Quick-add */}
        <TextInput
          placeholder="Quick add… press Enter to save"
          size="sm"
          value={quickAdd}
          onChange={(e) => setQuickAdd(e.target.value)}
          onKeyDown={handleQuickAdd}
          rightSection={createMutation.isPending ? <Loader size={14} /> : null}
          styles={{
            input: {
              background: 'var(--g-background)',
              color: 'var(--g-text)',
              border: '1px solid var(--g-border)',
            },
          }}
        />

        {/* List */}
        {isLoading ? (
          <Text size="sm" c="dimmed">Loading…</Text>
        ) : todos.length === 0 ? (
          <Text size="sm" c="dimmed" py="sm">
            {filter === 'Open' ? 'No open todos.' : 'No todos yet.'}
          </Text>
        ) : (
          <Stack gap={8}>
            {todos.map((todo) => {
              const isComplete = todo.status === 'Complete';
              const due = todo.dueDate ? formatDue(todo.dueDate) : null;

              const hasDescription = !!todo.description;
              const hasMeta = !!(due || todo.estimatedMinutes || (!projectId && todo.projectName) || todo.tags.length > 0 || todo.link);

              return (
                <Box
                  key={todo.id}
                  style={{
                    borderRadius: 6,
                    border: `1px solid ${todo.isPinned ? 'var(--g-accent)' : 'var(--g-border)'}`,
                    background: todo.isPinned ? 'color-mix(in srgb, var(--g-accent) 8%, var(--g-surface))' : 'var(--g-surface)',
                    opacity: isComplete ? 0.55 : 1,
                  }}
                >
                  <Box style={{ padding: '10px 12px' }}>
                    {/* Primary row — checkbox, title, actions. The familiar todo-app pattern. */}
                    <Group gap={10} align="flex-start" wrap="nowrap">
                      <Tooltip label={isComplete ? 'Re-open' : `Mark complete (${todo.status})`}>
                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          onClick={() => toggleComplete(todo)}
                          style={{ color: statusColor[todo.status], flexShrink: 0, marginTop: 1 }}
                        >
                          {statusIcon[todo.status]}
                        </ActionIcon>
                      </Tooltip>

                      <Text
                        fw={600}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          color: 'var(--g-text)',
                          fontSize: 16,
                          lineHeight: 1.3,
                          textDecoration: isComplete ? 'line-through' : 'none',
                          whiteSpace: 'normal',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {todo.title}
                      </Text>

                      <Group gap={2} style={{ flexShrink: 0 }}>
                        <Tooltip label={todo.isPinned ? 'Unpin' : 'Pin to top'}>
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            onClick={() => pinMutation.mutate(todo.id)}
                            style={{ color: todo.isPinned ? 'var(--g-accent)' : 'var(--g-text-muted)' }}
                          >
                            {todo.isPinned ? <Pin size={14} fill="currentColor" /> : <Pin size={14} />}
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Edit">
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            onClick={() => openEdit(todo)}
                            style={{ color: 'var(--g-text-muted)' }}
                          >
                            <Pencil size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            color="red"
                            onClick={() => deleteMutation.mutate(todo.id)}
                          >
                            <Trash2 size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>

                    {/* Secondary row — facts about the todo, indented under the title */}
                    {hasMeta && (
                      <Group gap={6} wrap="wrap" mt={8} style={{ paddingLeft: 34 }}>
                        {due && (
                          <Badge size="xs" color={due.color} variant="light">{due.label}</Badge>
                        )}
                        <Badge size="xs" color={priorityColor[todo.priority]} variant="dot">
                          {todo.priority}
                        </Badge>
                        {!projectId && todo.projectName && todo.projectId && (
                          <Badge
                            size="xs"
                            variant="outline"
                            color="gray"
                            style={{ borderColor: 'var(--g-border)', color: 'var(--g-text-muted)', cursor: 'pointer' }}
                            onClick={() => navigate(`/projects/${todo.projectId}`)}
                          >
                            {todo.projectName}
                          </Badge>
                        )}
                        {todo.estimatedMinutes && (
                          <Text size="xs" c="dimmed">{formatMinutes(todo.estimatedMinutes)}</Text>
                        )}
                        {todo.link && (
                          <Tooltip label={todo.link}>
                            <ActionIcon
                              variant="subtle"
                              size="xs"
                              onClick={() => window.open(todo.link!, '_blank', 'noopener,noreferrer')}
                              style={{ color: 'var(--g-text-muted)' }}
                            >
                              <ExternalLink size={13} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        <TagPicker
                          selectedTags={todo.tags}
                          entityType="todos"
                          entityId={todo.id}
                          onChanged={invalidate}
                        />
                      </Group>
                    )}

                    {hasDescription && (
                      <Box style={{ paddingLeft: 34, paddingTop: 8, minWidth: 0, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                        <ExpandableDescription content={todo.description ?? ''} />
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Stack>

      <TodoFormModal
        opened={formOpen}
        onClose={() => setFormOpen(false)}
        projectId={projectId}
        todo={editingTodo}
      />
    </>
  );
}
