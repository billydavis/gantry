import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appSettingsKeys, appSettingsApi } from '../features/settings/api';

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const;
const CHECK_INTERVAL_MS = 1000;

export function useIdleLock() {
  const { data: settings } = useQuery({
    queryKey: appSettingsKeys.all,
    queryFn: appSettingsApi.get,
  });

  const [locked, setLocked] = useState(false);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    if (locked) return;
    const bump = () => { lastActivityRef.current = Date.now(); };
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    return () => ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, bump));
  }, [locked]);

  useEffect(() => {
    if (locked) return;
    if (!settings?.lockEnabled) return;
    const timeoutMs = settings.idleTimeoutMinutes * 60_000;
    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= timeoutMs) setLocked(true);
    }, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [locked, settings?.lockEnabled, settings?.idleTimeoutMinutes]);

  const lockNow = () => setLocked(true);
  const unlock = () => {
    lastActivityRef.current = Date.now();
    setLocked(false);
  };

  return { locked, hasPin: settings?.hasPin ?? false, lockNow, unlock };
}
