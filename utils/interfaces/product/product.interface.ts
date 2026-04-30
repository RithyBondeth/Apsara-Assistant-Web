export interface IProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IProductCreate {
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
}

export interface IProductUpdate extends Partial<IProductCreate> {}
