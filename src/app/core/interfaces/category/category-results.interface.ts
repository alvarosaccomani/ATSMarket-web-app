import { CategoryInterface } from "./category.interface";

export interface CategoryResults {
  category: number;
  categoryOf: number;
  numElements: number;
  totalPages: number;
  data: CategoryInterface[]
}