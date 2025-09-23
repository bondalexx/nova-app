import { useAuth } from "@/stores/authStore";

export const tokenProvider = {
  get access(): string | null {
    return useAuth.getState().accessToken ?? null;
  },
  set access(v: string | null) {
    useAuth.getState().setAccessToken?.(v ?? "");
  },
  async refresh(): Promise<string | null> {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {
          credentials: "include", // refresh cookie lives in httpOnly
        }
      );
      if (!res.ok) return null;
      const { accessToken } = await res.json();
      tokenProvider.access = accessToken;
      return accessToken;
    } catch {
      return null;
    }
  },
  clear() {
    useAuth.getState().logout?.();
  },
};
