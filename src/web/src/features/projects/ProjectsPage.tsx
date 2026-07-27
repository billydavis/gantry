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
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconArchive, IconDots, IconEdit, IconFolderPlus, IconPlayerPause, IconRefresh } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { projectsApi, projectKeys } from './api';
import { ProjectFormModal } from './ProjectFormModal';
import type { Project, ProjectStatus } from './types';

const statusColors: Record<ProjectStatus, string> = {
  Active: 'green',
  OnHold: 'yellow',
  Archived: 'gray',
};

const statusLabels: Record<ProjectStatus, string> = {
  Active: 'Active',
  OnHold: 'On Hold',
  Archived: 'Archived',
};

type Filter = 'Active' | 'OnHold' | 'Archived' | 'All';

type TreeEntry = { project: Project; depth: number };

function buildTree(projects: Project[]): TreeEntry[] {
  const inSet = new Set(projects.map((p) => p.id));
  const childrenOf = new Map<string | null, Project[]>();

  for (const p of projects) {
    const parentId = p.parentProjectId && inSet.has(p.parentProjectId) ? p.parentProjectId : null;
    if (!childrenOf.has(parentId)) childrenOf.set(parentId, []);
    childrenOf.get(parentId)!.push(p);
  }

  const result: TreeEntry[] = [];

  const walk = (parentId: string | null, depth: number) => {
    const children = (childrenOf.get(parentId) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    for (const child of children) {
      result.push({ project: child, depth });
      walk(child.id, depth + 1);
    }
  };

  walk(null, 0);
  return result;
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('Active');
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
    onError: (err: Error) => {
      notifications.show({ message: err.message, color: 'red' });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => projectsApi.reactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      notifications.show({ message: 'Project reactivated', color: 'green' });
    },
    onError: (err: Error) => {
      notifications.show({ message: err.message, color: 'red' });
    },
  });

  const holdMutation = useMutation({
    mutationFn: (id: string) => projectsApi.hold(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      notifications.show({ message: 'Project put on hold', color: 'yellow' });
    },
    onError: (err: Error) => {
      notifications.show({ message: err.message, color: 'red' });
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

  const mainTree = buildTree(mainProjects);
  const archivedTree = buildTree(archivedProjects);

  const isEmpty = mainTree.length === 0 && archivedTree.length === 0;

  const renderRow = ({ project, depth }: TreeEntry) => {
    const isChild = depth > 0;
    return (
      <Table.Tr
        key={project.id}
        style={{ cursor: 'pointer' }}
        onClick={() => navigate(`/projects/${project.id}`)}
      >
        <Table.Td>
          <Group gap="xs" wrap="nowrap" style={{ paddingLeft: depth * 24 }}>
            {isChild && (
              <Text size="sm" style={{ color: 'var(--g-border)', lineHeight: 1, flexShrink: 0 }}>
                ↳
              </Text>
            )}
            {project.color ? (
              <ColorSwatch color={project.color} size={isChild ? 10 : 14} style={{ flexShrink: 0 }} />
            ) : (
              <Box
                w={isChild ? 10 : 14}
                h={isChild ? 10 : 14}
                style={{ borderRadius: 3, background: 'var(--g-border)', flexShrink: 0 }}
              />
            )}
            <Text
              size="sm"
              fw={isChild ? 400 : 500}
              style={{ color: isChild ? 'var(--g-text-muted)' : 'var(--g-text)' }}
            >
              {project.name}
            </Text>
          </Group>
        </Table.Td>
        <Table.Td visibleFrom="md">
          <Text size="sm" c="dimmed" lineClamp={1}>
            {project.description ?? '—'}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge color={statusColors[project.status]} variant="light" size="sm">
            {statusLabels[project.status]}
          </Badge>
        </Table.Td>
        <Table.Td visibleFrom="sm">
          <Text size="xs" c="dimmed">
            {new Date(project.updatedUtc).toLocaleDateString()}
          </Text>
        </Table.Td>
        <Table.Td onClick={(e) => e.stopPropagation()}>
          <Menu shadow="md" width={160} position="bottom-end">
            <Menu.Target>
              <Tooltip label="Actions">
                <ActionIcon variant="subtle" size="sm" style={{ color: 'var(--g-text-muted)' }}>
                  <IconDots size={16} />
                </ActionIcon>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown
              styles={{
                dropdown: { background: 'var(--g-surface)', border: '1px solid var(--g-border)' },
              }}
            >
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={() => openEdit(project)}
                styles={{ item: { color: 'var(--g-text)' } }}
              >
                Edit
              </Menu.Item>
              {project.status === 'Active' && (
                <Menu.Item
                  leftSection={<IconPlayerPause size={14} />}
                  onClick={() => holdMutation.mutate(project.id)}
                  styles={{ item: { color: 'var(--g-text)' } }}
                >
                  Put On Hold
                </Menu.Item>
              )}
              {project.status === 'OnHold' && (
                <Menu.Item
                  leftSection={<IconRefresh size={14} />}
                  onClick={() => reactivateMutation.mutate(project.id)}
                  styles={{ item: { color: 'var(--g-text)' } }}
                >
                  Reactivate
                </Menu.Item>
              )}
              {project.status !== 'Archived' ? (
                <Menu.Item
                  leftSection={<IconArchive size={14} />}
                  onClick={() => archiveMutation.mutate(project.id)}
                  styles={{ item: { color: 'var(--g-text-muted)' } }}
                >
                  Archive
                </Menu.Item>
              ) : (
                <Menu.Item
                  leftSection={<IconRefresh size={14} />}
                  onClick={() => reactivateMutation.mutate(project.id)}
                  styles={{ item: { color: 'var(--g-text)' } }}
                >
                  Reactivate
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
      </Table.Tr>
    );
  };

  const tableHeader = (
    <Table.Thead>
      <Table.Tr>
        <Table.Th style={{ color: 'var(--g-text-muted)', fontWeight: 500 }}>Name</Table.Th>
        <Table.Th style={{ color: 'var(--g-text-muted)', fontWeight: 500 }} visibleFrom="md">Description</Table.Th>
        <Table.Th style={{ color: 'var(--g-text-muted)', fontWeight: 500 }}>Status</Table.Th>
        <Table.Th style={{ color: 'var(--g-text-muted)', fontWeight: 500 }} visibleFrom="sm">Updated</Table.Th>
        <Table.Th />
      </Table.Tr>
    </Table.Thead>
  );

  return (
    <>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2} style={{ color: 'var(--g-heading)' }}>
            Projects
          </Title>
          <Button
            leftSection={<IconFolderPlus size={16} />}
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
                <Table.ScrollContainer minWidth={320}>
                  <Table highlightOnHover>
                    {tableHeader}
                    <Table.Tbody>{mainTree.map(renderRow)}</Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
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
                  <Table.ScrollContainer minWidth={320}>
                    <Table highlightOnHover>
                      {tableHeader}
                      <Table.Tbody>{archivedTree.map(renderRow)}</Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
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
