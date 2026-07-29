import { useState } from 'react';
import { ActionIcon, Badge, Box, Checkbox, ColorSwatch, Group, Popover, Stack, Text, Title, Tooltip } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { noteKeys, notesApi } from '../features/notes/api';
import { NoteDrawer } from '../features/notes/NoteDrawer';
import { winKeys, winsApi } from '../features/wins/api';
import { WinFormModal } from '../features/wins/WinFormModal';
import {
  IconBrandGit, IconDatabase, IconEdit, IconExternalLink, IconFile,
  IconFolder, IconGlobe, IconLayoutDashboard, IconLink, IconNetwork,
  IconNote, IconPlus, IconServerCog, IconSettings, IconTrash, IconTrophy,
} from '@tabler/icons-react';
import { todosApi, todoKeys } from '../features/todos/api';
import { TodoList } from '../features/todos/TodoList';
import { resourcesApi, resourceKeys } from '../features/resources/api';
import { ResourceFormModal } from '../features/resources/ResourceFormModal';
import { type Resource, type ResourceType } from '../features/resources/types';
import { WIDGET_LABELS, useDashboardWidgets } from '../hooks/useDashboardWidgets';
import { projectsApi, projectKeys } from '../features/projects/api';
import { useRecentProjects } from '../hooks/useRecentProjects';

const typeIcon: Record<ResourceType, React.ReactNode> = {
  Website:       <IconGlobe size={18} />,
  UncShare:      <IconNetwork size={18} />,
  LocalFolder:   <IconFolder size={18} />,
  LocalFile:     <IconFile size={18} />,
  GitRepository: <IconBrandGit size={18} />,
  Documentation: <IconExternalLink size={18} />,
  Environment:   <IconServerCog size={18} />,
  Dashboard:     <IconLayoutDashboard size={18} />,
  Database:      <IconDatabase size={18} />,
  Other:         <IconExternalLink size={18} />,
};

function openLocation(location: string) {
  if (location.startsWith('\\\\') || location.startsWith('//')) {
    window.open(`file:${location.replace(/\\/g, '/')}`, '_blank');
  } else {
    window.open(location, '_blank', 'noopener,noreferrer');
  }
}

export function DashboardPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isVisible, toggle } = useDashboardWidgets();
  const { recent: recentProjects } = useRecentProjects();

  const [resourceFormOpen, setResourceFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | undefined>();
  const [noteDrawerOpen, setNoteDrawerOpen] = useState(false);
  const [winModalOpen, setWinModalOpen] = useState(false);
  const [editingWin, setEditingWin] = useState<import('../features/wins/types').Win | undefined>();
  const [configOpen, setConfigOpen] = useState(false);

  const { data: recentNotes = [] } = useQuery({
    queryKey: noteKeys.list({ limit: 5 }),
    queryFn: () => notesApi.list({ limit: 5 }),
  });

  const { data: recentWins = [] } = useQuery({
    queryKey: winKeys.list({ limit: 5 }),
    queryFn: () => winsApi.list({ limit: 5 }),
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: projectKeys.list(),
    queryFn: projectsApi.list,
  });

  const activeProjects = allProjects.filter((p) => p.status === 'Active');

  const deleteMutation = useMutation({
    mutationFn: resourcesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: resourceKeys.global() }),
    onError: (err: Error) => notifications.show({ message: err.message, color: 'red' }),
  });

  const { data: todos = [] } = useQuery({
    queryKey: todoKeys.list({}),
    queryFn: () => todosApi.list({}),
  });

  const { data: globalResources = [] } = useQuery({
    queryKey: resourceKeys.global(),
    queryFn: resourcesApi.listGlobal,
  });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const overdue = todos.filter((t) => { if (!t.dueDate) return false; return new Date(t.dueDate + 'T00:00:00') < today; });
  const dueToday = todos.filter((t) => { if (!t.dueDate) return false; return new Date(t.dueDate + 'T00:00:00').getTime() === today.getTime(); });
  const pinned = todos.filter((t) => t.isPinned);

  const isDesktop = useMediaQuery('(min-width: 768px)', true);
  const showFocus = isVisible('todaysFocus');
  const showNotes = isVisible('recentNotes') && recentNotes.length > 0;
  const showWins = isVisible('recentWins') && recentWins.length > 0;

  return (
    <>
      {/* Header */}
      <Group justify="space-between" align="flex-end" wrap="wrap" mb="xl">
        <Box>
          <Text size="sm" c="dimmed">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <Title order={2} style={{ color: 'var(--g-heading)' }}>
            Good{getTimeOfDay()}, Billy.
          </Title>
        </Box>

        <Group gap="md" align="center">
          {pinned.length > 0 && <Text size="sm" style={{ color: 'var(--g-accent)' }}>{pinned.length} pinned</Text>}
          {overdue.length > 0 && <Text size="sm" c="red">{overdue.length} overdue</Text>}
          {dueToday.length > 0 && <Text size="sm" c="yellow">{dueToday.length} due today</Text>}

          <Popover opened={configOpen} onChange={setConfigOpen} position="bottom-end" withinPortal>
            <Popover.Target>
              <Tooltip label="Configure widgets" disabled={configOpen} withinPortal>
                <ActionIcon variant="subtle" size="sm" onClick={() => setConfigOpen(v => !v)} style={{ color: 'var(--g-text-muted)' }}>
                  <IconSettings size={16} />
                </ActionIcon>
              </Tooltip>
            </Popover.Target>
            <Popover.Dropdown style={{ background: 'var(--g-surface)', border: '1px solid var(--g-border)', minWidth: 190 }}>
              <Text size="xs" c="dimmed" mb={10} fw={600} tt="uppercase" style={{ letterSpacing: '0.05em' }}>Widgets</Text>
              <Stack gap={8}>
                {(Object.keys(WIDGET_LABELS) as (keyof typeof WIDGET_LABELS)[]).map((id) => (
                  <Checkbox
                    key={id}
                    label={WIDGET_LABELS[id]}
                    checked={isVisible(id)}
                    onChange={() => toggle(id)}
                    size="sm"
                    styles={{ label: { color: 'var(--g-text)', cursor: 'pointer' } }}
                  />
                ))}
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Group>

      {/* Two-column content grid */}
      <Box style={{
        display: 'grid',
        gridTemplateColumns: isDesktop && showFocus ? '1fr 340px' : '1fr',
        gap: 24,
        alignItems: 'start',
      }}>
        {/* Left column: context widgets */}
        <Stack gap="lg">
          {/* Quick Launch */}
          {isVisible('quickLaunch') && (
            <Box>
              <Group justify="space-between" align="center" mb="xs">
                <Text fw={600} size="sm" tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
                  Quick Launch
                </Text>
                <Tooltip label="Add global resource">
                  <ActionIcon variant="subtle" size="sm" onClick={() => { setEditingResource(undefined); setResourceFormOpen(true); }} style={{ color: 'var(--g-text-muted)' }}>
                    <IconPlus size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>

              {globalResources.length === 0 ? (
                <Box
                  onClick={() => { setEditingResource(undefined); setResourceFormOpen(true); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px',
                    background: 'var(--g-surface)', border: '1px dashed var(--g-border)',
                    borderRadius: 8, cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--g-accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--g-border)')}
                >
                  <IconLink size={18} style={{ color: 'var(--g-text-muted)' }} />
                  <Box>
                    <Text size="sm" fw={500} style={{ color: 'var(--g-text)' }}>Add your first quick launch link</Text>
                    <Text size="xs" c="dimmed">Pin frequently used tools, dashboards, and portals here.</Text>
                  </Box>
                </Box>
              ) : (
                <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {globalResources.map((resource) => (
                    <QuickLaunchPill
                      key={resource.id}
                      resource={resource}
                      onEdit={() => { setEditingResource(resource); setResourceFormOpen(true); }}
                      onDelete={() => deleteMutation.mutate(resource.id)}
                    />
                  ))}
                  <Tooltip label="Add global resource">
                    <Box
                      onClick={() => { setEditingResource(undefined); setResourceFormOpen(true); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                        background: 'transparent', border: '1px dashed var(--g-border)',
                        borderRadius: 8, cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--g-accent)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--g-border)')}
                    >
                      <IconPlus size={14} style={{ color: 'var(--g-text-muted)' }} />
                      <Text size="sm" c="dimmed">Add</Text>
                    </Box>
                  </Tooltip>
                </Box>
              )}
            </Box>
          )}

          {/* Active Projects */}
          {isVisible('activeProjects') && activeProjects.length > 0 && (
            <Box>
              <Group justify="space-between" align="center" mb="xs">
                <Group gap="xs">
                  <Text fw={600} size="sm" tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
                    Active Projects
                  </Text>
                  <Badge variant="light" color="gray" size="sm">{activeProjects.length}</Badge>
                </Group>
                <Tooltip label="All projects">
                  <ActionIcon variant="subtle" size="sm" onClick={() => navigate('/projects')} style={{ color: 'var(--g-text-muted)' }}>
                    <IconFolder size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <Box style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 8,
              }}>
                {activeProjects.slice(0, 6).map((project) => (
                  <Box
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px',
                      background: 'var(--g-surface)', border: '1px solid var(--g-border)',
                      borderRadius: 8, cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--g-accent)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--g-border)')}
                  >
                    {project.color
                      ? <ColorSwatch color={project.color} size={12} style={{ flexShrink: 0 }} />
                      : <IconFolder size={14} style={{ color: 'var(--g-text-muted)', flexShrink: 0 }} />
                    }
                    <Text size="sm" fw={500} style={{ color: 'var(--g-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {project.name}
                    </Text>
                  </Box>
                ))}
              </Box>
              {activeProjects.length > 6 && (
                <Text size="xs" c="dimmed" mt="xs" style={{ cursor: 'pointer' }} onClick={() => navigate('/projects')}>
                  +{activeProjects.length - 6} more — view all
                </Text>
              )}
            </Box>
          )}

          {/* Recent Notes + Recent Wins: side by side */}
          {(showNotes || showWins) && (
            <Box style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
              alignItems: 'start',
            }}>
              {showNotes && (
                <Box>
                  <Group justify="space-between" align="center" mb="xs">
                    <Text fw={600} size="sm" tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
                      Recent Notes
                    </Text>
                    <Tooltip label="New note">
                      <ActionIcon variant="subtle" size="sm" onClick={() => setNoteDrawerOpen(true)} style={{ color: 'var(--g-text-muted)' }}>
                        <IconPlus size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                  <Box style={{ background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 8, overflow: 'hidden' }}>
                    {recentNotes.map((note, i) => {
                      const label = note.title ?? (note.date
                        ? new Date(note.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                        : 'Untitled');
                      return (
                        <Box key={note.id} onClick={() => navigate(`/notes/${note.id}`)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                            borderBottom: i < recentNotes.length - 1 ? '1px solid var(--g-border)' : 'none',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--g-background)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <IconNote size={15} style={{ color: 'var(--g-accent)', flexShrink: 0 }} />
                          <Text size="sm" fw={500} style={{ color: 'var(--g-text)', flex: 1 }}>{label}</Text>
                          {note.projectName && <Text size="xs" c="dimmed">{note.projectName}</Text>}
                          <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                            {new Date(note.updatedUtc).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </Text>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {showWins && (
                <Box>
                  <Group justify="space-between" align="center" mb="xs">
                    <Text fw={600} size="sm" tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
                      Recent Wins
                    </Text>
                    <Tooltip label="Log win">
                      <ActionIcon variant="subtle" size="sm" onClick={() => setWinModalOpen(true)} style={{ color: 'var(--g-text-muted)' }}>
                        <IconPlus size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                  <Box style={{ background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 8, overflow: 'hidden' }}>
                    {recentWins.map((win, i) => (
                      <Box key={win.id}
                        onClick={() => { setEditingWin(win); setWinModalOpen(true); }}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
                          borderBottom: i < recentWins.length - 1 ? '1px solid var(--g-border)' : 'none',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--g-background)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <IconTrophy size={15} style={{ color: 'var(--g-accent)', flexShrink: 0, marginTop: 2 }} />
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text size="sm" fw={500} style={{ color: 'var(--g-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {win.title}
                          </Text>
                          {win.projectName && <Text size="xs" c="dimmed">{win.projectName}</Text>}
                        </Box>
                        <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                          {new Date(win.date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Recently Opened Projects */}
          {isVisible('recentProjects') && recentProjects.length > 0 && (
            <Box>
              <Group justify="space-between" align="center" mb="xs">
                <Text fw={600} size="sm" tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
                  Recently Opened
                </Text>
              </Group>
              <Box style={{ background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 8, overflow: 'hidden' }}>
                {recentProjects.map((project, i) => (
                  <Box
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                      borderBottom: i < recentProjects.length - 1 ? '1px solid var(--g-border)' : 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--g-background)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {project.color
                      ? <ColorSwatch color={project.color} size={12} style={{ flexShrink: 0 }} />
                      : <IconFolder size={14} style={{ color: 'var(--g-text-muted)', flexShrink: 0 }} />
                    }
                    <Text size="sm" fw={500} style={{ color: 'var(--g-text)', flex: 1 }}>{project.name}</Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Stack>

        {/* Right column: Today's Focus (sticky) */}
        {showFocus && (
          <Box style={{ position: 'sticky', top: 16 }}>
            <Text fw={600} size="sm" tt="uppercase" mb="md" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em' }}>
              Today's Focus
            </Text>
            <TodoList />
          </Box>
        )}
      </Box>

      <ResourceFormModal
        opened={resourceFormOpen}
        onClose={() => setResourceFormOpen(false)}
        resource={editingResource}
        nextSortOrder={globalResources.length}
      />
      <NoteDrawer
        opened={noteDrawerOpen}
        onClose={() => { setNoteDrawerOpen(false); queryClient.invalidateQueries({ queryKey: noteKeys.lists() }); }}
      />
      <WinFormModal
        opened={winModalOpen}
        onClose={() => { setWinModalOpen(false); setEditingWin(undefined); }}
        win={editingWin}
      />
    </>
  );
}

function QuickLaunchPill({ resource, onEdit, onDelete }: { resource: Resource; onEdit: () => void; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Box
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
        background: hovered ? 'color-mix(in srgb, var(--g-accent) 6%, var(--g-surface))' : 'var(--g-surface)',
        border: `1px solid ${hovered ? 'var(--g-accent)' : 'var(--g-border)'}`,
        borderRadius: 8, transition: 'border-color 120ms, background 120ms', userSelect: 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box onClick={() => openLocation(resource.location)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1 }}>
        <Box style={{ color: 'var(--g-accent)' }}>{typeIcon[resource.type as ResourceType]}</Box>
        <Text size="sm" fw={500} style={{ color: 'var(--g-text)' }}>{resource.name}</Text>
      </Box>
      {hovered && (
        <Group gap={2} style={{ marginLeft: 4 }}>
          <Tooltip label="Edit">
            <ActionIcon variant="subtle" size="xs" onClick={onEdit} style={{ color: 'var(--g-text-muted)' }}>
              <IconEdit size={12} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon variant="subtle" size="xs" color="red" onClick={onDelete}>
              <IconTrash size={12} />
            </ActionIcon>
          </Tooltip>
        </Group>
      )}
    </Box>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return ' morning';
  if (h < 17) return ' afternoon';
  return ' evening';
}
