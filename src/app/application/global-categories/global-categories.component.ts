import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

import { GlobalCategoryInterface } from '@interfaces/global-category';
import { GlobalCategoriesService } from '@services/global-categories.service';
import { MessageService } from '@services/message.service';

@Component({
  selector: 'app-global-categories',
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
  templateUrl: './global-categories.component.html',
  styleUrl: './global-categories.component.scss'
})
export class GlobalCategoriesComponent implements OnInit {

  // Flujo de datos reactivo
  private searchTerm$ = new BehaviorSubject<string>('');
  private refreshData$ = new BehaviorSubject<void>(undefined);
  public filteredGlobalCategories$!: Observable<GlobalCategoryInterface[]>;

  // Control del Drawer
  public selectedGlobalCategory: GlobalCategoryInterface | null = null;
  public isDrawerVisible = false;

  constructor(
    private _globalCategoriesService: GlobalCategoriesService,
    private _messageService: MessageService
  ) { }

  ngOnInit(): void {
    // Combinamos la carga de datos con el filtro de búsqueda
    this.filteredGlobalCategories$ = combineLatest([
      this.refreshData$.pipe(
        switchMap(() => this._globalCategoriesService.getGlobalCategories())
      ),
      this.searchTerm$.asObservable()
    ]).pipe(
      map(([results, term]) => {
        const categories = results.data;
        if (!term.trim()) return categories;
        
        const lowTerm = term.toLowerCase();
        return categories.filter(c => 
          c.gcat_name.toLowerCase().includes(lowTerm) || 
          c.gcat_description.toLowerCase().includes(lowTerm)
        );
      })
    );
  }

  public onSearch(term: string): void {
    this.searchTerm$.next(term);
  }

  public openGlobalCategoryDetail(category: GlobalCategoryInterface): void {
    this.selectedGlobalCategory = category;
    this.isDrawerVisible = true;
  }

  public closeDrawer(): void {
    this.isDrawerVisible = false;
    setTimeout(() => this.selectedGlobalCategory = null, 300);
  }

  public onDeleteGlobalCategory(category: GlobalCategoryInterface): void {
    this._messageService.confirm(
      '¿Estás seguro?',
      `Esta acción eliminará permanentemente la categoría global: ${category.gcat_name}`,
      () => {
        this._globalCategoriesService.deleteGlobalCategory(category.gitm_uuid, category.gcat_uuid).subscribe({
          next: () => {
            this._messageService.success('¡Eliminado!', 'La categoría global ha sido eliminada correctamente.');
            this.closeDrawer();
            this.refreshData$.next();
          },
          error: (err) => {
            this._messageService.error('Error', 'No se pudo eliminar la categoría global.');
            console.error(err);
          }
        });
      }
    );
  }
}
