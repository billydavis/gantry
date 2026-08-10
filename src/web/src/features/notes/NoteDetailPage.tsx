import { useState } from 'react';
import { ActionIcon, Breadcrumbs, Button, Group, Loader, Modal, Select, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { noteKeys, notesApi } from './api';
import { NoteEditor } from './NoteEditor';
import { SaveStatusText } from './SaveStatusText';
import { useNoteAutosave } from './useNoteAutosave';
import { noteFieldStyles } from './noteFieldStyles';
import { projectsApi, projectKeys } from '../projects/api';

export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: note, isLoading } = useQuery({
    queryKey: noteKeys.detail(id!),
    queryFn: () => notesApi.getById(id!),
    enabled: !!id,
  });

  const { data: projects = [] } = useQuery({
    queryKey: projectKeys.list(),
    queryFn: projectsApi.list,
  });

  const { title, setTitle, projectId, setProjectId, content, setContent, status } = useNoteAutosave(note);

  const deleteMutation = useMutation({
    mutationFn: () => notesApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      navigate('/notes');
    },
  });

  if (isLoading) return <Loader size="sm" />;
  if (!note) return <Text c="dimmed">Note not found.</Text>;

  const fallbackTitle = note.date
    ? new Date(note.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
    : 'Note';
  const displayTitle = title || fallbackTitle;
  const selectedProject = projects.find((p) => p.id === projectId);

  return (
    <>
      <Stack gap="md">
        <Breadcrumbs styles={{ breadcrumb: { color: 'var(--g-text-muted)', fontSize: 13 } }}>
          <Text component={Link} to="/notes" size="sm" style={{ color: 'var(--g-text-muted)', textDecoration: 'none' }}>
            Notes
          </Text>
          {selectedProject && (
            <Text component={Link} to={`/projects/${selectedProject.id}`} size="sm"
              style={{ color: 'var(--g-text-muted)', textDecoration: 'none' }}>
              {selectedProject.name}
            </Text>
          )}
          <Text size="sm" style={{ color: 'var(--g-text)' }}>{displayTitle}</Text>
        </Breadcrumbs>

        <Group justify="space-between" align="flex-end">
          <Group gap="sm" align="flex-end" style={{ flex: 1 }} wrap="wrap">
            <TextInput
              label="Title"
              placeholder={fallbackTitle}
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              styles={noteFieldStyles}
              style={{ flex: 1, minWidth: 240 }}
            />
            <Select
              label="Project"
              placeholder="None (general note)"
              clearable
              searchable
              data={projects.map((p) => ({ value: p.id, label: p.name }))}
              value={projectId}
              onChange={setProjectId}
              styles={noteFieldStyles}
              w={220}
            />
          </Group>
          <Group gap="xs" align="center">
            <SaveStatusText status={status} />
            <Tooltip label="Delete">
              <ActionIcon variant="subtle" color="red" onClick={() => setDeleteOpen(true)}>
                <Trash2 size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <NoteEditor value={content} onChange={setContent} minHeight={560} />
      </Stack>

      <Modal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete note"
        size="sm"
        styles={{
          content: { background: 'var(--g-surface)' },
          header: { background: 'var(--g-surface)', borderBottom: '1px solid var(--g-border)' },
          title: { color: 'var(--g-heading)', fontWeight: 600 },
        }}
      >
        <Stack gap="md" pt="sm">
          <Text size="sm" style={{ color: 'var(--g-text)' }}>
            Delete "{displayTitle}"? This can't be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setDeleteOpen(false)} style={{ color: 'var(--g-text-muted)' }}>
              Cancel
            </Button>
            <Button color="red" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
