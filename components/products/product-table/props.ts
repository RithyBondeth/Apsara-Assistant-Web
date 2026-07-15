import { IProduct } from "@/utils/interfaces/product/product.interface";

export interface IProductTableProps {
  products: IProduct[];
  onDelete: (id: string) => void;
  deleting?: boolean;
}
