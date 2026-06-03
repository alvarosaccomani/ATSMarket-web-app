import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CartItemInterface } from '@interfaces/cart-item.interface';
import { ProductVariationInterface } from '@interfaces/product-variation';
import { StoreContextService } from './store-context.service';
import { CompaniesSettingsService } from './companies-settings.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject: BehaviorSubject<CartItemInterface[]> = new BehaviorSubject<CartItemInterface[]>([]);
  public cartItems$: Observable<CartItemInterface[]> = this.cartItemsSubject.asObservable();
  private readonly STORAGE_KEY = 'ats_market_cart';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _storeContext: StoreContextService,
    private message: NzMessageService,
    private _settingsService: CompaniesSettingsService
  ) {
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
    const totalQuantity = currentItems.reduce((sum, item) => sum + item.quantity, 0);
    const maxItems = Number(this._storeContext.getSetting('MAX_CART_ITEMS', 100));

    if (totalQuantity + quantity > maxItems) {
      this.message.warning(`No puedes agregar más artículos. El límite es de ${maxItems} unidades.`);
      return;
    }

    // 1. Verificar si hay productos de otras tiendas en el carrito
    const differentStoreItems = currentItems.filter(item => item.cmp_uuid !== product.cmp_uuid);
    if (differentStoreItems.length > 0) {
      // Hay productos de otras tiendas. Necesitamos validar si se permite la combinación.
      this._settingsService.getCompaniesSettings(product.cmp_uuid).subscribe({
        next: (res) => {
          let incomingAllowsMulti = true;
          if (res && res.data) {
            const setting = res.data.find((s: any) => s.cmps_key === 'ALLOW_MULTI_STORE_CART');
            if (setting) {
              incomingAllowsMulti = setting.cmps_value !== 'false';
            }
          }

          if (!incomingAllowsMulti) {
            this.message.warning(`Esta tienda no permite combinar sus productos con los de otras tiendas.`);
            return;
          }

          // Consultar las configuraciones de las tiendas de los productos ya presentes en el carrito
          const existingCmpUuids = [...new Set(differentStoreItems.map(item => item.cmp_uuid))];
          const checks = existingCmpUuids.map(uuid => 
            this._settingsService.getCompaniesSettings(uuid).pipe(
              map(settingsRes => {
                const setting = settingsRes?.data?.find((s: any) => s.cmps_key === 'ALLOW_MULTI_STORE_CART');
                return {
                  uuid,
                  allows: setting ? setting.cmps_value !== 'false' : true
                };
              }),
              catchError(() => of({ uuid, allows: true }))
            )
          );

          forkJoin(checks).subscribe({
            next: (results) => {
              const blockedStore = results.find(r => !r.allows);
              if (blockedStore) {
                this.message.warning(`El carrito contiene productos de una tienda que no permite compras multi-tienda.`);
                return;
              }

              this.proceedAddToCart(product, quantity);
            },
            error: () => {
              this.proceedAddToCart(product, quantity);
            }
          });
        },
        error: () => {
          this.proceedAddToCart(product, quantity);
        }
      });
    } else {
      // El carrito está vacío o contiene solo productos de la misma tienda.
      this.proceedAddToCart(product, quantity);
    }
  }

  private proceedAddToCart(product: ProductVariationInterface, quantity: number): void {
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
    this.message.success(`${product.prov_name} agregado al carrito.`);
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
