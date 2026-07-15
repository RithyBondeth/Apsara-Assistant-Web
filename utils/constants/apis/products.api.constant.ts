import { API_V1 } from "./base.api.constant";

export const PRODUCTS_API = {
  LIST: `${API_V1}/products`,
  CREATE: `${API_V1}/products`,
  GET: (id: string) => `${API_V1}/products/${id}`,
  UPDATE: (id: string) => `${API_V1}/products/${id}`,
  DELETE: (id: string) => `${API_V1}/products/${id}`,
};
