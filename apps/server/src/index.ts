import "dotenv/config";
import http from "http";
import app from "./app";
import jwt from "jsonwebtoken";
import { prisma } from "./lib/prisma";
import { Server } from "socket.io";

const PORT = Number(process.env.PORT ?? 4000);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";

const server = http.createServer(app);

export const io = new Server(server, {
  path: "/socket.io", // <— match client
  transports: ["websocket", "polling"],
  cors: {
    origin: CORS_ORIGIN,
    credentials: true,
  },
  // (optional) tune dev keepalive; defaults are fine
  pingTimeout: 20000,
  pingInterval: 25000,
});

io.use((socket, next) => {
  try {
    const raw =
      (socket.handshake.auth?.token as string | undefined) ||
      (socket.handshake.headers?.authorization as string | undefined);

    if (!raw) return next(new Error("Unauthorized: no token"));
    const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;

    const payload = jwt.verify(token, process.env.JWT_SECRET!); // HS256
    // @ts-expect-error
    socket.user = { id: (payload as any).sub };
    return next();
  } catch (err: any) {
    console.error("[io.auth] verify failed:", err?.message);
    return next(new Error(`Unauthorized: ${err?.message || "verify failed"}`));
  }
});

io.on("connection", (socket) => {
  const me = (socket as any).user.id as string;
  console.log("[io] connect", socket.id, "user:", me);

  socket.emit("session", { id: me });

  socket.on("join_room", async (roomId: string) => {
    if (!roomId) return;
    const member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId: me } },
      select: { roomId: true },
    });
    if (!member) return;
    socket.join(roomId);
    console.log("[io] join", socket.id, "room:", roomId);
  });

  socket.on(
    "send_message",
    async (
      payload: { room: string; message: string; replyToId?: string },
      ack?: (saved: any) => void
    ) => {
      try {
        const { room, message, replyToId } = payload;
        if (!room || !message?.trim()) return;

        const member = await prisma.roomMember.findUnique({
          where: { roomId_userId: { roomId: room, userId: me } },
          select: { roomId: true },
        });
        if (!member) return;

        const saved = await prisma.message.create({
          data: {
            roomId: room,
            senderId: me,
            content: message.trim(),
            replyToId: replyToId ?? null,
          },
        });

        await prisma.room.update({
          where: { id: room },
          data: { lastMessageAt: saved.createdAt },
        });

        const payloadOut = {
          id: saved.id,
          roomId: room,
          senderId: me,
          content: saved.content,
          createdAt: saved.createdAt,
        };

        io.to(room).emit("message:new", payloadOut);
        ack?.(payloadOut);
      } catch (e) {
        console.error("[socket.send_message]", e);
        ack?.({ error: "Failed to send" });
      }
    }
  );

  socket.on("disconnect", (reason) => {
    console.log("[io] disconnect", socket.id, reason);
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
