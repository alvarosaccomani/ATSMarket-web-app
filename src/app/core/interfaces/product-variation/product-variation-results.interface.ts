import { ProductVariationInterface } from "./product-variation.interface";

export interface ProductVariationResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: ProductVariationInterface[]
}