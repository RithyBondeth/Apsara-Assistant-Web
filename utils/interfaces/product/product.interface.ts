export interface IProductImage {
  id: string;
  url: string;
  file_name: string;
  file_size: number;
  position: number;
  is_primary: boolean;
  created_at: string;
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
  is_active: boolean;
  created_at: string;
}

export interface IProductCreate {
  name: string;
  description?: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
}

export interface IProductUpdate extends Partial<IProductCreate> {
  is_active?: boolean;
}
