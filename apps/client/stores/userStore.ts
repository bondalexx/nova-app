import { create } from "zustand";

import User from "@/types/user";

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user: User | null) => set({ user: user ?? null }),
}));

export default useUserStore;
