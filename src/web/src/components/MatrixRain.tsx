import { useEffect, useRef, useState } from 'react';

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

export function MatrixRain() {
  const [active, setActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setActive((prev) => !prev);
      } else if (e.key === 'Escape') {
        setActive(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!active) return;
    // Any click anywhere in the app — including the nav sidebar, which the
    // overlay doesn't cover — dismisses the effect.
    const onClick = () => setActive(false);
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [active]);

  useEffect(() => {
    if (!active) return;
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

    const parent = canvas.parentElement;

    const resize = () => {
      width = canvas.width = parent?.clientWidth ?? window.innerWidth;
      height = canvas.height = parent?.clientHeight ?? window.innerHeight;
      columns = Math.ceil(width / COLUMN_WIDTH);
      rows = Math.ceil(height / FONT_SIZE);
      heads = Array.from({ length: columns }, () => Math.random() * rows);
      speeds = Array.from({ length: columns }, () => 0.3 + Math.random() * 0.7);
      trailLengths = Array.from({ length: columns }, () => 14 + Math.floor(Math.random() * 22));
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    if (parent) resizeObserver.observe(parent);
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
      resizeObserver.disconnect();
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      onClick={() => setActive(false)}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        background: 'var(--g-background)',
        cursor: 'pointer',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}
