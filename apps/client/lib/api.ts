// lib/api.ts
import { useAuth } from "@/stores/authStore";

export async function api(input: string, init: RequestInit = {}) {
  const { accessToken, refresh, setAccessToken, setUser } = useAuth.getState();

  const withAuth = {
    ...(init.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${input}`, {
    ...init,
    headers: withAuth,
    credentials: "include",
  });

  // If access token expired → try refresh once
  if (res.status === 401) {
    const ok = await refresh();
    if (ok) {
      const newToken = useAuth.getState().accessToken;
      res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${input}`, {
        ...init,
        headers: {
          ...(init.headers || {}),
          ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
        },
        credentials: "include",
      });
    } else {
      setAccessToken(null);
      setUser(null);
    }
  }

  // If this was a call to `/auth/me` and succeeded, update user in store
  if (input.startsWith("/auth/me") && res.ok) {
    try {
      const user = await res.clone().json(); // clone so original res still usable
      setUser(user);
    } catch (e) {
      console.warn("[api] failed to parse /auth/me response", e);
    }
  }

  return res;
}
