import { IOrder, TOrderStatus } from "@/utils/interfaces/order/order.interface";
import { ICustomer } from "@/utils/interfaces/customer/customer.interface";
import { IProduct } from "@/utils/interfaces/product/product.interface";

export interface IOrderDetailDialogProps {
  order: IOrder | null;
  customer: ICustomer | undefined;
  products: IProduct[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (status: TOrderStatus) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  error: string | null;
  onDismissError: () => void;
}
