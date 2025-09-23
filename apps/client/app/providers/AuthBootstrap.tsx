"use client";
import { useEffect } from "react";
import { useAuth } from "@/stores/authStore";
import { redirect } from "next/navigation";

export default function AuthBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const refresh = useAuth((s) => s.refresh);
  const loadMe = useAuth((s) => s.loadMe);

  useEffect(() => {
    (async () => {
      const ok = await refresh(); // pulls new access token from cookie

      if (ok) await loadMe();
      else redirect("/login"); // hydrate user
    })();
  }, [refresh, loadMe]);

  return <>{children}</>;
}
