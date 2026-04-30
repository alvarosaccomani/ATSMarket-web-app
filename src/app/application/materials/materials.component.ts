import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, map, combineLatest, BehaviorSubject } from 'rxjs';

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
import { SessionService } from '@services/session.service';
import { MaterialsService } from '@services/materials.service';

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  public filteredMaterials$!: Observable<MaterialInterface[]>;

  // Control del Drawer
  public selectedMaterial: MaterialInterface | null = null;
  public isDrawerVisible = false;

  constructor(
    private _sessionService: SessionService,
    private _materialService: MaterialsService
  ) { }

  ngOnInit(): void {
    this.cmp_uuid = this._sessionService.getCompany().cmp_uuid;

    // Combinamos la carga de datos con el filtro de búsqueda
    this.filteredMaterials$ = combineLatest([
      this._materialService.getMaterials(this.cmp_uuid),
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
}
