import { supabase } from '@/integrations/supabase/client';

/**
 * API client wrapper for Edge Function calls.
 * All data operations go through edge functions instead of direct DB access.
 */

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  params?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/**
 * Call an edge function as an API endpoint.
 * @param functionName - The edge function name (e.g. 'api-salah')
 * @param options - method, body, query params
 */
export async function api<T = unknown>(functionName: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, params } = options;
  const token = await getAuthToken();

  // Build URL with query params
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const baseUrl = `https://${projectId}.supabase.co/functions/v1/${functionName}`;
  const url = new URL(baseUrl);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, text || `API error ${response.status}`);
  }

  const text = await response.text();
  if (!text) return null as T;
  return JSON.parse(text) as T;
}

/**
 * Fire-and-forget API call — does not block UI.
 */
export function apiAsync(functionName: string, options: ApiOptions = {}): void {
  api(functionName, options).catch(err => console.warn('[api-client]', err));
}
