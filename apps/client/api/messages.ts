import { api } from "@/api/client/axios";
import type { Message, Page } from "@/types/room";

export const getMessages = (
  roomId: string,
  cursor?: string,
  limit = 30,
  signal?: AbortSignal
) =>
  api
    .get(`/messages/${roomId}`, { params: { cursor, limit }, signal })
    .then((r) => r.data as Page<Message>);

export const sendMessage = (
  roomId: string,
  content: string,
  replyToId?: string
) =>
  api
    .post(`/messages/${roomId}`, { content, replyToId })
    .then((r) => r.data as Message);

export const markRead = (roomId: string, upToMessageId?: string) =>
  api
    .post(`/messages/${roomId}/read`, { upToMessageId })
    .then((r) => r.data as { ok: true; lastReadAt: string });
