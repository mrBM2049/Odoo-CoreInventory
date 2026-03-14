import { supabase } from './supabase';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function getAuthHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token) {
    throw new Error('Not authenticated');
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const authHeader = await getAuthHeader();
    Object.assign(headers, authHeader);
  } catch (err) {
    // Propagate auth errors to caller so pages can handle redirect/messages
    throw err;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  if (response.status === 204) {
    // No content
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function apiGet<T>(path: string) {
  return request<T>(path, { method: 'GET' });
}

export function apiPost<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function apiPut<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function apiDelete<T = void>(path: string) {
  return request<T>(path, {
    method: 'DELETE',
  });
}

