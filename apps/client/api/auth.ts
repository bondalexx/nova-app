import User from "@/types/user";
import { api } from "./client/axios";

export const signIn = (payload: { email: string; password: string }) =>
  api.post("/auth/signin", payload).then((r) => r.data);

export const signOut = () => api.post("/auth/logout").then((r) => r.data);

export const me = () => api.get("/auth/me").then((r) => r.data as User);
