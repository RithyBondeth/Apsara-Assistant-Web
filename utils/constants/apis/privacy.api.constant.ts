import { API_V1 } from "./base.api.constant";

export const PRIVACY_API = {
  DELETION_STATUS: (code: string) =>
    `${API_V1}/privacy/deletion-requests/${encodeURIComponent(code)}`,
};
