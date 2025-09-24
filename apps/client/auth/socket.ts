"use client";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/stores/authStore";

let socket: Socket | null = null;
let lastToken: string | null = null;

export function ensureSocket(): Socket | null {
  const token = useAuth.getState().accessToken;
  if (!token) return null;

  const tokenChanged = token !== lastToken;

  if (!socket || tokenChanged) {
    if (socket) {
      socket.off(); // remove handlers (HMR-safe)
      socket.disconnect(); // drop old SID
    }
    socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      path: "/socket.io", // <— must match server
      transports: ["websocket"], // <— prefer websocket in dev
      withCredentials: true,
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      forceNew: true, // <— always get a fresh SID after token change
    });
    lastToken = token;
  }

  return socket;
}
