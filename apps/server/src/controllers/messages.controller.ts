import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

async function ensureMember(roomId: string, userId: string) {
  return prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });
}

/* ---------- GET /rooms/:roomId/messages ---------- */
export async function getRoomMessages(req: Request, res: Response) {
  try {
    const me = req.user!.id;
    const { roomId } = req.params;

    const member = await ensureMember(roomId, me);
    if (!member) return res.status(403).json({ error: "Forbidden" });

    const limit = Math.min(Number(req.query.limit ?? 50), 100);
    const cursor = req.query.cursor as string | undefined;

    const base = {
      where: { roomId },
      orderBy: { createdAt: "asc" as const },
      take: limit,
      include: {
        user: {
          select: { id: true, displayName: true, email: true, avatarUrl: true },
        },
      },
    };

    const messages = cursor
      ? await prisma.message.findMany({
          ...base,
          cursor: { id: cursor },
          skip: 1,
        })
      : await prisma.message.findMany(base);

    const items = messages.map((m) => ({
      id: m.id,
      room: m.roomId,
      message: m.content,
      user: {
        id: m.user.id,
        displayName: m.user.displayName,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl ?? undefined,
      },
      createdAt: m.createdAt.toISOString(),
    }));

    const nextCursor = items.length ? items[items.length - 1].id : null;
    return res.json({ items, nextCursor });
  } catch (e) {
    console.error("[getRoomMessages]", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
