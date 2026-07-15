import { API_V1 } from "./base.api.constant";

export const INTEGRATIONS_API = {
  LIST: `${API_V1}/integrations/`,
  CREATE: `${API_V1}/integrations/`,
  GET: (id: string) => `${API_V1}/integrations/${id}`,
  UPDATE: (id: string) => `${API_V1}/integrations/${id}`,
  DELETE: (id: string) => `${API_V1}/integrations/${id}`,
  REGISTER_WEBHOOK: (id: string) => `${API_V1}/integrations/${id}/register-webhook`,
};
