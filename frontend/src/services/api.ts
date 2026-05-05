const DEFAULT_API_BASE_URL = "";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "") ??
  DEFAULT_API_BASE_URL;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestCandidate = {
  path: string;
  method: HttpMethod;
  allowBodyOnGet?: boolean;
};

export class ApiError extends Error {
  status?: number;
  payload?: unknown;

  constructor(message: string, status?: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions<T> = {
  candidates: RequestCandidate[];
  body?: unknown;
  parser?: (payload: unknown) => T;
};

type JsonResponse = {
  status: number;
  payload: unknown;
};

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJsonSafely(value: string) {
  if (!value.trim()) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

async function fetchJson(
  candidate: RequestCandidate,
  body?: unknown
): Promise<JsonResponse> {
  try {
    const response = await fetch(buildUrl(candidate.path), {
      method: candidate.method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      credentials: "include",
      body:
        body && candidate.method !== "GET"
          ? JSON.stringify(body)
          : undefined,
      cache: "no-store",
    });

    const text = await response.text();
    return {
      status: response.status,
      payload: parseJsonSafely(text),
    };
  } catch {
    throw new ApiError(
      "Could not reach the API. Confirm Next.js is running and BACKEND_API_BASE_URL points to the backend server."
    );
  }
}

function getApiMessage(payload: unknown) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (!isRecord(payload)) {
    return null;
  }

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  if ("data" in payload) {
    return getApiMessage(payload.data);
  }

  return null;
}

function shouldTryNextCandidate(error: unknown) {
  return (
    error instanceof ApiError &&
    typeof error.status === "number" &&
    [404, 405].includes(error.status)
  );
}

export async function requestWithFallback<T>({
  candidates,
  body,
  parser,
}: RequestOptions<T>) {
  let lastError: unknown = null;

  for (const candidate of candidates) {
    try {
      const response = await fetchJson(candidate, body);

      if (response.status >= 200 && response.status < 300) {
        return parser ? parser(response.payload) : (response.payload as T);
      }

      throw new ApiError(
        getApiMessage(response.payload) ??
          `Request failed with status ${response.status}.`,
        response.status,
        response.payload
      );
    } catch (error) {
      lastError = error;

      if (shouldTryNextCandidate(error)) {
        continue;
      }

      throw error;
    }
  }

  throw (
    lastError ??
    new ApiError("The backend route could not be resolved for this action.")
  );
}

export function unwrapData<T>(payload: unknown) {
  if (isRecord(payload) && "data" in payload) {
    return payload.data as T;
  }

  return payload as T;
}

export function getRecord(
  payload: unknown,
  nestedKeys: string[] = []
): Record<string, unknown> | null {
  let current = payload;

  for (const key of nestedKeys) {
    if (!isRecord(current) || !(key in current)) {
      return null;
    }

    current = current[key];
  }

  return isRecord(current) ? current : null;
}

export function getArray(
  payload: unknown,
  nestedKeys: string[] = []
): unknown[] | null {
  let current = payload;

  for (const key of nestedKeys) {
    if (!isRecord(current) || !(key in current)) {
      return null;
    }

    current = current[key];
  }

  return Array.isArray(current) ? current : null;
}

export function getString(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  return null;
}
