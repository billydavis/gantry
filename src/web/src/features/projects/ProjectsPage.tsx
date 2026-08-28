import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  ColorSwatch,
  Group,
  Menu,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Archive, Ellipsis, FolderKanban, FolderPlus, Pause, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { projectsApi, projectKeys } from './api';
import { ProjectFormModal } from './ProjectFormModal';
import { DeleteProjectModal } from './DeleteProjectModal';
import type { Project, ProjectStatus } from './types';
import { statusColors, statusLabels } from './statusMeta';
import { buildProjectTree, type ProjectTreeEntry } from './projectTree';
import { ExpandableDescription } from '../../components/ExpandableDescription';
import { SearchInput } from '../../components/SearchInput';
import { TagPicker } from '../tags/TagPicker';

type Filter = 'Active' | 'OnHold' | 'Archived' | 'All';

const FILTER_STORAGE_KEY = 'gantry-projects-filter';
const VALID_FILTERS: Filter[] = ['Active', 'OnHold', 'Archived', 'All'];

function loadFilter(): Filter {
  const raw = localStorage.getItem(FILTER_STORAGE_KEY);
  return VALID_FILTERS.includes(raw as Filter) ? (raw as Filter) : 'All';
}

/**
 * Keeps only projects that match `matches`, plus the ancestors of any match so
 * the tree stays connected. Descendants of a match are not pulled in.
 */
function filterKeepingTree(projects: Project[], matches: (p: Project) => boolean): Project[] {
  const byId = new Map(projects.map((p) => [p.id, p]));
  const keep = new Set<string>();

  for (const p of projects) {
    if (!matches(p)) continue;
    keep.add(p.id);
    let parentId = p.parentProjectId;
    while (parentId && byId.has(parentId) && !keep.has(parentId)) {
      keep.add(parentId);
      parentId = byId.get(parentId)!.parentProjectId;
    }
  }

  return projects.filter((p) => keep.has(p.id));
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilterState] = useState<Filter>(loadFilter);
  const setFilter = (next: Filter) => {
    setFilterState(next);
    localStorage.setItem(FILTER_STORAGE_KEY, next);
  };
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [deleteModalProject, setDeleteModalProject] = useState<Project | undefined>();
  const [search, setSearch] = useState('');
  const [tagId, setTagId] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 200);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: projectKeys.list(),
    queryFn: projectsApi.list,
  });

  const q = debouncedSearch.trim().toLowerCase();
  const filtersActive = q.length > 0 || tagId !== null;

  const tagOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of projects) for (const t of p.tags) seen.set(t.id, t.name);
    return [...seen.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [projects]);

  const matchesFilters = (p: Project) => {
    const textOk = !q || p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q);
    const tagOk = !tagId || p.tags.some((t) => t.id === tagId);
    return textOk && tagOk;
  };

  const archiveMutation = useMutation({
    mutationFn: (id: string) => projectsApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      notifications.show({ message: 'Project archived', color: 'gray' });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => projectsApi.reactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      notifications.show({ message: 'Project reactivated', color: 'green' });
    },
  });

  const holdMutation = useMutation({
    mutationFn: (id: string) => projectsApi.hold(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      notifications.show({ message: 'Project put on hold', color: 'yellow' });
    },
  });

  const openCreate = () => {
    setEditingProject(undefined);
    setModalOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  // Derive what to show in each section based on the active status filter
  let mainProjects = projects.filter((p) => {
    if (filter === 'Active') return p.status === 'Active';
    if (filter === 'OnHold') return p.status === 'OnHold';
    if (filter === 'All') return p.status !== 'Archived';
    return false; // Archived filter — main section is empty
  });

  let archivedProjects =
    filter === 'Archived' || filter === 'All'
      ? projects.filter((p) => p.status === 'Archived')
      : [];

  // Then narrow by the search / tag filter, keeping matched projects' ancestors
  // so the hierarchy stays readable.
  if (filtersActive) {
    mainProjects = filterKeepingTree(mainProjects, matchesFilters);
    archivedProjects = filterKeepingTree(archivedProjects, matchesFilters);
  }

  const mainTree = buildProjectTree(mainProjects);
  const archivedTree = buildProjectTree(archivedProjects);

  const isEmpty = mainTree.length === 0 && archivedTree.length === 0;

  const renderRow = ({ project, depth }: ProjectTreeEntry, isLast: boolean) => {
    const isChild = depth > 0;
    return (
      <Box
        key={project.id}
        onClick={() => navigate(`/projects/${project.id}`)}
        style={{
          padding: '10px 14px',
          borderBottom: isLast ? 'none' : '1px solid var(--g-border)',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--g-background)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        {/* Primary row — swatch, name, status, actions pinned top-right */}
        <Group gap={10} align="center" wrap="nowrap" style={{ paddingLeft: depth * 24 }}>
          {isChild && (
            <Text size="sm" style={{ color: 'var(--g-border)', lineHeight: 1, flexShrink: 0 }}>
              ↳
            </Text>
          )}
          {project.color ? (
            <ColorSwatch color={project.color} size={isChild ? 10 : 14} style={{ flexShrink: 0 }} />
          ) : (
            <FolderKanban size={isChild ? 12 : 14} style={{ color: 'var(--g-text-muted)', flexShrink: 0 }} />
          )}
          <Text
            fw={isChild ? 400 : 500}
            style={{
              flex: 1,
              minWidth: 0,
              color: isChild ? 'var(--g-text-muted)' : 'var(--g-text)',
              fontSize: 14,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {project.name}
          </Text>
          <Badge color={statusColors[project.status]} variant="light" size="sm" style={{ flexShrink: 0 }}>
            {statusLabels[project.status]}
          </Badge>
          <Text size="xs" c="dimmed" visibleFrom="sm" style={{ flexShrink: 0, width: 76, textAlign: 'right' }}>
            {new Date(project.updatedUtc).toLocaleDateString()}
          </Text>
          <Box onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
            <Menu width={160} position="bottom-end">
              <Menu.Target>
                <Tooltip label="Actions">
                  <ActionIcon variant="subtle" size="sm" style={{ color: 'var(--g-text-muted)' }}>
                    <Ellipsis size={16} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown
                styles={{
                  dropdown: { background: 'var(--g-surface)', border: '1px solid var(--g-border)' },
                }}
              >
                <Menu.Item
                  leftSection={<Pencil size={14} />}
                  onClick={() => openEdit(project)}
                  styles={{ item: { color: 'var(--g-text)' } }}
                >
                  Edit
                </Menu.Item>
                {project.status === 'Active' && (
                  <Menu.Item
                    leftSection={<Pause size={14} />}
                    onClick={() => holdMutation.mutate(project.id)}
                    styles={{ item: { color: 'var(--g-text)' } }}
                  >
                    Put On Hold
                  </Menu.Item>
                )}
                {project.status === 'OnHold' && (
                  <Menu.Item
                    leftSection={<RefreshCw size={14} />}
                    onClick={() => reactivateMutation.mutate(project.id)}
                    styles={{ item: { color: 'var(--g-text)' } }}
                  >
                    Reactivate
                  </Menu.Item>
                )}
                {project.status !== 'Archived' ? (
                  <Menu.Item
                    leftSection={<Archive size={14} />}
                    onClick={() => archiveMutation.mutate(project.id)}
                    styles={{ item: { color: 'var(--g-text-muted)' } }}
                  >
                    Archive
                  </Menu.Item>
                ) : (
                  <>
                    <Menu.Item
                      leftSection={<RefreshCw size={14} />}
                      onClick={() => reactivateMutation.mutate(project.id)}
                      styles={{ item: { color: 'var(--g-text)' } }}
                    >
                      Reactivate
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<Trash2 size={14} />}
                      onClick={() => setDeleteModalProject(project)}
                      styles={{ item: { color: 'var(--g-danger)' } }}
                    >
                      Delete Forever
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
          </Box>
        </Group>

        {/* Secondary row — expandable description and tags, indented under the name */}
        {(project.description || project.tags.length > 0) && (
          <Box
            visibleFrom="md"
            style={{ paddingLeft: depth * 24 + (isChild ? 34 : 24), marginTop: 4 }}
          >
            {project.description && <ExpandableDescription content={project.description} />}
            <Box
              onClick={(e) => e.stopPropagation()}
              mt={project.description ? 4 : 0}
              ml={project.description ? 21 : 0}
            >
              <TagPicker
                selectedTags={project.tags}
                entityType="projects"
                entityId={project.id}
                onChanged={() => queryClient.invalidateQueries({ queryKey: projectKeys.all })}
              />
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <FolderKanban size={22} style={{ color: 'var(--g-heading)' }} />
            <Title order={2} style={{ color: 'var(--g-heading)' }}>
              Projects
            </Title>
          </Group>
          <Button
            leftSection={<FolderPlus size={16} />}
            onClick={openCreate}
            style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}
          >
            New Project
          </Button>
        </Group>

        <Group gap="sm" align="center" wrap="wrap">
          <SegmentedControl
            value={filter}
            onChange={(v) => setFilter(v as Filter)}
            data={[
              { label: 'Active', value: 'Active' },
              { label: 'On Hold', value: 'OnHold' },
              { label: 'Archived', value: 'Archived' },
              { label: 'All', value: 'All' },
            ]}
            styles={{
              root: {
                background: 'var(--g-surface)',
                border: '1px solid var(--g-border)',
              },
              label: { color: 'var(--g-text-muted)', fontSize: 13 },
            }}
          />
          <SearchInput value={search} onChange={setSearch} placeholder="Search projects…" width={220} />
          {tagOptions.length > 0 && (
            <Select
              placeholder="All tags"
              clearable
              searchable
              data={tagOptions}
              value={tagId}
              onChange={setTagId}
              styles={{ input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' } }}
              w={180}
            />
          )}
          {filtersActive && (
            <Button variant="subtle" size="sm" onClick={() => { setSearch(''); setTagId(null); }} style={{ color: 'var(--g-text-muted)' }}>
              Clear filters
            </Button>
          )}
        </Group>

        {isLoading ? (
          <Text c="dimmed">Loading…</Text>
        ) : isEmpty ? (
          <Stack align="center" py="xl" gap="sm">
            <Text c="dimmed">
              {projects.length === 0
                ? 'No projects yet.'
                : filtersActive
                  ? 'No projects match these filters.'
                  : `No ${statusLabels[filter as ProjectStatus] ?? ''} projects.`}
            </Text>
            {projects.length === 0 && (
              <Button variant="subtle" onClick={openCreate}>
                Create your first project
              </Button>
            )}
            {projects.length > 0 && filtersActive && (
              <Button variant="subtle" onClick={() => { setSearch(''); setTagId(null); }} style={{ color: 'var(--g-text-muted)' }}>
                Clear filters
              </Button>
            )}
          </Stack>
        ) : (
          <Stack gap="xl">
            {mainTree.length > 0 && (
              <Box
                style={{
                  background: 'var(--g-surface)',
                  border: '1px solid var(--g-border)',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                {mainTree.map((entry, i) => renderRow(entry, i === mainTree.length - 1))}
              </Box>
            )}

            {archivedTree.length > 0 && (
              <Box>
                {filter === 'All' && (
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed" mb="xs" px={2}>
                    Archived
                  </Text>
                )}
                <Box
                  style={{
                    background: 'var(--g-surface)',
                    border: '1px solid var(--g-border)',
                    borderRadius: 8,
                    overflow: 'hidden',
                    opacity: 0.7,
                  }}
                >
                  {archivedTree.map((entry, i) => renderRow(entry, i === archivedTree.length - 1))}
                </Box>
              </Box>
            )}
          </Stack>
        )}
      </Stack>

      <ProjectFormModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        project={editingProject}
      />

      <DeleteProjectModal
        opened={!!deleteModalProject}
        onClose={() => setDeleteModalProject(undefined)}
        project={deleteModalProject}
      />
    </>
  );
}
