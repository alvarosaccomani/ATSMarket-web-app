import { SupplierInterface } from "./supplier.interface";

export interface SupplierResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: SupplierInterface[]
}