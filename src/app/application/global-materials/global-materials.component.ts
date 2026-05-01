import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, map, combineLatest, BehaviorSubject, switchMap } from 'rxjs';

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

import { GlobalMaterialInterface } from '@interfaces/global-material';
import { GlobalMaterialsService } from '@services/global-materials.service';
import { MessageService } from '@services/message.service';

@Component({
  selector: 'app-global-materials',
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
  templateUrl: './global-materials.component.html',
  styleUrl: './global-materials.component.scss'
})
export class GlobalMaterialsComponent implements OnInit {

  // Flujo de datos reactivo
  private searchTerm$ = new BehaviorSubject<string>('');
  private refreshData$ = new BehaviorSubject<void>(undefined);
  public filteredGlobalMaterials$!: Observable<GlobalMaterialInterface[]>;

  // Control del Drawer
  public selectedGlobalMaterial: GlobalMaterialInterface | null = null;
  public isDrawerVisible = false;

  constructor(
    private _globalMaterialService: GlobalMaterialsService,
    private _messageService: MessageService
  ) { }

  ngOnInit(): void {
    // Combinamos la carga de datos con el filtro de búsqueda
    this.filteredGlobalMaterials$ = combineLatest([
      this.refreshData$.pipe(
        switchMap(() => this._globalMaterialService.getGlobalMaterials())
      ),
      this.searchTerm$.asObservable()
    ]).pipe(
      map(([results, term]) => {
        const materials = results.data;
        if (!term.trim()) return materials;
        
        const lowTerm = term.toLowerCase();
        return materials.filter(m => 
          m.gmat_name.toLowerCase().includes(lowTerm) || 
          m.gmat_description.toLowerCase().includes(lowTerm)
        );
      })
    );
  }

  public onSearch(term: string): void {
    this.searchTerm$.next(term);
  }

  public openGlobalMaterialDetail(material: GlobalMaterialInterface): void {
    this.selectedGlobalMaterial = material;
    this.isDrawerVisible = true;
  }

  public closeDrawer(): void {
    this.isDrawerVisible = false;
    setTimeout(() => this.selectedGlobalMaterial = null, 300);
  }

  public onDeleteGlobalMaterial(material: GlobalMaterialInterface): void {
    this._messageService.confirm(
      '¿Estás seguro?',
      `Esta acción eliminará permanentemente el material global: ${material.gmat_name}`,
      () => {
        this._globalMaterialService.deleteGlobalMaterial(material.gmat_uuid).subscribe({
          next: () => {
            this._messageService.success('¡Eliminado!', 'El material global ha sido eliminado correctamente.');
            this.closeDrawer();
            this.refreshData$.next();
          },
          error: (err) => {
            this._messageService.error('Error', 'No se pudo eliminar el material global.');
            console.error(err);
          }
        });
      }
    );
  }
}
