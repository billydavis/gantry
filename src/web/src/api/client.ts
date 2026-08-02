const API_BASE = '/api';

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ title: res.statusText }));
    throw new ApiError(res.status, body?.title ?? 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

async function apiDownload(path: string): Promise<{ blob: Blob; filename: string }> {
  const res = await fetch(`${API_BASE}${path}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({ title: res.statusText }));
    throw new ApiError(res.status, body?.title ?? 'Request failed');
  }

  const disposition = res.headers.get('Content-Disposition') ?? '';
  const match = /filename="?([^"]+)"?/.exec(disposition);
  return { blob: await res.blob(), filename: match?.[1] ?? 'download' };
}

async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', body: formData });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ title: res.statusText }));
    throw new ApiError(res.status, body?.title ?? 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
  download: apiDownload,
  upload: apiUpload,
};
