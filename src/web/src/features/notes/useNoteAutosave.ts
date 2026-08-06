import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { noteKeys, notesApi } from './api';
import type { Note } from './types';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/** Keeps a note's title/project/content in local state and autosaves changes after a short pause. */
export function useNoteAutosave(note: Note | undefined) {
  const queryClient = useQueryClient();
  const [title, setTitleState] = useState('');
  const [projectId, setProjectIdState] = useState<string | null>(null);
  const [content, setContentState] = useState('');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const dirty = useRef(false);
  const noteId = note?.id;

  useEffect(() => {
    if (!note) return;
    setTitleState(note.title ?? '');
    setProjectIdState(note.projectId);
    setContentState(note.content);
    dirty.current = false;
    setStatus('idle');
  }, [note?.id]);

  const { mutate: save } = useMutation({
    mutationFn: (payload: { title: string; projectId: string | null; content: string }) =>
      notesApi.update(noteId!, {
        title: payload.title.trim() || null,
        projectId: payload.projectId,
        content: payload.content,
      }),
    onMutate: () => setStatus('saving'),
    onSuccess: () => {
      setStatus('saved');
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
    onError: () => setStatus('error'),
  });

  useEffect(() => {
    if (!dirty.current || !noteId) return;
    const timer = setTimeout(() => save({ title, projectId, content }), 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, projectId, content, noteId]);

  const setTitle = (v: string) => { dirty.current = true; setTitleState(v); };
  const setProjectId = (v: string | null) => { dirty.current = true; setProjectIdState(v); };
  const setContent = (v: string) => { dirty.current = true; setContentState(v); };

  return { title, setTitle, projectId, setProjectId, content, setContent, status };
}
