import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

import { WarehousesService } from '@services/warehouses.service';
import { SessionService } from '@services/session.service';
import { WarehouseInterface } from '@interfaces/warehouse';
import { WarehouseLocationInterface } from '@interfaces/warehouse-location';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzDrawerModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSpinModule,
    NzCardModule,
    NzGridModule,
    NzCollapseModule,
    NzSwitchModule,
    NzPopconfirmModule,
    NzEmptyModule
  ],
  templateUrl: './warehouses.component.html',
  styleUrl: './warehouses.component.scss'
})
export class WarehousesComponent implements OnInit {

  public companyUuid: string | null = null;
  
  // Estados de Carga
  public isLoadingWarehouses = false;
  public isLoadingLocations = false;
  public isSavingWarehouse = false;
  public isSavingLocations = false;

  // Listas de datos
  public warehouses: WarehouseInterface[] = [];
  public activeWarehouse: WarehouseInterface | null = null;
  public locations: WarehouseLocationInterface[] = [];
  public filteredLocations: WarehouseLocationInterface[] = [];
  
  // Filtros de ubicación
  public locationSearchQuery = '';

  // Control de Modales / Cajones
  public isWarehouseModalVisible = false;
  public isLocationsDrawerVisible = false;
  public isEditingWarehouse = false;

  // Formularios Reactivos
  public warehouseForm!: FormGroup;
  
  // Variables del Generador por Lotes
  public isBatchGeneratorOpen = false;
  public batchAisles = '';      // Pasillos (ej: A, B)
  public batchRacks = '';        // Racks (ej: 01, 02, 03)
  public batchShelves = '';      // Estantes (ej: 1, 2)
  public batchSector = '';       // Sector general (ej: Carga General)
  public previewLocations: WarehouseLocationInterface[] = [];

  // Formulario de Ubicación Única
  public singleLocationAisle = '';
  public singleLocationSector = '';
  public singleLocationRack = '';
  public singleLocationShelf = '';

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private _warehousesService: WarehousesService,
    private _sessionService: SessionService
  ) { }

  ngOnInit(): void {
    const company = this._sessionService.getCompany();
    this.companyUuid = company.cmp_uuid;
    this.loadWarehouses();

    this.initWarehouseForm();
  }

  // --- LOGICA DE DEPÓSITOS ---

  private initWarehouseForm(): void {
    this.warehouseForm = this.fb.group({
      war_uuid: [null],
      cmp_uuid: [this.companyUuid, [Validators.required]],
      war_name: ['', [Validators.required, Validators.minLength(3)]],
      war_address: ['', [Validators.required]],
      war_active: [true]
    });
  }

  public loadWarehouses(): void {
    if (!this.companyUuid) return;
    this.isLoadingWarehouses = true;
    this._warehousesService.getWarehouses(this.companyUuid).subscribe({
      next: (res) => {
        this.warehouses = res.data || [];
        this.isLoadingWarehouses = false;
      },
      error: (err) => {
        console.error('Error al cargar depósitos:', err);
        this.message.error('No se pudieron cargar los depósitos.');
        this.isLoadingWarehouses = false;
      }
    });
  }

  public openCreateWarehouseModal(): void {
    this.isEditingWarehouse = false;
    this.warehouseForm.reset({
      war_uuid: null,
      cmp_uuid: this.companyUuid,
      war_name: '',
      war_address: '',
      war_active: true
    });
    this.isWarehouseModalVisible = true;
  }

  public openEditWarehouseModal(warehouse: WarehouseInterface): void {
    this.isEditingWarehouse = true;
    this.warehouseForm.reset({
      war_uuid: warehouse.war_uuid,
      cmp_uuid: warehouse.cmp_uuid,
      war_name: warehouse.war_name,
      war_address: warehouse.war_address,
      war_active: warehouse.war_active
    });
    this.isWarehouseModalVisible = true;
  }

  public handleWarehouseModalCancel(): void {
    this.isWarehouseModalVisible = false;
  }

  public submitWarehouse(): void {
    if (this.warehouseForm.invalid) {
      Object.values(this.warehouseForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isSavingWarehouse = true;
    const formVal = this.warehouseForm.value;

    if (this.isEditingWarehouse) {
      this._warehousesService.updateWarehouse(formVal).subscribe({
        next: (res) => {
          this.message.success('Depósito actualizado con éxito.');
          this.loadWarehouses();
          this.isWarehouseModalVisible = false;
          this.isSavingWarehouse = false;
        },
        error: (err) => {
          this.message.error('Error al actualizar el depósito.');
          this.isSavingWarehouse = false;
        }
      });
    } else {
      this._warehousesService.saveWarehouse(formVal).subscribe({
        next: (res) => {
          this.message.success('Depósito creado con éxito.');
          this.loadWarehouses();
          this.isWarehouseModalVisible = false;
          this.isSavingWarehouse = false;
        },
        error: (err) => {
          this.message.error('Error al crear el depósito.');
          this.isSavingWarehouse = false;
        }
      });
    }
  }

  // --- LOGICA DE UBICACIONES (WMS) ---

  public openLocationsDrawer(warehouse: WarehouseInterface): void {
    this.activeWarehouse = warehouse;
    this.locationSearchQuery = '';
    this.clearBatchGenerator();
    this.clearSingleLocationForm();
    this.isLocationsDrawerVisible = true;
    this.loadLocations();
  }

  public closeLocationsDrawer(): void {
    this.isLocationsDrawerVisible = false;
    this.activeWarehouse = null;
    this.locations = [];
    this.filteredLocations = [];
  }

  public loadLocations(): void {
    if (!this.activeWarehouse) return;
    this.isLoadingLocations = true;
    this._warehousesService.getLocations(this.activeWarehouse.war_uuid).subscribe({
      next: (res) => {
        this.locations = res.data || [];
        this.applyLocationFilters();
        this.isLoadingLocations = false;
      },
      error: (err) => {
        console.error('Error al cargar ubicaciones:', err);
        this.message.error('No se pudieron cargar las ubicaciones físicas.');
        this.isLoadingLocations = false;
      }
    });
  }

  public applyLocationFilters(): void {
    if (!this.locationSearchQuery.trim()) {
      this.filteredLocations = [...this.locations];
      return;
    }

    const query = this.locationSearchQuery.toLowerCase();
    this.filteredLocations = this.locations.filter(loc => {
      const matchCode = loc.warl_bincode.toLowerCase().includes(query);
      const matchAisle = loc.warl_aisle?.toLowerCase().includes(query) || false;
      const matchSector = loc.warl_sector?.toLowerCase().includes(query) || false;
      const matchRack = loc.warl_rack?.toLowerCase().includes(query) || false;
      const matchShelf = loc.warl_shelf?.toLowerCase().includes(query) || false;
      return matchCode || matchAisle || matchSector || matchRack || matchShelf;
    });
  }

  public deleteLocation(location: WarehouseLocationInterface): void {
    if (!this.activeWarehouse) return;
    this._warehousesService.deleteLocation(this.activeWarehouse.war_uuid, location.warl_uuid).subscribe({
      next: () => {
        this.message.success(`Ubicación ${location.warl_bincode} eliminada.`);
        this.loadLocations();
      },
      error: (err) => {
        this.message.error('No se pudo eliminar la ubicación.');
      }
    });
  }

  // --- GENERADOR POR LOTES (BATCH GENERATOR) ---

  public toggleBatchGenerator(): void {
    this.isBatchGeneratorOpen = !this.isBatchGeneratorOpen;
    if (!this.isBatchGeneratorOpen) {
      this.clearBatchGenerator();
    }
  }

  public clearBatchGenerator(): void {
    this.batchAisles = '';
    this.batchRacks = '';
    this.batchShelves = '';
    this.batchSector = '';
    this.previewLocations = [];
  }

  public previewBatchLocations(): void {
    if (!this.activeWarehouse) return;
    
    // Validar mínimos campos
    if (!this.batchAisles.trim() && !this.batchRacks.trim() && !this.batchShelves.trim()) {
      this.message.warning('Debes ingresar al menos un parámetro (Pasillo, Rack o Estante) para previsualizar.');
      return;
    }

    const aisles = this.batchAisles.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const racks = this.batchRacks.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const shelves = this.batchShelves.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    const parsedAisles = aisles.length > 0 ? aisles : [''];
    const parsedRacks = racks.length > 0 ? racks : [''];
    const parsedShelves = shelves.length > 0 ? shelves : [''];

    const previewList: WarehouseLocationInterface[] = [];

    parsedAisles.forEach(aisle => {
      parsedRacks.forEach(rack => {
        parsedShelves.forEach(shelf => {
          // Generar código único: DEP - PASILLO - RACK - SHELF
          const parts: string[] = [];
          if (aisle) parts.push(`P${aisle}`);
          if (rack) parts.push(`R${rack}`);
          if (shelf) parts.push(`N${shelf}`);
          
          const binCode = parts.join('-');
          if (binCode) {
            previewList.push({
              warl_uuid: 'preview-' + Math.random().toString(36).substr(2, 9),
              war_uuid: this.activeWarehouse!.war_uuid,
              cmp_uuid: this.companyUuid || '',
              warl_aisle: aisle || undefined,
              warl_sector: this.batchSector.trim() || undefined,
              warl_rack: rack || undefined,
              warl_shelf: shelf || undefined,
              warl_bincode: binCode,
              warl_active: true,
              warl_createdat: new Date(),
              warl_updatedat: new Date()
            });
          }
        });
      });
    });

    this.previewLocations = previewList;
    if (this.previewLocations.length === 0) {
      this.message.warning('No se pudo generar ninguna combinación de ubicación.');
    } else {
      this.message.info(`Previsualizando ${this.previewLocations.length} combinaciones.`);
    }
  }

  public saveBatchLocations(): void {
    if (!this.activeWarehouse || this.previewLocations.length === 0) return;

    this.isSavingLocations = true;
    this._warehousesService.saveLocationsBatch(this.activeWarehouse.war_uuid, this.previewLocations).subscribe({
      next: (res) => {
        this.message.success(`¡Éxito! Se generaron y guardaron ${res.count || this.previewLocations.length} ubicaciones.`);
        this.loadLocations();
        this.clearBatchGenerator();
        this.isBatchGeneratorOpen = false;
        this.isSavingLocations = false;
      },
      error: (err) => {
        console.error('Error al guardar lote de ubicaciones:', err);
        this.message.error('No se pudo guardar el lote de ubicaciones.');
        this.isSavingLocations = false;
      }
    });
  }

  // --- CARGA DE UBICACIÓN ÚNICA ---

  public clearSingleLocationForm(): void {
    this.singleLocationAisle = '';
    this.singleLocationSector = '';
    this.singleLocationRack = '';
    this.singleLocationShelf = '';
  }

  public saveSingleLocation(): void {
    if (!this.activeWarehouse) return;

    if (!this.singleLocationAisle.trim() && !this.singleLocationRack.trim() && !this.singleLocationShelf.trim()) {
      this.message.warning('Debes ingresar al menos Pasillo, Estantería o Nivel para guardar.');
      return;
    }

    const parts: string[] = [];
    const aisle = this.singleLocationAisle.trim();
    const rack = this.singleLocationRack.trim();
    const shelf = this.singleLocationShelf.trim();

    if (aisle) parts.push(`P${aisle}`);
    if (rack) parts.push(`R${rack}`);
    if (shelf) parts.push(`N${shelf}`);

    const binCode = parts.join('-');

    // Evitar códigos repetidos en vivo
    if (this.locations.some(l => l.warl_bincode.toLowerCase() === binCode.toLowerCase())) {
      this.message.error(`La ubicación con código ${binCode} ya existe en este depósito.`);
      return;
    }

    const payload: WarehouseLocationInterface = {
      warl_uuid: '',
      war_uuid: this.activeWarehouse.war_uuid,
      cmp_uuid: this.companyUuid || '',
      warl_aisle: aisle || undefined,
      warl_sector: this.singleLocationSector.trim() || undefined,
      warl_rack: rack || undefined,
      warl_shelf: shelf || undefined,
      warl_bincode: binCode,
      warl_active: true,
      warl_createdat: new Date(),
      warl_updatedat: new Date()
    };

    this.isSavingLocations = true;
    this._warehousesService.saveLocation(payload).subscribe({
      next: () => {
        this.message.success(`Ubicación ${binCode} creada con éxito.`);
        this.loadLocations();
        this.clearSingleLocationForm();
        this.isSavingLocations = false;
      },
      error: (err) => {
        this.message.error('No se pudo crear la ubicación.');
        this.isSavingLocations = false;
      }
    });
  }
}
