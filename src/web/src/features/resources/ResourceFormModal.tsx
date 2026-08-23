import { useEffect } from 'react';
import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { resourcesApi, resourceKeys } from './api';
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS, type Resource, type ResourceType } from './types';
import { environmentsApi, environmentKeys } from '../environments/api';
import { MarkdownField } from '../../components/MarkdownField';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  location: z.string().min(1, 'Location is required').max(2000),
  type: z.string().min(1, 'Type is required'),
  description: z.string().optional(),
  environmentId: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  opened: boolean;
  onClose: () => void;
  projectId?: string;
  resource?: Resource;
  nextSortOrder?: number;
}

export function ResourceFormModal({ opened, onClose, projectId, resource, nextSortOrder = 0 }: Props) {
  const queryClient = useQueryClient();
  const isEdit = !!resource;

  const { data: environments = [] } = useQuery({
    queryKey: projectId ? environmentKeys.byProject(projectId) : ['environments-skip'],
    queryFn: () => environmentsApi.list(projectId!),
    enabled: !!projectId,
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
    defaultValues: { name: '', location: '', type: 'Website', description: '', environmentId: null },
  });

  const typeValue = watch('type');
  const environmentIdValue = watch('environmentId');

  useEffect(() => {
    if (opened) {
      reset(
        resource
          ? {
              name: resource.name,
              location: resource.location,
              type: resource.type,
              description: resource.description ?? '',
              environmentId: resource.environmentId ?? null,
            }
          : { name: '', location: '', type: 'Website', description: '', environmentId: null }
      );
    }
  }, [opened, resource, reset]);

  const invalidate = () => {
    if (projectId) queryClient.invalidateQueries({ queryKey: resourceKeys.byProject(projectId) });
    else queryClient.invalidateQueries({ queryKey: resourceKeys.global() });
  };

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      resourcesApi.create({
        projectId: projectId,
        name: values.name,
        location: values.location,
        type: values.type as ResourceType,
        description: values.description || undefined,
        environmentId: values.environmentId ?? undefined,
        sortOrder: nextSortOrder,
      }),
    onSuccess: () => { invalidate(); onClose(); },
  });

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      resourcesApi.update(resource!.id, {
        name: values.name,
        location: values.location,
        type: values.type as ResourceType,
        description: values.description || undefined,
        sortOrder: resource!.sortOrder,
        environmentId: values.environmentId ?? undefined,
      }),
    onSuccess: () => { invalidate(); onClose(); },
  });

  const onSubmit = (values: FormValues) => {
    if (isEdit) updateMutation.mutate(values);
    else createMutation.mutate(values);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const envOptions = [
    { value: '', label: 'None (general)' },
    ...environments.map((e) => ({ value: e.id, label: e.name })),
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Edit Resource' : 'Add Resource'}
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
            placeholder="e.g. Production API"
            required
            error={errors.name?.message}
            styles={{ input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' } }}
            {...register('name')}
          />
          <TextInput
            label="Location"
            placeholder="https://... or \\server\share or /path/to/file"
            required
            error={errors.location?.message}
            styles={{ input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' } }}
            {...register('location')}
          />
          <Select
            label="Type"
            required
            data={RESOURCE_TYPES.map((t) => ({ value: t, label: RESOURCE_TYPE_LABELS[t] }))}
            value={typeValue}
            onChange={(v) => setValue('type', v ?? 'Website')}
            error={errors.type?.message}
            styles={{ input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' } }}
          />
          {projectId && environments.length > 0 && (
            <Select
              label="Environment"
              placeholder="None (general)"
              data={envOptions}
              value={environmentIdValue ?? ''}
              onChange={(v) => setValue('environmentId', v || null)}
              clearable
              styles={{ input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' } }}
            />
          )}
          <MarkdownField
            label="Description"
            placeholder="Optional notes"
            height={120}
            value={watch('description') ?? ''}
            onChange={(v) => setValue('description', v)}
            error={errors.description?.message}
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
