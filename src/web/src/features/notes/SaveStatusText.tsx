import { Text } from '@mantine/core';
import type { SaveStatus } from './useNoteAutosave';

export function SaveStatusText({ status }: { status: SaveStatus }) {
  return (
    <Text size="xs" c={status === 'error' ? 'red' : 'dimmed'} mt={4} h={16}>
      {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : status === 'error' ? 'Failed to save' : ''}
    </Text>
  );
}
