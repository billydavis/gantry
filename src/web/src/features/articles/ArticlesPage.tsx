import { useState } from 'react';
import { ActionIcon, Badge, Box, Button, Group, Loader, Stack, Text, Title, Tooltip } from '@mantine/core';
import { Brain, FileText, Pencil, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { articleKeys, articlesApi } from './api';
import { ArticleFormModal } from './ArticleFormModal';
import type { Article } from './types';
import { TagBadge } from '../tags/TagBadge';
import { markdownPreview } from '../../utils/markdownPreview';
import { MarkdownViewerModal } from '../../components/MarkdownViewerModal';

export function ArticlesPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<Article | null>(null);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: articleKeys.lists(),
    queryFn: () => articlesApi.list(),
  });

  const grouped = groupByCategory(articles);

  return (
    <>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <Brain size={22} style={{ color: 'var(--g-heading)' }} />
            <Title order={2} style={{ color: 'var(--g-heading)' }}>Knowledge Base</Title>
          </Group>
          <Button
            leftSection={<Plus size={16} />}
            onClick={() => setModalOpen(true)}
            style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}
          >
            New Article
          </Button>
        </Group>

        {isLoading && <Loader size="sm" />}

        {!isLoading && articles.length === 0 && (
          <Box style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 8,
          }}>
            <FileText size={40} style={{ color: 'var(--g-text-muted)', marginBottom: 12 }} />
            <Text fw={500} style={{ color: 'var(--g-text)' }}>No articles yet</Text>
            <Text size="sm" c="dimmed" mb="md">
              Capture gotchas, how-tos, and reference notes you'll want later.
            </Text>
            <Button onClick={() => setModalOpen(true)} style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}>
              Write your first article
            </Button>
          </Box>
        )}

        {grouped.map(({ label, articles: categoryArticles }) => (
          <Stack key={label} gap="sm">
            <Group gap="xs" align="center">
              <Text fw={600} size="sm" tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
                {label}
              </Text>
              <Badge
                size="sm"
                styles={{ root: { background: 'var(--g-background)', color: 'var(--g-text-muted)', border: '1px solid var(--g-border)' } }}
              >
                {categoryArticles.length}
              </Badge>
            </Group>
            <Stack gap="sm">
              {categoryArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onEdit={() => navigate(`/wiki/${article.id}`)}
                  onView={() => setViewTarget(article)}
                />
              ))}
            </Stack>
          </Stack>
        ))}
      </Stack>

      <ArticleFormModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(created) => navigate(`/wiki/${created.id}`)}
      />

      <MarkdownViewerModal
        opened={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title={viewTarget?.title ?? ''}
        content={viewTarget?.content ?? ''}
        icon={<FileText size={18} style={{ color: 'var(--g-accent)' }} />}
        onOpenEditor={() => viewTarget && navigate(`/wiki/${viewTarget.id}`)}
      />
    </>
  );
}

function ArticleCard({ article, onEdit, onView }: { article: Article; onEdit: () => void; onView: () => void }) {
  return (
    <Box
      onClick={onView}
      style={{
        background: 'var(--g-surface)', border: '1px solid var(--g-border)',
        borderRadius: 6, padding: '10px 14px', cursor: 'pointer',
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group gap="sm" align="flex-start" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <FileText size={18} style={{ color: 'var(--g-accent)', flexShrink: 0, marginTop: 2 }} />
          <Stack gap={4} style={{ minWidth: 0 }}>
            <Text fw={600} style={{ color: 'var(--g-text)', wordBreak: 'break-word' }}>{article.title}</Text>
            {markdownPreview(article.content) && (
              <Text size="sm" lineClamp={2} style={{ color: 'var(--g-text-muted)' }}>
                {markdownPreview(article.content)}
              </Text>
            )}
            {article.tags.length > 0 && (
              <Group gap={4} wrap="wrap" onClick={(e) => e.stopPropagation()}>
                {article.tags.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
              </Group>
            )}
          </Stack>
        </Group>
        <Tooltip label="Edit">
          <ActionIcon variant="subtle" onClick={(e) => { e.stopPropagation(); onEdit(); }} style={{ color: 'var(--g-text-muted)' }}>
            <Pencil size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Box>
  );
}

function groupByCategory(articles: Article[]): { label: string; articles: Article[] }[] {
  const map = new Map<string, Article[]>();
  for (const article of articles) {
    const label = article.category?.trim() || 'Uncategorized';
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(article);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => (a === 'Uncategorized' ? 1 : b === 'Uncategorized' ? -1 : a.localeCompare(b)))
    .map(([label, articles]) => ({ label, articles }));
}
