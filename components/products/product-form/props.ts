import { IProduct } from "@/utils/interfaces/product/product.interface";

export interface IProductFormProps {
  defaultValues?: Partial<IProduct>;
  onSubmit: (data: ProductFormValues, images: File[]) => void | Promise<void>;
  loading?: boolean;
  submitLabel?: string;
  allowStockEditing?: boolean;
  allowImageSelection?: boolean;
  allowVariantSelection?: boolean;
}

export interface ProductFormValues {
  name: string;
  description?: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
  variants?: Array<{
    option_values: Record<string, string>;
    sku?: string;
    barcode?: string;
    price: number;
    stock: number;
    low_stock_threshold: number;
  }>;
}
