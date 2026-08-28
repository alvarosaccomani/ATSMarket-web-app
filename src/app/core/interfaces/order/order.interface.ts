import { CustomerInterface } from "@interfaces/customer";
import { OrderDetailInterface } from "@interfaces/order-detail";

export interface OrderInterface {
    cmp_uuid: string;
    ord_uuid: string;
    usr_uuid: string;
    cus_uuid: string;
    cus?: CustomerInterface;
    adr_uuid: string;
    ord_customeremail: string;
    ord_customername: string;
    ord_contactphone: string;
    ord_ordernumber: number;
    ords_uuid: string;
    ord_date: Date;
    ord_subtotal: number;
    ord_shippingcost: number;
    ord_tax: number;
    ord_total: number;
    ord_customernotes: string;
    ord_trackingnumber: string;
    cou_uuid?: string | null;
    ord_couponcode?: string | null;
    ord_discountamount?: number;
    ord_createdat: Date;
    ord_updatedat: Date;
    orderDetails?: OrderDetailInterface[];
}