import { IProduct } from "@/utils/interfaces/product/product.interface";

export interface IProductTableProps {
  products: IProduct[];
  onDelete: (id: string) => void;
  /** Receives the CURRENT state; the handler flips it. */
  onToggleActive: (id: string, isActive: boolean) => void;
  /** A search or filter is active, so "empty" means "no matches". */
  filtered?: boolean;
  deleting?: boolean;
}
