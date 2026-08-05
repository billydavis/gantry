import { useEffect } from 'react';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { articleKeys, articlesApi } from './api';
import type { Article } from './types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  category: z.string().max(100).optional(),
  sourceUrl: z.string().max(2000).url('Must be a valid URL').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  opened: boolean;
  onClose: () => void;
  article?: Article;
  onCreated?: (article: Article) => void;
}

const inputStyles = {
  input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' },
  label: { color: 'var(--g-text)' },
};

export function ArticleFormModal({ opened, onClose, article, onCreated }: Props) {
  const queryClient = useQueryClient();
  const isEdit = !!article;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', category: '', sourceUrl: '' },
  });

  useEffect(() => {
    if (opened) {
      reset(article
        ? { title: article.title, category: article.category ?? '', sourceUrl: article.sourceUrl ?? '' }
        : { title: '', category: '', sourceUrl: '' }
      );
    }
  }, [opened, article, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const req = {
        title: values.title,
        content: article?.content ?? '',
        category: values.category || undefined,
        sourceUrl: values.sourceUrl || undefined,
      };
      return isEdit ? articlesApi.update(article.id, req) : articlesApi.create(req);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      if (isEdit) queryClient.invalidateQueries({ queryKey: articleKeys.detail(article.id) });
      onCreated?.(saved);
      onClose();
    },
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Edit Article' : 'New Article'}
      size="md"
      styles={{
        content: { background: 'var(--g-surface)' },
        header: { background: 'var(--g-surface)', borderBottom: '1px solid var(--g-border)' },
        title: { color: 'var(--g-heading)', fontWeight: 600 },
      }}
    >
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <Stack gap="md" pt="sm">
          <TextInput
            label="Title"
            placeholder=".NET 10 upgrade gotchas"
            required
            error={errors.title?.message}
            styles={inputStyles}
            {...register('title')}
          />
          <TextInput
            label="Category"
            placeholder=".NET, Azure, UI…"
            error={errors.category?.message}
            styles={inputStyles}
            {...register('category')}
          />
          <TextInput
            label="Source URL"
            placeholder="https://…"
            error={errors.sourceUrl?.message}
            styles={inputStyles}
            {...register('sourceUrl')}
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
              {isEdit ? 'Save' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
