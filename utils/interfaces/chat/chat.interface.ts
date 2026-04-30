export interface IConversation {
  id: number;
  customer_name: string;
  customer_phone?: string;
  platform: "facebook" | "telegram" | "tiktok" | "website";
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  status: "active" | "resolved" | "pending";
}

export interface IMessage {
  id: number;
  conversation_id: number;
  content: string;
  sender: "customer" | "ai" | "seller";
  created_at: string;
  is_read: boolean;
}
