import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItemInterface } from '@interfaces/cart-item.interface';
import { CartService } from '@services/cart.service';
import { Observable, Subscription } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    FormsModule,
    AsyncPipe,
    NzButtonModule,
    NzCardModule,
    NzDividerModule,
    NzEmptyModule,
    NzGridModule,
    NzIconModule,
    NzInputNumberModule,
    NzStatisticModule,
    NzTableModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit, OnDestroy {

  public cartItems$: Observable<CartItemInterface[]>;
  public totalPrice: number = 0;
  public cartSubscription: Subscription = new Subscription();

  // Definición de las columnas de la tabla para la lógica responsive
  public listOfColumns = [
    { name: 'Producto', responsive: 'xs' },
    { name: 'Precio Unitario', responsive: 'md' }, // Ocultar en SM y XS
    { name: 'Cantidad', responsive: 'xs' },
    { name: 'Subtotal', responsive: 'xs' },
    { name: 'Acción', responsive: 'xs' }
  ];

  constructor(
    private cartService: CartService,
    private _router: Router
  ) {
    this.cartItems$ = this.cartService.cartItems$;
  }

  ngOnInit(): void {
    // Suscripción para mantener el precio total actualizado en la vista
    this.cartSubscription = this.cartItems$.subscribe(() => {
      this.totalPrice = this.cartService.getTotalPrice();
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
  }

  public updateItemQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  public removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  public checkout(): void {
    this._router.navigate(['/user/checkout']);
  }

}
