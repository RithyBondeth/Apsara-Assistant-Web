import { API_V1 } from "./base.api.constant";

export const CONVERSATIONS_API = {
  LIST: `${API_V1}/conversations`,
  CREATE: `${API_V1}/conversations`,
  GET: (id: string) => `${API_V1}/conversations/${id}`,
  UPDATE: (id: string) => `${API_V1}/conversations/${id}`,
  MESSAGES: (id: string) => `${API_V1}/conversations/${id}/messages`,
  SEND_MESSAGE: (id: string) => `${API_V1}/conversations/${id}/messages`,
  SEEN: (id: string) => `${API_V1}/conversations/${id}/seen`,
};
