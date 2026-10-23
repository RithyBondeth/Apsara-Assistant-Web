import { API_V1 } from "./base.api.constant";

export const STAFF_API = {
  LIST: `${API_V1}/staff/`,
  CREATE: `${API_V1}/staff/`,
  UPDATE: (id: string) => `${API_V1}/staff/${id}`,
  DELETE: (id: string) => `${API_V1}/staff/${id}`,
  INVITE: (id: string) => `${API_V1}/staff/${id}/invite`,
};
