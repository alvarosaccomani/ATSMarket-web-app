import { GlobalMaterialInterface } from "./global-material.interface";

export interface GlobalMaterialResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: GlobalMaterialInterface[]
}