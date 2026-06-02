import { MessageInterface } from "./message.interface";

export interface MessageResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: MessageInterface[]
}