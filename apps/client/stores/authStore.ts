// stores/useAuth.ts
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type User from "@/types/user";
import { api } from "@/api/client/axios"; // your axios instance with interceptors
import { toAPIError } from "@/api/client/axios";
import { me as apiMe, signOut as apiLogout } from "@/api/auth"; // thin API wrappers

type AuthState = {
  accessToken: string | null;
  user: User | null;

  status: "idle" | "loading" | "ready" | "error";
  error: string | null;

  // setters
  setAccessToken: (t: string | null) => void;
  setUser: (u: User | null) => void;

  // lifecycle
  init: () => Promise<void>; // refresh -> loadMe (call once on app bootstrap)

  // server calls
  refresh: () => Promise<boolean>; // POST /auth/refresh (cookie-based)
  loadMe: () => Promise<void>; // GET /auth/me
  logout: () => Promise<void>; // POST /auth/logout
};

const noopStorage: Storage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  length: 0,
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,

      status: "idle",
      error: null,

      setAccessToken: (t) => set({ accessToken: t }),
      setUser: (u) => set({ user: u }),

      /** Boot sequence: try refresh, then fetch /me */
      init: async () => {
        // avoid double-init thrash
        if (get().status === "loading" || get().status === "ready") return;
        set({ status: "loading", error: null });
        try {
          const ok = await get().refresh();
          if (ok) {
            await get().loadMe();
          } else {
            // not logged in (no refresh cookie) -> keep idle but not an error
            set({ accessToken: null, user: null });
          }
          set({ status: "ready" });
        } catch (e) {
          const err = toAPIError(e);
          set({
            status: "error",
            error: err.message,
            accessToken: null,
            user: null,
          });
        }
      },

      /** Ask backend to mint a new access token from refresh cookie */
      refresh: async () => {
        try {
          const res = await api.post<{ accessToken: string }>(
            "/auth/refresh",
            {},
            { withCredentials: true }
          );
          const token = res.data?.accessToken ?? null;
          set({ accessToken: token });
          return !!token;
        } catch {
          set({ accessToken: null, user: null });
          return false;
        }
      },

      /** Load current user profile using current access token */
      loadMe: async () => {
        const token = get().accessToken;
        if (!token) return;
        try {
          const u = await apiMe(); // GET /auth/me via axios
          set({ user: u });
        } catch (e) {
          // If /me fails (expired token) leave user null; interceptor may refresh next call anyway
          const err = toAPIError(e);
          set({ error: err.message });
        }
      },

      /** Logout on server + clear local auth */
      logout: async () => {
        try {
          await apiLogout(); // POST /auth/logout
        } catch {
          // ignore network/logout errors, we still clear locally
        } finally {
          set({ accessToken: null, user: null, status: "idle", error: null });
        }
      },
    }),
    {
      name: "nova-auth",
      // Persist only what's safe/useful on the client
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
      storage: createJSONStorage(() => sessionStorage || noopStorage),
      // If you prefer long-lived sessions:
      // storage: createJSONStorage(() => localStorage),
    }
  )
);
