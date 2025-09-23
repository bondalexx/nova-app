"use client";
import { useAuth } from "@/stores/authStore";
import { useEffect } from "react";
import { redirect } from "next/navigation";

const LogoutPage = () => {
  const { logout } = useAuth();
  useEffect(() => {
    logout();
    redirect("/");
  }, [logout]);
  return null;
};

export default LogoutPage;
