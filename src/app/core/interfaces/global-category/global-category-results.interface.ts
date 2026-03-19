import { GlobalCategoryInterface } from "./global-category.interface";

export interface GlobalCategoryResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: GlobalCategoryInterface[]
}