import { Loader, Stack, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { tagKeys, tagsApi } from '../tags/api';
import { SearchResultList } from './SearchResultList';

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';

  const { data: results = [], isLoading } = useQuery({
    queryKey: tagKeys.search(q),
    queryFn: () => tagsApi.search(q),
    enabled: q.length >= 2,
  });

  return (
    <Stack gap="lg">
      <Title order={2} style={{ color: 'var(--g-heading)' }}>
        Search results for "{q}"
      </Title>

      {isLoading && <Loader size="sm" />}

      {!isLoading && q.length >= 2 && results.length === 0 && (
        <Text c="dimmed">No results found.</Text>
      )}

      {q.length < 2 && (
        <Text c="dimmed">Enter at least 2 characters to search.</Text>
      )}

      <SearchResultList results={results} />
    </Stack>
  );
}
