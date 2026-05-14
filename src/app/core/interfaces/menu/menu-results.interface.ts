import { MenuInterface } from "./menu.interface";

export interface MenuResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: MenuInterface[]
}