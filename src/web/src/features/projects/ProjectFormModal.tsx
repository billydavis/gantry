import { useEffect } from 'react';
import {
  Button,
  ColorInput,
  Group,
  Modal,
  Select,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { projectsApi, projectKeys } from './api';
import type { Project } from './types';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  parentProjectId: z.string().uuid('Invalid project ID').nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  opened: boolean;
  onClose: () => void;
  project?: Project;
}

export function ProjectFormModal({ opened, onClose, project }: Props) {
  const isEditing = !!project;
  const queryClient = useQueryClient();

  const { data: allProjects = [] } = useQuery({
    queryKey: projectKeys.list(),
    queryFn: projectsApi.list,
    enabled: opened,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: null, color: null, parentProjectId: null },
  });

  useEffect(() => {
    if (opened) {
      reset({
        name: project?.name ?? '',
        description: project?.description ?? null,
        color: project?.color ?? null,
        parentProjectId: project?.parentProjectId ?? null,
      });
    }
  }, [opened, project, reset]);

  const createMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      notifications.show({ message: 'Project created', color: 'green' });
      onClose();
    },
    onError: (err: Error) => {
      notifications.show({ message: err.message, color: 'red' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof projectsApi.update>[1] }) =>
      projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      notifications.show({ message: 'Project updated', color: 'green' });
      onClose();
    },
    onError: (err: Error) => {
      notifications.show({ message: err.message, color: 'red' });
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const parentOptions = allProjects
    .filter((p) => p.id !== project?.id)
    .map((p) => ({ value: p.id, label: p.name }));

  const colorValue = watch('color');
  const parentValue = watch('parentProjectId');

  const onSubmit = (values: FormValues) => {
    if (isEditing && project) {
      updateMutation.mutate({
        id: project.id,
        data: {
          name: values.name,
          description: values.description ?? null,
          color: values.color ?? null,
          parentProjectId: values.parentProjectId ?? null,
        },
      });
    } else {
      createMutation.mutate({
        name: values.name,
        description: values.description ?? null,
        color: values.color ?? null,
        parentProjectId: values.parentProjectId ?? null,
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'New Project'}
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
            label="Name"
            placeholder="Project name"
            required
            error={errors.name?.message}
            styles={{ input: { background: 'var(--g-background)', color: 'var(--g-text)' } }}
            {...register('name')}
          />

          <Textarea
            label="Description"
            placeholder="Optional description"
            rows={3}
            error={errors.description?.message}
            styles={{ input: { background: 'var(--g-background)', color: 'var(--g-text)' } }}
            {...register('description')}
          />

          <ColorInput
            label="Color"
            placeholder="#3b82f6"
            value={colorValue ?? ''}
            onChange={(v) => setValue('color', v || null)}
            format="hex"
            swatches={[
              '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444',
              '#f97316', '#eab308', '#22c55e', '#14b8a6',
            ]}
            styles={{ input: { background: 'var(--g-background)', color: 'var(--g-text)' } }}
          />

          <Select
            label="Parent Project"
            placeholder="None (top-level)"
            data={parentOptions}
            value={parentValue ?? null}
            onChange={(v) => setValue('parentProjectId', v)}
            clearable
            searchable
            styles={{ input: { background: 'var(--g-background)', color: 'var(--g-text)' } }}
          />

          <Group justify="flex-end" mt="xs">
            <Button variant="subtle" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isPending}
              style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}
            >
              {isEditing ? 'Save Changes' : 'Create Project'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
