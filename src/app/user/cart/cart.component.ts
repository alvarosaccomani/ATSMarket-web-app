import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

import { CartService } from '@services/cart.service';
import { CartItemInterface } from '@interfaces/cart-item.interface';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NzGridModule,
    NzCardModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzInputNumberModule,
    NzDividerModule,
    NzEmptyModule,
    NzPopconfirmModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {

  public cartItems$: Observable<CartItemInterface[]>;

  constructor(public cartService: CartService) {
    this.cartItems$ = this.cartService.cartItems$;
  }

  ngOnInit(): void { }

  public onQuantityChange(productId: string, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  public onRemoveItem(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  public clearCart(): void {
    this.cartService.clearCart();
  }

  public getTotal(): number {
    return this.cartService.getTotalPrice();
  }
}
