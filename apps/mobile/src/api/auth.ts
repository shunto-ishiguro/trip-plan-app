import { API_BASE_URL } from './config';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function authFetch<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, (data as { error?: string }).error ?? 'Request failed');
  }

  return data as T;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: { id: string; email: string };
}

export interface SignupResponse {
  user: { id: string; email: string };
  session: {
    access_token: string;
    refresh_token: string;
  };
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

export interface MeResponse {
  id: string;
  email: string;
}

export function login(email: string, password: string) {
  return authFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function signup(email: string, password: string) {
  return authFetch<SignupResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function refreshTokens(refreshToken: string) {
  return authFetch<RefreshResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export function getMe(accessToken: string) {
  return authFetch<MeResponse>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
