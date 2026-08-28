import { ActionIcon, TextInput } from '@mantine/core';
import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Width of the input; defaults to a flexible min-width. */
  width?: number | string;
}

/** Themed search box with a leading icon and a clear button, shared across list pages. */
export function SearchInput({ value, onChange, placeholder = 'Search…', width }: Props) {
  return (
    <TextInput
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      placeholder={placeholder}
      leftSection={<Search size={15} />}
      rightSection={
        value ? (
          <ActionIcon variant="subtle" size="sm" onClick={() => onChange('')} style={{ color: 'var(--g-text-muted)' }}>
            <X size={14} />
          </ActionIcon>
        ) : null
      }
      styles={{
        root: { width, flex: width ? undefined : 1, minWidth: 200 },
        input: { background: 'var(--g-background)', color: 'var(--g-text)', border: '1px solid var(--g-border)' },
        section: { color: 'var(--g-text-muted)' },
      }}
    />
  );
}
