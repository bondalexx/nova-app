import { create } from "zustand";
import type { FriendsListPayload } from "@/types/friends";
import { fetchFriends } from "@/api/friends"; // axios wrapper

type FriendsStore = {
  friends: FriendsListPayload;
  status: "idle" | "loading" | "error" | "success";
  error: string | null;

  getFriends: () => Promise<void>; // <-- define it here
  setFriends: (friends: FriendsListPayload) => void;
};

export const useFriends = create<FriendsStore>((set) => ({
  friends: { accepted: [], pendingIncoming: [], pendingOutgoing: [] },
  status: "idle",
  error: null,

  getFriends: async () => {
    set({ status: "loading", error: null });
    try {
      const data = await fetchFriends();
      set({ friends: data, status: "success" });
    } catch (err: any) {
      set({ status: "error", error: err.message ?? "Failed to load friends" });
    }
    return Promise.resolve();
  },

  setFriends: (friends) => set({ friends }),
}));
