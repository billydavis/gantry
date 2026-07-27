import { useEffect, useRef, useState } from 'react';
import { Text } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { notesApi } from './api';
import { useAppTheme } from '../../themes/ThemeProvider';

interface Props {
  noteId: string;
  initialContent: string;
  minHeight?: number;
}

export function NoteEditor({ noteId, initialContent, minHeight = 500 }: Props) {
  const { colorScheme } = useAppTheme();
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const dirty = useRef(false);

  const { mutate: save } = useMutation({
    mutationFn: (c: string) => notesApi.update(noteId, { content: c }),
    onMutate: () => setSaveStatus('saving'),
    onSuccess: () => setSaveStatus('saved'),
    onError: () => setSaveStatus('error'),
  });

  useEffect(() => {
    setContent(initialContent);
    dirty.current = false;
    setSaveStatus('idle');
  }, [noteId, initialContent]);

  useEffect(() => {
    if (!dirty.current) return;
    const timer = setTimeout(() => save(content), 1500);
    return () => clearTimeout(timer);
  }, [content, save]);

  const handleChange = (val: string | undefined) => {
    dirty.current = true;
    setContent(val ?? '');
  };

  return (
    <div data-color-mode={colorScheme}>
      <MDEditor
        value={content}
        onChange={handleChange}
        height={minHeight}
        style={{ background: 'var(--g-surface)' }}
      />
      <Text size="xs" c={saveStatus === 'error' ? 'red' : 'dimmed'} mt={4} h={16}>
        {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Failed to save' : ''}
      </Text>
    </div>
  );
}
