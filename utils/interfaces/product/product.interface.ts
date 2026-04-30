export interface IProduct {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  price: string; // Decimal comes as string from FastAPI
  stock: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface IProductCreate {
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
}

export interface IProductUpdate extends Partial<IProductCreate> {
  is_active?: boolean;
}
