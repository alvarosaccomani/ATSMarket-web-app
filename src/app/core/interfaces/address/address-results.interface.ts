import { AddressInterface } from "./address.interface";

export interface AddressResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: AddressInterface[]
}