import { useEffect } from 'react';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { environmentsApi, environmentKeys } from './api';
import type { ProjectEnvironment } from './types';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  baseUrl: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  opened: boolean;
  onClose: () => void;
  projectId: string;
  environment?: ProjectEnvironment;
  nextSortOrder?: number;
}

export function EnvironmentFormModal({ opened, onClose, projectId, environment, nextSortOrder = 0 }: Props) {
  const queryClient = useQueryClient();
  const isEdit = !!environment;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', baseUrl: '' },
  });

  useEffect(() => {
    if (opened) {
      reset(environment
        ? { name: environment.name, baseUrl: environment.baseUrl ?? '' }
        : { name: '', baseUrl: '' }
      );
    }
  }, [opened, environment, reset]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: environmentKeys.byProject(projectId) });

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      environmentsApi.create({
        projectId,
        name: values.name,
        baseUrl: values.baseUrl || undefined,
        sortOrder: nextSortOrder,
      }),
    onSuccess: () => { invalidate(); onClose(); },
  });

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      environmentsApi.update(environment!.id, {
        name: values.name,
        baseUrl: values.baseUrl || undefined,
        sortOrder: environment!.sortOrder,
      }),
    onSuccess: () => { invalidate(); onClose(); },
  });

  const onSubmit = (values: FormValues) => {
    if (isEdit) updateMutation.mutate(values);
    else createMutation.mutate(values);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Edit Environment' : 'Add Environment'}
      size="sm"
      styles={{
        content: { background: 'var(--g-surface)', border: '1px solid var(--g-border)' },
        header: { background: 'var(--g-surface)' },
        title: { color: 'var(--g-heading)', fontWeight: 600 },
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="sm">
          <TextInput
            label="Name"
            placeholder="e.g. Production, Staging, Dev"
            required
            error={errors.name?.message}
            styles={{ input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' } }}
            {...register('name')}
          />
          <TextInput
            label="Base URL"
            placeholder="https://prod.example.com (optional)"
            error={errors.baseUrl?.message}
            styles={{ input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' } }}
            {...register('baseUrl')}
          />
          <Group justify="flex-end" mt="xs">
            <Button variant="subtle" onClick={onClose} disabled={isPending}
              style={{ color: 'var(--g-text-muted)' }}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}
              style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}>
              {isEdit ? 'Save' : 'Add'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
