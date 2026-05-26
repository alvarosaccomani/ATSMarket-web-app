import { WarehouseLocationInterface } from "./warehouse-location.interface";

export interface WarehouseLocationResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: WarehouseLocationInterface[]
}