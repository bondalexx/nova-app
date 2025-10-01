"use client";
import { useEffect } from "react";
import { useAuth } from "@/stores/authStore";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { usePathname, redirect } from "next/navigation";

export default function AuthBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const refresh = useAuth((s) => s.refresh);
  const loadMe = useAuth((s) => s.loadMe);
  const pathname = usePathname();

  useEffect(() => {
    (async () => {
      const ok = await refresh();

      if (ok) {
        await loadMe();
      } else {
        if (pathname !== "/signup") {
          redirect("/login");
        }
      }
    })();
  }, [refresh, loadMe, pathname]);

  return (
    <>
      {children} <GlobalLoadingOverlay />
    </>
  );
}
