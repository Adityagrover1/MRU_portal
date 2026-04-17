import { supabase } from './supabase';

type RequestBody = Record<string, unknown> | undefined;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const toApiUrl = (path: string) => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
};

export async function apiRequest<T>(path: string, method = 'GET', body?: RequestBody): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new Error('You must be signed in to continue.');
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  const init: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  const response = await fetch(toApiUrl(path), init);

  if (response.status === 204) {
    return undefined as T;
  }

  const dataJson = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof dataJson?.error === 'string' ? dataJson.error : 'Request failed';
    throw new Error(message);
  }

  return dataJson as T;
}
