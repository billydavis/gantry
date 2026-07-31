import { useState } from 'react';
import {
  ActionIcon, Box, Group, Loader, Stack, Text, Tooltip,
} from '@mantine/core';
import {
  IconBrandGit, IconCheck, IconCopy, IconDatabase, IconEdit, IconExternalLink,
  IconFile, IconFolder, IconGlobe, IconLayoutDashboard,
  IconNetwork, IconPlus, IconServerCog, IconTrash,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { resourcesApi, resourceKeys } from './api';
import { ResourceFormModal } from './ResourceFormModal';
import { RESOURCE_TYPE_LABELS, type Resource, type ResourceType } from './types';
import type { ProjectEnvironment } from '../environments/types';
import { TagPicker } from '../tags/TagPicker';

const typeIcon: Record<ResourceType, React.ReactNode> = {
  Website:       <IconGlobe size={16} />,
  UncShare:      <IconNetwork size={16} />,
  LocalFolder:   <IconFolder size={16} />,
  LocalFile:     <IconFile size={16} />,
  GitRepository: <IconBrandGit size={16} />,
  Documentation: <IconExternalLink size={16} />,
  Environment:   <IconServerCog size={16} />,
  Dashboard:     <IconLayoutDashboard size={16} />,
  Database:      <IconDatabase size={16} />,
  Other:         <IconExternalLink size={16} />,
};

function isUrl(location: string): boolean {
  return /^https?:\/\//i.test(location);
}

function openLocation(location: string) {
  if (location.startsWith('\\\\') || location.startsWith('//')) {
    window.open(`file:${location.replace(/\\/g, '/')}`, '_blank');
  } else {
    window.open(location, '_blank', 'noopener,noreferrer');
  }
}

function copyLocation(location: string) {
  navigator.clipboard.writeText(location).then(() => {
    notifications.show({ message: 'URL copied to clipboard', color: 'green', icon: <IconCheck size={16} /> });
  }).catch(() => {
    notifications.show({ message: 'Failed to copy URL', color: 'red' });
  });
}

function ResourceRow({
  resource,
  onEdit,
  onDelete,
  isLast,
  onTagsChanged,
}: {
  resource: Resource;
  onEdit: (r: Resource) => void;
  onDelete: (id: string) => void;
  isLast: boolean;
  onTagsChanged: () => void;
}) {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderBottom: isLast ? 'none' : '1px solid var(--g-border)',
      }}
    >
      <Tooltip label={`Open ${RESOURCE_TYPE_LABELS[resource.type]}`}>
        <ActionIcon variant="subtle" size="sm" onClick={() => openLocation(resource.location)}
          style={{ color: 'var(--g-accent)', flexShrink: 0 }}>
          {typeIcon[resource.type]}
        </ActionIcon>
      </Tooltip>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text size="sm" fw={500} style={{ color: 'var(--g-text)', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          onClick={() => openLocation(resource.location)}>
          {resource.name}
        </Text>
        {resource.description && (
          <Text size="xs" c="dimmed" lineClamp={1}>{resource.description}</Text>
        )}
        <Text size="xs" style={{ color: 'var(--g-text-muted)', fontFamily: 'monospace' }} lineClamp={1}>
          {resource.location}
        </Text>
        <Box mt={4}>
          <TagPicker
            selectedTags={resource.tags}
            entityType="resources"
            entityId={resource.id}
            onChanged={onTagsChanged}
          />
        </Box>
      </Box>
      <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>{RESOURCE_TYPE_LABELS[resource.type]}</Text>
      <Group gap={2} style={{ flexShrink: 0 }}>
        {isUrl(resource.location) && (
          <Tooltip label="Copy URL">
            <ActionIcon variant="subtle" size="sm" onClick={() => copyLocation(resource.location)} style={{ color: 'var(--g-text-muted)' }}>
              <IconCopy size={14} />
            </ActionIcon>
          </Tooltip>
        )}
        <Tooltip label="Edit">
          <ActionIcon variant="subtle" size="sm" onClick={() => onEdit(resource)} style={{ color: 'var(--g-text-muted)' }}>
            <IconEdit size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete">
          <ActionIcon variant="subtle" size="sm" color="red" onClick={() => onDelete(resource.id)}>
            <IconTrash size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Box>
  );
}

function ResourceGroup({ label, resources, onEdit, onDelete, onTagsChanged }: {
  label: string;
  resources: Resource[];
  onEdit: (r: Resource) => void;
  onDelete: (id: string) => void;
  onTagsChanged: () => void;
}) {
  return (
    <Stack gap={4}>
      <Text size="xs" fw={600} tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em', paddingLeft: 2 }}>
        {label}
      </Text>
      <Box style={{ background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 8, overflow: 'hidden' }}>
        {resources.map((r, i) => (
          <ResourceRow key={r.id} resource={r} onEdit={onEdit} onDelete={onDelete} isLast={i === resources.length - 1} onTagsChanged={onTagsChanged} />
        ))}
      </Box>
    </Stack>
  );
}

interface Props {
  projectId?: string;
  environments?: ProjectEnvironment[];
}

export function ResourceList({ projectId, environments = [] }: Props) {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | undefined>();

  const isGlobal = !projectId;

  const { data: resources = [], isLoading } = useQuery({
    queryKey: isGlobal ? resourceKeys.global() : resourceKeys.byProject(projectId!),
    queryFn: () => isGlobal ? resourcesApi.listGlobal() : resourcesApi.list(projectId!),
  });

  const invalidate = () => {
    if (isGlobal) queryClient.invalidateQueries({ queryKey: resourceKeys.global() });
    else queryClient.invalidateQueries({ queryKey: resourceKeys.byProject(projectId!) });
  };

  const deleteMutation = useMutation({
    mutationFn: resourcesApi.delete,
    onSuccess: invalidate,
    onError: (err: Error) => notifications.show({ message: err.message, color: 'red' }),
  });

  const openEdit = (resource: Resource) => { setEditing(resource); setFormOpen(true); };
  const openCreate = () => { setEditing(undefined); setFormOpen(true); };

  const nextSortOrder = resources.length > 0
    ? Math.max(...resources.map((r) => r.sortOrder)) + 1
    : 0;

  // Group resources by environment when environments are provided
  const grouped = environments.length > 0;
  const byEnv = grouped
    ? environments.map((env) => ({
        env,
        items: resources.filter((r) => r.environmentId === env.id),
      })).filter((g) => g.items.length > 0)
    : [];
  const unassigned = grouped
    ? resources.filter((r) => !r.environmentId)
    : resources;

  return (
    <>
      <Stack gap="sm">
        <Group justify="flex-end">
          <Tooltip label="Add resource">
            <ActionIcon variant="subtle" onClick={openCreate} style={{ color: 'var(--g-text-muted)' }}>
              <IconPlus size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {isLoading ? (
          <Loader size="xs" />
        ) : resources.length === 0 ? (
          <Text size="sm" c="dimmed">No resources yet.</Text>
        ) : grouped ? (
          <Stack gap="lg">
            {byEnv.map(({ env, items }) => (
              <ResourceGroup
                key={env.id}
                label={env.name}
                resources={items}
                onEdit={openEdit}
                onDelete={(id) => deleteMutation.mutate(id)}
                onTagsChanged={invalidate}
              />
            ))}
            {unassigned.length > 0 && (
              <ResourceGroup
                label="General"
                resources={unassigned}
                onEdit={openEdit}
                onDelete={(id) => deleteMutation.mutate(id)}
                onTagsChanged={invalidate}
              />
            )}
          </Stack>
        ) : (
          <Box style={{ background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 8, overflow: 'hidden' }}>
            {resources.map((r, i) => (
              <ResourceRow key={r.id} resource={r} onEdit={openEdit}
                onDelete={(id) => deleteMutation.mutate(id)} isLast={i === resources.length - 1} onTagsChanged={invalidate} />
            ))}
          </Box>
        )}
      </Stack>

      <ResourceFormModal
        opened={formOpen}
        onClose={() => setFormOpen(false)}
        projectId={projectId}
        resource={editing}
        nextSortOrder={nextSortOrder}
      />
    </>
  );
}
