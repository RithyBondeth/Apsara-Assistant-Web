export interface IDashboardStats {
  products: number; // active products in the catalogue
  customers: number;
  conversations: number;
  open_conversations: number;
  orders: number;
  pending_orders: number;
  revenue: string; // Decimal comes as string from FastAPI
}
