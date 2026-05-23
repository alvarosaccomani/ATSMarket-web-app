export interface StockMovementInterface {
    cmp_uuid: string;
    pro_uuid: string;    
    prov_uuid: string;
    smo_uuid: string;
    ord_uuid: string | null;
    usr_uuid: string | null;
    tsmo_uuid: string;
    smo_quantity: number;
    smo_previousstock: number;
	smo_currentstock: number;
  	smo_reason: string;
    smo_createdat: Date;
    smo_updatedat?: Date;
}