const ROOT = "/api/v1/operations";
export const OPERATIONS_API = {
  ALERTS: `${ROOT}/alerts`, SUPPLIERS: `${ROOT}/suppliers`, PURCHASE_ORDERS: `${ROOT}/purchase-orders`,
  PURCHASE_ORDER: (id: string) => `${ROOT}/purchase-orders/${id}`,
  RECEIVE_PURCHASE: (id: string) => `${ROOT}/purchase-orders/${id}/receive`,
  RETURNS: `${ROOT}/returns`, RECEIVE_RETURN: (id: string) => `${ROOT}/returns/${id}/receive`,
  REFUND_RETURN: (id: string) => `${ROOT}/returns/${id}/refund`, REPORTS: `${ROOT}/reports`,
};
