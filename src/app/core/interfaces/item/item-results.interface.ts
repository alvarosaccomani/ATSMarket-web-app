import { ItemInterface } from "./item.interface";

export interface ItemResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: ItemInterface[]
}