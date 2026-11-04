/**
 * Tiny HTTP client used by every API function in this package.
 *
 * While the backend is being built, every call returns PLACEHOLDER data from
 * `./mocks`. Once an endpoint is live:
 *   1. Point the app at the backend (`configureApi({ baseUrl })`, or the
 *      EXPO_PUBLIC_API_URL / VITE_API_URL env variables, see the README).
 *   2. Set `useMocks: false`. Every call then hits `baseUrl + path`.
 *
 * You can also switch single endpoints over early by listing their paths in
 * `liveEndpoints`, while everything else stays on placeholder data.
 */

export interface ApiConfig {
  baseUrl: string;
  useMocks: boolean;
  /** Paths (from `endpoints.ts`) that should hit the real backend even while `useMocks` is true. */
  liveEndpoints: string[];
  /** Returns the current auth token, if any. */
  getToken: () => string | null | undefined | Promise<string | null | undefined>;
  /** Simulated latency for placeholder responses, in ms. */
  mockLatencyMs: number;
}

let config: ApiConfig = {
  baseUrl: '',
  useMocks: true,
  liveEndpoints: [],
  getToken: () => null,
  mockLatencyMs: 250,
};

export function configureApi(next: Partial<ApiConfig>) {
  config = { ...config, ...next };
}

export function getApiConfig(): Readonly<ApiConfig> {
  return config;
}

/** True when the app shows placeholder data (useful for "Sample data" labels and demo hints). */
export function isUsingMocks() {
  return config.useMocks;
}

export class ApiError extends Error {
  status: number;
  body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  /** Path parameters, e.g. `{ id: 'd1' }` fills `/doctors/:id`. */
  params?: Record<string, string | number>;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function buildUrl({ path, params, query }: RequestOptions) {
  let p = path;
  for (const [k, v] of Object.entries(params ?? {})) p = p.replace(':' + k, encodeURIComponent(String(v)));
  const qs = Object.entries(query ?? {})
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return config.baseUrl.replace(/\/$/, '') + p + (qs ? '?' + qs : '');
}

/**
 * Calls the backend, or returns `placeholder()` while mocks are on.
 * `placeholder` may mutate the in-memory mock store so the UI behaves
 * realistically (approving an application, sending a message, and so on).
 */
export async function request<T>(opts: RequestOptions, placeholder: () => T | Promise<T>): Promise<T> {
  const live = !config.useMocks || config.liveEndpoints.includes(opts.path);
  if (!live) {
    await sleep(config.mockLatencyMs);
    // Clone so screens can't accidentally mutate the mock store.
    const value = await placeholder();
    return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
  }

  const token = await config.getToken();
  const res = await fetch(buildUrl(opts), {
    method: opts.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;
  if (!res.ok) throw new ApiError(data?.message ?? res.statusText, res.status, data);
  return data as T;
}
