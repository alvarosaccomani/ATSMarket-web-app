import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { FormsModule } from '@angular/forms';

import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../core/services/orders.service';
import { SessionService } from '../../core/services/session.service';
import { OrderInterface } from '../../core/interfaces/order/order.interface';
import { AddressesService } from '../../core/services/addresses.service';
import { AddressInterface } from '../../core/interfaces/address/address.interface';

@Component({
  selector: 'app-orders-received',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTabsModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzDrawerModule,
    NzDividerModule,
    NzDescriptionsModule,
    NzCardModule,
    NzAlertModule,
    NzInputModule,
    NzProgressModule
  ],
  templateUrl: './orders-received.component.html',
  styleUrl: './orders-received.component.scss'
})
export class OrdersReceivedComponent implements OnInit {

  // Lógica de Modo Repartidor
  public isDeliveryMode = false;
  public deliveryAddressesCache: { [adr_uuid: string]: AddressInterface } = {};
  public companyCoords: { lat: number; lng: number } | null = null;
  public companyName = '';

  // Drawer de Control de Carga (Checklist)
  public isChecklistVisible = false;
  public checklistOrder: OrderInterface | null = null;
  public checklistItems: { name: string; qty: number; checked: boolean }[] = [];

  // Drawer de Incidencias
  public isIncidentVisible = false;
  public incidentOrder: OrderInterface | null = null;
  public incidentReason = '';
  public incidentNotes = '';

  // Mock de Base de Datos Temporal
  public allOrders: OrderInterface[] = [];

  // Listas divididas para las pestañas
  public pendingOrders: OrderInterface[] = [];
  public processingOrders: OrderInterface[] = [];
  public shippedOrders: OrderInterface[] = [];
  public deliveredOrders: OrderInterface[] = [];

  // Control del Drawer Lateral (Vista de Detalles)
  public isDrawerVisible = false;
  public selectedOrder: OrderInterface | null = null;
  public selectedOrderAddress: AddressInterface | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private message: NzMessageService,
    private _ordersService: OrdersService,
    private _sessionService: SessionService,
    private _addressesService: AddressesService
  ) { }

  ngOnInit(): void {
    // Escuchar cambios de libreta de direcciones para encontrar el domicilio del pedido seleccionado
    this._addressesService.addresses$.pipe(takeUntil(this.destroy$)).subscribe(list => {
      if (this.selectedOrder) {
        this.selectedOrderAddress = list.find(a => a.adr_uuid === this.selectedOrder!.adr_uuid) || null;
      }
    });
    const company = this._sessionService.getCompany();
    if (company && company.cmp_uuid) {
      this._ordersService.getOrders(company.cmp_uuid).subscribe({
        next: (res: any) => {
          this.allOrders = res.data || [];
          this.filterOrdersIntoTabs();
        },
        error: (err: any) => {
          console.error('Error cargando ordenes:', err);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- LOGICA DE DATOS ---

  private filterOrdersIntoTabs(): void {
    this.pendingOrders = this.allOrders.filter(o => o.ord_status === 'PENDING');
    this.processingOrders = this.allOrders.filter(o => o.ord_status === 'PROCESSING');
    this.shippedOrders = this.allOrders.filter(o => o.ord_status === 'SHIPPED');
    this.deliveredOrders = this.allOrders.filter(o => o.ord_status === 'DELIVERED');
  }

  public getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'gold';
      case 'PROCESSING': return 'blue';
      case 'SHIPPED': return 'orange';
      case 'DELIVERED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'default';
    }
  }

  public getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'Nuevo (Pendiente)';
      case 'PROCESSING': return 'En Preparación';
      case 'SHIPPED': return 'Despachado / En Viaje';
      case 'DELIVERED': return 'Entregado';
      case 'CANCELLED': return 'Cancelado';
      default: return 'Desconocido';
    }
  }

  // --- ACCIONES DE ESTADO (KANBAN) ---

  public approvePayment(order: OrderInterface, event?: Event): void {
    if (event) event.stopPropagation();
    const idx = this.allOrders.findIndex(o => o.ord_uuid === order.ord_uuid);
    if (idx !== -1) {
      this.allOrders[idx].ord_status = 'PROCESSING';
      this.filterOrdersIntoTabs();
      this.message.success(`Pago Aprobado. Pedido ${order.ord_ordernumber} pasó a Preparación.`);
      this.isDrawerVisible = false;
    }
  }

  public rejectPayment(order: OrderInterface): void {
    const idx = this.allOrders.findIndex(o => o.ord_uuid === order.ord_uuid);
    if (idx !== -1) {
      this.allOrders[idx].ord_status = 'CANCELLED';
      this.filterOrdersIntoTabs();
      this.message.error(`Pago Rechazado. Pedido ${order.ord_ordernumber} fue cancelado.`);
      this.isDrawerVisible = false;
    }
  }

  public markAsShipped(order: OrderInterface, event: Event): void {
    event.stopPropagation();
    const idx = this.allOrders.findIndex(o => o.ord_uuid === order.ord_uuid);
    if (idx !== -1) {
      this.allOrders[idx].ord_status = 'SHIPPED';
      this.filterOrdersIntoTabs();
      this.message.success(`Pedido ${order.ord_ordernumber} marcado como Despachado.`);
    }
  }

  public markAsDelivered(order: OrderInterface, event?: Event): void {
    if (event) event.stopPropagation();
    const idx = this.allOrders.findIndex(o => o.ord_uuid === order.ord_uuid);
    if (idx !== -1) {
      this.allOrders[idx].ord_status = 'DELIVERED';
      this.filterOrdersIntoTabs();
      this.message.success(`Pedido ${order.ord_ordernumber} marcado como Entregado con éxito.`);
      this.isDrawerVisible = false;
    }
  }

  public saveTrackingNumber(order: OrderInterface, trackingNumber: string): void {
    const idx = this.allOrders.findIndex(o => o.ord_uuid === order.ord_uuid);
    if (idx !== -1) {
      this.allOrders[idx].ord_trackingnumber = trackingNumber;
      this.message.success(`Guía de Correo Postal actualizada: ${trackingNumber}`);
    }
  }

  // --- PARSEADORES DE DATOS DE ENVÍO ---

  public parseCustomerNotes(notes: string): any {
    if (!notes) return { shipping: '', payment: '', voucher: '', extraNotes: '' };
    
    let shipping = '';
    let payment = '';
    let voucher = '';
    let extraNotes = '';

    const shippingMatch = notes.match(/\[Envío:\s*([^\]]+)\]/);
    if (shippingMatch) {
      shipping = shippingMatch[1];
    }

    const paymentMatch = notes.match(/Método de pago:\s*([^.]+)/);
    if (paymentMatch) {
      payment = paymentMatch[1].trim();
    }

    const voucherMatch = notes.match(/Comprobante:\s*(\S+)/);
    if (voucherMatch) {
      voucher = voucherMatch[1].trim();
    }

    const parts = notes.split('|');
    if (parts.length > 2) {
      extraNotes = parts.slice(2).join('|').trim();
    }

    return {
      shipping: shipping || 'No especificado',
      payment: payment || 'No especificado',
      voucher: voucher || 'N/A',
      extraNotes: extraNotes
    };
  }

  public getDeliveryType(notes: string): { label: string, icon: string, color: string } {
    if (!notes) return { label: 'Correo', icon: 'global', color: 'blue' };
    if (notes.includes('Motomensajería Local')) {
      return { label: 'Moto', icon: 'car', color: 'cyan' };
    } else if (notes.includes('Correo Postal Nacional')) {
      return { label: 'Correo', icon: 'global', color: 'blue' };
    } else if (notes.includes('Retiro en el Local')) {
      return { label: 'Retiro', icon: 'shop', color: 'green' };
    } else if (notes.includes('Acordar con el Vendedor')) {
      return { label: 'Acordar', icon: 'message', color: 'orange' };
    }
    return { label: 'Correo', icon: 'global', color: 'blue' };
  }

  public getGoogleMapsLink(addr: AddressInterface): string {
    if (!addr) return '#';
    if (addr.adr_lat && addr.adr_lng) {
      return `https://www.google.com/maps/search/?api=1&query=${addr.adr_lat},${addr.adr_lng}`;
    }
    const query = `${addr.adr_address || ''}, ${addr.adr_city || ''}, ${addr.adr_province || ''}, Argentina`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  // --- CONTROL DEL DRAWER ---

  public openOrderDetails(order: OrderInterface): void {
    this.selectedOrder = order;
    this.selectedOrderAddress = null;
    this.isDrawerVisible = true;

    if (order.cus_uuid) {
      this._addressesService.getAddressesByCustomer(order.cus_uuid);
    }
  }

  public closeDrawer(): void {
    this.isDrawerVisible = false;
    setTimeout(() => {
      this.selectedOrder = null;
      this.selectedOrderAddress = null;
    }, 300); // Esperar la animación css
  }

  // --- SECCIÓN: MODO REPARTIDOR Y HOJA DE RUTA ---

  public toggleDeliveryMode(): void {
    this.isDeliveryMode = !this.isDeliveryMode;
    if (this.isDeliveryMode) {
      // Cargar coordenadas del comercio
      const company = this._sessionService.getCompany();
      if (company) {
        this.companyName = company.cmp_name || 'Mi Tienda';
        if (company.cmp_lat && company.cmp_lng) {
          this.companyCoords = {
            lat: parseFloat(company.cmp_lat),
            lng: parseFloat(company.cmp_lng)
          };
        }
      }
      
      // Cargar direcciones de todos los pedidos activos (PROCESSING, SHIPPED)
      const activeOrders = this.allOrders.filter(
        o => o.ord_status === 'PROCESSING' || o.ord_status === 'SHIPPED'
      );
      this.loadAddressesForDeliveries(activeOrders);
    }
  }

  public loadAddressesForDeliveries(orders: OrderInterface[]): void {
    orders.forEach(order => {
      if (order.adr_uuid && !this.deliveryAddressesCache[order.adr_uuid] && order.cus_uuid) {
        this._addressesService.fetchAddressesByCustomer(order.cus_uuid).subscribe({
          next: (res) => {
            if (res.success && res.data) {
              const matched = res.data.find((a: AddressInterface) => a.adr_uuid === order.adr_uuid);
              if (matched) {
                this.deliveryAddressesCache[order.adr_uuid] = matched;
              }
            }
          },
          error: (err) => console.error('Error fetching delivery address:', err)
        });
      }
    });
  }

  public getDistanceToOrder(order: OrderInterface): number | null {
    const addr = this.deliveryAddressesCache[order.adr_uuid];
    if (!addr || !addr.adr_lat || !addr.adr_lng || !this.companyCoords) {
      return null;
    }
    
    const lat1 = this.companyCoords.lat;
    const lon1 = this.companyCoords.lng;
    const lat2 = Number(addr.adr_lat);
    const lon2 = Number(addr.adr_lng);

    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  public getSortedRouteOrders(): OrderInterface[] {
    const deliveryOrders = this.allOrders.filter(o => {
      const isDeliveryStatus = o.ord_status === 'PROCESSING' || o.ord_status === 'SHIPPED';
      const isDeliveryType = o.ord_customernotes && (
        o.ord_customernotes.includes('Motomensajería Local') || 
        o.ord_customernotes.includes('Correo Postal Nacional')
      );
      return isDeliveryStatus && isDeliveryType;
    });

    return deliveryOrders.sort((a, b) => {
      const distA = this.getDistanceToOrder(a) ?? 9999;
      const distB = this.getDistanceToOrder(b) ?? 9999;
      return distA - distB;
    });
  }

  public getCompletedDeliveriesCount(): number {
    return this.allOrders.filter(o => 
      o.ord_status === 'DELIVERED' && 
      o.ord_customernotes && (
        o.ord_customernotes.includes('Motomensajería Local') || 
        o.ord_customernotes.includes('Correo Postal Nacional')
      )
    ).length;
  }

  public getTotalDeliveriesCount(): number {
    return this.allOrders.filter(o => 
      (o.ord_status === 'PROCESSING' || o.ord_status === 'SHIPPED' || o.ord_status === 'DELIVERED') &&
      o.ord_customernotes && (
        o.ord_customernotes.includes('Motomensajería Local') || 
        o.ord_customernotes.includes('Correo Postal Nacional')
      )
    ).length;
  }

  public getCashToCollectTotal(): number {
    return this.getSortedRouteOrders()
      .filter(o => o.ord_status === 'SHIPPED' && o.ord_customernotes.toLowerCase().includes('efectivo'))
      .reduce((acc, o) => acc + o.ord_total, 0);
  }

  // --- CONTROL DE CARGA (CHECKLIST) ---

  public startDeliveryWorkflow(order: OrderInterface, event?: Event): void {
    if (event) event.stopPropagation();
    this.checklistOrder = order;
    
    // Generar ítems simulados realistas
    this.checklistItems = this.getMockOrderItems(order.ord_uuid).map(item => ({
      ...item,
      checked: false
    }));
    
    this.isChecklistVisible = true;
  }

  public isChecklistComplete(): boolean {
    return this.checklistItems.every(i => i.checked);
  }

  public confirmLoadAndStartRoute(): void {
    if (!this.checklistOrder || !this.isChecklistComplete()) return;

    const idx = this.allOrders.findIndex(o => o.ord_uuid === this.checklistOrder!.ord_uuid);
    if (idx !== -1) {
      this.allOrders[idx].ord_status = 'SHIPPED';
      this.filterOrdersIntoTabs();
      this.message.success(`¡Carga verificada! Pedido #${this.checklistOrder.ord_ordernumber} en viaje.`);
      this.isChecklistVisible = false;
      this.checklistOrder = null;
    }
  }

  // --- CONTROL DE INCIDENCIAS ---

  public openIncidentWorkflow(order: OrderInterface, event?: Event): void {
    if (event) event.stopPropagation();
    this.incidentOrder = order;
    this.incidentReason = '';
    this.incidentNotes = '';
    this.isIncidentVisible = true;
  }

  public submitIncident(): void {
    if (!this.incidentOrder || !this.incidentReason) return;

    const idx = this.allOrders.findIndex(o => o.ord_uuid === this.incidentOrder!.ord_uuid);
    if (idx !== -1) {
      const reasonText = this.incidentReason + (this.incidentNotes ? `: ${this.incidentNotes}` : '');
      const oldNotes = this.allOrders[idx].ord_customernotes || '';
      
      // Graba la incidencia en el string de notas del cliente
      this.allOrders[idx].ord_customernotes = `[⚠️ INCIDENCIA: ${reasonText}] | ${oldNotes}`;
      
      // Devuelve el pedido a preparación
      this.allOrders[idx].ord_status = 'PROCESSING';
      
      this.filterOrdersIntoTabs();
      this.message.warning(`Incidencia registrada. Pedido #${this.incidentOrder.ord_ordernumber} regresó a preparación.`);
      this.isIncidentVisible = false;
      this.incidentOrder = null;
    }
  }

  public getMockOrderItems(orderUuid: string): { name: string; qty: number }[] {
    const seed = orderUuid.charCodeAt(0) % 4;
    switch(seed) {
      case 0: return [
        { name: 'Difusor de Ambientes Vainilla Premium', qty: 1 },
        { name: 'Vela Aromática Soja Jazmín en Frasco de Vidrio', qty: 2 }
      ];
      case 1: return [
        { name: 'Sahumerios Ecológicos Naturales Sagrada Madre (Caja x8)', qty: 3 },
        { name: 'Portasahumerio Artesanal Cerámica Rústica', qty: 1 }
      ];
      case 2: return [
        { name: 'Esencia Concentrada Lavanda para Hornillo (20ml)', qty: 1 },
        { name: 'Aceite Esencial Puro de Limón Orgánico', qty: 2 },
        { name: 'Humidificador Ultrasónico LED con Madera', qty: 1 }
      ];
      default: return [
        { name: 'Kit de Limpieza Energética (Hierbas, Carbones y Resina)', qty: 1 }
      ];
    }
  }
}
