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
import { NzEmptyModule } from 'ng-zorro-antd/empty';

// Tipado mock para Clientes
export interface CustomerOrder {
  order_number: string;
  date: Date;
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'CANCELLED';
}

export interface Customer {
  cus_uuid: string;
  cus_name: string;
  cus_email: string;
  cus_phone: string;
  cus_document: string; // DNI o CUIT
  cus_type: 'B2B' | 'B2C';
  total_orders: number;
  total_spent: number;
  last_order_date: Date | null;
  order_history: CustomerOrder[];
}

@Component({
  selector: 'app-customers',
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
    NzAvatarModule,
    NzEmptyModule
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit {

  public allCustomers: Customer[] = [];
  public filteredCustomers: Customer[] = [];
  public searchTerm: string = '';

  // Drawer Control
  public selectedCustomer: Customer | null = null;
  public isDrawerVisible = false;

  constructor() { }

  ngOnInit(): void {
    this.generateMockCustomers();
    this.applyFilters();
  }

  // --- FILTROS Y BUSQUEDA ---

  public applyFilters(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCustomers = [...this.allCustomers];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredCustomers = this.allCustomers.filter(c =>
      c.cus_name.toLowerCase().includes(term) ||
      c.cus_email.toLowerCase().includes(term) ||
      c.cus_phone.includes(term)
    );
  }

  // --- DRAWER (PERFIL CLIENTE) ---

  public openCustomerProfile(customer: Customer): void {
    this.selectedCustomer = customer;
    this.isDrawerVisible = true;
  }

  public closeDrawer(): void {
    this.isDrawerVisible = false;
    setTimeout(() => this.selectedCustomer = null, 300);
  }

  // --- OBTENER ETIQUETAS VISUALES ---

  public getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'gold';
      case 'PROCESSING': return 'blue';
      case 'SHIPPED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'default';
    }
  }

  public getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'PROCESSING': return 'Preparando';
      case 'SHIPPED': return 'Despachado';
      case 'CANCELLED': return 'Cancelado';
      default: return 'Desconocido';
    }
  }

  public getSegmentColor(type: string): string {
    return type === 'B2B' ? 'purple' : 'geekblue';
  }

  public getSegmentLabel(type: string): string {
    return type === 'B2B' ? 'Mayorista' : 'Minorista';
  }

  // --- MOCK DATA ---

  private generateMockOrders(count: number): CustomerOrder[] {
    const orders: CustomerOrder[] = [];
    const statuses: ('PENDING' | 'PROCESSING' | 'SHIPPED' | 'CANCELLED')[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'CANCELLED'];

    for (let i = 0; i < count; i++) {
      orders.push({
        order_number: `#PED-100${Math.floor(Math.random() * 90) + 10}`,
        date: new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 30))),
        total: Math.floor(Math.random() * 50000) + 5000,
        status: statuses[Math.floor(Math.random() * statuses.length)]
      });
    }
    // Ordenar de más reciente a más antiguo
    orders.sort((a, b) => b.date.getTime() - a.date.getTime());
    return orders;
  }

  private generateMockCustomers(): void {
    this.allCustomers = [
      {
        cus_uuid: 'c-1',
        cus_name: 'Santería La Milagrosa',
        cus_email: 'compras@lamilagrosa.com.ar',
        cus_phone: '+54 11 4455-6677',
        cus_document: '30-71234567-8',
        cus_type: 'B2B',
        total_orders: 15,
        total_spent: 850000,
        last_order_date: new Date(),
        order_history: this.generateMockOrders(15)
      },
      {
        cus_uuid: 'c-2',
        cus_name: 'María Carmen López',
        cus_email: 'maricarmen.lopez@gmail.com',
        cus_phone: '+54 223 555-1234',
        cus_document: '27-18345678-4',
        cus_type: 'B2C',
        total_orders: 2,
        total_spent: 45000,
        last_order_date: new Date(new Date().setDate(new Date().getDate() - 5)),
        order_history: this.generateMockOrders(2)
      },
      {
        cus_uuid: 'c-3',
        cus_name: 'Parroquia Nuestra Señora de la Paz',
        cus_email: 'secretaria@paz.org.ar',
        cus_phone: '+54 11 2233-4455',
        cus_document: '30-55555555-5',
        cus_type: 'B2B',
        total_orders: 8,
        total_spent: 420000,
        last_order_date: new Date(new Date().setDate(new Date().getDate() - 15)),
        order_history: this.generateMockOrders(8)
      },
      {
        cus_uuid: 'c-4',
        cus_name: 'Juan Ignacio Pérez',
        cus_email: 'jiperez99@hotmail.com',
        cus_phone: '+54 351 999-8888',
        cus_document: '20-35678912-1',
        cus_type: 'B2C',
        total_orders: 1,
        total_spent: 15500,
        last_order_date: new Date(new Date().setDate(new Date().getDate() - 25)),
        order_history: this.generateMockOrders(1)
      },
      {
        cus_uuid: 'c-5',
        cus_name: 'Librería Católica El Buen Pastor',
        cus_email: 'ventas@elbuenpastor.com',
        cus_phone: '+54 341 456-7890',
        cus_document: '30-66666666-6',
        cus_type: 'B2B',
        total_orders: 0,
        total_spent: 0,
        last_order_date: null,
        order_history: []
      }
    ];
  }
}
