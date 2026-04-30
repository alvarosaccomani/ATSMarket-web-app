import { MaterialInterface } from "./material.interface";

export interface MaterialResults {
  material: number;
  materialOf: number;
  numElements: number;
  totalPages: number;
  data: MaterialInterface[]
}