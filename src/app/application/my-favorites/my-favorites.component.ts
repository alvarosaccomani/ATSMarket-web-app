import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// NG-ZORRO Modules
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

import { FavoritesService } from '@services/favorites.service';
import { CartService } from '@services/cart.service';
import { MessageService } from '@services/message.service';

@Component({
  selector: 'app-my-favorites',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzInputModule,
    NzEmptyModule,
    NzSpinModule,
    NzToolTipModule,
    NzPopconfirmModule
  ],
  templateUrl: './my-favorites.component.html',
  styleUrl: './my-favorites.component.scss'
})
export class MyFavoritesComponent implements OnInit {

  public favoriteItems: any[] = [];
  public filteredItems: any[] = [];
  public isLoading: boolean = true;
  public searchTerm: string = '';
  public stockFilter: string = 'ALL'; // ALL | IN_STOCK

  constructor(
    private _favoritesService: FavoritesService,
    private _cartService: CartService,
    private _messageService: MessageService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  public loadFavorites(): void {
    this.isLoading = true;
    this._favoritesService.getFavoritesDetails().subscribe({
      next: (data) => {
        this.favoriteItems = data || [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar favoritos:', err);
        this._messageService.error('Error', 'No se pudieron cargar tus favoritos.');
        this.isLoading = false;
      }
    });
  }

  public applyFilters(): void {
    let result = [...this.favoriteItems];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(item => 
        (item.prov_name && item.prov_name.toLowerCase().includes(term)) ||
        (item.prov_sku && item.prov_sku.toLowerCase().includes(term)) ||
        (item.cmp_name && item.cmp_name.toLowerCase().includes(term))
      );
    }

    if (this.stockFilter === 'IN_STOCK') {
      result = result.filter(item => item.prov_stock > 0);
    }

    this.filteredItems = result;
  }

  public removeFavorite(item: any): void {
    this._favoritesService.removeFavorite(item.prov_uuid, item.cmp_uuid).subscribe({
      next: () => {
        this._messageService.success('Eliminado', 'Producto eliminado de tus favoritos.');
        this.favoriteItems = this.favoriteItems.filter(f => f.prov_uuid !== item.prov_uuid);
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error al quitar de favoritos:', err);
        this._messageService.error('Error', 'No se pudo eliminar de favoritos.');
      }
    });
  }

  public addToCart(item: any): void {
    const cartProduct = {
      cmp_uuid: item.cmp_uuid,
      pro_uuid: item.pro_uuid,
      prov_uuid: item.prov_uuid,
      prov_name: item.prov_name,
      prov_sku: item.prov_sku,
      prov_price: item.prov_suggestedminimumsellingprice,
      prov_image: item.prov_image,
      quantity: 1,
      cmp_name: item.cmp_name
    };
    this._cartService.addToCart(cartProduct as any);
    this._messageService.success('Agregado', `"${item.prov_name}" se añadió a tu carrito.`);
  }

  public goToProductDetail(item: any): void {
    if (item.cmp_slug) {
      this._router.navigate(['/public/store-catalog', item.cmp_slug, 'product', item.prov_uuid]);
    }
  }

  public goToCatalog(): void {
    this._router.navigate(['/public/catalog']);
  }
}
