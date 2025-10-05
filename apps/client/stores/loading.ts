// src/stores/loading.ts
"use client";
import { create } from "zustand";

type LoadingState = {
  pendingCount: number;
  start: () => void;
  end: () => void;
  reset: () => void; // optional (e.g., after route changes)
};

export const useLoading = create<LoadingState>((set, get) => ({
  pendingCount: 0,
  start: () => set({ pendingCount: get().pendingCount + 1 }),
  end: () => set((s) => ({ pendingCount: Math.max(0, s.pendingCount - 1) })),
  reset: () => set({ pendingCount: 0 }),
}));

// selector
export const useIsLoading = () => useLoading((s) => s.pendingCount > 0);
