import { ProductVariationInterface } from '@interfaces/product-variation';

export interface CartItemInterface extends ProductVariationInterface {
    quantity: number;
    subtotal: number;
}