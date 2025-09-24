import { create } from "zustand";
import type { Room } from "@/types/room";
import { getRooms, ensureDirect } from "@/api/rooms";
import { toAPIError } from "@/api/client/axios";
import { redirect } from "next/navigation";

type Scope = "recent" | "all";

type RoomsState = {
  rooms: Room[];
  scope: Scope;
  selectedRoomId: string | null;
  status: "idle" | "loading" | "error" | "success";
  error: string | null;

  setScope: (s: Scope) => void;
  select: (id: string | null) => void;
  load: () => Promise<void>;
  openDM: (peerId: string) => Promise<Room>;
  upsert: (room: Room) => void;
  bumpActivity: (roomId: string, ts: string) => void;
  setUnread: (roomId: string, unread: number) => void;
};

export const useRooms = create<RoomsState>((set, get) => ({
  rooms: [],
  scope: "recent",
  selectedRoomId: null,
  status: "idle",
  error: null,

  setScope: (s) => set({ scope: s }),
  select: (id) => set({ selectedRoomId: id }),

  load: async () => {
    set({ status: "loading", error: null });
    try {
      const rooms = await getRooms(get().scope);
      set({ rooms, status: "success" });
    } catch (e) {
      const err = toAPIError(e);
      set({ status: "error", error: err.message });
      throw err;
    }
  },

  openDM: async (peerId) => {
    // catch ONLY the network/HTTP part
    let room: Room;
    try {
      room = await ensureDirect(peerId);
    } catch (e) {
      throw toAPIError(e); // Axios/network -> APIError with message/status
    }

    // Validate minimum shape before using it
    if (!room?.id) {
      // This will surface a clear message in the console instead of "Unknown error"
      throw new Error("Room has no id");
    }

    // Keep state updates outside the catch to avoid masking bugs
    set((state) => {
      const exists = state.rooms.some((r) => r.id === room.id);
      return {
        rooms: exists ? state.rooms : [room, ...state.rooms],
        selectedRoomId: room.id,
      };
    });

    return room;
  },

  upsert: (room) =>
    set((state) => {
      const idx = state.rooms.findIndex((r) => r.id === room.id);
      if (idx === -1) return { rooms: [room, ...state.rooms] };
      const copy = state.rooms.slice();
      copy[idx] = { ...copy[idx], ...room };
      return { rooms: copy };
    }),

  bumpActivity: (roomId, ts) =>
    set((state) => {
      const idx = state.rooms.findIndex((r) => r.id === roomId);
      if (idx === -1) return state;
      const updated = { ...state.rooms[idx], lastMessageAt: ts };
      const rest = state.rooms.filter((_, i) => i !== idx);
      return { rooms: [updated, ...rest] };
    }),

  setUnread: (roomId, unread) =>
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === roomId ? { ...r, unreadCount: unread } : r
      ),
    })),
}));
