import { ActionIcon, Group, Loader, Text, Title } from '@mantine/core';
import { ArrowLeft, Tag as TagIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { tagKeys, tagsApi } from './api';
import { SearchResultList } from '../search/SearchResultList';

/** Standalone "everything tagged X" view — reached by clicking any TagBadge in the app. */
export function TagUsagePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: tags } = useQuery({ queryKey: tagKeys.list(), queryFn: tagsApi.list });
  const tag = tags?.find((t) => t.id === id);

  const { data: results, isLoading } = useQuery({
    queryKey: tagKeys.usage(id ?? ''),
    queryFn: () => tagsApi.usage(id!),
    enabled: !!id,
  });

  return (
    <div>
      <Group gap="sm" mb="lg">
        <ActionIcon variant="subtle" onClick={() => navigate(-1)} style={{ color: 'var(--g-text-muted)' }}>
          <ArrowLeft size={18} />
        </ActionIcon>
        <TagIcon size={20} style={{ color: 'var(--g-accent)' }} />
        <Title order={2} style={{ color: 'var(--g-heading)' }}>
          {tag ? `Tagged "${tag.name}"` : 'Tagged items'}
        </Title>
      </Group>

      {isLoading ? (
        <Loader size="sm" />
      ) : results && results.length === 0 ? (
        <Text size="sm" c="dimmed">Not used anywhere.</Text>
      ) : (
        <SearchResultList results={results ?? []} />
      )}
    </div>
  );
}
