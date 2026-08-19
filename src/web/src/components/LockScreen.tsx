import { useEffect, useRef, useState } from 'react';
import { PasswordInput, Stack, Text } from '@mantine/core';
import { Lock } from 'lucide-react';
import { appSettingsApi } from '../features/settings/api';

const CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' +
  '!@#$%^&*()_+-=[]{}|;:,.<>?/~`' +
  'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ' +
  'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' +
  'αβγδεζηθικλμνξοπρστυφχψω' +
  '一二三四五六七八九十日月火水木金土';
const FONT_SIZE = 15;
const COLUMN_WIDTH = 12;
const BACKOFF_THRESHOLD = 5;
const MAX_PIN_LENGTH = 8;

interface LockScreenProps {
  locked: boolean;
  hasPin: boolean;
  onLockRequested: () => void;
  onUnlock: () => void;
}

export function LockScreen({ locked, hasPin, onLockRequested, onUnlock }: LockScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!locked) {
      setPin('');
      setError(false);
      setFailedAttempts(0);
      setLockedUntil(0);
    }
  }, [locked]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        if (!locked) onLockRequested();
      } else if (e.key === 'Escape' && locked && !hasPin) {
        onUnlock();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [locked, hasPin, onLockRequested, onUnlock]);

  useEffect(() => {
    if (!locked || hasPin) return;
    const onClick = () => onUnlock();
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [locked, hasPin, onUnlock]);

  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  useEffect(() => {
    if (!locked) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const styles = getComputedStyle(document.documentElement);
    const bg = styles.getPropertyValue('--g-background').trim() || '#000';
    const accent = styles.getPropertyValue('--g-accent').trim() || '#0f0';
    const textMuted = styles.getPropertyValue('--g-text-muted').trim() || accent;

    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let heads: number[] = [];
    let speeds: number[] = [];
    let trailLengths: number[] = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.ceil(width / COLUMN_WIDTH);
      rows = Math.ceil(height / FONT_SIZE);
      heads = Array.from({ length: columns }, () => Math.random() * rows);
      speeds = Array.from({ length: columns }, () => 0.3 + Math.random() * 0.7);
      trailLengths = Array.from({ length: columns }, () => 14 + Math.floor(Math.random() * 22));
    };
    resize();

    window.addEventListener('resize', resize);

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);

      ctx.fillStyle = `color-mix(in srgb, ${bg} 25%, transparent)`;
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${FONT_SIZE}px monospace`;
      ctx.textBaseline = 'top';

      for (let i = 0; i < columns; i++) {
        const x = i * COLUMN_WIDTH;
        const head = heads[i];
        const trailLength = trailLengths[i];

        for (let t = 0; t < trailLength; t++) {
          const row = Math.floor(head) - t;
          if (row < 0) continue;
          const y = row * FONT_SIZE;
          if (y > height) continue;

          const char = CHARS[Math.floor(Math.random() * CHARS.length)];
          const fade = 1 - t / trailLength;
          ctx.globalAlpha = t === 0 ? 1 : Math.max(0.08, fade);
          ctx.fillStyle = t === 0 ? '#ffffff' : t < 3 ? accent : textMuted;
          ctx.fillText(char, x, y);
        }
        ctx.globalAlpha = 1;

        heads[i] += speeds[i];
        if (Math.floor(heads[i]) - trailLength > rows) {
          heads[i] = 0;
          speeds[i] = 0.3 + Math.random() * 0.7;
          trailLengths[i] = 14 + Math.floor(Math.random() * 22);
        }
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [locked]);

  const backoffRemainingMs = Math.max(0, lockedUntil - now);
  const throttled = backoffRemainingMs > 0;

  const attemptPin = async (value: string, reportFailure: boolean) => {
    if (throttled || value.length < 4) return;
    try {
      await appSettingsApi.verifyPin({ pin: value });
      onUnlock();
    } catch {
      if (!reportFailure) return;
      setPin('');
      setError(true);
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      if (attempts >= BACKOFF_THRESHOLD) {
        const delaySeconds = Math.min(30, 2 ** (attempts - BACKOFF_THRESHOLD + 1));
        setLockedUntil(Date.now() + delaySeconds * 1000);
      }
    }
  };

  // Check the PIN as soon as it's long enough to be complete — no Enter needed to
  // unlock. Wrong-PIN feedback only fires once the field hits the max length (or on
  // an explicit Enter), so a correct-but-not-yet-fully-typed prefix never flashes an error.
  useEffect(() => {
    if (!locked || !hasPin) return;
    void attemptPin(pin, pin.length >= MAX_PIN_LENGTH);
  }, [pin]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!locked) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--g-background)',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      {hasPin && (
        <Stack
          align="center"
          justify="center"
          gap="sm"
          style={{ position: 'absolute', inset: 0 }}
        >
          <Lock size={28} color="var(--g-accent)" />
          <Text size="sm" style={{ color: 'var(--g-text)' }}>
            {throttled ? `Too many attempts — try again in ${Math.ceil(backoffRemainingMs / 1000)}s` : 'Enter PIN to unlock'}
          </Text>
          <PasswordInput
            inputMode="numeric"
            maxLength={8}
            value={pin}
            onChange={(e) => { setPin(e.currentTarget.value.replace(/\D/g, '')); setError(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') void attemptPin(pin, true); }}
            disabled={throttled}
            error={error}
            autoFocus
            w={200}
            styles={{
              input: {
                background: 'var(--g-surface)',
                borderColor: error ? 'var(--g-danger)' : 'var(--g-border)',
                color: 'var(--g-text)',
                textAlign: 'center',
                letterSpacing: '0.3em',
              },
            }}
          />
        </Stack>
      )}
    </div>
  );
}
