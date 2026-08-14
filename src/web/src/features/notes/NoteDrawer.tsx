import { useEffect, useState } from 'react';
import {
  Button, Drawer, Group, Select, Stack, Text, TextInput,
} from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { notesApi, noteKeys } from './api';
import { NoteEditor } from './NoteEditor';
import { SaveStatusText } from './SaveStatusText';
import { useNoteAutosave } from './useNoteAutosave';
import { noteFieldStyles } from './noteFieldStyles';
import { projectsApi, projectKeys } from '../projects/api';
import { useAppTheme } from '../../themes/ThemeProvider';
import type { Note } from './types';
import { TagPicker } from '../tags/TagPicker';

interface Props {
  opened: boolean;
  onClose: () => void;
  /** Pass a note to open in edit mode; omit for create mode */
  note?: Note;
  /** Pre-select a project in create mode */
  defaultProjectId?: string;
}

const drawerStyles = {
  content: { background: 'var(--g-surface)', display: 'flex', flexDirection: 'column' as const },
  header: { background: 'var(--g-surface)', borderBottom: '1px solid var(--g-border)', paddingBottom: 12 },
  title: { color: 'var(--g-heading)', fontWeight: 600, fontSize: 16 },
  body: { flex: 1, paddingTop: 16, overflow: 'auto' },
};

export function NoteDrawer({ opened, onClose, note, defaultProjectId }: Props) {
  const { colorScheme } = useAppTheme();
  const queryClient = useQueryClient();
  const isEdit = !!note;

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (opened) {
      if (!isEdit) {
        setTitle('');
        setProjectId(defaultProjectId ?? null);
        setContent('');
      }
    }
  }, [opened, isEdit, defaultProjectId]);

  const { data: projects = [] } = useQuery({
    queryKey: projectKeys.list(),
    queryFn: projectsApi.list,
    enabled: opened,
  });

  const autosave = useNoteAutosave(isEdit ? note : undefined);

  const createMutation = useMutation({
    mutationFn: () =>
      notesApi.create({
        projectId: projectId ?? undefined,
        title: title.trim() || undefined,
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      notifications.show({ message: 'Note saved', color: 'green' });
      onClose();
    },
  });

  const drawerTitle = isEdit
    ? (autosave.title || (note.date ? new Date(note.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Note'))
    : 'New Note';

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={drawerTitle}
      position="right"
      size="max(520px, 50vw)"
      lockScroll={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      styles={drawerStyles}
    >
      {isEdit ? (
        <Stack gap="md" h="100%">
          <TextInput
            label="Title"
            placeholder="Optional — leave blank for an untitled note"
            value={autosave.title}
            onChange={(e) => autosave.setTitle(e.currentTarget.value)}
            styles={noteFieldStyles}
          />
          <Select
            label="Project"
            placeholder="None (general note)"
            clearable
            searchable
            data={projects.map((p) => ({ value: p.id, label: p.name }))}
            value={autosave.projectId}
            onChange={autosave.setProjectId}
            styles={noteFieldStyles}
          />
          <TagPicker
            selectedTags={note.tags}
            entityType="notes"
            entityId={note.id}
            onChanged={() => queryClient.invalidateQueries({ queryKey: noteKeys.lists() })}
          />
          <NoteEditor value={autosave.content} onChange={autosave.setContent} minHeight={480} />
          <SaveStatusText status={autosave.status} />
        </Stack>
      ) : (
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="Optional — leave blank for an untitled note"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            styles={noteFieldStyles}
          />
          <Select
            label="Project"
            placeholder="None (general note)"
            clearable
            data={projects.map((p) => ({ value: p.id, label: p.name }))}
            value={projectId}
            onChange={setProjectId}
            styles={noteFieldStyles}
          />
          <Stack gap={4}>
            <Text size="sm" fw={500} style={{ color: 'var(--g-text)' }}>Content</Text>
            <div data-color-mode={colorScheme}>
              <MDEditor
                value={content}
                onChange={(v) => setContent(v ?? '')}
                height={420}
              />
            </div>
          </Stack>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={onClose} style={{ color: 'var(--g-text-muted)' }}>
              Cancel
            </Button>
            <Button
              loading={createMutation.isPending}
              onClick={() => createMutation.mutate()}
              style={{ background: 'var(--g-accent)', color: 'var(--g-accent-text)' }}
            >
              Save Note
            </Button>
          </Group>
        </Stack>
      )}
    </Drawer>
  );
}
