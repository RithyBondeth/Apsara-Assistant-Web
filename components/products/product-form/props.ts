import { IProduct } from "@/utils/interfaces/product/product.interface";

export interface IProductFormProps {
  defaultValues?: Partial<IProduct>;
  onSubmit: (data: ProductFormValues, images: File[]) => void | Promise<void>;
  loading?: boolean;
  submitLabel?: string;
  allowStockEditing?: boolean;
  allowImageSelection?: boolean;
}

export interface ProductFormValues {
  name: string;
  description?: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
}
