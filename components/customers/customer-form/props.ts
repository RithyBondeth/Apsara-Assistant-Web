import { ICustomer } from "@/utils/interfaces/customer/customer.interface";
import { PlatformId } from "@/utils/interfaces/integration/integration.interface";

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
  /** "" is the "— None —" option: not tied to a channel. */
  platform?: PlatformId | "";
  platform_id?: string;
}
