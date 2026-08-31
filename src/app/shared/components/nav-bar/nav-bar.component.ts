import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, filter } from 'rxjs';

// NG-ZORRO Modules
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { CartItemInterface } from '@interfaces/cart-item.interface';
import { CartService } from '@services/cart.service';
import { FavoritesService } from '@services/favorites.service';
import { SessionService } from '@services/session.service';
import { StoreContextService } from '@services/store-context.service';
import { WebSocketNotificationService } from '@services/web-socket-notification.service';
import { NotificationInterface } from '@interfaces/notification/notification.interface';
import { CompanyInterface } from '@interfaces/company';

@Component({
  selector: 'app-nav-bar',
  imports: [
    CommonModule,
    AsyncPipe,
    RouterLink,
    FormsModule,
    NzDrawerModule,
    NzLayoutModule,
    NzIconModule,
    NzBadgeModule,
    NzInputModule,
    NzAvatarModule,
    NzDropDownModule,
    NzButtonModule,
    NzDividerModule,
    NzTagModule,
    NzSpinModule,
    NzEmptyModule,
    NzToolTipModule
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent implements OnInit {

  public cartItemCount: number = 0;
  public cartItems$: Observable<CartItemInterface[]>;
  public drawerVisible: boolean = false;

  // Favoritos
  public favoritesCount$: Observable<number>;
  public isFavoritesDrawerVisible: boolean = false;
  public favoriteItemsDetails: any[] = [];
  public isLoadingFavorites: boolean = false;

  // Usuario
  public userIdentity: any = null;

  // Contexto de Tienda
  public activeStore: CompanyInterface | null = null;
  public storeLogoUrl: string = '';
  public storeName: string = 'ATS Market';
  public navbarColor: string = '#001529'; // Color por defecto (dark)
  public searchQuery: string = '';

  // Notificaciones
  public notifications$: Observable<NotificationInterface[]>;
  public unreadCount$: Observable<number>;
  public animateBell: boolean = false;

  constructor(
    private cartService: CartService,
    private _favoritesService: FavoritesService,
    private _sessionService: SessionService,
    private _router: Router,
    private _storeContext: StoreContextService,
    public notificationService: WebSocketNotificationService
  ) {
    this.cartItems$ = this.cartService.cartItems$;
    this.favoritesCount$ = this._favoritesService.favoritesCount$;
    this.notifications$ = this.notificationService.notifications$;
    this.unreadCount$ = this.notificationService.unreadCount$;
  }

  ngOnInit(): void {
    this.userIdentity = this._sessionService.getIdentity();

    // Suscribirse a cambios en la tienda activa
    this._storeContext.activeStore$.subscribe(store => {
      this.activeStore = store;
      this.storeName = store?.cmp_name || 'ATS Market';
      this.updateLogo();
    });

    this._storeContext.storeSettings$.subscribe(() => {
      this.updateLogo();
      this.updateNavbarColor();
    });

    // Escuchar el conteo de no leídos para disparar la animación de campana
    this.unreadCount$.subscribe(count => {
      if (count > 0) {
        this.animateBell = true;
        setTimeout(() => this.animateBell = false, 1200); // Duración de la oscilación
      }
    });

    // Sincronizar el buscador del navbar con los queryParams de la URL
    const initialTree = this._router.parseUrl(this._router.url);
    this.searchQuery = initialTree.queryParams['search'] || '';

    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const tree = this._router.parseUrl(this._router.url);
      this.searchQuery = tree.queryParams['search'] || '';
    });
    if (this.userIdentity) {
      this._favoritesService.loadFavorites().subscribe();
    }
  }

  // --- MÓDULO HÍBRIDO DE FAVORITOS ---
  public openFavoritesDrawer(): void {
    if (!this.userIdentity) {
      this._router.navigate(['/auth/login']);
      return;
    }
    this.isFavoritesDrawerVisible = true;
    this.loadFavoritesDetails();
  }

  public closeFavoritesDrawer(): void {
    this.isFavoritesDrawerVisible = false;
  }

  public loadFavoritesDetails(): void {
    this.isLoadingFavorites = true;
    this._favoritesService.getFavoritesDetails().subscribe({
      next: (data) => {
        this.favoriteItemsDetails = data || [];
        this.isLoadingFavorites = false;
      },
      error: () => {
        this.favoriteItemsDetails = [];
        this.isLoadingFavorites = false;
      }
    });
  }

  public removeFavoriteFromDrawer(item: any): void {
    this._favoritesService.removeFavorite(item.prov_uuid, item.cmp_uuid).subscribe({
      next: () => {
        this.favoriteItemsDetails = this.favoriteItemsDetails.filter(f => f.prov_uuid !== item.prov_uuid);
      }
    });
  }

  public addToCartFromFavorites(item: any): void {
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
    this.cartService.addToCart(cartProduct as any);
  }

  public goToProductDetail(item: any): void {
    this.closeFavoritesDrawer();
    if (item.cmp_slug) {
      this._router.navigate(['/public/store-catalog', item.cmp_slug, 'product', item.prov_uuid]);
    }
  }

  public goToMyFavoritesPage(): void {
    this.closeFavoritesDrawer();
    this._router.navigate(['/application/my-favorites']);
  }

  private updateLogo(): void {
    // Prioridad: Ajuste personalizado de logo > Logo de la empresa > Vacío (texto)
    const customLogo = this._storeContext.getSetting('STORE_LOGO_URL');
    this.storeLogoUrl = customLogo || this.activeStore?.cmp_logo || '';
  }

  private updateNavbarColor(): void {
    const customColor = this._storeContext.getSetting('THEME_NAVBAR_COLOR');
    this.navbarColor = customColor || this.activeStore?.cmp_primarycolor || '#001529';
  }

  // Ejecuta la búsqueda desde el navbar
  public onSearch(): void {
    const queryParams: any = {};
    if (this.searchQuery && this.searchQuery.trim()) {
      queryParams.search = this.searchQuery.trim();
    }
    
    if (this.activeStore) {
      // Si estamos dentro de una tienda, buscamos en esa tienda
      this._router.navigate(['/public/store-catalog', this.activeStore.cmp_slug], { queryParams });
    } else {
      // Si no, buscamos en el catálogo general
      this._router.navigate(['/public/catalog'], { queryParams });
    }
  }

  public openDrawer(): void {
    this.drawerVisible = true;
  }

  public closeDrawer(): void {
    this.drawerVisible = false;
  }

  public logout(): void {
    this._sessionService.logout();
    this.userIdentity = null;
    this._router.navigate(['/auth/login']);
  }

  public markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  public navegarNotificacion(ntf: NotificationInterface): void {
    // Marcar como leída de forma interna si hace clic
    ntf.ntf_isread = true;
    this.notificationService.markAllAsRead(); // para esta versión rápida
    
    if (ntf.ntf_actionurl) {
      this._router.navigateByUrl(ntf.ntf_actionurl);
    }
  }
}
