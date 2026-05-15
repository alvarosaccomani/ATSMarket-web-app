import { OrderInterface } from "./order.interface";

export interface OrderResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: OrderInterface[]
}