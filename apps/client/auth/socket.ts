"use client";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/stores/authStore";

let socket: Socket | null = null;

export function ensureSocket() {
  const token = useAuth.getState().accessToken;
  if (!token) return null;

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      auth: { token },
      withCredentials: true,
    });

    // if token changes (after refresh), update & reconnect
    useAuth.subscribe((s) => {
      if (socket && s.accessToken) {
        socket.auth = { token: s.accessToken };
        if (!socket.connected) socket.connect();
      }
    });
  }
  return socket;
}
