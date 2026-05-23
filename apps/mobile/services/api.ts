import { API_BASE_URL } from '@/constants/api';
import { getStoredToken } from '@/services/storage.service';
import { ApiError, type ApiResponse } from '@/types/api';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface ApiRequestOptions<TBody> {
  method?: HttpMethod;
  body?: TBody;
  token?: string | null;
  requiresAuth?: boolean;
  headers?: Record<string, string>;
}

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function apiRequest<TData, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TData> {
  const token = options.token ?? (options.requiresAuth ? await getStoredToken() : null);
  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError('Unable to reach the Estately API. Check your API URL and network connection.', 0);
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse<TData> | null;

  if (!payload) {
    throw new ApiError('The Estately API returned an invalid response.', response.status);
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(payload.success ? 'Request failed.' : payload.error, response.status);
  }

  return payload.data;
}
