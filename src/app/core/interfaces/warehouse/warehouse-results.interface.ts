import { WarehouseInterface } from "./warehouse.interface";

export interface WarehouseResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: WarehouseInterface[]
}