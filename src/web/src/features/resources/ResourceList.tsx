import { useState } from 'react';
import {
  ActionIcon, Badge, Box, Group, Loader, Stack, Text, Tooltip,
} from '@mantine/core';
import { Copy, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { resourcesApi, resourceKeys } from './api';
import { ResourceFormModal } from './ResourceFormModal';
import { RESOURCE_TYPE_LABELS, type Resource } from './types';
import { copyLocation, isCopyOnly, openLocation, typeIcon } from './locationUtils';
import type { ProjectEnvironment } from '../environments/types';
import { TagPicker } from '../tags/TagPicker';

const TYPE_ICON = typeIcon(16);

function ResourceRow({
  resource,
  onEdit,
  onDelete,
  isLast,
  onTagsChanged,
  environmentName,
  environmentHue,
}: {
  resource: Resource;
  onEdit: (r: Resource) => void;
  onDelete: (id: string) => void;
  isLast: boolean;
  onTagsChanged: () => void;
  environmentName?: string;
  environmentHue?: number;
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
      <Tooltip label={isCopyOnly(resource.type) ? `Copy ${RESOURCE_TYPE_LABELS[resource.type]} location` : `Open ${RESOURCE_TYPE_LABELS[resource.type]}`}>
        <ActionIcon variant="subtle" size="sm" onClick={() => openLocation(resource.location, resource.type)}
          style={{ color: 'var(--g-accent)', flexShrink: 0 }}>
          {TYPE_ICON[resource.type]}
        </ActionIcon>
      </Tooltip>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text size="sm" fw={500} style={{ color: 'var(--g-text)', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          onClick={() => openLocation(resource.location, resource.type)}>
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
      {environmentName && (
        <Badge
          size="xs"
          variant="outline"
          styles={{
            root: {
              borderColor: 'var(--g-accent)',
              color: 'var(--g-accent)',
              background: 'color-mix(in srgb, var(--g-accent) 15%, transparent)',
              filter: `hue-rotate(${environmentHue ?? 0}deg)`,
              flexShrink: 0,
            },
          }}
        >
          {environmentName}
        </Badge>
      )}
      <Group gap={2} style={{ flexShrink: 0 }}>
        <Tooltip label="Copy location">
          <ActionIcon variant="subtle" size="sm" onClick={() => copyLocation(resource.location)} style={{ color: 'var(--g-text-muted)' }}>
            <Copy size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Edit">
          <ActionIcon variant="subtle" size="sm" onClick={() => onEdit(resource)} style={{ color: 'var(--g-text-muted)' }}>
            <Pencil size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete">
          <ActionIcon variant="subtle" size="sm" color="red" onClick={() => onDelete(resource.id)}>
            <Trash2 size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Box>
  );
}

function ResourceGroup({ label, resources, onEdit, onDelete, onTagsChanged, envMetaById }: {
  label: string;
  resources: Resource[];
  onEdit: (r: Resource) => void;
  onDelete: (id: string) => void;
  onTagsChanged: () => void;
  envMetaById: Map<string, { name: string; hue: number }>;
}) {
  return (
    <Stack gap={4}>
      <Text size="xs" fw={600} tt="uppercase" style={{ color: 'var(--g-text-muted)', letterSpacing: '0.05em', paddingLeft: 2 }}>
        {label}
      </Text>
      <Box style={{ background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 8, overflow: 'hidden' }}>
        {resources.map((r, i) => (
          <ResourceRow key={r.id} resource={r} onEdit={onEdit} onDelete={onDelete} isLast={i === resources.length - 1}
            onTagsChanged={onTagsChanged}
            environmentName={r.environmentId ? envMetaById.get(r.environmentId)?.name : undefined}
            environmentHue={r.environmentId ? envMetaById.get(r.environmentId)?.hue : undefined} />
        ))}
      </Box>
    </Stack>
  );
}

interface Props {
  projectId?: string;
  environments?: ProjectEnvironment[];
  /**
   * Controlled environment scope. When omitted, resources are auto-grouped into a
   * section per environment plus "General" (the original behavior). When provided,
   * grouping is skipped in favor of a flat list scoped to that environment (plus
   * environment-less resources, which apply everywhere) — `null` means "All".
   */
  selectedEnvironmentId?: string | null;
}

export function ResourceList({ projectId, environments = [], selectedEnvironmentId }: Props) {
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
  });

  const openEdit = (resource: Resource) => { setEditing(resource); setFormOpen(true); };
  const openCreate = () => { setEditing(undefined); setFormOpen(true); };

  const nextSortOrder = resources.length > 0
    ? Math.max(...resources.map((r) => r.sortOrder)) + 1
    : 0;

  // Each environment gets a hue-rotated variant of the accent color as its badge color,
  // cycling every 6 (60deg steps) so colors repeat gracefully once there are many environments.
  const envMetaById = new Map(
    environments.map((e, i) => [e.id, { name: e.name, hue: (i % 6) * 60 }])
  );

  const isControlled = selectedEnvironmentId !== undefined;
  const isScopedToOneEnv = isControlled && selectedEnvironmentId !== null;
  const scopedResources = isScopedToOneEnv
    ? resources.filter((r) => r.environmentId === selectedEnvironmentId || !r.environmentId)
    : resources;

  // Common (environment-less) links always show. When a single environment is selected,
  // common links sort to the end (the environment-specific links are what you came for);
  // otherwise ("All") common links sort to the top. Name is the tiebreaker either way.
  const sortedResources = [...scopedResources].sort((a, b) => {
    const aCommon = !a.environmentId;
    const bCommon = !b.environmentId;
    if (aCommon !== bCommon) {
      const commonFirst = aCommon ? -1 : 1;
      return isScopedToOneEnv ? -commonFirst : commonFirst;
    }
    return a.name.localeCompare(b.name);
  });

  // Group resources by environment when environments are provided and no scope is controlled
  const grouped = environments.length > 0 && !isControlled;
  const byEnv = grouped
    ? environments.map((env) => ({
        env,
        items: resources.filter((r) => r.environmentId === env.id).sort((a, b) => a.name.localeCompare(b.name)),
      })).filter((g) => g.items.length > 0)
    : [];
  const unassigned = resources.filter((r) => !r.environmentId).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Stack gap="sm">
        <Group justify="flex-end">
          <Tooltip label="Add resource">
            <ActionIcon variant="subtle" onClick={openCreate} style={{ color: 'var(--g-text-muted)' }}>
              <Plus size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {isLoading ? (
          <Loader size="xs" />
        ) : scopedResources.length === 0 ? (
          <Text size="sm" c="dimmed">
            {isControlled && selectedEnvironmentId !== null ? 'No quick links for this environment yet.' : 'No resources yet.'}
          </Text>
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
                envMetaById={envMetaById}
              />
            ))}
            {unassigned.length > 0 && (
              <ResourceGroup
                label="General"
                resources={unassigned}
                onEdit={openEdit}
                onDelete={(id) => deleteMutation.mutate(id)}
                onTagsChanged={invalidate}
                envMetaById={envMetaById}
              />
            )}
          </Stack>
        ) : (
          <Box style={{ background: 'var(--g-surface)', border: '1px solid var(--g-border)', borderRadius: 8, overflow: 'hidden' }}>
            {sortedResources.map((r, i) => (
              <ResourceRow key={r.id} resource={r} onEdit={openEdit}
                onDelete={(id) => deleteMutation.mutate(id)} isLast={i === sortedResources.length - 1} onTagsChanged={invalidate}
                environmentName={r.environmentId ? envMetaById.get(r.environmentId)?.name : undefined}
                environmentHue={r.environmentId ? envMetaById.get(r.environmentId)?.hue : undefined} />
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
