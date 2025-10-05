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
    <div className="bg-[#0A0A0A] h-screen w-screen text-white flex justify-center items-center">
      <div className="flex flex-col gap-4 justify-center items-center">
        <h1 className="text-[40px] font-bold text-white">
          Create account in Nova
        </h1>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="User name"
          className="h-[48px] w-[320px] rounded-lg  border border-[#242424] px-4 text-white placeholder:text-[#8F8F8F] text-[18px] "
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="h-[48px] w-[320px] rounded-lg  border border-[#242424] px-4 text-white placeholder:text-[#8F8F8F] text-[18px] "
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Display name"
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
          Sign up
        </button>
      </div>
    </div>
  );
}
