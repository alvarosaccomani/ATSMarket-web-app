import { CustomerInterface } from "./customer.interface";

export interface CustomerResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: CustomerInterface[]
}