export interface IInventoryMovement {
  id: string;
  product_id: string | null;
  product_name: string;
  order_id: string | null;
  created_by_user_id: string | null;
  kind: string;
  quantity_delta: number;
  balance_after: number;
  reserved_after: number;
  reason: string | null;
  created_at: string;
}

export interface IInventoryAdjustment {
  quantity_delta: number;
  reason: string;
}

export interface IExpiredReservationsResult {
  released_orders: number;
  released_units: number;
}
