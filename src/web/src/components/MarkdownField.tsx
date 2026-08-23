import { Text } from '@mantine/core';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { useAppTheme } from '../themes/ThemeProvider';

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  error?: string;
}

/** Compact Markdown-enabled replacement for a Mantine `Textarea`, for use on `description`-style fields. */
export function MarkdownField({ label, value, onChange, placeholder, height = 160, error }: Props) {
  const { colorScheme } = useAppTheme();

  return (
    <div>
      {label && (
        <Text size="sm" fw={500} mb={4} style={{ color: 'var(--g-text)' }}>
          {label}
        </Text>
      )}
      <div data-color-mode={colorScheme}>
        <MDEditor
          value={value}
          onChange={(v) => onChange(v ?? '')}
          height={height}
          preview="edit"
          textareaProps={{ placeholder }}
        />
      </div>
      {error && (
        <Text size="xs" mt={4} style={{ color: 'var(--g-danger)' }}>
          {error}
        </Text>
      )}
    </div>
  );
}
