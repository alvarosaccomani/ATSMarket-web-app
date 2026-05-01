import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, map, combineLatest, BehaviorSubject, switchMap } from 'rxjs';

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

import { GlobalItemInterface } from '@interfaces/global-item';
import { GlobalItemsService } from '@services/global-items.service';
import { MessageService } from '@services/message.service';

@Component({
  selector: 'app-global-items',
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
    NzAvatarModule
  ],
  templateUrl: './global-items.component.html',
  styleUrl: './global-items.component.scss'
})
export class GlobalItemsComponent implements OnInit {

  // Flujo de datos reactivo
  private searchTerm$ = new BehaviorSubject<string>('');
  private refreshData$ = new BehaviorSubject<void>(undefined);
  public filteredGlobalItems$!: Observable<GlobalItemInterface[]>;

  // Control del Drawer
  public selectedGlobalItem: GlobalItemInterface | null = null;
  public isDrawerVisible = false;

  constructor(
    private _globalItemsService: GlobalItemsService,
    private _messageService: MessageService
  ) { }

  ngOnInit(): void {
    // Combinamos la carga de datos con el filtro de búsqueda
    this.filteredGlobalItems$ = combineLatest([
      this.refreshData$.pipe(
        switchMap(() => this._globalItemsService.getGlobalItems())
      ),
      this.searchTerm$.asObservable()
    ]).pipe(
      map(([results, term]) => {
        const items = results.data;
        if (!term.trim()) return items;
        
        const lowTerm = term.toLowerCase();
        return items.filter(i => 
          i.gitm_name.toLowerCase().includes(lowTerm) || 
          i.gitm_description.toLowerCase().includes(lowTerm)
        );
      })
    );
  }

  public onSearch(term: string): void {
    this.searchTerm$.next(term);
  }

  public openGlobalItemDetail(item: GlobalItemInterface): void {
    this.selectedGlobalItem = item;
    this.isDrawerVisible = true;
  }

  public closeDrawer(): void {
    this.isDrawerVisible = false;
    setTimeout(() => this.selectedGlobalItem = null, 300);
  }

  public onDeleteGlobalItem(item: GlobalItemInterface): void {
    this._messageService.confirm(
      '¿Estás seguro?',
      `Esta acción eliminará permanentemente el rubro global: ${item.gitm_name}`,
      () => {
        this._globalItemsService.deleteGlobalItem(item.gitm_uuid).subscribe({
          next: () => {
            this._messageService.success('¡Eliminado!', 'El rubro global ha sido eliminado correctamente.');
            this.closeDrawer();
            this.refreshData$.next();
          },
          error: (err: any) => {
            this._messageService.error('Error', 'No se pudo eliminar el rubro global.');
            console.error(err);
          }
        });
      }
    );
  }
}
