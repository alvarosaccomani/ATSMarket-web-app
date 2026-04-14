import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
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
  public groupedSettings: { groupName: string, items: CompanySettingInterface[] }[] = [];
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
        const dbSettings: CompanySettingInterface[] = response?.data || [];
        this.mergeSettings(dbSettings);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar settings', err);
        this.mergeSettings([]);
        this.isLoading = false;
      }
    });
  }

  private mergeSettings(dbSettings: CompanySettingInterface[]): void {
    const schema = this.getSettingsSchema();
    this.settings = schema.map(schemaItem => {
      // Buscar si el ajuste ya existe guardado en la Base de Datos para esta empresa
      const existing = dbSettings.find(db => db.cmps_key === schemaItem.cmps_key);

      if (existing) {
        // Si existe, combinamos su valor real en DB pero actualizamos textos descriptivos por si cambiaron en el frontend
        return {
          ...existing,
          cmps_parameter: schemaItem.cmps_parameter,
          cmps_description: schemaItem.cmps_description,
          cmps_group: schemaItem.cmps_group,
          cmps_options: schemaItem.cmps_options
        };
      }

      // Si no existe (es una config nueva agregada por primera vez al hardcode), devolvemos el valor por defecto del esquema
      return { ...schemaItem };
    });

    this.groupSettingsByCategory();
  }

  private groupSettingsByCategory(): void {
    const groupsMap = new Map<string, CompanySettingInterface[]>();

    for (const setting of this.settings) {
      const group = setting.cmps_group || 'General';
      if (!groupsMap.has(group)) {
        groupsMap.set(group, []);
      }
      groupsMap.get(group)!.push(setting);
    }

    this.groupedSettings = Array.from(groupsMap.entries()).map(([groupName, items]) => ({
      groupName,
      items
    }));
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

  private getSettingsSchema(): CompanySettingInterface[] {
    return [
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '1',
        cmps_key: 'search_filter_mode',
        cmps_parameter: 'Rubros y Categorias',
        cmps_description: 'Que Rubros y Categorias se mostraran en el arbol de filtro.',
        cmps_datatype: 'select',
        cmps_value: 'GLOBAL',
        cmps_group: 'Busqueda',
        cmps_options: '["GLOBAL", "LOCAL"]',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },


      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '2b',
        cmps_key: 'THEME_NAVBAR_COLOR',
        cmps_parameter: 'Color de Barra de Navegación',
        cmps_description: 'Define el color de fondo para la cabecera (Navbar) en el catálogo público.',
        cmps_datatype: 'color',
        cmps_value: '#001529',
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

      // --- GRUPO: TIENDA - HOME ---
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '10',
        cmps_key: 'HOME_BANNER_SHOW',
        cmps_parameter: 'Mostrar Banner Principal',
        cmps_description: 'Habilitar o deshabilitar la sección del banner/hero en la página de inicio.',
        cmps_datatype: 'boolean',
        cmps_value: 'true',
        cmps_group: 'Tienda - Home',
        cmps_options: '',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '12',
        cmps_key: 'HOME_BANNER_DESCRIPTION',
        cmps_parameter: 'Descripción Banner (Marketing)',
        cmps_description: 'Texto promocional o slogan que aparece resaltado en el banner principal.',
        cmps_datatype: 'string',
        cmps_value: 'Artículos de Fe y Devoción seleccionados desde Luján.',
        cmps_group: 'Tienda - Home',
        cmps_options: '',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },

      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '14',
        cmps_key: 'HOME_BANNER_BUTTON_TEXT',
        cmps_parameter: 'Texto Botón Banner',
        cmps_description: 'Etiqueta del botón de acción en el banner principal.',
        cmps_datatype: 'string',
        cmps_value: 'Explorar Catálogo',
        cmps_group: 'Tienda - Home',
        cmps_options: '',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '15',
        cmps_key: 'HOME_CATEGORIES_TITLE',
        cmps_parameter: 'Título de Categorías',
        cmps_description: 'Encabezado de la sección de categorías en el inicio.',
        cmps_datatype: 'string',
        cmps_value: 'Nuestras Categorías Principales',
        cmps_group: 'Tienda - Home',
        cmps_options: '',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '16',
        cmps_key: 'HOME_FEATURED_TITLE',
        cmps_parameter: 'Título de Productos Destacados',
        cmps_description: 'Encabezado de la sección de productos destacados o de la semana.',
        cmps_datatype: 'string',
        cmps_value: 'Productos de la Semana',
        cmps_group: 'Tienda - Home',
        cmps_options: '',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '17',
        cmps_key: 'HOME_FEATURED_COUNT',
        cmps_parameter: 'Cantidad de Destacados',
        cmps_description: 'Número de productos a mostrar en la sección destacada del inicio.',
        cmps_datatype: 'number',
        cmps_value: '4',
        cmps_group: 'Tienda - Home',
        cmps_options: '',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '18',
        cmps_key: 'HOME_INFO_BLOCK_1_TITLE',
        cmps_parameter: 'Info 1: Título',
        cmps_description: 'Título del primer bloque informativo/beneficio.',
        cmps_datatype: 'string',
        cmps_value: 'Auténtica Fe',
        cmps_group: 'Tienda - Home',
        cmps_options: '',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '19',
        cmps_key: 'HOME_INFO_BLOCK_1_DESC',
        cmps_parameter: 'Info 1: Descripción',
        cmps_description: 'Descripción del primer bloque informativo.',
        cmps_datatype: 'string',
        cmps_value: 'Artículos seleccionados desde el corazón de Luján.',
        cmps_group: 'Tienda - Home',
        cmps_options: '',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '20',
        cmps_key: 'HOME_INFO_BLOCK_1_ICON',
        cmps_parameter: 'Info 1: Icono',
        cmps_description: 'Icono de Ant Design para el bloque 1.',
        cmps_datatype: 'string',
        cmps_value: 'environment',
        cmps_group: 'Tienda - Home',
        cmps_options: '',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '21',
        cmps_key: 'HOME_INFO_BLOCK_2_TITLE',
        cmps_parameter: 'Info 2: Título',
        cmps_description: 'Título del segundo bloque informativo.',
        cmps_datatype: 'string',
        cmps_value: 'Consulta Discreta',
        cmps_group: 'Tienda - Home',
        cmps_options: '',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '22',
        cmps_key: 'HOME_INFO_BLOCK_2_DESC',
        cmps_parameter: 'Info 2: Descripción',
        cmps_description: 'Descripción del segundo bloque informativo.',
        cmps_datatype: 'string',
        cmps_value: 'Precios disponibles instantáneamente al solicitarlos.',
        cmps_group: 'Tienda - Home',
        cmps_options: '',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '23',
        cmps_key: 'HOME_INFO_BLOCK_2_ICON',
        cmps_parameter: 'Info 2: Icono',
        cmps_description: 'Icono de Ant Design para el bloque 2.',
        cmps_datatype: 'string',
        cmps_value: 'tag',
        cmps_group: 'Tienda - Home',
        cmps_options: '',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '24',
        cmps_key: 'HOME_INFO_BLOCK_3_TITLE',
        cmps_parameter: 'Info 3: Título',
        cmps_description: 'Título del tercer bloque informativo.',
        cmps_datatype: 'string',
        cmps_value: 'Envío Rápido',
        cmps_group: 'Tienda - Home',
        cmps_options: '',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '25',
        cmps_key: 'HOME_INFO_BLOCK_3_DESC',
        cmps_parameter: 'Info 3: Descripción',
        cmps_description: 'Descripción del tercer bloque informativo.',
        cmps_datatype: 'string',
        cmps_value: 'Despachamos tu pedido en menos de 24 horas.',
        cmps_group: 'Tienda - Home',
        cmps_options: '',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },
      {
        cmp_uuid: this.cmp_uuid,
        cmps_uuid: '26',
        cmps_key: 'HOME_INFO_BLOCK_3_ICON',
        cmps_parameter: 'Info 3: Icono',
        cmps_description: 'Icono de Ant Design para el bloque 3.',
        cmps_datatype: 'string',
        cmps_value: 'rocket',
        cmps_group: 'Tienda - Home',
        cmps_options: '',
        cmps_updatedat: new Date(),
        cmps_createdat: new Date()
      },
    ];
  }

  public onSave(): void {
    console.log('Guardando configuración:', this.settings);
    this.isLoading = true;

    // Preparamos las peticiones para guardar cada configuración
    const saveRequests = this.settings.map(setting => {
      const payload = { ...setting };
      payload.cmp_uuid = this.cmp_uuid;

      // Si el cmps_uuid es solo un número (placeholder del esquema inicial),
      // lo eliminamos para que el backend lo trate como una nueva inserción.
      // Caso contrario, usamos el método de actualización.
      const isNew = !payload.cmps_uuid || payload.cmps_uuid.length < 5;

      if (isNew) {
        delete (payload as any).cmps_uuid;
        return this._settingsService.saveCompanySetting(payload);
      } else {
        return this._settingsService.updateCompanySetting(payload);
      }
    });

    if (saveRequests.length === 0) {
      this.isLoading = false;
      this._messageService.warning('Sin cambios', 'No hay configuraciones para guardar.');
      return;
    }

    // Ejecutamos todas las peticiones en paralelo
    forkJoin(saveRequests).subscribe({
      next: (results) => {
        this.isLoading = false;
        this._messageService.success('Configuración Guardada', 'Las configuraciones se procesaron correctamente.', () => {
          this._location.back();
        });
      },
      error: (err) => {
        console.error('Error al procesar configuraciones', err);
        this.isLoading = false;
        this._messageService.error('Error al guardar', 'Hubo un problema al procesar los ajustes. Por favor, reintente.');
      }
    });
  }

  public onCancel(): void {
    this._location.back();
  }
}
