import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  ColorSwatch,
  Group,
  Menu,
  SegmentedControl,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { Archive, Ellipsis, Folder, FolderPlus, Pause, Pencil, RefreshCw } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { projectsApi, projectKeys } from './api';
import { ProjectFormModal } from './ProjectFormModal';
import type { Project, ProjectStatus } from './types';
import { statusColors, statusLabels } from './statusMeta';
import { buildProjectTree, type ProjectTreeEntry } from './projectTree';

type Filter = 'Active' | 'OnHold' | 'Archived' | 'All';

const FILTER_STORAGE_KEY = 'gantry-projects-filter';
const VALID_FILTERS: Filter[] = ['Active', 'OnHold', 'Archived', 'All'];

function loadFilter(): Filter {
  const raw = localStorage.getItem(FILTER_STORAGE_KEY);
  return VALID_FILTERS.includes(raw as Filter) ? (raw as Filter) : 'All';
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

  const { data: projects = [], isLoading } = useQuery({
    queryKey: projectKeys.list(),
    queryFn: projectsApi.list,
  });

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

  // Derive what to show in each section based on the active filter
  const mainProjects = projects.filter((p) => {
    if (filter === 'Active') return p.status === 'Active';
    if (filter === 'OnHold') return p.status === 'OnHold';
    if (filter === 'All') return p.status !== 'Archived';
    return false; // Archived filter — main section is empty
  });

  const archivedProjects =
    filter === 'Archived' || filter === 'All'
      ? projects.filter((p) => p.status === 'Archived')
      : [];

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
            <Folder size={isChild ? 12 : 14} style={{ color: 'var(--g-text-muted)', flexShrink: 0 }} />
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
                  <Menu.Item
                    leftSection={<RefreshCw size={14} />}
                    onClick={() => reactivateMutation.mutate(project.id)}
                    styles={{ item: { color: 'var(--g-text)' } }}
                  >
                    Reactivate
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          </Box>
        </Group>

        {/* Secondary row — description, indented under the name */}
        {project.description && (
          <Text
            size="xs"
            c="dimmed"
            visibleFrom="md"
            style={{
              paddingLeft: depth * 24 + (isChild ? 34 : 24),
              marginTop: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {project.description}
          </Text>
        )}
      </Box>
    );
  };

  return (
    <>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2} style={{ color: 'var(--g-heading)' }}>
            Projects
          </Title>
          <Button
            leftSection={<FolderPlus size={16} />}
            onClick={openCreate}
            style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}
          >
            New Project
          </Button>
        </Group>

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
              alignSelf: 'flex-start',
            },
            label: { color: 'var(--g-text-muted)', fontSize: 13 },
          }}
        />

        {isLoading ? (
          <Text c="dimmed">Loading…</Text>
        ) : isEmpty ? (
          <Stack align="center" py="xl" gap="sm">
            <Text c="dimmed">
              {projects.length === 0 ? 'No projects yet.' : `No ${statusLabels[filter as ProjectStatus] ?? ''} projects.`}
            </Text>
            {projects.length === 0 && (
              <Button variant="subtle" onClick={openCreate}>
                Create your first project
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
    </>
  );
}
