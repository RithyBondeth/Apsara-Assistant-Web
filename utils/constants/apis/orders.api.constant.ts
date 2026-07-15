import { API_V1 } from "./base.api.constant";

export const ORDERS_API = {
  LIST: `${API_V1}/orders/`,
  CREATE: `${API_V1}/orders/`,
  GET: (id: string) => `${API_V1}/orders/${id}`,
  UPDATE: (id: string) => `${API_V1}/orders/${id}`,
  DELETE: (id: string) => `${API_V1}/orders/${id}`,
};
