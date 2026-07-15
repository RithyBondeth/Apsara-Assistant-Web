import { IOrder, OrderStatus } from "@/utils/interfaces/order/order.interface";
import { ICustomer } from "@/utils/interfaces/customer/customer.interface";

export interface IOrderTableProps {
  orders: IOrder[];
  customers: ICustomer[];
  onStatusChange: (id: string, status: OrderStatus) => void;
  onDelete: (id: string) => void;
  busy?: boolean;
}
