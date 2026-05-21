import { OrderDetailInterface } from "@interfaces/order-detail";

export interface OrderInterface {
    cmp_uuid: string;
    ord_uuid: string;
    usr_uuid: string;
    cus_uuid: string;
    adr_uuid: string;
    ord_ordernumber: number;
    ord_status: string;
    ord_date: Date;
    ord_subtotal: number;
    ord_shippingcost: number;
    ord_tax: number;
    ord_total: number;
    ord_customernotes: string;
    ord_trackingnumber: string;
    ord_createdat: Date;
    ord_updatedat: Date;
    orderDetails?: OrderDetailInterface[];
}