import { useEffect } from 'react';
import { Button, Group, Modal, Select, Stack, Textarea, TextInput } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { winKeys, winsApi } from './api';
import { projectKeys, projectsApi } from '../projects/api';
import type { Win } from './types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(2000).optional(),
  impact: z.string().max(1000).optional(),
  date: z.string().min(1, 'Date is required'),
  projectId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  opened: boolean;
  onClose: () => void;
  win?: Win;
  defaultProjectId?: string;
}

const inputStyles = {
  input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' },
  label: { color: 'var(--g-text)' },
};

export function WinFormModal({ opened, onClose, win, defaultProjectId }: Props) {
  const queryClient = useQueryClient();
  const isEdit = !!win;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      impact: '',
      date: new Date().toISOString().split('T')[0],
      projectId: '',
    },
  });

  const projectId = watch('projectId');

  useEffect(() => {
    if (opened) {
      reset(win
        ? { title: win.title, description: win.description ?? '', impact: win.impact ?? '', date: win.date, projectId: win.projectId ?? '' }
        : { title: '', description: '', impact: '', date: new Date().toISOString().split('T')[0], projectId: defaultProjectId ?? '' }
      );
    }
  }, [opened, win, defaultProjectId, reset]);

  const { data: projects = [] } = useQuery({
    queryKey: projectKeys.list(),
    queryFn: projectsApi.list,
    enabled: opened,
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const req = {
        title: values.title,
        description: values.description || undefined,
        impact: values.impact || undefined,
        date: values.date,
        projectId: values.projectId || undefined,
      };
      return isEdit ? winsApi.update(win.id, req) : winsApi.create(req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: winKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      notifications.show({ message: isEdit ? 'Win updated' : 'Win logged!', color: 'green' });
      onClose();
    },
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Edit Win' : 'Log a Win'}
      size="lg"
      styles={{
        content: { background: 'var(--g-surface)' },
        header: { background: 'var(--g-surface)', borderBottom: '1px solid var(--g-border)' },
        title: { color: 'var(--g-heading)', fontWeight: 600 },
      }}
    >
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <Stack gap="md" pt="sm">
          <TextInput
            label="What did you accomplish?"
            placeholder="Shipped the new onboarding flow"
            required
            error={errors.title?.message}
            styles={inputStyles}
            {...register('title')}
          />
          <TextInput
            label="Date"
            type="date"
            required
            error={errors.date?.message}
            styles={inputStyles}
            {...register('date')}
          />
          <Textarea
            label="Impact"
            placeholder="How did this move the needle? (great for perf reviews)"
            autosize
            minRows={2}
            maxRows={4}
            error={errors.impact?.message}
            styles={inputStyles}
            {...register('impact')}
          />
          <Textarea
            label="Details"
            placeholder="Optional — extra context, links, numbers"
            autosize
            minRows={2}
            maxRows={6}
            error={errors.description?.message}
            styles={inputStyles}
            {...register('description')}
          />
          <Select
            label="Project"
            placeholder="None (general win)"
            clearable
            data={projects.map((p) => ({ value: p.id, label: p.name }))}
            value={projectId || null}
            onChange={(v) => setValue('projectId', v ?? '')}
            styles={inputStyles}
          />
          <Group justify="flex-end" mt="xs">
            <Button variant="subtle" onClick={onClose} style={{ color: 'var(--g-text-muted)' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={mutation.isPending}
              style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}
            >
              {isEdit ? 'Save' : 'Log Win'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
