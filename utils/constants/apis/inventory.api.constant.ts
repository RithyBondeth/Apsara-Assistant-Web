import { API_V1 } from "./base.api.constant";

export const INVENTORY_API = {
  MOVEMENTS: `${API_V1}/inventory/movements`,
  ADJUST: (productId: string) =>
    `${API_V1}/inventory/products/${productId}/adjustments`,
  RELEASE_EXPIRED: `${API_V1}/inventory/release-expired`,
};
