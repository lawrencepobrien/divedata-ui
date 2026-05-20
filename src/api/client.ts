import keycloak from '../auth/keycloak';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (keycloak.authenticated) {
    await keycloak.updateToken(30).catch(() => keycloak.login());
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(keycloak.token ? { Authorization: `Bearer ${keycloak.token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || res.statusText);
  }

  return res.json() as Promise<T>;
}

export const client = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
