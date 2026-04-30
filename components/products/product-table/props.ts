import { IProduct } from "@/utils/interfaces/product/product.interface";

export interface IProductTableProps {
  products: IProduct[];
  onDelete: (id: number) => void;
  deleting?: boolean;
}
