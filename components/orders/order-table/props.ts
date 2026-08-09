import { IOrder } from "@/utils/interfaces/order/order.interface";
import { ICustomer } from "@/utils/interfaces/customer/customer.interface";

export interface IOrderTableProps {
  orders: IOrder[];
  customers: ICustomer[];
  onSelect: (order: IOrder) => void;
}
