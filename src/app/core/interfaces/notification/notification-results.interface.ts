import { NotificationInterface } from "./notification.interface";

export interface NotificationResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: NotificationInterface[]
}