export type Message = {
  room: string;
  message: string;
  from: string;
  createdAt: string;
  user: { id: string; email?: string; displayName?: string };
  id: string;
};
