import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItemInterface } from '@interfaces/cart-item.interface';
import { ProductVariationInterface } from '@interfaces/product-variation';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject: BehaviorSubject<CartItemInterface[]> = new BehaviorSubject<CartItemInterface[]>([]);
  public cartItems$: Observable<CartItemInterface[]> = this.cartItemsSubject.asObservable();
  private readonly STORAGE_KEY = 'ats_market_cart';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const savedCart = localStorage.getItem(this.STORAGE_KEY);
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          this.cartItemsSubject.next(parsed);
        } catch (e) {
          console.error('Error cargando el carrito desde LocalStorage', e);
        }
      }
    }
  }

  private syncToLocalStorage(items: CartItemInterface[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    }
  }

  private calculateSubtotal(item: CartItemInterface): number {
    return item.prov_suggestedminimumsellingprice * item.quantity;
  }

  public getTotalPrice(): number {
    return this.cartItemsSubject.value.reduce((total, item) => total + item.subtotal, 0);
  }

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

    this.cartItemsSubject.next([...currentItems]);
    this.syncToLocalStorage(currentItems);
  }

  public updateQuantity(productId: string, quantity: number): void {
    const currentItems = this.cartItemsSubject.value;
    const itemToUpdate = currentItems.find(item => item.prov_uuid === productId);

    if (itemToUpdate) {
      itemToUpdate.quantity = quantity < 1 ? 1 : quantity;
      itemToUpdate.subtotal = this.calculateSubtotal(itemToUpdate);
      this.cartItemsSubject.next([...currentItems]);
      this.syncToLocalStorage(currentItems);
    }
  }

  public removeFromCart(productId: string): void {
    const filteredItems = this.cartItemsSubject.value.filter(item => item.prov_uuid !== productId);
    this.cartItemsSubject.next(filteredItems);
    this.syncToLocalStorage(filteredItems);
  }

  public clearCart(): void {
    this.cartItemsSubject.next([]);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}
