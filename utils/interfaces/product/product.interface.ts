export interface IProductImage {
  id: string;
  url: string;
  file_name: string;
  file_size: number;
  position: number;
  is_primary: boolean;
  variant_id: string | null;
  created_at: string;
}

export interface IProductVariant {
  id: string;
  product_id: string;
  option_values: Record<string, string>;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: string;
  stock: number;
  reserved_stock: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface IProductVariantCreate {
  option_values: Record<string, string>;
  sku?: string;
  barcode?: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
  is_active?: boolean;
}

export interface IProductVariantUpdate {
  option_values?: Record<string, string>;
  sku?: string | null;
  barcode?: string | null;
  price?: number;
  low_stock_threshold?: number;
  is_active?: boolean;
}

export interface IProduct {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  price: string; // Decimal comes as string from FastAPI
  stock: number;
  reserved_stock: number;
  low_stock_threshold: number;
  image_url: string | null;
  images: IProductImage[];
  variants: IProductVariant[];
  is_active: boolean;
  created_at: string;
}

export interface IProductCreate {
  name: string;
  description?: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
  variants?: IProductVariantCreate[];
}

export interface IProductUpdate extends Partial<IProductCreate> {
  is_active?: boolean;
}
