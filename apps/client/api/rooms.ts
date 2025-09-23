import { api } from "@/api/client/axios";
import type { Room } from "@/types/room";

export const getRooms = (scope: "recent" | "all" = "recent") =>
  api.get("/rooms", { params: { scope } }).then((r) => r.data as Room[]);

export const ensureDirect = (peerId: string) =>
  api.post("/rooms/direct", { peerId }).then((r) => r.data as Room);

export const createGroup = (name: string, memberIds: string[]) =>
  api.post("/rooms", { name, memberIds }).then((r) => r.data as Room);
