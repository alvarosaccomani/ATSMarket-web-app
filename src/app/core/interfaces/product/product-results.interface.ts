import { ProductInterface } from "./product.interface";

export interface ProductResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: ProductInterface[]
}