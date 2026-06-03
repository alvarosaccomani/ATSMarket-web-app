import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Subject, takeUntil } from 'rxjs';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { SideBarComponent } from '@components/side-bar/side-bar.component';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ApplicationBarComponent } from '@components/application-bar/application-bar.component';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';

import { SessionService } from '@services/session.service';
import { UserRolesCompanyService } from '@services/user-roles-company.service';
import { MenuInterface } from '@interfaces/menu';
import { AppMenusService } from '@services/app-menus.service';
import { WebSocketNotificationService } from '../../core/services/web-socket-notification.service';

@Component({
  selector: 'app-application-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    NzLayoutModule,
    SideBarComponent,
    NzBreadCrumbModule,
    NzIconModule,
    NzMenuModule,
    NzAvatarModule,
    NzDropDownModule,
    NzButtonModule,
    NzToolTipModule,
    NzNotificationModule,
    ApplicationBarComponent
  ],
  templateUrl: './application-layout.component.html',
  styleUrl: './application-layout.component.scss'
})
export class ApplicationLayoutComponent implements OnInit, OnDestroy {

  public isCollapsed = false;
  public userRolesCompany: any[] = [];
  public activeCompany: any = null;
  public userIdentity: any = null;

  public menuItems: MenuInterface[] = [];
  public breadcrumbs: string[] = ['Inicio'];

  private destroy$ = new Subject<void>();

  constructor(
    private _sessionService: SessionService,
    private _userRolesCompanyService: UserRolesCompanyService,
    private _appMmenusService: AppMenusService,
    private _router: Router,
    private _notificationService: WebSocketNotificationService,
    private _nzNotificationService: NzNotificationService
  ) { }

  ngOnInit(): void {
    const identity = this._sessionService.getIdentity();
    this.userIdentity = identity;
    const currentSession = this._sessionService.getCurrentSession() as any;
    this.activeCompany = currentSession?.company || null;

    if (identity) {
      this._userRolesCompanyService.getUserRolesCompanyByUser(identity.usr_uuid!)
        .subscribe((response: any) => {
          this.userRolesCompany = this.groupByCompany(response.data);

          if (!this.activeCompany && this.userRolesCompany.length > 0) {
            this.activeCompany = this.userRolesCompany[0];
            this._sessionService.setCompany(JSON.stringify(this.activeCompany));
          }
        });
    }

    this._sessionService.refreshCompanies$.subscribe(() => {
      if (this.userIdentity) {
        this._userRolesCompanyService.getUserRolesCompanyByUser(this.userIdentity.usr_uuid!)
          .subscribe((response: any) => {
            this.userRolesCompany = this.groupByCompany(response.data);
          });
      }
    });

    this.loadMenuTree();

    // Suscribirse a cambios de ruta para breadcrumbs
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateBreadcrumbs(event.urlAfterRedirects);
    });

    // Suscribirse al canal de notificaciones en tiempo real
    this._notificationService.incomingNotification$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ntf) => {
        // Validar que la notificación corresponda a la tienda/compañía activa
        if (ntf.cmp_uuid && this.activeCompany && ntf.cmp_uuid === this.activeCompany.cmp_uuid) {
          const type = ntf.ntf_type || 'info';
          let borderLeftColor = '#1890ff'; // Info blue
          if (type === 'success') borderLeftColor = '#52c41a'; // Success green
          else if (type === 'warning') borderLeftColor = '#faad14'; // Warning yellow
          else if (type === 'error') borderLeftColor = '#ff4d4f'; // Error red

          // Mostrar notificación flotante visual
          this._nzNotificationService.create(
            type,
            ntf.ntf_title,
            ntf.ntf_message,
            {
              nzDuration: 7000,
              nzPlacement: 'topRight',
              nzStyle: {
                background: '#ffffff',
                borderLeft: `5px solid ${borderLeftColor}`,
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)'
              }
            }
          );

          // Reproducir alerta de sonido armónico
          this._notificationService.playNotificationSound();
        }
      });
  }

  private loadMenuTree(): void {
    this._appMmenusService.getMenuItemsTree().subscribe({
      next: (res) => {
        this.menuItems = res.data;
        // Una vez cargado el menú, inicializamos breadcrumbs
        this.updateBreadcrumbs(this._router.url);
      },
      error: (err) => {
        console.error('Error al cargar el menú:', err);
      }
    });
  }

  private updateBreadcrumbs(url: string): void {
    const path: string[] = ['ATS Market']; // Nombre base
    
    // Buscamos en el árbol de menús
    for (const item of this.menuItems) {
      // Caso 1: El ítem padre coincide
      if (item.mnu_route && url.includes(item.mnu_route)) {
        path.push(item.mnu_title || '');
        break;
      }
      
      // Caso 2: Uno de los hijos coincide
      if (item.items && item.items.length > 0) {
        const child = item.items.find(c => c.mnu_route && url.includes(c.mnu_route));
        if (child) {
          path.push(item.mnu_title || '');
          path.push(child.mnu_title || '');
          break;
        }
      }
    }

    // Si no se encontró nada (ej: dashboard), podrías añadir lógica por defecto o dejar solo el base
    this.breadcrumbs = path;
  }

  public groupByCompany(data: any[]): any[] {
    const grouped = new Map();
    data.forEach((item) => {
      const cmpUuid = item.cmp.cmp_uuid;
      if (!grouped.has(cmpUuid)) {
        grouped.set(cmpUuid, {
          cmp_uuid: item.cmp.cmp_uuid,
          cmp_name: item.cmp.cmp_name,
          roles: [],
        });
      }
      grouped.get(cmpUuid).roles.push({
        rol_uuid: item.rol.rol_uuid,
        rol_name: item.rol.rol_name,
        rolpers: item.rolpers.map((e: any) => e.per.per_slug)
      });
    });
    return Array.from(grouped.values());
  }

  public selectCompany(company: any): void {
    this.activeCompany = company;
    this._sessionService.setCompany(JSON.stringify(company));

    // Recargar componentes para que usen la nueva tienda de la sesión
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this._router.navigate(['/application/products']);
    });
  }

  public logout(): void {
    this._sessionService.logout();
    this._router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
