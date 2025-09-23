"use client";
import { useState } from "react";
import { redirect } from "next/navigation";

import { useAuth } from "@/stores/authStore";
import useUserStore from "@/stores/userStore";

export default function LoginPage() {
  const { setAccessToken } = useAuth();
  const { setUser } = useUserStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    if (!res.ok) {
      console.error("Login failed");
      return;
    }
    const data = await res.json();
    const accessToken = data.accessToken;
    setAccessToken(accessToken);
    setUser(data.user);
    redirect("/");
  }

  return (
    <div className="bg-blue-950 h-screen w-screen text-white">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
