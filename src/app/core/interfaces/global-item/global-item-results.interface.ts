import { GlobalItemInterface } from "./global-item.interface";

export interface GlobalItemResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: GlobalItemInterface[]
}