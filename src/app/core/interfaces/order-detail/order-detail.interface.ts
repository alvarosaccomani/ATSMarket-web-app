export interface OrderDetailInterface {
    cmp_uuid: string;
    ord_uuid: string;
    ordd_uuid: string;
    pro_uuid: string;
    prov_uuid: string;
    ordd_productname: string;
    ordd_code: string;
    ordd_sku: string;
    ordd_quantity: number;
    ordd_unitprice: number;
    ordd_discount?: number;
    ordd_subtotal?: number;
    ordd_taxrate?: number;
    ordd_tax?: number;
    ordd_basecost?: number;
    ordd_createdat?: Date;
    ordd_updatedat?: Date;
}
    