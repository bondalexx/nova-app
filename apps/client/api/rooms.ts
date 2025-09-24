import { api } from "@/api/client/axios";
import type { Room } from "@/types/room";

export const getRooms = (scope: "recent" | "all" = "recent") =>
  api.get("/rooms", { params: { scope } }).then((r) => r.data as Room[]);

export const ensureDirect = async (peerId: string): Promise<Room> => {
  const res = await api.post("/rooms/direct", { peerId });
  const data = res.data;
  // normalize possible shapes
  const room =
    data && typeof data === "object" && "room" in data
      ? (data.room as Room)
      : (data as Room);
  if (!room || typeof room !== "object" || !("id" in room)) {
    // Give a meaningful error if backend shape is unexpected
    throw new Error("Invalid /rooms/direct response shape");
  }
  return room;
};
export const createGroup = (name: string, memberIds: string[]) =>
  api.post("/rooms", { name, memberIds }).then((r) => r.data as Room);
