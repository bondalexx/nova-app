import { api } from "./client/axios";

import type { FriendsListPayload } from "@/types/friends";

export const fetchFriends = () =>
  api.get("/friends").then((r) => r.data as FriendsListPayload);

export const sendFriendRequest = (username: string) =>
  api
    .post("/friends/request", { username })
    .then((r) => r.data as { ok: true });

export const acceptFriendRequest = (username: string) =>
  api.post("/friends/accept", { username }).then((r) => r.data as { ok: true });

export const declineFriend = (username: string) =>
  api
    .post<{ status: "DECLINED" | "CANCELED" }>("/friends/decline", { username })
    .then((r) => r.data);
