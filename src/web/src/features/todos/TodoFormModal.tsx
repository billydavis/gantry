import { useEffect } from 'react';
import { Button, Group, Modal, NumberInput, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { todosApi, todoKeys } from './api';
import { projectsApi, projectKeys } from '../projects/api';
import { MarkdownField } from '../../components/MarkdownField';
import type { Todo, Priority, TodoStatus } from './types';

const schema = z.object({
  projectId: z.string().uuid().nullable().optional(),
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().nullable().optional(),
  link: z.string().max(2000).nullable().optional(),
  priority: z.enum(['Low', 'Medium', 'High']),
  status: z.enum(['Todo', 'InProgress', 'Waiting', 'Blocked', 'Complete']).optional(),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  opened: boolean;
  onClose: () => void;
  /** Pre-selects a project; user can still change it. */
  projectId?: string;
  todo?: Todo;
}

const statusOptions = [
  { value: 'Todo', label: 'To Do' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'Waiting', label: 'Waiting' },
  { value: 'Blocked', label: 'Blocked' },
  { value: 'Complete', label: 'Complete' },
];

const priorityOptions = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];

const inputStyles = { input: { background: 'var(--g-background)', color: 'var(--g-text)' } };

export function TodoFormModal({ opened, onClose, projectId, todo }: Props) {
  const isEditing = !!todo;
  const queryClient = useQueryClient();

  const { data: allProjects = [] } = useQuery({
    queryKey: projectKeys.list(),
    queryFn: projectsApi.list,
    enabled: opened,
  });

  const activeProjects = allProjects.filter((p) => p.status === 'Active');

  const projectOptions = [
    { value: '', label: 'No project' },
    ...activeProjects.map((p) => ({ value: p.id, label: p.name })),
  ];

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectId: null,
      title: '',
      description: null,
      link: null,
      priority: 'Medium',
      estimatedMinutes: null,
      dueDate: null,
    },
  });

  useEffect(() => {
    if (opened) {
      reset({
        projectId: todo?.projectId ?? projectId ?? null,
        title: todo?.title ?? '',
        description: todo?.description ?? null,
        link: todo?.link ?? null,
        priority: (todo?.priority ?? 'Medium') as Priority,
        status: todo?.status as TodoStatus | undefined,
        estimatedMinutes: todo?.estimatedMinutes ?? null,
        dueDate: todo?.dueDate ?? null,
      });
    }
  }, [opened, todo, projectId, reset]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: todoKeys.all });

  const createMutation = useMutation({
    mutationFn: todosApi.create,
    onSuccess: () => { invalidate(); notifications.show({ message: 'Todo created', color: 'green' }); onClose(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof todosApi.update>[1] }) =>
      todosApi.update(id, data),
    onSuccess: () => { invalidate(); notifications.show({ message: 'Todo updated', color: 'green' }); onClose(); },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const projectIdValue = watch('projectId');
  const priorityValue = watch('priority');
  const statusValue = watch('status');
  const estimatedValue = watch('estimatedMinutes');

  const onSubmit = (values: FormValues) => {
    const resolvedProjectId = values.projectId || null;
    if (isEditing && todo) {
      updateMutation.mutate({
        id: todo.id,
        data: {
          projectId: resolvedProjectId,
          title: values.title,
          description: values.description ?? null,
          link: values.link ?? null,
          status: values.status,
          priority: values.priority,
          estimatedMinutes: values.estimatedMinutes ?? null,
          dueDate: values.dueDate ?? null,
        },
      });
    } else {
      createMutation.mutate({
        projectId: resolvedProjectId,
        title: values.title,
        description: values.description ?? null,
        link: values.link ?? null,
        priority: values.priority,
        estimatedMinutes: values.estimatedMinutes ?? null,
        dueDate: values.dueDate ?? null,
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? 'Edit Todo' : 'New Todo'}
      size="md"
      styles={{
        content: { background: 'var(--g-surface)' },
        header: { background: 'var(--g-surface)', borderBottom: '1px solid var(--g-border)' },
        title: { color: 'var(--g-heading)', fontWeight: 600 },
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="What needs to be done?"
            required
            error={errors.title?.message}
            styles={inputStyles}
            {...register('title')}
          />

          <MarkdownField
            label="Description"
            placeholder="Optional notes"
            value={watch('description') ?? ''}
            onChange={(v) => setValue('description', v)}
            error={errors.description?.message}
          />

          <TextInput
            label="Link"
            placeholder="https://dev.azure.com/…"
            error={errors.link?.message}
            styles={inputStyles}
            {...register('link')}
          />

          <Select
            label="Project"
            placeholder="No project"
            data={projectOptions}
            value={projectIdValue ?? ''}
            onChange={(v) => setValue('projectId', v || null)}
            searchable
            clearable
            styles={inputStyles}
          />

          <Group grow>
            <Select
              label="Priority"
              data={priorityOptions}
              value={priorityValue}
              onChange={(v) => setValue('priority', (v ?? 'Medium') as Priority)}
              styles={inputStyles}
            />
            {isEditing && (
              <Select
                label="Status"
                data={statusOptions}
                value={statusValue ?? 'Todo'}
                onChange={(v) => setValue('status', (v ?? 'Todo') as TodoStatus)}
                styles={inputStyles}
              />
            )}
          </Group>

          <Group grow>
            <NumberInput
              label="Estimated minutes"
              placeholder="e.g. 30"
              min={1}
              value={estimatedValue ?? ''}
              onChange={(v) => setValue('estimatedMinutes', v === '' ? null : Number(v))}
              styles={inputStyles}
            />
            <TextInput
              label="Due date"
              type="date"
              value={watch('dueDate') ?? ''}
              onChange={(e) => setValue('dueDate', e.target.value || null)}
              styles={inputStyles}
            />
          </Group>

          <Group justify="flex-end" mt="xs">
            <Button variant="subtle" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button
              type="submit"
              loading={isPending}
              style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}
            >
              {isEditing ? 'Save Changes' : 'Create Todo'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
