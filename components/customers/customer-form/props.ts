import { ICustomer } from "@/utils/interfaces/customer/customer.interface";

export interface ICustomerFormProps {
  defaultValues?: Partial<ICustomer>;
  onSubmit: (data: CustomerFormValues) => void | Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

export interface CustomerFormValues {
  name: string;
  phone?: string;
  email?: string;
  platform?: string;
  platform_id?: string;
}
