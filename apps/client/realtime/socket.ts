import { io, Socket } from "socket.io-client";
import { useAuth } from "@/stores/authStore"; // your auth store (accessToken or userId)
import { useMessages } from "@/stores/messages";

let socket: Socket | null = null;

export function getSocket() {
  if (socket) return socket;
  const userId = useAuth.getState().user?.id;
  socket = io(process.env.NEXT_PUBLIC_API_URL!, {
    withCredentials: true,
    transports: ["websocket"],
    auth: { userId }, // or pass accessToken if your server expects it
  });

  // incoming events
  socket.on("message:new", (msg) => {
    useMessages.getState().receiveRemote(msg);
  });

  return socket;
}
