import { ProductVariationReviewInterface } from "./product-variation-review.interface";

export interface ProductVariationReviewResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: ProductVariationReviewInterface[]
}