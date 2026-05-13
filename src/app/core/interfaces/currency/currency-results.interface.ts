import { CurrencyInterface } from "./currency.interface";

export interface CurrencyResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: CurrencyInterface[]
}