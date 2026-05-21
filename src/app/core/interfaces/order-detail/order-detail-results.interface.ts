import { OrderDetailInterface } from "./order-detail.interface";

export interface OrderDetailResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: OrderDetailInterface[]
}