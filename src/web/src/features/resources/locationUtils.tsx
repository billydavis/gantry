import { notifications } from '@mantine/notifications';
import { Check, Database, ExternalLink, File, Folder, GitBranch, Globe, LayoutDashboard, Monitor, Network, ServerCog } from 'lucide-react';
import { COPY_ONLY_TYPES, type ResourceType } from './types';

export function typeIcon(size: number): Record<ResourceType, React.ReactNode> {
  return {
    Website:       <Globe size={size} />,
    UncShare:      <Network size={size} />,
    LocalFolder:   <Folder size={size} />,
    LocalFile:     <File size={size} />,
    GitRepository: <GitBranch size={size} />,
    Documentation: <ExternalLink size={size} />,
    Environment:   <ServerCog size={size} />,
    Dashboard:     <LayoutDashboard size={size} />,
    Database:      <Database size={size} />,
    RemoteDesktop: <Monitor size={size} />,
    Other:         <ExternalLink size={size} />,
  };
}

export function isUrl(location: string): boolean {
  return /^https?:\/\//i.test(location);
}

export function isCopyOnly(type: ResourceType): boolean {
  return COPY_ONLY_TYPES.includes(type);
}

export function openLocation(location: string, type: ResourceType) {
  if (isCopyOnly(type)) {
    copyLocation(location);
  } else if (location.startsWith('\\\\') || location.startsWith('//')) {
    window.open(`file:${location.replace(/\\/g, '/')}`, '_blank');
  } else {
    window.open(location, '_blank', 'noopener,noreferrer');
  }
}

export function copyLocation(location: string) {
  navigator.clipboard.writeText(location).then(() => {
    notifications.show({ message: 'Location copied to clipboard', color: 'green', icon: <Check size={16} /> });
  }).catch(() => {
    notifications.show({ message: 'Failed to copy location', color: 'red' });
  });
}
