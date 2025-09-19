import axios, { AxiosError, AxiosInstance } from 'axios';

// Token storage key
const TOKEN_KEY = 'km_token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export type ApiProblem = {
  status: number;
  message: string;
  details?: unknown;
};

// Determine API base URL. Prefer NEXT_PUBLIC_API_BASE to bypass Next.js rewrites if needed.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

// Create Axios instance targeting API_BASE
const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if we have a token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const problem: ApiProblem = {
      status: error.response?.status || 0,
      message:
        (error.response?.data as any)?.error ||
        error.message ||
        'Network error. Please try again.',
      details: error.response?.data,
    };
    return Promise.reject(problem);
  },
);

export { api, TOKEN_KEY };
