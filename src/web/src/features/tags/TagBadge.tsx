import { Badge } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import type { Tag } from './types';

interface Props {
  tag: Tag;
  size?: 'xs' | 'sm' | 'md';
  onRemove?: () => void;
}

export function TagBadge({ tag, size = 'xs', onRemove }: Props) {
  const navigate = useNavigate();
  const color = tag.color ?? '#868e96';

  return (
    <Badge
      size={size}
      onClick={() => navigate(`/search?q=${encodeURIComponent(tag.name)}`)}
      style={{
        background: `${color}22`,
        color,
        border: `1px solid ${color}55`,
        fontWeight: 500,
        cursor: 'pointer',
      }}
      rightSection={onRemove ? (
        <span
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{ cursor: 'pointer', marginLeft: 2, lineHeight: 1 }}
        >
          ×
        </span>
      ) : undefined}
    >
      {tag.name}
    </Badge>
  );
}
