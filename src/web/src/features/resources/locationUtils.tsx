import { notifications } from '@mantine/notifications';
import {
  IconBrandGit, IconCheck, IconDatabase, IconExternalLink,
  IconFile, IconFolder, IconGlobe, IconLayoutDashboard,
  IconNetwork, IconServerCog,
} from '@tabler/icons-react';
import type { ResourceType } from './types';

export function typeIcon(size: number): Record<ResourceType, React.ReactNode> {
  return {
    Website:       <IconGlobe size={size} />,
    UncShare:      <IconNetwork size={size} />,
    LocalFolder:   <IconFolder size={size} />,
    LocalFile:     <IconFile size={size} />,
    GitRepository: <IconBrandGit size={size} />,
    Documentation: <IconExternalLink size={size} />,
    Environment:   <IconServerCog size={size} />,
    Dashboard:     <IconLayoutDashboard size={size} />,
    Database:      <IconDatabase size={size} />,
    Other:         <IconExternalLink size={size} />,
  };
}

export function isUrl(location: string): boolean {
  return /^https?:\/\//i.test(location);
}

export function openLocation(location: string) {
  if (location.startsWith('\\\\') || location.startsWith('//')) {
    window.open(`file:${location.replace(/\\/g, '/')}`, '_blank');
  } else {
    window.open(location, '_blank', 'noopener,noreferrer');
  }
}

export function copyLocation(location: string) {
  navigator.clipboard.writeText(location).then(() => {
    notifications.show({ message: 'URL copied to clipboard', color: 'green', icon: <IconCheck size={16} /> });
  }).catch(() => {
    notifications.show({ message: 'Failed to copy URL', color: 'red' });
  });
}
