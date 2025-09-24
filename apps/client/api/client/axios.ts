import axios, { AxiosError, AxiosHeaders, RawAxiosRequestHeaders } from "axios";
import { APIError } from "./errors";
import { tokenProvider } from "./tokenProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
});

// Attach Authorization header
api.interceptors.request.use((config) => {
  const token = tokenProvider.access; // reads from useAuth.getState()
  if (token && config.headers) {
    // use safe setter (AxiosHeaders or plain obj)
    const h = config.headers as any;
    if (!h.Authorization) h.Authorization = `Bearer ${token}`;
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
