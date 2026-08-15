import { API_V1 } from "./base.api.constant";

export const PAYMENT_QRS_API = {
  LIST: `${API_V1}/payment-qrs`,
  CREATE: `${API_V1}/payment-qrs`,
  UPDATE: (id: string) => `${API_V1}/payment-qrs/${id}`,
  DELETE: (id: string) => `${API_V1}/payment-qrs/${id}`,
};
