import { useEffect, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  ColorSwatch,
  Divider,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconEdit, IconFolder, IconFolderOpen, IconPlus, IconTrash } from '@tabler/icons-react';
import { TodoList } from '../todos/TodoList';
import { ResourceList } from '../resources/ResourceList';
import { ProjectNotesList } from '../notes/ProjectNotesList';
import { NoteDrawer } from '../notes/NoteDrawer';
import { noteKeys } from '../notes/api';
import { ProjectWinsList } from '../wins/ProjectWinsList';
import { WinFormModal } from '../wins/WinFormModal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { projectsApi, projectKeys } from './api';
import { ProjectFormModal } from './ProjectFormModal';
import type { Project, ProjectStatus } from './types';
import type { Note } from '../notes/types';
import type { Win } from '../wins/types';
import { environmentsApi, environmentKeys } from '../environments/api';
import { EnvironmentFormModal } from '../environments/EnvironmentFormModal';
import { TagPicker } from '../tags/TagPicker';
import { useRecentProjects } from '../../hooks/useRecentProjects';

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

type TreeEntry = { project: Project; depth: number };

function buildSubTree(all: Project[], rootId: string): TreeEntry[] {
  const result: TreeEntry[] = [];
  const walk = (parentId: string, depth: number) => {
    const children = all
      .filter((p) => p.parentProjectId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const child of children) {
      result.push({ project: child, depth });
      walk(child.id, depth + 1);
    }
  };
  walk(rootId, 0);
  return result;
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { push: pushRecent } = useRecentProjects();
  const [editOpen, setEditOpen] = useState(false);
  const [envFormOpen, setEnvFormOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState<import('../environments/types').ProjectEnvironment | undefined>();
  const [noteDrawerOpen, setNoteDrawerOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | undefined>();
  const [winModalOpen, setWinModalOpen] = useState(false);
  const [editingWin, setEditingWin] = useState<Win | undefined>();

  const { data: project, isLoading } = useQuery({
    queryKey: projectKeys.detail(id!),
    queryFn: () => projectsApi.getById(id!),
    enabled: !!id,
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: projectKeys.list(),
    queryFn: projectsApi.list,
    enabled: !!project,
  });

  const { data: environments = [] } = useQuery({
    queryKey: id ? environmentKeys.byProject(id) : ['env-skip'],
    queryFn: () => environmentsApi.list(id!),
    enabled: !!id,
  });

  const deleteEnvMutation = useMutation({
    mutationFn: environmentsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: environmentKeys.byProject(id!) }),
    onError: (err: Error) => notifications.show({ message: err.message, color: 'red' }),
  });

  useEffect(() => {
    if (project) pushRecent({ id: project.id, name: project.name, color: project.color });
  }, [project?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: parentProject } = useQuery({
    queryKey: projectKeys.detail(project?.parentProjectId!),
    queryFn: () => projectsApi.getById(project!.parentProjectId!),
    enabled: !!project?.parentProjectId,
  });

  if (isLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={32} width={300} />
        <Skeleton height={20} width={200} />
        <Skeleton height={120} />
      </Stack>
    );
  }

  if (!project) {
    return (
      <Stack align="center" py="xl">
        <IconFolder size={48} style={{ color: 'var(--g-text-muted)' }} />
        <Text c="dimmed">Project not found.</Text>
        <Button component={Link} to="/projects" variant="subtle">
          Back to Projects
        </Button>
      </Stack>
    );
  }

  const subProjects = buildSubTree(allProjects, project.id);

  return (
    <>
      <Stack gap="lg">
        <Breadcrumbs styles={{ breadcrumb: { color: 'var(--g-text-muted)', fontSize: 13 } }}>
          <Text
            component={Link}
            to="/projects"
            size="sm"
            style={{ color: 'var(--g-text-muted)', textDecoration: 'none' }}
          >
            Projects
          </Text>
          {parentProject && (
            <Text
              component={Link}
              to={`/projects/${parentProject.id}`}
              size="sm"
              style={{ color: 'var(--g-text-muted)', textDecoration: 'none' }}
            >
              {parentProject.name}
            </Text>
          )}
          <Text size="sm" style={{ color: 'var(--g-text)' }}>
            {project.name}
          </Text>
        </Breadcrumbs>

        <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
          <Group gap="sm" align="center" wrap="wrap">
            {project.color && <ColorSwatch color={project.color} size={20} />}
            <Title order={1} style={{ color: 'var(--g-heading)', fontSize: 'clamp(1.4rem, 4vw, 2rem)' }}>
              {project.name}
            </Title>
            <Badge color={statusColors[project.status]} variant="light" size="md">
              {statusLabels[project.status]}
            </Badge>
          </Group>
          <Button
            leftSection={<IconEdit size={16} />}
            variant="subtle"
            onClick={() => setEditOpen(true)}
            style={{ color: 'var(--g-text-muted)' }}
          >
            Edit
          </Button>
        </Group>

        {project.description && (
          <Text style={{ color: 'var(--g-text-muted)' }} size="sm">
            {project.description}
          </Text>
        )}

        <TagPicker
          selectedTags={project.tags}
          entityType="projects"
          entityId={project.id}
          onChanged={() => queryClient.invalidateQueries({ queryKey: projectKeys.detail(project.id) })}
        />

        <Divider style={{ borderColor: 'var(--g-border)' }} />

        {/* Overview */}
        <Stack gap="md">
          <Text
            fw={600}
            size="sm"
            tt="uppercase"
            style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}
          >
            Overview
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 12,
            }}
          >
            <OverviewCard label="Status" value={statusLabels[project.status]} />
            <OverviewCard
              label="Created"
              value={new Date(project.createdUtc).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            />
            <OverviewCard
              label="Last Updated"
              value={new Date(project.updatedUtc).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            />
            {parentProject && (
              <OverviewCard label="Parent Project" value={parentProject.name} />
            )}
          </Box>
        </Stack>

        {/* Sub-projects */}
        {subProjects.length > 0 && (
          <>
            <Divider style={{ borderColor: 'var(--g-border)' }} />
            <Stack gap="sm">
              <Group gap="xs" align="center">
                <Text
                  fw={600}
                  size="sm"
                  tt="uppercase"
                  style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}
                >
                  Sub-projects
                </Text>
                <Badge
                  size="sm"
                  styles={{ root: { background: 'var(--g-background)', color: 'var(--g-text-muted)', border: '1px solid var(--g-border)' } }}
                >
                  {subProjects.length}
                </Badge>
              </Group>
              <Box
                style={{
                  background: 'var(--g-surface)',
                  border: '1px solid var(--g-border)',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                {subProjects.map(({ project: child, depth }) => (
                  <Box
                    key={child.id}
                    onClick={() => navigate(`/projects/${child.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 16px',
                      paddingLeft: 16 + depth * 24,
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--g-border)',
                      transition: 'background 120ms',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = 'var(--g-background)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'transparent')
                    }
                  >
                    <Group gap="sm" wrap="nowrap">
                      {depth > 0 && (
                        <Text size="sm" style={{ color: 'var(--g-border)', flexShrink: 0 }}>
                          ↳
                        </Text>
                      )}
                      {child.color ? (
                        <ColorSwatch color={child.color} size={12} style={{ flexShrink: 0 }} />
                      ) : (
                        <IconFolderOpen size={14} style={{ color: 'var(--g-text-muted)', flexShrink: 0 }} />
                      )}
                      <Text
                        size="sm"
                        fw={depth === 0 ? 500 : 400}
                        style={{ color: depth === 0 ? 'var(--g-text)' : 'var(--g-text-muted)' }}
                      >
                        {child.name}
                      </Text>
                      {child.description && (
                        <Text size="xs" c="dimmed" lineClamp={1} style={{ maxWidth: 320 }}>
                          {child.description}
                        </Text>
                      )}
                    </Group>
                    <Badge
                      color={statusColors[child.status]}
                      variant="light"
                      size="xs"
                      style={{ flexShrink: 0 }}
                    >
                      {statusLabels[child.status]}
                    </Badge>
                  </Box>
                ))}
              </Box>
            </Stack>
          </>
        )}

        {/* Todo List */}
        <Divider style={{ borderColor: 'var(--g-border)' }} />
        <Stack gap="sm">
          <Text fw={600} size="sm" tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
            Todo List
          </Text>
          <TodoList projectId={project.id} />
        </Stack>
        {/* Environments */}
        <Divider style={{ borderColor: 'var(--g-border)' }} />
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Text fw={600} size="sm" tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
                Environments
              </Text>
              {environments.length > 0 && (
                <Badge
                  size="sm"
                  styles={{ root: { background: 'var(--g-background)', color: 'var(--g-text-muted)', border: '1px solid var(--g-border)' } }}
                >
                  {environments.length}
                </Badge>
              )}
            </Group>
            <Tooltip label="Add environment">
              <ActionIcon variant="subtle" size="sm" onClick={() => { setEditingEnv(undefined); setEnvFormOpen(true); }}
                style={{ color: 'var(--g-text-muted)' }}>
                <IconPlus size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
          {environments.length === 0 ? (
            <Text size="sm" c="dimmed">No environments. Add one to group resources by deployment target.</Text>
          ) : (
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {environments.map((env) => (
                <Box
                  key={env.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 12px',
                    background: 'var(--g-surface)',
                    border: '1px solid var(--g-border)',
                    borderRadius: 6,
                  }}
                >
                  <Box>
                    <Text size="sm" fw={500} style={{ color: 'var(--g-text)' }}>{env.name}</Text>
                    {env.baseUrl && (
                      <Text size="xs" style={{ color: 'var(--g-text-muted)', fontFamily: 'monospace' }}>{env.baseUrl}</Text>
                    )}
                  </Box>
                  <Group gap={2}>
                    <Tooltip label="Edit">
                      <ActionIcon variant="subtle" size="xs" style={{ color: 'var(--g-text-muted)' }}
                        onClick={() => { setEditingEnv(env); setEnvFormOpen(true); }}>
                        <IconEdit size={12} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete">
                      <ActionIcon variant="subtle" size="xs" color="red"
                        onClick={() => deleteEnvMutation.mutate(env.id)}>
                        <IconTrash size={12} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Box>
              ))}
            </Box>
          )}
        </Stack>

        {/* Quick Links / Resources */}
        <Divider style={{ borderColor: 'var(--g-border)' }} />
        <Stack gap="sm">
          <Text fw={600} size="sm" tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
            Quick Links
          </Text>
          <ResourceList projectId={project.id} environments={environments} />
        </Stack>
        {/* Notes */}
        <Divider style={{ borderColor: 'var(--g-border)' }} />
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Text fw={600} size="sm" tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
              Notes
            </Text>
            <Tooltip label="New note">
              <ActionIcon variant="subtle" size="sm"
                onClick={() => { setActiveNote(undefined); setNoteDrawerOpen(true); }}
                style={{ color: 'var(--g-text-muted)' }}>
                <IconPlus size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
          <ProjectNotesList
            projectId={project.id}
            onEdit={(note) => { setActiveNote(note); setNoteDrawerOpen(true); }}
          />
        </Stack>
        {/* Wins */}
        <Divider style={{ borderColor: 'var(--g-border)' }} />
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Text fw={600} size="sm" tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
              Wins
            </Text>
            <Tooltip label="Log win">
              <ActionIcon variant="subtle" size="sm"
                onClick={() => { setEditingWin(undefined); setWinModalOpen(true); }}
                style={{ color: 'var(--g-text-muted)' }}>
                <IconPlus size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
          <ProjectWinsList
            projectId={project.id}
            onEdit={(win) => { setEditingWin(win); setWinModalOpen(true); }}
          />
        </Stack>
      </Stack>

      <ProjectFormModal
        opened={editOpen}
        onClose={() => setEditOpen(false)}
        project={project}
      />
      <EnvironmentFormModal
        opened={envFormOpen}
        onClose={() => setEnvFormOpen(false)}
        projectId={project.id}
        environment={editingEnv}
        nextSortOrder={environments.length}
      />
      <NoteDrawer
        opened={noteDrawerOpen}
        onClose={() => {
          setNoteDrawerOpen(false);
          setActiveNote(undefined);
          queryClient.invalidateQueries({ queryKey: noteKeys.list({ projectId: project.id }) });
        }}
        note={activeNote}
        defaultProjectId={project.id}
      />
      <WinFormModal
        opened={winModalOpen}
        onClose={() => { setWinModalOpen(false); setEditingWin(undefined); }}
        win={editingWin}
        defaultProjectId={project.id}
      />
    </>
  );
}

function OverviewCard({ label, value }: { label: string; value: string }) {
  return (
    <Box
      style={{
        background: 'var(--g-surface)',
        border: '1px solid var(--g-border)',
        borderRadius: 8,
        padding: '12px 16px',
      }}
    >
      <Text size="xs" c="dimmed" mb={4}>
        {label}
      </Text>
      <Text size="sm" fw={500} style={{ color: 'var(--g-text)' }}>
        {value}
      </Text>
    </Box>
  );
}

