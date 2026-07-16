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
  created_at: string;
  updated_at: string;
}

export interface IConversationDetail extends IConversation {
  messages: IMessage[];
}

export interface IChatResponse {
  customer_message: IMessage;
  ai_message: IMessage;
}
