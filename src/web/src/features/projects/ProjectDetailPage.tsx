import { useEffect, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  ColorSwatch,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { FolderKanban, FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { TodoList } from '../todos/TodoList';
import { ResourceList } from '../resources/ResourceList';
import { ProjectNotesList } from '../notes/ProjectNotesList';
import { useCreateNote } from '../notes/useCreateNote';
import { ProjectWinsList } from '../wins/ProjectWinsList';
import { WinFormModal } from '../wins/WinFormModal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { projectsApi, projectKeys } from './api';
import { ProjectFormModal } from './ProjectFormModal';
import { statusColors, statusLabels } from './statusMeta';
import { buildProjectTree } from './projectTree';
import { ExpandableDescription } from '../../components/ExpandableDescription';
import type { Win } from '../wins/types';
import { environmentsApi, environmentKeys } from '../environments/api';
import { EnvironmentFormModal } from '../environments/EnvironmentFormModal';
import { TagPicker } from '../tags/TagPicker';
import { useRecentProjects } from '../../hooks/useRecentProjects';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { push: pushRecent } = useRecentProjects();
  const [editOpen, setEditOpen] = useState(false);
  const [envFormOpen, setEnvFormOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState<import('../environments/types').ProjectEnvironment | undefined>();
  const { createNote } = useCreateNote();
  const [winModalOpen, setWinModalOpen] = useState(false);
  const [editingWin, setEditingWin] = useState<Win | undefined>();
  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(null);

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
  });

  useEffect(() => {
    if (project) pushRecent({ id: project.id, name: project.name, color: project.color });
  }, [project?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: parentProject } = useQuery({
    queryKey: projectKeys.detail(project?.parentProjectId!),
    queryFn: () => projectsApi.getById(project!.parentProjectId!),
    enabled: !!project?.parentProjectId,
  });

  const isDesktop = useMediaQuery('(min-width: 900px)', true);

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
        <FolderKanban size={48} style={{ color: 'var(--g-text-muted)' }} />
        <Text c="dimmed">Project not found.</Text>
        <Button component={Link} to="/projects" variant="subtle">
          Back to Projects
        </Button>
      </Stack>
    );
  }

  const subProjects = buildProjectTree(allProjects, project.id);

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
            leftSection={<Pencil size={16} />}
            variant="subtle"
            onClick={() => setEditOpen(true)}
            style={{ color: 'var(--g-text-muted)' }}
          >
            Edit
          </Button>
        </Group>

        {project.description && <ExpandableDescription content={project.description} />}

        <TagPicker
          selectedTags={project.tags}
          entityType="projects"
          entityId={project.id}
          onChanged={() => queryClient.invalidateQueries({ queryKey: projectKeys.detail(project.id) })}
        />

        <Text size="xs" c="dimmed">
          Created {new Date(project.createdUtc).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          {' · '}
          Updated {new Date(project.updatedUtc).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </Text>

        {/* Environments — a selectable scope filter for Quick Links below */}
        <Box>
          <Group justify="space-between" align="center" mb="xs">
            <Text fw={600} size="sm" tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
              Environments
            </Text>
            <Tooltip label="Add environment">
              <ActionIcon variant="subtle" size="sm" onClick={() => { setEditingEnv(undefined); setEnvFormOpen(true); }}
                style={{ color: 'var(--g-text-muted)' }}>
                <Plus size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
          {environments.length === 0 ? (
            <Text size="sm" c="dimmed">No environments yet. Add one to scope Quick Links by deployment target.</Text>
          ) : (
            <Group gap={8} wrap="wrap">
              <EnvChip
                label="All"
                active={selectedEnvId === null}
                onClick={() => setSelectedEnvId(null)}
              />
              {environments.map((env) => (
                <EnvChip
                  key={env.id}
                  label={env.name}
                  baseUrl={env.baseUrl}
                  active={selectedEnvId === env.id}
                  onClick={() => setSelectedEnvId(selectedEnvId === env.id ? null : env.id)}
                  onEdit={() => { setEditingEnv(env); setEnvFormOpen(true); }}
                  onDelete={() => deleteEnvMutation.mutate(env.id)}
                />
              ))}
            </Group>
          )}
        </Box>

        {/* Two-column widget grid — mirrors the main Dashboard's layout */}
        <Box style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? '1fr 340px' : '1fr',
          gap: 24,
          alignItems: 'start',
        }}>
          {/* Left column: active work */}
          <Stack gap="lg">
            <Box>
              <Text fw={600} size="sm" tt="uppercase" mb="xs" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
                Todo List
              </Text>
              <TodoList projectId={project.id} />
            </Box>

            <Box style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
              alignItems: 'start',
            }}>
              <Box>
                <Group justify="space-between" align="center" mb="xs">
                  <Text fw={600} size="sm" tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
                    Notes
                  </Text>
                  <Tooltip label="New note">
                    <ActionIcon variant="subtle" size="sm"
                      onClick={() => createNote(project.id)}
                      style={{ color: 'var(--g-text-muted)' }}>
                      <Plus size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <ProjectNotesList
                  projectId={project.id}
                  onEdit={(note) => navigate(`/notes/${note.id}`)}
                />
              </Box>

              <Box>
                <Group justify="space-between" align="center" mb="xs">
                  <Text fw={600} size="sm" tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
                    Wins
                  </Text>
                  <Tooltip label="Log win">
                    <ActionIcon variant="subtle" size="sm"
                      onClick={() => { setEditingWin(undefined); setWinModalOpen(true); }}
                      style={{ color: 'var(--g-text-muted)' }}>
                      <Plus size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <ProjectWinsList
                  projectId={project.id}
                  onEdit={(win) => { setEditingWin(win); setWinModalOpen(true); }}
                />
              </Box>
            </Box>
          </Stack>

          {/* Right column: Quick Links (the reason this rail is here) + project structure (sticky) */}
          <Stack gap="lg" style={{ position: 'sticky', top: 16 }}>
            <Box>
              <Text fw={600} size="sm" tt="uppercase" mb="xs" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
                Quick Links
              </Text>
              <ResourceList projectId={project.id} environments={environments} selectedEnvironmentId={selectedEnvId} />
            </Box>

            {subProjects.length > 0 && (
              <Box>
                <Group gap="xs" align="center" mb="xs">
                  <Text fw={600} size="sm" tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
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
                  {subProjects.map(({ project: child, depth }, i) => (
                    <Box
                      key={child.id}
                      onClick={() => navigate(`/projects/${child.id}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 14px',
                        paddingLeft: 14 + depth * 20,
                        cursor: 'pointer',
                        borderBottom: i < subProjects.length - 1 ? '1px solid var(--g-border)' : 'none',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--g-background)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {depth > 0 && (
                        <Text size="sm" style={{ color: 'var(--g-border)', flexShrink: 0 }}>
                          ↳
                        </Text>
                      )}
                      {child.color ? (
                        <ColorSwatch color={child.color} size={10} style={{ flexShrink: 0 }} />
                      ) : (
                        <FolderOpen size={12} style={{ color: 'var(--g-text-muted)', flexShrink: 0 }} />
                      )}
                      <Text
                        size="sm"
                        fw={depth === 0 ? 500 : 400}
                        style={{
                          flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          color: depth === 0 ? 'var(--g-text)' : 'var(--g-text-muted)',
                        }}
                      >
                        {child.name}
                      </Text>
                      <Badge color={statusColors[child.status]} variant="light" size="xs" style={{ flexShrink: 0 }}>
                        {statusLabels[child.status]}
                      </Badge>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Stack>
        </Box>
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
      <WinFormModal
        opened={winModalOpen}
        onClose={() => { setWinModalOpen(false); setEditingWin(undefined); }}
        win={editingWin}
        defaultProjectId={project.id}
      />
    </>
  );
}

function EnvChip({ label, baseUrl, active, onClick, onEdit, onDelete }: {
  label: string;
  baseUrl?: string | null;
  active: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Box
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        background: active ? 'color-mix(in srgb, var(--g-accent) 12%, var(--g-surface))' : 'var(--g-surface)',
        border: `1px solid ${active ? 'var(--g-accent)' : 'var(--g-border)'}`,
        borderRadius: 6,
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'border-color 120ms, background 120ms',
      }}
    >
      <Text size="sm" fw={500} style={{ color: active ? 'var(--g-accent)' : 'var(--g-text)' }}>
        {label}
      </Text>
      {baseUrl && (
        <Text size="xs" style={{ color: 'var(--g-text-muted)', fontFamily: 'monospace' }}>{baseUrl}</Text>
      )}
      {onEdit && onDelete && hovered && (
        <Group gap={2} onClick={(e) => e.stopPropagation()}>
          <Tooltip label="Edit">
            <ActionIcon variant="subtle" size="xs" style={{ color: 'var(--g-text-muted)' }} onClick={onEdit}>
              <Pencil size={12} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon variant="subtle" size="xs" color="red" onClick={onDelete}>
              <Trash2 size={12} />
            </ActionIcon>
          </Tooltip>
        </Group>
      )}
    </Box>
  );
}

