import { StockMovementInterface } from "./stock-movement.interface";

export interface StockMovementResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: StockMovementInterface[]
}