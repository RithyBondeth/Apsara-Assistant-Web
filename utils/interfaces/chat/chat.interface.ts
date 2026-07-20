import { PlatformId } from "@/utils/interfaces/integration/integration.interface";

export interface IAttachment {
  id: string;
  file_url: string;
  file_type: string | null;
  file_name: string | null;
  file_size: number | null;
}

/** "seller" is a manual reply the seller typed themselves, not an AI reply. */
export type SenderType = "customer" | "assistant" | "seller";

export interface IMessage {
  id: string;
  conversation_id: string;
  sender_type: SenderType;
  message_type: string;
  content: string | null;
  created_at: string;
  attachments: IAttachment[];
}

export interface IConversation {
  id: string;
  user_id: string;
  customer_id: string;
  platform: PlatformId;
  status: "open" | "closed" | "pending";
  /** False while a human has taken over: inbound still arrives, AI stays quiet. */
  ai_enabled: boolean;
  /** The AI escalated or failed — the seller has to deal with this one. */
  needs_attention: boolean;
  /** The customer has said something since the seller last opened it. */
  unread: boolean;
  created_at: string;
  updated_at: string;
}

export interface IConversationDetail extends IConversation {
  /** Only the newest window of the thread — see `message_total`. */
  messages: IMessage[];
  /** Total messages in the thread, so the UI knows older ones exist. */
  message_total: number;
}

export interface IConversationFilters {
  /** Only threads the AI escalated, or where the customer is waiting. */
  needs_me?: boolean;
  status?: "open" | "closed" | "pending";
  platform?: PlatformId;
  /** Matches the customer's name or their platform id. */
  search?: string;
}
