export type RoomType = "DIRECT" | "GROUP";

export type Room = {
  id: string;
  type: RoomType;
  name?: string | null;
  avatarUrl?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
};

export type Message = {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
  editedAt?: string | null;
  deletedAt?: string | null;
  type?: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
};

export type Page<T> = { items: T[]; nextCursor: string | null };
