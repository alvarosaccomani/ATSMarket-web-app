import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

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
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { CustomersService } from '../../core/services/customers.service';
import { OrdersService } from '../../core/services/orders.service';
import { SessionService } from '../../core/services/session.service';
import { CustomerInterface } from '../../core/interfaces/customer/customer.interface';
import { OrderInterface } from '../../core/interfaces/order/order.interface';

// Modelo de datos del cliente enriquecido para la vista
export interface CustomerOrder {
  order_number: string;
  date: Date;
  total: number;
  status: string;
}

export interface CustomerViewModel {
  cus_uuid: string;
  cus_name: string;
  cus_email: string;
  cus_phone: string;
  cus_document: string; // DNI o CUIT deducido
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
    NzEmptyModule,
    NzSpinModule
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit {

  public allCustomers: CustomerViewModel[] = [];
  public filteredCustomers: CustomerViewModel[] = [];
  public searchTerm: string = '';
  public isLoading: boolean = true;
  public companyName: string = '';

  // Drawer Control
  public selectedCustomer: CustomerViewModel | null = null;
  public isDrawerVisible = false;

  constructor(
    private _customersService: CustomersService,
    private _ordersService: OrdersService,
    private _sessionService: SessionService
  ) { }

  ngOnInit(): void {
    const company = this._sessionService.getCompany();
    if (company && company.cmp_uuid) {
      this.companyName = company.cmp_name || 'Mi Tienda';
      this.loadRealData(company.cmp_uuid);
    } else {
      this.isLoading = false;
    }
  }

  // --- LOGICA DE DATOS DESDE API ---

  private loadRealData(companyUuid: string): void {
    this.isLoading = true;
    forkJoin({
      customersRes: this._customersService.getCustomers(),
      ordersRes: this._ordersService.getOrders(companyUuid)
    }).subscribe({
      next: (results) => {
        const customersList = results.customersRes?.data || [];
        const ordersList = results.ordersRes?.data || [];

        this.processCustomersAndOrders(customersList, ordersList);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al recuperar datos para el directorio de clientes:', err);
        this.isLoading = false;
      }
    });
  }

  private processCustomersAndOrders(customers: CustomerInterface[], orders: OrderInterface[]): void {
    const companyOrders = orders || [];
    
    // Agrupar órdenes por cliente
    const ordersByCustomer: { [cus_uuid: string]: OrderInterface[] } = {};
    companyOrders.forEach(order => {
      if (order.cus_uuid) {
        if (!ordersByCustomer[order.cus_uuid]) {
          ordersByCustomer[order.cus_uuid] = [];
        }
        ordersByCustomer[order.cus_uuid].push(order);
      }
    });

    this.allCustomers = customers.map(c => {
      const clientOrders = ordersByCustomer[c.cus_uuid] || [];
      
      // Calcular métricas reales de compras en este comercio
      const totalSpent = clientOrders.reduce((acc, o) => acc + (o.ord_total || 0), 0);
      const totalOrders = clientOrders.length;
      
      // Obtener fecha del último pedido
      let lastOrderDate: Date | null = null;
      if (clientOrders.length > 0) {
        const sortedOrders = [...clientOrders].sort((a, b) => {
          const dateA = a.ord_createdat ? new Date(a.ord_createdat).getTime() : 0;
          const dateB = b.ord_createdat ? new Date(b.ord_createdat).getTime() : 0;
          return dateB - dateA;
        });
        lastOrderDate = sortedOrders[0].ord_createdat ? new Date(sortedOrders[0].ord_createdat) : null;
      }

      // Mapear historial detallado
      const orderHistory: CustomerOrder[] = clientOrders.map(o => ({
        order_number: `#PED-${o.ord_ordernumber}`,
        date: o.ord_createdat ? new Date(o.ord_createdat) : new Date(),
        total: o.ord_total || 0,
        status: o.ords_uuid
      })).sort((a, b) => b.date.getTime() - a.date.getTime());

      // Segmentación dinámica: Mayorista (B2B) si tiene 5+ compras o gastó $100k+, sino Minorista (B2C)
      const type = (totalOrders >= 5 || totalSpent >= 100000) ? 'B2B' : 'B2C';

      // Deducción del número de identificación para mantener la consistencia estética
      const numSeed = c.cus_phone ? c.cus_phone.replace(/\D/g, '') : c.cus_uuid.replace(/\D/g, '');
      const mockDocNum = numSeed.substring(0, 8).padEnd(8, '4');
      const document = type === 'B2B' ? `30-${mockDocNum}-8` : `20-${mockDocNum}-4`;

      return {
        cus_uuid: c.cus_uuid,
        cus_name: c.cus_fullname || 'Cliente Registrado',
        cus_email: c.cus_email || 'Sin Email',
        cus_phone: c.cus_phone || 'Sin Teléfono',
        cus_document: document,
        cus_type: type,
        total_orders: totalOrders,
        total_spent: totalSpent,
        last_order_date: lastOrderDate,
        order_history: orderHistory
      };
    });

    // Ordenar los clientes por volumen de gasto (LTV) descendente
    this.allCustomers.sort((a, b) => b.total_spent - a.total_spent);
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

  public openCustomerProfile(customer: CustomerViewModel): void {
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
      case 'SHIPPED': return 'orange'; // Cambiado a orange para consistencia con Vista de Reparto (En camino)
      case 'DELIVERED': return 'green'; // Cambiado a green para consistencia con Vista de Reparto (Entregado)
      case 'CANCELLED': return 'red';
      default: return 'default';
    }
  }

  public getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'PROCESSING': return 'Preparando';
      case 'SHIPPED': return 'En Camino';
      case 'DELIVERED': return 'Entregado';
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
}
