import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { useAppTheme } from '../../themes/ThemeProvider';

interface Props {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
}

export function NoteEditor({ value, onChange, minHeight = 500 }: Props) {
  const { colorScheme } = useAppTheme();

  return (
    <div data-color-mode={colorScheme}>
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? '')}
        height={minHeight}
      />
    </div>
  );
}
