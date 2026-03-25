import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

// Tipado mock para Proveedores
export interface Supplier {
  sup_uuid: string;
  sup_company: string;
  sup_cuit: string;
  sup_category: string; // Rubro (ej. Textil, Orfebrería, Velas)
  sup_contact_name: string;
  sup_email: string;
  sup_phone: string;
  sup_address: string;
  sup_status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  total_purchases_ars: number; // Monto histórico que la tienda B2B compró a este proveedor
  last_purchase: Date | null;
}

@Component({
  selector: 'app-suppliers',
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
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.scss'
})
export class SuppliersComponent implements OnInit {

  public allSuppliers: Supplier[] = [];
  public filteredSuppliers: Supplier[] = [];
  public searchTerm: string = '';

  // Control del Drawer (Ficha Técnica)
  public selectedSupplier: Supplier | null = null;
  public isDrawerVisible = false;

  constructor() { }

  ngOnInit(): void {
    this.generateMockSuppliers();
    this.applyFilters();
  }

  // --- BUSCADOR ---

  public applyFilters(): void {
    if (!this.searchTerm.trim()) {
      this.filteredSuppliers = [...this.allSuppliers];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredSuppliers = this.allSuppliers.filter(s =>
      s.sup_company.toLowerCase().includes(term) ||
      s.sup_cuit.includes(term) ||
      s.sup_category.toLowerCase().includes(term) ||
      s.sup_contact_name.toLowerCase().includes(term)
    );
  }

  // --- DRAWER ---

  public openSupplierProfile(supplier: Supplier): void {
    this.selectedSupplier = supplier;
    this.isDrawerVisible = true;
  }

  public closeDrawer(): void {
    this.isDrawerVisible = false;
    setTimeout(() => this.selectedSupplier = null, 300);
  }

  // --- FORMATO Y ETIQUETAS ---

  public getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'INACTIVE': return 'red';
      case 'PENDING': return 'gold';
      default: return 'default';
    }
  }

  public getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Activo';
      case 'INACTIVE': return 'Inactivo';
      case 'PENDING': return 'En Revisión';
      default: return 'Desconocido';
    }
  }

  // --- MOCK DATA ---

  private generateMockSuppliers(): void {
    this.allSuppliers = [
      {
        sup_uuid: 's-100',
        sup_company: 'Fábrica de Velas San Marcos',
        sup_cuit: '30-71234567-8',
        sup_category: 'Cerería (Velas e Inciensos)',
        sup_contact_name: 'Marcos Alonso',
        sup_email: 'ventas@velassanmarcos.com.ar',
        sup_phone: '+54 11 4455-1234',
        sup_address: 'Av. Industrial 1234, Parque Patricios, CABA',
        sup_status: 'ACTIVE',
        total_purchases_ars: 2500000,
        last_purchase: new Date(new Date().setDate(new Date().getDate() - 5))
      },
      {
        sup_uuid: 's-101',
        sup_company: 'Orfebrería Litúrgica Luján',
        sup_cuit: '33-18345678-9',
        sup_category: 'Orfebrería y Metal',
        sup_contact_name: 'Carlos Ruiz',
        sup_email: 'cruiz@orfebrerialujan.com',
        sup_phone: '+54 2323 55-9988',
        sup_address: 'Calle San Martín 500, Luján, BA',
        sup_status: 'ACTIVE',
        total_purchases_ars: 5800000,
        last_purchase: new Date(new Date().setDate(new Date().getDate() - 15))
      },
      {
        sup_uuid: 's-102',
        sup_company: 'Textiles del Sagrado Corazón S.A.',
        sup_cuit: '30-99887766-5',
        sup_category: 'Indumentaria Litúrgica',
        sup_contact_name: 'Sofía Martínez',
        sup_email: 'info@textilessagrado.com',
        sup_phone: '+54 351 444-5555',
        sup_address: 'Bv. San Juan 1500, Córdoba',
        sup_status: 'PENDING',
        total_purchases_ars: 120000,
        last_purchase: new Date(new Date().setDate(new Date().getDate() - 45))
      },
      {
        sup_uuid: 's-103',
        sup_company: 'Importadora El Buen Pastor',
        sup_cuit: '30-11223344-5',
        sup_category: 'Imágenes Religiosas y Resina',
        sup_contact_name: 'Emilio Fernández',
        sup_email: 'importaciones@buenpastor.com.ar',
        sup_phone: '+54 11 3333-2222',
        sup_address: 'Zona Franca La Plata, BA',
        sup_status: 'INACTIVE',
        total_purchases_ars: 0,
        last_purchase: null
      }
    ];
  }
}
