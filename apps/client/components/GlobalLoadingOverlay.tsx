"use client";
import { useIsLoading } from "@/stores/loading";
import Spinner from "./Modals/Spinner";

export default function GlobalLoadingOverlay() {
  const isLoading = useIsLoading();
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/40 backdrop-blur-sm">
      <Spinner />
    </div>
  );
}
