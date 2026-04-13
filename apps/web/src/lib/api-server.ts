import { auth } from '@clerk/nextjs/server';
import { ApiError } from './api-error';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4100';

export async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers as Record<string, string>),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    let apiMessage: string;
    try {
      apiMessage = (JSON.parse(body) as { message?: string }).message ?? body;
    } catch {
      apiMessage = body;
    }
    throw new ApiError(res.status, apiMessage);
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return res.json();
}
