import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzInputModule } from 'ng-zorro-antd/input';
import { CartItemInterface } from '@interfaces/cart-item.interface';
import { CartService } from '@services/cart.service';

@Component({
  selector: 'app-nav-bar',
  imports: [
    AsyncPipe,
    RouterLink,
    FormsModule,
    NzDrawerModule,
    NzLayoutModule,
    NzIconModule,
    NzBadgeModule,
    NzInputModule
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {

  // Propiedad para mostrar el número de ítems en el carrito
  // Esto debe ser alimentado por tu CartService real.
  public cartItemCount: number = 0;
  public cartItems$: Observable<CartItemInterface[]>;

  // Si usas ngModel en el input, necesitas importar FormsModule y ReactiveFormsModule
  // en tu app.module.ts.

  constructor(
    private cartService: CartService
  ) {
    this.cartItems$ = this.cartService.cartItems$;
  }

  // Maneja el cambio en el campo de búsqueda.

  public onSearchInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value && value.trim().length > 3) {
      console.log('Buscando:', value);
      // **TODO:** Implementar la lógica de búsqueda,
      // ej: redirigir a '/catalogo?q=' + value
    }
  }
}
