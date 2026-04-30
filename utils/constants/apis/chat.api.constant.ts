import { API_V1 } from "./base.api.constant";

export const CHAT_API = {
  CONVERSATIONS: `${API_V1}/conversations`,
  MESSAGES: (conversationId: number) =>
    `${API_V1}/conversations/${conversationId}/messages`,
  SEND: (conversationId: number) =>
    `${API_V1}/conversations/${conversationId}/messages`,
};
