// api/client/axios.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { APIError } from "./errors";
import { tokenProvider } from "./tokenProvider";
import { useLoading } from "@/stores/loading";

declare module "axios" {
  export interface AxiosRequestConfig {
    showLoading?: boolean;
    _retry?: boolean;
    __loadingCounted?: boolean; // internal
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
});

/* --------------------- REQUEST --------------------- */
api.interceptors.request.use((config) => {
  const token = tokenProvider.access;
  if (token && config.headers) {
    // use safe setter (AxiosHeaders or plain obj)
    const h = config.headers as any;
    if (!h.Authorization) h.Authorization = `Bearer ${token}`;
  }

  // Only count once per actual network attempt
  if (config.showLoading !== false && !config.__loadingCounted) {
    useLoading.getState().start();
    config.__loadingCounted = true;
  }
  return config;
});

/* --------------------- REFRESH QUEUE --------------------- */
let isRefreshing = false;
let waiters: Array<() => void> = [];
const waitForRefresh = () => new Promise<void>((r) => waiters.push(r));
const releaseWaiters = () => {
  waiters.forEach((fn) => fn());
  waiters = [];
};

/* --------------------- RESPONSE --------------------- */
api.interceptors.response.use(
  // SUCCESS → always end if we counted
  (res) => {
    if (res.config.__loadingCounted) {
      useLoading.getState().end();
      res.config.__loadingCounted = false;
    }
    return res;
  },
  // ERROR
  async (error: AxiosError<any>) => {
    const original = error.config as AxiosRequestConfig;

    // If it's not a 401 or we've already retried, end & throw
    if ((error.response?.status ?? 0) !== 401 || original._retry) {
      if (original.__loadingCounted) {
        useLoading.getState().end();
        original.__loadingCounted = false;
      }
      const message =
        (error.response?.data as any)?.error ??
        error.message ??
        "Network error";
      throw new APIError(
        message,
        error.response?.status ?? 0,
        error.response?.data
      );
    }

    // 401: try a single refresh for the whole herd
    original._retry = true;

    try {
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await tokenProvider.refresh();
        if (!newToken) {
          tokenProvider.clear();
          throw new APIError("Unauthorized", 401);
        }
      } else {
        // Wait for the in-flight refresh to complete
        await waitForRefresh();
      }
    } catch (e) {
      // Refresh failed → end & rethrow
      if (original.__loadingCounted) {
        useLoading.getState().end();
        original.__loadingCounted = false;
      }
      throw e instanceof APIError ? e : new APIError("Unauthorized", 401);
    } finally {
      if (isRefreshing) {
        isRefreshing = false;
        releaseWaiters();
      }
    }

    // Replay the original request WITH the same loading ticket still active.
    // The success/error handlers above will `end()` it when this attempt finishes.
    return api(original);
  }
);

/* --------------------- Helper --------------------- */
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
