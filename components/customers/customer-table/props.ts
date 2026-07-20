import { ICustomer } from "@/utils/interfaces/customer/customer.interface";

export interface ICustomerTableProps {
  customers: ICustomer[];
  onDelete: (id: string) => void;
  /** A search or filter is active, so "empty" means "no matches". */
  filtered?: boolean;
  deleting?: boolean;
}
