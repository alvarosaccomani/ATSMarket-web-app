import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

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

import { CartItemInterface } from '@interfaces/cart-item.interface';
import { CartService } from '@services/cart.service';
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
    NzDividerModule
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent implements OnInit {

  public cartItemCount: number = 0;
  public cartItems$: Observable<CartItemInterface[]>;
  public drawerVisible: boolean = false;

  // Usuario
  public userIdentity: any = null;

  // Contexto de Tienda
  public activeStore: CompanyInterface | null = null;
  public storeLogoUrl: string = '';
  public storeName: string = 'ATS Market';
  public navbarColor: string = '#001529'; // Color por defecto (dark)

  // Notificaciones
  public notifications$: Observable<NotificationInterface[]>;
  public unreadCount$: Observable<number>;
  public animateBell: boolean = false;

  constructor(
    private cartService: CartService,
    private _sessionService: SessionService,
    private _router: Router,
    private _storeContext: StoreContextService,
    public notificationService: WebSocketNotificationService
  ) {
    this.cartItems$ = this.cartService.cartItems$;
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
  }

  private updateLogo(): void {
    // Prioridad: Ajuste personalizado de logo > Logo de la empresa > Vacío (texto)
    const customLogo = this._storeContext.getSetting('STORE_LOGO_URL');
    this.storeLogoUrl = customLogo || this.activeStore?.cmp_logo || '';
  }

  private updateNavbarColor(): void {
    const customColor = this._storeContext.getSetting('THEME_NAVBAR_COLOR');
    this.navbarColor = customColor || '#001529';
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
