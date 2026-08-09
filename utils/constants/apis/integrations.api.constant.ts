import { API_V1 } from "./base.api.constant";

export const INTEGRATIONS_API = {
  LIST: `${API_V1}/integrations`,
  CREATE: `${API_V1}/integrations`,
  UPDATE: (id: string) => `${API_V1}/integrations/${id}`,
  DELETE: (id: string) => `${API_V1}/integrations/${id}`,
  CHECK: (id: string) => `${API_V1}/integrations/${id}/check`,
  REGISTER_WEBHOOK: (id: string) =>
    `${API_V1}/integrations/${id}/register-webhook`,
};
