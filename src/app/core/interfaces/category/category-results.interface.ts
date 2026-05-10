import { CategoryInterface } from "./category.interface";

export interface CategoryResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: CategoryInterface[]
}