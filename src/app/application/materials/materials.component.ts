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

import { MaterialInterface } from '@interfaces/material';
import { GlobalMaterialInterface } from '@interfaces/global-material';
import { SessionService } from '@services/session.service';
import { MaterialsService } from '@services/materials.service';
import { GlobalMaterialsService } from '@services/global-materials.service';
import { MessageService } from '@services/message.service';

@Component({
  selector: 'app-materials',
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
  templateUrl: './materials.component.html',
  styleUrl: './materials.component.scss'
})
export class MaterialsComponent implements OnInit {

  private cmp_uuid!: string;
  
  // Flujo de datos reactivo
  private searchTerm$ = new BehaviorSubject<string>('');
  private refreshData$ = new BehaviorSubject<void>(undefined);
  public filteredMaterials$!: Observable<MaterialInterface[]>;

  // Control del Drawer
  public selectedMaterial: MaterialInterface | null = null;
  public isDrawerVisible = false;
  public globalMaterials: GlobalMaterialInterface[] = [];

  constructor(
    private _sessionService: SessionService,
    private _materialService: MaterialsService,
    private _globalMaterialsService: GlobalMaterialsService,
    private _messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cmp_uuid = this._sessionService.getCompany().cmp_uuid;
    this.getGlobalMaterials();

    // Combinamos la carga de datos con el filtro de búsqueda
    this.filteredMaterials$ = combineLatest([
      this.refreshData$.pipe(
        switchMap(() => this._materialService.getMaterials(this.cmp_uuid))
      ),
      this.searchTerm$.asObservable()
    ]).pipe(
      map(([results, term]) => {
        const materials = results.data;
        if (!term.trim()) return materials;
        
        const lowTerm = term.toLowerCase();
        return materials.filter(m => 
          m.mat_name.toLowerCase().includes(lowTerm) || 
          m.mat_description.toLowerCase().includes(lowTerm)
        );
      })
    );
  }

  public onSearch(term: string): void {
    this.searchTerm$.next(term);
  }

  public openMaterialDetail(material: MaterialInterface): void {
    this.selectedMaterial = material;
    this.isDrawerVisible = true;
  }

  public closeDrawer(): void {
    this.isDrawerVisible = false;
    setTimeout(() => this.selectedMaterial = null, 300);
  }

  public onDeleteMaterial(material: MaterialInterface): void {
    this._messageService.confirm(
      '¿Estás seguro?',
      `Esta acción eliminará permanentemente el material: ${material.mat_name}`,
      () => {
        this._materialService.deleteMaterial(this.cmp_uuid, material.mat_uuid).subscribe({
          next: () => {
            this._messageService.success('¡Eliminado!', 'El material ha sido eliminado correctamente.');
            this.closeDrawer();
            this.refreshData$.next(); // Recargamos la lista
          },
          error: (err) => {
            this._messageService.error('Error', 'No se pudo eliminar el material.');
            console.error(err);
          }
        });
      }
    );
  }

  private getGlobalMaterials(): void {
    this._globalMaterialsService.getGlobalMaterials().subscribe({
      next: (res) => {
        this.globalMaterials = res.data;
      },
      error: (err) => {
        console.error('Error loading global materials:', err);
      }
    });
  }

  public getGlobalMaterialName(gmat_uuid: string): string {
    const found = this.globalMaterials.find(m => m.gmat_uuid === gmat_uuid);
    return found ? found.gmat_name : 'Sin Grupo';
  }
}
