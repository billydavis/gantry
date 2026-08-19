import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notesApi, noteKeys } from './api';

export function useCreateNote() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (projectId?: string) => notesApi.create({ projectId, content: '' }),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      navigate(`/notes/${note.id}`);
    },
  });

  return { createNote: mutation.mutate, isCreating: mutation.isPending };
}
