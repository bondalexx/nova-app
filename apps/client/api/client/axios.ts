import axios, { AxiosError, AxiosHeaders, RawAxiosRequestHeaders } from "axios";
import { APIError } from "./errors";
import { tokenProvider } from "./tokenProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  withCredentials: true, // allow refresh cookie
});

// Attach Authorization header
api.interceptors.request.use((config) => {
  const token = tokenProvider.access;

  // Ensure headers exists
  config.headers = config.headers ?? {};

  // Helper to set a header regardless of type
  const setHeader = (k: string, v: string) => {
    if (config.headers instanceof AxiosHeaders) {
      config.headers.set(k, v);
    } else {
      (config.headers as RawAxiosRequestHeaders)[k] = v;
    }
  };

  // Set Authorization if we have a token
  if (token) setHeader("Authorization", `Bearer ${token}`);

  // Set Content-Type only when sending JSON (not FormData)
  if (config.data && !(config.data instanceof FormData)) {
    // don’t overwrite if already provided
    if (
      (config.headers instanceof AxiosHeaders &&
        !config.headers.has("Content-Type")) ||
      (!(config.headers instanceof AxiosHeaders) &&
        !(config.headers as RawAxiosRequestHeaders)["Content-Type"])
    ) {
      setHeader("Content-Type", "application/json");
    }
  }

  // Optional: Accept JSON
  if (config.headers instanceof AxiosHeaders) {
    if (!config.headers.has("Accept"))
      config.headers.set("Accept", "application/json");
  } else if (!(config.headers as RawAxiosRequestHeaders)["Accept"]) {
    (config.headers as RawAxiosRequestHeaders)["Accept"] = "application/json";
  }

  return config;
});

// Refresh-once logic
let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

function flushQueue() {
  pendingQueue.forEach((res) => res());
  pendingQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<any>) => {
    const original = error.config!;
    const status = error.response?.status ?? 0;

    // Wrap known errors with APIError
    if (status !== 401 || (original as any)?._retry) {
      const message =
        (error.response?.data as any)?.error ??
        error.message ??
        "Network error";
      throw new APIError(message, status, error.response?.data);
    }

    // 401 handling with single refresh
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await tokenProvider.refresh();
        if (!newToken) {
          tokenProvider.clear();
          throw new APIError("Unauthorized", 401);
        }
      } finally {
        isRefreshing = false;
        flushQueue();
      }
    } else {
      // wait until refresh finishes
      await new Promise<void>((resolve) => pendingQueue.push(resolve));
    }

    (original as any)._retry = true;
    return api(original); // replay request with new token
  }
);

// Helper to normalize errors in `try/catch`
export function toAPIError(err: unknown): APIError {
  if (err instanceof APIError) return err;
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? 0;
    const message =
      (err.response?.data as any)?.error ?? err.message ?? "Network error";
    return new APIError(message, status, err.response?.data);
  }
  return new APIError("Unknown error", 0);
}
