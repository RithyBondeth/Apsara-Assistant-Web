import { API_V1 } from "./base.api.constant";

export const CUSTOMERS_API = {
  LIST: `${API_V1}/customers`,
  CREATE: `${API_V1}/customers`,
  GET: (id: string) => `${API_V1}/customers/${id}`,
  UPDATE: (id: string) => `${API_V1}/customers/${id}`,
  DELETE: (id: string) => `${API_V1}/customers/${id}`,
};
