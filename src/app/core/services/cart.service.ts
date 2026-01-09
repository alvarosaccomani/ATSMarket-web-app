import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItemInterface } from '@interfaces/cart-item.interface';
import { ProductVariationInterface } from '@interfaces/product-variation';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // BehaviorSubject guarda el estado actual del carrito de forma reactiva
  private cartItemsSubject: BehaviorSubject<CartItemInterface[]> = new BehaviorSubject<CartItemInterface[]>([]);

  // Observable al que se suscribirán los componentes (Navbar, Carrito)
  public cartItems$: Observable<CartItemInterface[]> = this.cartItemsSubject.asObservable();

  constructor() {
    // Carga inicial (opcional: puedes cargar desde localStorage o una API aquí)
  }

  // --- Lógica de Estado ---

  private calculateSubtotal(item: CartItemInterface): number {
    return item.prov_suggestedminimumsellingprice * item.quantity;
  }

  public getTotalPrice(): number {
    return this.cartItemsSubject.value.reduce((total, item) => total + item.subtotal, 0);
  }

  // --- Acciones de Compra ---

  public addToCart(product: ProductVariationInterface, quantity: number = 1): void {
    const currentItems = this.cartItemsSubject.value;
    const existingItem = currentItems.find(item => item.prov_uuid === product.prov_uuid);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.subtotal = this.calculateSubtotal(existingItem);
    } else {
      const newItem: CartItemInterface = {
        ...product,
        quantity: quantity,
        subtotal: this.calculateSubtotal({ ...product, quantity } as CartItemInterface)
      };
      currentItems.push(newItem);
    }

    this.cartItemsSubject.next([...currentItems]); // Emite el nuevo estado
  }

  public updateQuantity(productId: string, quantity: number): void {
    const currentItems = this.cartItemsSubject.value;
    const itemToUpdate = currentItems.find(item => item.prov_uuid === productId);

    if (itemToUpdate) {
      itemToUpdate.quantity = quantity < 1 ? 1 : quantity;
      itemToUpdate.subtotal = this.calculateSubtotal(itemToUpdate);
      this.cartItemsSubject.next([...currentItems]);
    }
  }

  public removeFromCart(productId: string): void {
    const filteredItems = this.cartItemsSubject.value.filter(item => item.prov_uuid !== productId);
    this.cartItemsSubject.next(filteredItems);
  }

  public clearCart(): void {
    this.cartItemsSubject.next([]);
  }
}