export type MessageDTO = {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string; // ISO strings from server
  editedAt: string | null;
  deletedAt: string | null;
  sender: { id: string; displayName: string; avatarUrl: string | null };
};
