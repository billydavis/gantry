import { useState } from 'react';
import { ActionIcon, Anchor, Box, Breadcrumbs, Button, Group, Loader, Modal, Stack, Text, Title, Tooltip } from '@mantine/core';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { articleKeys, articlesApi } from './api';
import { ArticleEditor } from './ArticleEditor';
import { ArticleFormModal } from './ArticleFormModal';
import { TagPicker } from '../tags/TagPicker';
import { CopyForEmailButton } from '../../components/CopyForEmailButton';
import { articleEmailMeta } from './articleEmailMeta';

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: article, isLoading } = useQuery({
    queryKey: articleKeys.detail(id!),
    queryFn: () => articlesApi.getById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => articlesApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      navigate('/wiki');
    },
  });

  if (isLoading) return <Loader size="sm" />;
  if (!article) return <Text c="dimmed">Article not found.</Text>;

  return (
    <>
      <Stack gap="md">
        <Breadcrumbs styles={{ breadcrumb: { color: 'var(--g-text-muted)', fontSize: 13 } }}>
          <Text component={Link} to="/wiki" size="sm" style={{ color: 'var(--g-text-muted)', textDecoration: 'none' }}>
            Knowledge Base
          </Text>
          <Text size="sm" style={{ color: 'var(--g-text)' }}>{article.title}</Text>
        </Breadcrumbs>

        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={2} style={{ color: 'var(--g-heading)' }}>{article.title}</Title>
            <Group gap="xs" mt={4}>
              {article.category && <Text size="sm" style={{ color: 'var(--g-text-muted)' }}>{article.category}</Text>}
              {article.sourceUrl && (
                <Anchor href={article.sourceUrl} target="_blank" rel="noreferrer" size="sm" style={{ color: 'var(--g-accent)' }}>
                  <Group gap={4}><ExternalLink size={12} />Source</Group>
                </Anchor>
              )}
            </Group>
          </Box>
          <Group gap={4}>
            <CopyForEmailButton
              title={article.title}
              content={article.content}
              metaHtml={articleEmailMeta(article).html}
              metaText={articleEmailMeta(article).text}
            />
            <Tooltip label="Edit details">
              <ActionIcon variant="subtle" onClick={() => setEditOpen(true)} style={{ color: 'var(--g-text-muted)' }}>
                <Pencil size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete">
              <ActionIcon variant="subtle" color="red" onClick={() => setDeleteOpen(true)}>
                <Trash2 size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <TagPicker
          selectedTags={article.tags}
          entityType="articles"
          entityId={article.id}
          onChanged={() => queryClient.invalidateQueries({ queryKey: articleKeys.detail(article.id) })}
        />

        <ArticleEditor article={article} minHeight={560} />
      </Stack>

      <ArticleFormModal opened={editOpen} onClose={() => setEditOpen(false)} article={article} />

      <Modal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete article"
        size="sm"
        styles={{
          content: { background: 'var(--g-surface)' },
          header: { background: 'var(--g-surface)', borderBottom: '1px solid var(--g-border)' },
          title: { color: 'var(--g-heading)', fontWeight: 600 },
        }}
      >
        <Stack gap="md" pt="sm">
          <Text size="sm" style={{ color: 'var(--g-text)' }}>
            Delete "{article.title}"? This can't be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setDeleteOpen(false)} style={{ color: 'var(--g-text-muted)' }}>
              Cancel
            </Button>
            <Button color="red" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
