import { ICustomer } from "@/utils/interfaces/customer/customer.interface";

export interface ICustomerTableProps {
  customers: ICustomer[];
  onDelete: (id: string) => void;
  deleting?: boolean;
}
