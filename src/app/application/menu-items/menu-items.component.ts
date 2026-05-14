import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, map, combineLatest, BehaviorSubject, switchMap, tap } from 'rxjs';

// NG-ZORRO
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { MenuInterface } from '@interfaces/menu';
import { MenusService } from '@services/menus.service';
import { MessageService } from '@services/message.service';

@Component({
  selector: 'app-menu-items',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzTableModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzDrawerModule,
    NzDividerModule,
    NzDescriptionsModule,
    NzTagModule,
    NzInputModule,
    NzAvatarModule,
    NzToolTipModule
  ],
  templateUrl: './menu-items.component.html',
  styleUrl: './menu-items.component.scss'
})
export class MenuItemsComponent implements OnInit {

  // Flujo de datos reactivo
  private searchTerm$ = new BehaviorSubject<string>('');
  private refreshData$ = new BehaviorSubject<void>(undefined);
  public filteredMenus$!: Observable<MenuInterface[]>;

  // Control del Drawer
  public selectedMenu: MenuInterface | null = null;
  public isDrawerVisible = false;

  private allMenus: MenuInterface[] = [];

  constructor(
    private _menusService: MenusService,
    private _messageService: MessageService
  ) { }

  ngOnInit(): void {
    // Combinamos la carga de datos con el filtro de búsqueda
    this.filteredMenus$ = combineLatest([
      this.refreshData$.pipe(
        switchMap(() => this._menusService.getMenus()),
        tap(results => this.allMenus = results.data)
      ),
      this.searchTerm$.asObservable()
    ]).pipe(
      map(([results, term]) => {
        const items = results.data;
        if (!term.trim()) return items;
        
        const lowTerm = term.toLowerCase();
        return items.filter(i => 
          (i.mnu_title?.toLowerCase().includes(lowTerm) ?? false) || 
          (i.mnu_description?.toLowerCase().includes(lowTerm) ?? false) ||
          (i.mnu_route?.toLowerCase().includes(lowTerm) ?? false)
        );
      })
    );
  }

  public onSearch(term: string): void {
    this.searchTerm$.next(term);
  }

  public openMenuDetail(item: MenuInterface): void {
    this.selectedMenu = item;
    this.isDrawerVisible = true;
  }

  public closeDrawer(): void {
    this.isDrawerVisible = false;
    setTimeout(() => this.selectedMenu = null, 300);
  }

  public onDeleteMenu(item: MenuInterface): void {
    this._messageService.confirm(
      '¿Estás seguro?',
      `Esta acción eliminará permanentemente el ítem de menú: ${item.mnu_title}`,
      () => {
        this._menusService.deleteMenu(item.mnu_uuid!).subscribe({
          next: () => {
            this._messageService.success('¡Eliminado!', 'El ítem de menú ha sido eliminado correctamente.');
            this.closeDrawer();
            this.refreshData$.next();
          },
          error: (err: any) => {
            this._messageService.error('Error', 'No se pudo eliminar el ítem de menú.');
            console.error(err);
          }
        });
      }
    );
  }

  public moveItem(item: MenuInterface, direction: 'up' | 'down'): void {
    const currentIndex = this.allMenus.findIndex(m => m.mnu_uuid === item.mnu_uuid);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= this.allMenus.length) return;

    const targetItem = this.allMenus[targetIndex];

    // Intercambiamos los órdenes
    const currentOrder = item.mnu_order || 0;
    const targetOrder = targetItem.mnu_order || 0;

    // Si los órdenes son iguales, forzamos una diferencia
    const newCurrentOrder = targetOrder;
    const newTargetOrder = currentOrder === targetOrder ? targetOrder + (direction === 'up' ? 1 : -1) : currentOrder;

    // Actualizamos ambos ítems
    const update1 = this._menusService.updateMenu(item.mnu_uuid!, { mnu_order: newCurrentOrder });
    const update2 = this._menusService.updateMenu(targetItem.mnu_uuid!, { mnu_order: newTargetOrder });

    combineLatest([update1, update2]).subscribe({
      next: () => {
        this.refreshData$.next();
      },
      error: (err) => {
        this._messageService.error('Error', 'No se pudo actualizar el orden.');
        console.error(err);
      }
    });
  }

  public getParentTitle(parentUuid: string | null): string {
    if (!parentUuid) return 'Raíz';
    const parent = this.allMenus.find(m => m.mnu_uuid === parentUuid);
    return parent ? parent.mnu_title || 'Sin título' : 'Desconocido';
  }
}
