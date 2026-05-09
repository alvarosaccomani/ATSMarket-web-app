import { ProductVariationInterface } from "@interfaces/product-variation";

export interface ProductInterface {
    cmp_uuid: string;
    pro_uuid: string;
    pro_code: string;
    pro_name: string;
    pro_image: string;
    pro_description: string;
    itm_uuid: string;
    cat_uuid: string;
    pro_createdat: Date;
    pro_updatedat: Date;
    productVariations?: ProductVariationInterface[]
}