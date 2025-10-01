export type RoomType = "DIRECT" | "GROUP";

export type RoomMemberUser = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type RoomMember = {
  userId: string;
  lastReadAt: string | null; // ISO in DTO; convert to Date in app type if you prefer
  user: RoomMemberUser;
};
export type MessagePreviewSender = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
};
export type MessagePreview = {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string; // ISO (DTO); map to Date for app runtime if needed
  editedAt: string | null;
  deletedAt: string | null;
  sender: MessagePreviewSender;
};

export type Room = {
  id: string;
  type: RoomType;
  name: string | null; // for GROUPs
  avatarUrl: string | null; // for GROUPs
  directKey: string | null; // for DMs
  createdById: string;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;

  members: RoomMember[];
  messages: MessagePreview[]; // server gives last one (take:1)
  _count: { messages: number };

  // added by controller for convenience
  unreadCount: number;
  otherUser: RoomMemberUser | null;
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
