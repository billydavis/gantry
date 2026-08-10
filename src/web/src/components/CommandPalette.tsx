import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spotlight, spotlight } from '@mantine/spotlight';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChartNoAxesGantt, Check, ExternalLink, Folder, LayoutDashboard, Search, StickyNote, Trophy } from 'lucide-react';
import { projectsApi, projectKeys } from '../features/projects/api';
import { tagsApi, tagKeys } from '../features/tags/api';
import type { SearchResult } from '../features/tags/types';
import { NoteDrawer } from '../features/notes/NoteDrawer';
import { WinFormModal } from '../features/wins/WinFormModal';

import '@mantine/spotlight/styles.css';

export { spotlight };

const RESULT_ICON: Record<SearchResult['type'], React.ReactNode> = {
  Project:  <Folder size={18} />,
  Todo:     <Check size={18} />,
  Note:     <StickyNote size={18} />,
  Win:      <Trophy size={18} />,
  Resource: <ExternalLink size={18} />,
  Article:  <BookOpen size={18} />,
};

export function CommandPalette() {
  const navigate = useNavigate();
  const [noteOpen, setNoteOpen] = useState(false);
  const [winOpen, setWinOpen] = useState(false);
  const [query, setQuery] = useState('');

  const trimmed = query.trim();

  const { data: projects = [] } = useQuery({
    queryKey: projectKeys.list(),
    queryFn: projectsApi.list,
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: tagKeys.search(trimmed),
    queryFn: () => tagsApi.search(trimmed),
    enabled: trimmed.length >= 2,
  });

  const staticActions = useMemo(() => {
    const nav = [
      { id: 'dashboard',  label: 'Dashboard',  description: 'Go to dashboard',     leftSection: <LayoutDashboard size={18} />, onClick: () => navigate('/') },
      { id: 'projects',   label: 'Projects',   description: 'Browse all projects', leftSection: <Folder size={18} />,          onClick: () => navigate('/projects') },
      { id: 'notes',      label: 'Notes',      description: 'Open daily notes',    leftSection: <StickyNote size={18} />,            onClick: () => navigate('/notes') },
      { id: 'wiki',       label: 'Wiki',       description: 'Browse the wiki',     leftSection: <BookOpen size={18} />,           onClick: () => navigate('/wiki') },
      { id: 'wins',       label: 'Wins',       description: 'View all wins',       leftSection: <Trophy size={18} />,          onClick: () => navigate('/wins') },
      { id: 'timeline',   label: 'Timeline',   description: 'Browse timeline',     leftSection: <ChartNoAxesGantt size={18} />,        onClick: () => navigate('/timeline') },
      {
        id: 'new-note', label: 'New Note', description: 'Create a new note',
        leftSection: <StickyNote size={18} />,
        onClick: () => { spotlight.close(); setNoteOpen(true); },
      },
      {
        id: 'new-win', label: 'Log Win', description: 'Record an accomplishment',
        leftSection: <Trophy size={18} />,
        onClick: () => { spotlight.close(); setWinOpen(true); },
      },
    ];

    const projectActions = projects
      .filter((p) => p.status === 'Active')
      .map((p) => ({
        id: `project-${p.id}`,
        label: p.name,
        description: 'Project',
        leftSection: <Folder size={18} style={{ color: p.color ?? undefined }} />,
        onClick: () => navigate(`/projects/${p.id}`),
      }));

    return [...nav, ...projectActions];
  }, [projects, navigate]);

  const handleResultClick = (r: SearchResult) => {
    spotlight.close();
    switch (r.type) {
      case 'Project':  navigate(`/projects/${r.id}`); break;
      case 'Note':     navigate(`/notes/${r.id}`); break;
      case 'Win':      navigate('/wins'); break;
      case 'Todo':     navigate('/'); break;
      case 'Resource': if (r.projectId) navigate(`/projects/${r.projectId}`); break;
      case 'Article':  navigate(`/wiki/${r.id}`); break;
    }
  };

  // When the user has typed something, show live search results + a "see all" action.
  // Fall back to static actions when the query is empty.
  const actions = trimmed.length >= 2
    ? [
        ...searchResults.map((r) => ({
          id: `result-${r.type}-${r.id}`,
          label: r.title,
          description: r.snippet ?? r.subtitle ?? r.type,
          leftSection: RESULT_ICON[r.type],
          onClick: () => handleResultClick(r),
        })),
        {
          id: 'search-all',
          label: `See all results for "${trimmed}"`,
          description: 'Open full search page',
          leftSection: <Search size={18} />,
          onClick: () => navigate(`/search?q=${encodeURIComponent(trimmed)}`),
        },
      ]
    : staticActions;

  return (
    <>
      <Spotlight
        actions={actions}
        query={query}
        onQueryChange={setQuery}
        filter={(_q, a) => a} // disable built-in filtering — results come from the API
        shortcut="mod+K"
        nothingFound={trimmed.length >= 2 ? 'No results found' : 'Type to search…'}
        searchProps={{ placeholder: 'Search or jump to…' }}
        styles={{
          root:    { '--spotlight-overlay-bg': 'color-mix(in srgb, var(--g-background) 60%, transparent)' },
          content: { background: 'var(--g-surface)', border: '1px solid var(--g-border)' },
          search:  { background: 'var(--g-background)', color: 'var(--g-text)', borderColor: 'var(--g-border)' },
          action:  { color: 'var(--g-text)' },
        }}
      />

      <NoteDrawer opened={noteOpen} onClose={() => setNoteOpen(false)} />
      <WinFormModal opened={winOpen} onClose={() => setWinOpen(false)} />
    </>
  );
}
