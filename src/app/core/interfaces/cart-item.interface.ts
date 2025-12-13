import { ProductInterface } from './product.interface';

export interface CartItemInterface extends ProductInterface {
    quantity: number;
    subtotal: number;
}