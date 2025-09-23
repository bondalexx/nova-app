"use client";
import { useState } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/stores/authStore";

export default function SignupPage() {
  const { setAccessToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");

  async function handleLogin() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        displayName: name,
        username: userName,
      }),
      credentials: "include", // <- send cookies (refresh_token)
    });
    if (!res.ok) {
      console.error("Login failed");
      return;
    }
    const data = await res.json();
    const accessToken = data.accessToken;
    setAccessToken(accessToken);
    // redirect("/");
  }

  return (
    <div className="bg-blue-950 h-screen w-screen text-white">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
      />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="display name"
      />

      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="user name"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />

      <button onClick={handleLogin}>Sign up</button>
    </div>
  );
}
