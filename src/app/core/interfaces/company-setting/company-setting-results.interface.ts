import { CompanySettingInterface } from "./company-setting.interface";

export interface CompanySettingResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: CompanySettingInterface[]
}