import { API_V1 } from "./base.api.constant";

export const CONVERSATIONS_API = {
  LIST: `${API_V1}/conversations`,
  CREATE: `${API_V1}/conversations`,
  GET: (id: string) => `${API_V1}/conversations/${id}`,
  UPDATE: (id: string) => `${API_V1}/conversations/${id}`,
  METRICS: `${API_V1}/conversations/metrics`,
  MARK_READ: (id: string) => `${API_V1}/conversations/${id}/read`,
  NOTES: (id: string) => `${API_V1}/conversations/${id}/notes`,
  DELETE_NOTE: (id: string, noteId: string) =>
    `${API_V1}/conversations/${id}/notes/${noteId}`,
  TAGS: (id: string) => `${API_V1}/conversations/${id}/tags`,
  DELETE_TAG: (id: string, tagId: string) =>
    `${API_V1}/conversations/${id}/tags/${tagId}`,
  MESSAGES: (id: string) => `${API_V1}/conversations/${id}/messages`,
  SEND_MESSAGE: (id: string) => `${API_V1}/conversations/${id}/messages`,
};

export const CHAT_API = {
  SEND: (conversationId: string) => `${API_V1}/chat/${conversationId}`,
  ORDER_DRAFT: (conversationId: string) =>
    `${API_V1}/chat/${conversationId}/order-draft`,
};
