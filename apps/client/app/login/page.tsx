"use client";
import { useState } from "react";
import { redirect } from "next/navigation";

import { useAuth } from "@/stores/authStore";
import useUserStore from "@/stores/userStore";

import styles from "./page.module.css";

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
    <div className="bg-[#0A0A0A] h-screen w-screen text-white flex justify-center items-center">
      <div className={`flex flex-col gap-4 justify-center`}>
        <h1 className="text-[40px] font-bold text-white">Login in to Nova</h1>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="h-[48px] w-[320px] rounded-lg  border border-[#242424] px-4 text-white placeholder:text-[#8F8F8F] text-[18px] "
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="h-[48px] w-[320px] rounded-lg  border border-[#242424] px-4 text-white placeholder:text-[#8F8F8F] text-[18px] "
        />
        <button
          className="h-[48px] w-[320px] rounded-lg text-[#0A0A0A] bg-white text-[18px] cursor-pointer"
          onClick={handleLogin}
        >
          Login
        </button>
        <span className="text-center text-[16px]">
          Don't have an account?{" "}
          <a href="/signup" className="text-[#0A84FF]">
            Sign up
          </a>
        </span>
      </div>
    </div>
  );
}
