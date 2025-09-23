import { create } from "zustand";
import type { Message } from "@/types/room";
import { getMessages, sendMessage, markRead } from "@/api/messages";
import { toAPIError } from "@/api/client/axios";
import { useRooms } from "./rooms";

type Thread = {
  items: Message[];
  nextCursor: string | null;
  status: "idle" | "loading" | "error" | "success";
};

type MsgState = {
  byRoom: Record<string, Thread>;
  loadFirst: (roomId: string) => Promise<void>;
  loadMore: (roomId: string) => Promise<void>;
  pushLocal: (roomId: string, msg: Message) => void;
  receiveRemote: (msg: Message) => void;
  send: (
    roomId: string,
    content: string,
    replyToId?: string
  ) => Promise<Message>;
  readUpTo: (roomId: string, upToMessageId?: string) => Promise<void>;
};

export const useMessages = create<MsgState>((set, get) => ({
  byRoom: {},

  loadFirst: async (roomId) => {
    set((state) => ({
      byRoom: {
        ...state.byRoom,
        [roomId]: { items: [], nextCursor: null, status: "loading" },
      },
    }));
    try {
      const page = await getMessages(roomId);
      // API returns newest->oldest; UI wants oldest->newest
      set((state) => ({
        byRoom: {
          ...state.byRoom,
          [roomId]: {
            items: page.items.reverse(),
            nextCursor: page.nextCursor,
            status: "success",
          },
        },
      }));
    } catch (e) {
      const err = toAPIError(e);
      set((state) => ({
        byRoom: {
          ...state.byRoom,
          [roomId]: { items: [], nextCursor: null, status: "error" },
        },
      }));
      throw err;
    }
  },

  loadMore: async (roomId) => {
    const cur = get().byRoom[roomId];
    if (!cur?.nextCursor) return;
    const page = await getMessages(roomId, cur.nextCursor);
    set((state) => ({
      byRoom: {
        ...state.byRoom,
        [roomId]: {
          items: [
            ...page.items.reverse(),
            ...(state.byRoom[roomId]?.items ?? []),
          ],
          nextCursor: page.nextCursor,
          status: "success",
        },
      },
    }));
  },

  pushLocal: (roomId, msg) => {
    set((state) => {
      const t = state.byRoom[roomId] ?? {
        items: [],
        nextCursor: null,
        status: "idle",
      };
      return {
        byRoom: {
          ...state.byRoom,
          [roomId]: { ...t, items: [...t.items, msg] },
        },
      };
    });
    useRooms.getState().bumpActivity(roomId, msg.createdAt);
  },

  receiveRemote: (msg) => {
    const { roomId } = msg;
    get().pushLocal(roomId, msg);
    // increase unread for rooms not currently open, if you track that on the client
  },

  send: async (roomId, content, replyToId) => {
    const msg = await sendMessage(roomId, content, replyToId);
    get().pushLocal(roomId, msg);
    return msg;
  },

  readUpTo: async (roomId, upToMessageId) => {
    await markRead(roomId, upToMessageId);
    // reset unread locally
    useRooms.getState().setUnread(roomId, 0);
  },
}));
