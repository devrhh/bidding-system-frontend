const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Generic API client for base configs
export async function apiClient(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  const headers = {
    ...defaultHeaders,
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  return res;
}
