import type { Message } from "@/types/message";
import type { MessageDTO } from "@/types/message.dto";

export const toClientMessage = (m: MessageDTO): Message => ({
  ...m,
  createdAt: new Date(m.createdAt),
  editedAt: m.editedAt ? new Date(m.editedAt) : null,
  deletedAt: m.deletedAt ? new Date(m.deletedAt) : null,
});
