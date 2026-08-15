export interface IAttachment {
  id: string;
  file_url: string | null;
  file_type: string | null;
  file_name: string | null;
  file_size: number | null;
  review_status: "pending" | "accepted" | "rejected" | null;
  reviewed_at: string | null;
  reviewed_by_user_id: string | null;
}

export interface IMessage {
  id: string;
  conversation_id: string;
  sender_type: "customer" | "assistant" | "seller";
  message_type: string;
  content: string | null;
  created_at: string;
  attachments: IAttachment[];
}

export interface IConversation {
  id: string;
  user_id: string;
  customer_id: string;
  platform_connection_id: string | null;
  platform: string;
  source: "channel" | "rehearsal";
  status: "open" | "closed" | "pending";
  handling_mode: "auto" | "manual";
  assigned_user_id: string | null;
  unread_count: number;
  last_read_at: string | null;
  first_customer_message_at: string | null;
  first_response_at: string | null;
  last_customer_message_at: string | null;
  last_seller_message_at: string | null;
  last_message_preview: string | null;
  last_message_sender: "customer" | "assistant" | "seller" | null;
  tags: IConversationTag[];
  created_at: string;
  updated_at: string;
}

export interface IConversationDetail extends IConversation {
  messages: IMessage[];
  notes: IConversationNote[];
}

export interface IConversationNote {
  id: string;
  conversation_id: string;
  author_user_id: string | null;
  content: string;
  created_at: string;
}

export interface IConversationTag {
  id: string;
  name: string;
  created_at: string;
}

export interface IInboxMetrics {
  total: number;
  open: number;
  pending: number;
  closed: number;
  unread: number;
  manual: number;
  unassigned: number;
  average_first_response_seconds: number | null;
}

export interface IInboxFilters {
  search?: string;
  platform?: "messenger" | "telegram";
  status?: "open" | "pending" | "closed";
  unread_only?: boolean;
  handling_mode?: "auto" | "manual";
  assignment?: "me" | "unassigned";
  tag?: string;
}

export interface IChatResponse {
  customer_message: IMessage;
  ai_message: IMessage;
  // Only when the assistant chose to send the shop's payment QR. It is a
  // separate message on Messenger and Telegram, so it is one here too.
  // Optional, not just nullable: an API that predates the feature omits the
  // field entirely, and this ships ahead of the backend that returns it.
  qr_message?: IMessage | null;
}
