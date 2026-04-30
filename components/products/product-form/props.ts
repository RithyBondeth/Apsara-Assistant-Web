import { IProduct } from "@/utils/interfaces/product/product.interface";

export interface IProductFormProps {
  defaultValues?: Partial<IProduct>;
  onSubmit: (data: ProductFormValues) => void | Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

export interface ProductFormValues {
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
}
