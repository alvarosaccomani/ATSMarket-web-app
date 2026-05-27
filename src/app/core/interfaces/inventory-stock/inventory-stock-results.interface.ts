import { InventoryStockInterface } from "./inventory-stock.interface";

export interface InventoryStockResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: InventoryStockInterface[]
}