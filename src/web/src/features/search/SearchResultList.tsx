import { useState } from 'react';
import { Box, Group, Stack, Text } from '@mantine/core';
import { Check, ExternalLink, FileText, FolderKanban, NotebookText, Trophy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { noteKeys, notesApi } from '../notes/api';
import { articleKeys, articlesApi } from '../articles/api';
import { MarkdownViewerModal } from '../../components/MarkdownViewerModal';
import type { SearchResult } from '../tags/types';

const TYPE_ICON: Record<string, React.ReactNode> = {
  Project:  <FolderKanban size={15} />,
  Todo:     <Check size={15} />,
  Note:     <NotebookText size={15} />,
  Win:      <Trophy size={15} />,
  Resource: <ExternalLink size={15} />,
  Article:  <FileText size={15} />,
};

const TYPE_COLOR: Record<string, string> = {
  Project:  'var(--g-accent)',
  Todo:     'var(--g-success)',
  Note:     'var(--g-nav-active-text)',
  Win:      'var(--g-accent)',
  Resource: 'var(--g-text-muted)',
  Article:  'var(--g-accent)',
};

const TYPE_GROUP_LABEL: Record<string, string> = {
  Article: 'Knowledge Base',
};

interface Props {
  results: SearchResult[];
}

/** Renders a grouped, clickable list of cross-entity results — shared by the global Search page and the tag usage drill-in. */
export function SearchResultList({ results }: Props) {
  const navigate = useNavigate();
  const grouped = groupByType(results);

  const [viewNoteId, setViewNoteId] = useState<{ id: string; title: string } | null>(null);
  const [viewArticleId, setViewArticleId] = useState<{ id: string; title: string } | null>(null);

  const { data: viewNote, isLoading: viewNoteLoading } = useQuery({
    queryKey: noteKeys.detail(viewNoteId?.id ?? ''),
    queryFn: () => notesApi.getById(viewNoteId!.id),
    enabled: !!viewNoteId,
  });

  const { data: viewArticle, isLoading: viewArticleLoading } = useQuery({
    queryKey: articleKeys.detail(viewArticleId?.id ?? ''),
    queryFn: () => articlesApi.getById(viewArticleId!.id),
    enabled: !!viewArticleId,
  });

  const handleClick = (r: SearchResult) => {
    switch (r.type) {
      case 'Project':  navigate(`/projects/${r.id}`); break;
      case 'Note':     setViewNoteId({ id: r.id, title: r.title }); break;
      case 'Win':      navigate('/wins'); break;
      case 'Todo':     navigate('/'); break;
      case 'Resource': if (r.projectId) navigate(`/projects/${r.projectId}`); break;
      case 'Article':  setViewArticleId({ id: r.id, title: r.title }); break;
    }
  };

  return (
    <Stack gap="lg">
      {grouped.map(({ type, items }) => (
        <Stack key={type} gap="sm">
          <Text fw={600} size="sm" tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
            {TYPE_GROUP_LABEL[type] ?? `${type}s`}
          </Text>
          <Box style={{ background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 8, overflow: 'hidden' }}>
            {items.map((r, i) => (
              <Box
                key={r.id}
                onClick={() => handleClick(r)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
                  borderBottom: i < items.length - 1 ? '1px solid var(--g-border)' : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--g-background)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Box style={{ color: TYPE_COLOR[r.type], paddingTop: 2, flexShrink: 0 }}>
                  {TYPE_ICON[r.type]}
                </Box>
                <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={500} style={{ color: 'var(--g-text)' }}>{r.title}</Text>
                  {r.snippet && (
                    <Text size="xs" c="dimmed" lineClamp={2}>{r.snippet}</Text>
                  )}
                  <Group gap="xs">
                    {r.subtitle && <Text size="xs" c="dimmed">{r.subtitle}</Text>}
                    {r.projectName && (
                      <>
                        {r.subtitle && <Text size="xs" c="dimmed">·</Text>}
                        <Text size="xs" c="dimmed">{r.projectName}</Text>
                      </>
                    )}
                  </Group>
                </Stack>
              </Box>
            ))}
          </Box>
        </Stack>
      ))}

      <MarkdownViewerModal
        opened={!!viewNoteId}
        onClose={() => setViewNoteId(null)}
        title={viewNoteId?.title ?? ''}
        content={viewNote?.content ?? ''}
        icon={<NotebookText size={18} style={{ color: 'var(--g-accent)' }} />}
        isLoading={viewNoteLoading}
        onOpenEditor={() => viewNoteId && navigate(`/notes/${viewNoteId.id}`)}
      />

      <MarkdownViewerModal
        opened={!!viewArticleId}
        onClose={() => setViewArticleId(null)}
        title={viewArticleId?.title ?? ''}
        content={viewArticle?.content ?? ''}
        icon={<FileText size={18} style={{ color: 'var(--g-accent)' }} />}
        isLoading={viewArticleLoading}
        onOpenEditor={() => viewArticleId && navigate(`/wiki/${viewArticleId.id}`)}
      />
    </Stack>
  );
}

function groupByType(results: SearchResult[]): { type: string; items: SearchResult[] }[] {
  const map = new Map<string, SearchResult[]>();
  for (const r of results) {
    if (!map.has(r.type)) map.set(r.type, []);
    map.get(r.type)!.push(r);
  }
  const order = ['Project', 'Todo', 'Note', 'Win', 'Resource', 'Article'];
  return order.filter(t => map.has(t)).map(type => ({ type, items: map.get(type)! }));
}
