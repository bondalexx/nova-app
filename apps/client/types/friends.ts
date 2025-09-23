export type Friend = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  username: string;
};

export type FriendsListPayload = {
  accepted: Friend[];
  pendingIncoming: Friend[];
  pendingOutgoing: Friend[];
};

export type Filter = "online" | "all" | "sent" | "received" | "none";
