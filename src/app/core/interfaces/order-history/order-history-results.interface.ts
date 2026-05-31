import { OrderHistoryInterface } from "./order-history.interface";

export interface OrderHistoryResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: OrderHistoryInterface[]
}