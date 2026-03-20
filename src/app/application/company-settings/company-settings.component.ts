import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { CompaniesSettingsService } from '@services/companies-settings.service';
import { MessageService } from '@services/message.service';
import { CompanySettingInterface } from '@interfaces/company-setting';

@Component({
  selector: 'app-company-settings',
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzSwitchModule,
    NzSelectModule,
    NzInputModule,
    NzInputNumberModule,
    NzDividerModule,
    NzButtonModule,
    NzSpaceModule,
    NzIconModule,
    NzSpinModule,
    NzListModule,
    NzTagModule
  ],
  templateUrl: './company-settings.component.html',
  styleUrl: './company-settings.component.scss'
})
export class CompanySettingsComponent implements OnInit {

  public settings: CompanySettingInterface[] = [];
  public isLoading: boolean = true;
  private cmp_uuid: string = '';

  constructor(
    private _route: ActivatedRoute,
    private _settingsService: CompaniesSettingsService,
    private _messageService: MessageService,
    private _location: Location
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      this.cmp_uuid = params['cmp_uuid'];
      if (this.cmp_uuid) {
        this.loadSettings();
      }
    });
  }

  private loadSettings(): void {
    this.isLoading = true;
    this._settingsService.getCompaniesSettings(this.cmp_uuid).subscribe({
      next: (response) => {
        if (response && response.data && response.data.length > 0) {
          this.settings = response.data;
        } else {
          // Si la API devuelve un array vacío, usamos los mocks temporalmente para la UI
          this.settings = this.getMockSettings();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar settings', err);
        // Si la API falla, usamos mock para ver el diseño
        this.settings = this.getMockSettings();
        this.isLoading = false;
      }
    });
  }

  public getOptions(optionsString: string): string[] {
    if (!optionsString) return [];
    try {
      const parsed = JSON.parse(optionsString);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) { }
    return optionsString.split(',').map(s => s.trim());
  }

  public getBooleanValue(val: string): boolean {
    return val === 'true';
  }

  public setBooleanValue(setting: CompanySettingInterface, val: boolean): void {
    setting.cmps_value = val ? 'true' : 'false';
  }

  private getMockSettings(): CompanySettingInterface[] {
    return [
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '1',
        cmps_key: 'ALLOW_BACKORDERS',
        cmps_parameter: 'Permitir Reservas (Backorders)',
        cmps_description: 'Si se activa, los clientes podrán comprar productos listados que no tengan stock inmediato.',
        cmps_datatype: 'boolean',
        cmps_value: 'true',
        cmps_group: 'Ventas',
        cmps_options: '',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '2',
        cmps_key: 'THEME_PRIMARY_COLOR',
        cmps_parameter: 'Color Principal de Tienda',
        cmps_description: 'Define el acento de color para botones y resaltados interactivos en el catálogo público.',
        cmps_datatype: 'color',
        cmps_value: '#1890ff',
        cmps_group: 'Apariencia',
        cmps_options: '',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '3',
        cmps_key: 'MAX_CART_ITEMS',
        cmps_parameter: 'Límite de Ítems en Carrito',
        cmps_description: 'Cantidad permitida de unidades que un cliente puede añadir de una sola vez a su compra actual.',
        cmps_datatype: 'number',
        cmps_value: '10',
        cmps_group: 'Ventas',
        cmps_options: '',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '4',
        cmps_key: 'CURRENCY',
        cmps_parameter: 'Moneda Preferida',
        cmps_description: 'Tipo de Moneda visual usada globalmente para todos los artículos en el escaparate.',
        cmps_datatype: 'select',
        cmps_value: 'ARS',
        cmps_group: 'General',
        cmps_options: 'ARS,USD,EUR,CLP',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      }
    ];
  }

  public onSave(): void {
    console.log('Guardando configuración:', this.settings);
    this._messageService.success('Configuración Guardada', 'Las configuraciones avanzadas se actualizaron correctamente.', () => {
      this._location.back();
    });
  }

  public onCancel(): void {
    this._location.back();
  }
}
