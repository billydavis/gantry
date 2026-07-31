import { md5 } from './md5';

export function gravatarUrl(email: string | null | undefined, size = 80): string | undefined {
  if (!email?.trim()) return undefined;
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=404`;
}
