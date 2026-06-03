import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { NzModalModule } from 'ng-zorro-antd/modal';
import { FormsModule } from '@angular/forms';
import { BarcodeScannerComponent } from '../../shared/components/barcode-scanner/barcode-scanner.component';

import { Subject, Observable, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../core/services/orders.service';
import { SessionService } from '../../core/services/session.service';
import { OrderInterface } from '../../core/interfaces/order/order.interface';
import { AddressesService } from '../../core/services/addresses.service';
import { AddressInterface } from '../../core/interfaces/address/address.interface';
import { WebSocketNotificationService } from '../../core/services/web-socket-notification.service';
import { ChatService } from '../../core/services/chat.service';
import { MessageInterface } from '../../core/interfaces/message/message.interface';

declare const L: any;

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
    NzProgressModule,
    NzModalModule,
    BarcodeScannerComponent
  ],
  templateUrl: './orders-received.component.html',
  styleUrl: './orders-received.component.scss'
})
export class OrdersReceivedComponent implements OnInit, OnDestroy {

  // Lógica de Modo Repartidor
  public isDeliveryMode = false;
  public deliveryAddressesCache: { [adr_uuid: string]: AddressInterface } = {};
  public companyCoords: { lat: number; lng: number } | null = null;
  public companyName = '';

  // Drawer de Control de Carga (Checklist)
  public isChecklistVisible = false;
  public checklistOrder: OrderInterface | null = null;
  public checklistItems: { name: string; qty: number; checked: boolean }[] = [];
  public isChecklistScannerActive = false;
  public activeTabIndex = 0;

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
  // Estructuras de rastreo GPS del Repartidor
  public activeRiderMaps: { [orderUuid: string]: any } = {};
  public activeGpsWatchId: any = null;
  public riderCoords: { lat: number; lng: number } | null = null;
  private loadingOrders: { [key: string]: boolean } = {};

  // Estados del Chat en Vivo
  public isChatVisible = false;
  public activeChatOrder: OrderInterface | null = null;
  public chatMessageText = '';
  public activeChatMessages: MessageInterface[] = [];
  private _chatMessagesSub: any = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private message: NzMessageService,
    private _ordersService: OrdersService,
    private _sessionService: SessionService,
    private _addressesService: AddressesService,
    private _notificationService: WebSocketNotificationService,
    private _chatService: ChatService
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
    this.stopActiveGpsTracking();
    if (this._chatMessagesSub) {
      this._chatMessagesSub.unsubscribe();
    }
    Object.keys(this.activeRiderMaps).forEach(uuid => {
      if (this.activeRiderMaps[uuid]) {
        this.activeRiderMaps[uuid].remove();
      }
    });
    this.activeRiderMaps = {};
  }

  // --- LOGICA DE DATOS ---

  private filterOrdersIntoTabs(): void {
    this.pendingOrders = this.allOrders.filter(o => o.ords_uuid === 'PENDING');
    this.processingOrders = this.allOrders.filter(o => o.ords_uuid === 'PROCESSING');
    this.shippedOrders = this.allOrders.filter(o => o.ords_uuid === 'SHIPPED');
    this.deliveredOrders = this.allOrders.filter(o => o.ords_uuid === 'DELIVERED');
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

    if (order.cmp_uuid && order.ord_uuid) {
      this._ordersService.changeOrderStatus(order.cmp_uuid, order.ord_uuid, 'PROCESSING').subscribe({
        next: (res) => {
          console.info('Estado de pago aprobado en el servidor:', res);
        },
        error: (err) => {
          console.error('Error al aprobar pago en el servidor:', err);
          this.message.error('No se pudo sincronizar el estado del pago con el servidor.');
        }
      });
    }

    const idx = this.allOrders.findIndex(o => o.ord_uuid === order.ord_uuid);
    if (idx !== -1) {
      this.allOrders[idx].ords_uuid = 'PROCESSING';
      this.filterOrdersIntoTabs();
      this.message.success(`Pago Aprobado. Pedido ${order.ord_ordernumber} pasó a Preparación.`);
      this.isDrawerVisible = false;

      // Sincronizar en tiempo real por sockets y push notifications
      this._notificationService.broadcastOrderStatusUpdate(order.ord_uuid, 'PROCESSING');
      this._notificationService.pushNotification({
        usr_uuid: order.usr_uuid,
        cus_uuid: order.cus_uuid,
        cmp_uuid: order.cmp_uuid,
        ntf_title: '¡Pago Aprobado! 🎉',
        ntf_message: `Tu pago para el pedido #${order.ord_ordernumber} fue aprobado. Ya estamos preparando tus productos.`,
        ntf_type: 'success',
        ntf_actionurl: '/application/my-purchases'
      });
    }
  }

  public rejectPayment(order: OrderInterface): void {
    if (order.cmp_uuid && order.ord_uuid) {
      this._ordersService.changeOrderStatus(order.cmp_uuid, order.ord_uuid, 'CANCELLED').subscribe({
        next: (res) => {
          console.info('Pago rechazado y orden cancelada en el servidor:', res);
        },
        error: (err) => {
          console.error('Error al rechazar pago en el servidor:', err);
          this.message.error('No se pudo sincronizar la cancelación con el servidor.');
        }
      });
    }

    const idx = this.allOrders.findIndex(o => o.ord_uuid === order.ord_uuid);
    if (idx !== -1) {
      this.allOrders[idx].ords_uuid = 'CANCELLED';
      this.filterOrdersIntoTabs();
      this.message.error(`Pago Rechazado. Pedido ${order.ord_ordernumber} fue cancelado.`);
      this.isDrawerVisible = false;

      // Notificar en tiempo real al cliente
      this._notificationService.broadcastOrderStatusUpdate(order.ord_uuid, 'CANCELLED');
      this._notificationService.pushNotification({
        usr_uuid: order.usr_uuid,
        cus_uuid: order.cus_uuid,
        cmp_uuid: order.cmp_uuid,
        ntf_title: 'Pago rechazado ❌',
        ntf_message: `Lamentablemente tu pago para el pedido #${order.ord_ordernumber} fue rechazado y la orden fue cancelada.`,
        ntf_type: 'error',
        ntf_actionurl: '/application/my-purchases'
      });
    }
  }

  public markAsShipped(order: OrderInterface, event: Event): void {
    event.stopPropagation();

    if (order.cmp_uuid && order.ord_uuid) {
      this._ordersService.changeOrderStatus(order.cmp_uuid, order.ord_uuid, 'SHIPPED').subscribe({
        next: (res) => console.info('Pedido marcado como enviado en el servidor:', res),
        error: (err) => {
          console.error('Error al marcar envío en el servidor:', err);
          this.message.error('No se pudo sincronizar el despacho con el servidor.');
        }
      });
    }

    const idx = this.allOrders.findIndex(o => o.ord_uuid === order.ord_uuid);
    if (idx !== -1) {
      this.allOrders[idx].ords_uuid = 'SHIPPED';
      this.filterOrdersIntoTabs();
      this.message.success(`Pedido ${order.ord_ordernumber} marcado como Despachado.`);

      // Notificar en tiempo real al cliente
      this._notificationService.broadcastOrderStatusUpdate(order.ord_uuid, 'SHIPPED');
      this._notificationService.pushNotification({
        usr_uuid: order.usr_uuid,
        cus_uuid: order.cus_uuid,
        cmp_uuid: order.cmp_uuid,
        ntf_title: '¡Pedido en camino! 🛵',
        ntf_message: `Tu pedido #${order.ord_ordernumber} ya está en camino a tu domicilio.`,
        ntf_type: 'info',
        ntf_actionurl: '/application/my-purchases'
      });
    }
  }

  public markAsDelivered(order: OrderInterface, event?: Event): void {
    if (event) event.stopPropagation();

    if (order.cmp_uuid && order.ord_uuid) {
      this._ordersService.changeOrderStatus(order.cmp_uuid, order.ord_uuid, 'DELIVERED').subscribe({
        next: (res) => console.info('Pedido marcado como entregado en el servidor:', res),
        error: (err) => {
          console.error('Error al marcar entrega en el servidor:', err);
          this.message.error('No se pudo sincronizar la entrega con el servidor.');
        }
      });
    }

    const idx = this.allOrders.findIndex(o => o.ord_uuid === order.ord_uuid);
    if (idx !== -1) {
      this.allOrders[idx].ords_uuid = 'DELIVERED';
      this.filterOrdersIntoTabs();
      this.message.success(`Pedido ${order.ord_ordernumber} marcado como Entregado con éxito.`);
      this.isDrawerVisible = false;

      // Notificar en tiempo real al cliente
      this._notificationService.broadcastOrderStatusUpdate(order.ord_uuid, 'DELIVERED');
      this._notificationService.pushNotification({
        usr_uuid: order.usr_uuid,
        cus_uuid: order.cus_uuid,
        cmp_uuid: order.cmp_uuid,
        ntf_title: 'Pedido entregado exitosamente 🎉',
        ntf_message: `¡Qué alegría! Tu pedido #${order.ord_ordernumber} fue entregado correctamente.`,
        ntf_type: 'success',
        ntf_actionurl: '/application/my-purchases'
      });
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

    // Obtener los detalles completos del pedido, incluyendo la colección orderDetails de forma diferida
    if (order.cmp_uuid && order.ord_uuid) {
      this._ordersService.getOrderById(order.cmp_uuid, order.ord_uuid).subscribe({
        next: (res: any) => {
          if (res && res.data) {
            this.selectedOrder = res.data;
            // Actualizar en el listado local para caché
            const idx = this.allOrders.findIndex(o => o.ord_uuid === order.ord_uuid);
            if (idx !== -1) {
              this.allOrders[idx] = res.data;
              this.filterOrdersIntoTabs();
            }
          }
        },
        error: (err: any) => {
          console.error('Error al recuperar detalles completos del pedido:', err);
        }
      });
    }

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
        o => o.ords_uuid === 'PROCESSING' || o.ords_uuid === 'SHIPPED'
      );
      this.loadAddressesForDeliveries(activeOrders);

      // Inicializar mapas para los pedidos ya despachados ("SHIPPED")
      setTimeout(() => {
        this.getSortedRouteOrders().forEach(order => {
          if (order.ords_uuid === 'SHIPPED') {
            this.initializeRiderMap(order);
          }
        });
      }, 800);

      // Iniciar geolocalización activa watchPosition
      this.startActiveGpsTracking();
    } else {
      this.stopActiveGpsTracking();
      // Destruir mapas activos
      Object.keys(this.activeRiderMaps).forEach(uuid => {
        if (this.activeRiderMaps[uuid]) {
          this.activeRiderMaps[uuid].remove();
        }
      });
      this.activeRiderMaps = {};
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
      const isDeliveryStatus = o.ords_uuid === 'PROCESSING' || o.ords_uuid === 'SHIPPED';
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
      o.ords_uuid === 'DELIVERED' && 
      o.ord_customernotes && (
        o.ord_customernotes.includes('Motomensajería Local') || 
        o.ord_customernotes.includes('Correo Postal Nacional')
      )
    ).length;
  }

  public getTotalDeliveriesCount(): number {
    return this.allOrders.filter(o => 
      (o.ords_uuid === 'PROCESSING' || o.ords_uuid === 'SHIPPED' || o.ords_uuid === 'DELIVERED') &&
      o.ord_customernotes && (
        o.ord_customernotes.includes('Motomensajería Local') || 
        o.ord_customernotes.includes('Correo Postal Nacional')
      )
    ).length;
  }

  public getCashToCollectTotal(): number {
    return this.getSortedRouteOrders()
      .filter(o => o.ords_uuid === 'SHIPPED' && o.ord_customernotes.toLowerCase().includes('efectivo'))
      .reduce((acc, o) => acc + o.ord_total, 0);
  }

  // --- CONTROL DE CARGA (CHECKLIST) ---

  public startDeliveryWorkflow(order: OrderInterface, event?: Event): void {
    if (event) event.stopPropagation();
    this.checklistOrder = order;
    
    // Cargar ítems reales o simulados
    this.checklistItems = this.getOrderItems(order).map(item => ({
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

    if (this.checklistOrder.cmp_uuid && this.checklistOrder.ord_uuid) {
      this._ordersService.changeOrderStatus(this.checklistOrder.cmp_uuid, this.checklistOrder.ord_uuid, 'SHIPPED').subscribe({
        next: (res) => console.info('Ruta iniciada y pedido en camino en el servidor:', res),
        error: (err) => {
          console.error('Error al iniciar despacho en el servidor:', err);
          this.message.error('No se pudo sincronizar el viaje con el servidor.');
        }
      });
    }

    const idx = this.allOrders.findIndex(o => o.ord_uuid === this.checklistOrder!.ord_uuid);
    if (idx !== -1) {
      this.allOrders[idx].ords_uuid = 'SHIPPED';
      this.filterOrdersIntoTabs();
      this.message.success(`¡Carga verificada! Pedido #${this.checklistOrder.ord_ordernumber} en viaje.`);
      
      // Notificar en tiempo real al cliente
      this._notificationService.broadcastOrderStatusUpdate(this.checklistOrder.ord_uuid, 'SHIPPED');
      this._notificationService.pushNotification({
        usr_uuid: this.checklistOrder.usr_uuid,
        cus_uuid: this.checklistOrder.cus_uuid,
        cmp_uuid: this.checklistOrder.cmp_uuid,
        ntf_title: '¡Pedido en camino! 🛵',
        ntf_message: `Tu pedido #${this.checklistOrder.ord_ordernumber} ya está en camino a tu domicilio.`,
        ntf_type: 'info',
        ntf_actionurl: '/application/my-purchases'
      });

      const orderCopy = this.checklistOrder;
      setTimeout(() => {
        this.initializeRiderMap(orderCopy);
      }, 500);

      this.isChecklistVisible = false;
      this.checklistOrder = null;
    }
  }

  public onChecklistBarcodeScanned(code: string): void {
    if (!this.checklistOrder) return;

    const details = this.checklistOrder.orderDetails || [];
    const matchedDetail = details.find(d => d.ordd_sku?.toLowerCase() === code.toLowerCase());

    if (matchedDetail) {
      const item = this.checklistItems.find(i => i.name === matchedDetail.ordd_productname);
      if (item) {
        if (item.checked) {
          this.message.warning(`El artículo "${item.name}" ya fue verificado.`);
        } else {
          item.checked = true;
          this.message.success(`Artículo verificado: ${item.name}`);
        }
      } else {
        this.message.error('No se pudo vincular el artículo del pedido.');
      }
    } else {
      this.message.error(`El código "${code}" no pertenece a ningún artículo de este pedido.`);
    }
  }

  public resetChecklist(): void {
    this.checklistItems.forEach(i => i.checked = false);
    this.message.info('Checklist de carga reiniciado.');
  }

  // --- IMPRESIÓN DE ETIQUETAS DE DESPACHO (SHIPPING LABELS) ---

  public printShippingLabel(order: OrderInterface): void {
    const cachedAddress = this.deliveryAddressesCache[order.adr_uuid];
    if (cachedAddress) {
      this.doPrintLabel(order, cachedAddress);
    } else if (order.cus_uuid) {
      this.message.loading('Cargando dirección de envío...', { nzDuration: 800 });
      this._addressesService.fetchAddressesByCustomer(order.cus_uuid).subscribe({
        next: (res: any) => {
          const list = res.data || [];
          const matched = list.find((a: any) => a.adr_uuid === order.adr_uuid);
          if (matched) {
            this.deliveryAddressesCache[order.adr_uuid] = matched;
            this.doPrintLabel(order, matched);
          } else {
            this.doPrintLabel(order, this.getFallbackAddress(order));
          }
        },
        error: () => {
          this.doPrintLabel(order, this.getFallbackAddress(order));
        }
      });
    } else {
      this.doPrintLabel(order, this.getFallbackAddress(order));
    }
  }

  private getFallbackAddress(order: OrderInterface): AddressInterface {
    return {
      cmp_uuid: order.cmp_uuid || '',
      adr_uuid: order.adr_uuid || '',
      cus_uuid: order.cus_uuid || '',
      sup_uuid: '',
      adr_alias: 'Envío',
      adr_recipientname: order.ord_customername || 'Cliente',
      adr_contactphone: order.ord_contactphone || '',
      adr_reference: '',
      adr_country: 'Argentina',
      adr_address: 'Domicilio de entrega no especificado',
      adr_street: 'Domicilio de entrega',
      adr_number: '',
      adr_floor: '',
      adr_apartment: '',
      adr_city: 'Localidad no especificada',
      adr_province: '',
      adr_postalcode: '',
      adr_lat: 0,
      adr_lng: 0,
      adr_createdat: new Date(),
      adr_updatedat: new Date()
    };
  }

  private doPrintLabel(order: OrderInterface, address: AddressInterface): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.message.error('No se pudo abrir la ventana de impresión. Por favor, deshabilite el bloqueador de ventanas emergentes.');
      return;
    }

    const company = this._sessionService.getCompany() || {};
    const coName = company.cmp_name || 'Comercio ATSMarket';
    const coAddress = company.cmp_address || 'Dirección no especificada';
    const coPhone = company.cmp_phone || 'Teléfono no especificado';

    const delivery = this.getDeliveryType(order.ord_customernotes);
    const parsedNotes = this.parseCustomerNotes(order.ord_customernotes);

    const addressStr = address.adr_address || `${address.adr_street || ''} ${address.adr_number || ''}${address.adr_floor ? ', Piso ' + address.adr_floor : ''}${address.adr_apartment ? ', Depto ' + address.adr_apartment : ''}`.trim() || 'Domicilio de entrega no especificado';
    const cityStr = `${address.adr_city}${address.adr_postalcode ? ' (CP: ' + address.adr_postalcode + ')' : ''}`;

    const barcodeVal = `*${order.ord_ordernumber}*`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Etiqueta de Envío - PED-${order.ord_ordernumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Libre+Barcode+39&display=swap" rel="stylesheet">
  <style>
    @media print {
      @page {
        size: 100mm 150mm;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
        background: #fff;
      }
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', sans-serif;
      width: 100mm;
      height: 150mm;
      padding: 5mm;
      color: #000;
      background: #fff;
    }
    .label-box {
      border: 3px solid #000;
      width: 100%;
      height: 100%;
      padding: 4mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-radius: 8px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #000;
      padding-bottom: 2mm;
    }
    .header-logo {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .header-badge {
      font-size: 13px;
      font-weight: 900;
      border: 2px solid #000;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      background: #000;
      color: #fff;
    }
    .section {
      border-bottom: 2px dashed #000;
      padding: 3mm 0;
    }
    .section:last-of-type {
      border-bottom: none;
    }
    .section-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 1.5mm;
      letter-spacing: 0.5px;
    }
    .section-content {
      font-size: 13px;
      line-height: 1.4;
    }
    .sender-details {
      font-size: 11px;
      line-height: 1.3;
    }
    .barcode-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2mm 0;
      text-align: center;
    }
    .barcode {
      font-family: 'Libre Barcode 39', cursive;
      font-size: 60px;
      margin: 0;
      line-height: 1;
    }
    .barcode-text {
      font-size: 12px;
      font-weight: 700;
      margin-top: 1mm;
      font-family: monospace;
      letter-spacing: 1px;
    }
    .shipping-method {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .method-name {
      font-size: 16px;
      font-weight: 900;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="label-box">
    
    <div class="header">
      <span class="header-logo">ATSMARKET LOGISTICA</span>
      <span class="header-badge">${delivery.label}</span>
    </div>

    <!-- REMITENTE -->
    <div class="section">
      <div class="section-title">Remitente (Origen)</div>
      <div class="sender-details">
        <strong>${coName}</strong><br>
        Dirección: ${coAddress}<br>
        Teléfono: ${coPhone}
      </div>
    </div>

    <!-- DESTINATARIO -->
    <div class="section">
      <div class="section-title">Destinatario (Destino)</div>
      <div class="section-content">
        <strong>${order.ord_customername}</strong><br>
        Dirección: ${addressStr}<br>
        Ciudad: ${cityStr}<br>
        Teléfono: ${order.ord_contactphone || 'N/A'}<br>
        Email: ${order.ord_customeremail || 'N/A'}
      </div>
    </div>

    <!-- METODO Y NOTAS -->
    <div class="section">
      <div class="section-title">Detalles de Entrega</div>
      <div class="section-content">
        <div class="shipping-method">
          <span class="method-name">${parsedNotes.shipping || delivery.label}</span>
        </div>
        ${parsedNotes.extraNotes ? '<div style="margin-top: 1.5mm; font-size: 11px; border-left: 2px solid #000; padding-left: 6px; font-style: italic;"><strong>Notas:</strong> ' + parsedNotes.extraNotes + '</div>' : ''}
      </div>
    </div>

    <!-- CODIGO DE BARRAS -->
    <div class="barcode-section">
      <p class="barcode">${barcodeVal}</p>
      <div class="barcode-text">ORD-PED-${order.ord_ordernumber}</div>
    </div>

  </div>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 850);
  }

  public printBatchShippingLabels(): void {
    let targetOrders: OrderInterface[] = [];
    switch (this.activeTabIndex) {
      case 0: targetOrders = this.pendingOrders; break;
      case 1: targetOrders = this.processingOrders; break;
      case 2: targetOrders = this.shippedOrders; break;
      case 3: targetOrders = this.deliveredOrders; break;
    }

    const shippableOrders = targetOrders.filter(o => {
      const type = this.getDeliveryType(o.ord_customernotes);
      return type.label !== 'Retiro';
    });

    if (shippableOrders.length === 0) {
      this.message.warning('No hay pedidos con envío (correo/moto) en la pestaña actual para imprimir.');
      return;
    }

    this.message.loading(`Preparando impresión de ${shippableOrders.length} etiquetas...`, { nzDuration: 1200 });

    const missingCusUuids = shippableOrders
      .filter(o => !this.deliveryAddressesCache[o.adr_uuid] && o.cus_uuid)
      .map(o => o.cus_uuid);

    if (missingCusUuids.length > 0) {
      const requests = Array.from(new Set(missingCusUuids)).map(cusUuid =>
        this._addressesService.fetchAddressesByCustomer(cusUuid)
      );

      forkJoin(requests).subscribe({
        next: (results: any[]) => {
          results.forEach(res => {
            const list = res.data || [];
            list.forEach((addr: any) => {
              this.deliveryAddressesCache[addr.adr_uuid] = addr;
            });
          });
          this.doPrintLabelBatch(shippableOrders);
        },
        error: () => {
          this.doPrintLabelBatch(shippableOrders);
        }
      });
    } else {
      this.doPrintLabelBatch(shippableOrders);
    }
  }

  private doPrintLabelBatch(orders: OrderInterface[]): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.message.error('No se pudo abrir la ventana de impresión. Por favor, deshabilite el bloqueador de ventanas emergentes.');
      return;
    }

    const company = this._sessionService.getCompany() || {};
    const coName = company.cmp_name || 'Comercio ATSMarket';
    const coAddress = company.cmp_address || 'Dirección no especificada';
    const coPhone = company.cmp_phone || 'Teléfono no especificado';

    let pagesHtml = '';

    orders.forEach((order, index) => {
      const address = this.deliveryAddressesCache[order.adr_uuid] || this.getFallbackAddress(order);
      const delivery = this.getDeliveryType(order.ord_customernotes);
      const parsedNotes = this.parseCustomerNotes(order.ord_customernotes);

      const addressStr = address.adr_address || `${address.adr_street || ''} ${address.adr_number || ''}${address.adr_floor ? ', Piso ' + address.adr_floor : ''}${address.adr_apartment ? ', Depto ' + address.adr_apartment : ''}`.trim() || 'Domicilio de entrega no especificado';
      const cityStr = `${address.adr_city}${address.adr_postalcode ? ' (CP: ' + address.adr_postalcode + ')' : ''}`;
      const barcodeVal = `*${order.ord_ordernumber}*`;

      pagesHtml += `
      <div class="label-box">
        <div class="header">
          <span class="header-logo">ATSMARKET LOGISTICA</span>
          <span class="header-badge">${delivery.label}</span>
        </div>

        <div class="section">
          <div class="section-title">Remitente (Origen)</div>
          <div class="sender-details">
            <strong>${coName}</strong><br>
            Dirección: ${coAddress}<br>
            Teléfono: ${coPhone}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Destinatario (Destino)</div>
          <div class="section-content">
            <strong>${order.ord_customername}</strong><br>
            Dirección: ${addressStr}<br>
            Ciudad: ${cityStr}<br>
            Teléfono: ${order.ord_contactphone || 'N/A'}<br>
            Email: ${order.ord_customeremail || 'N/A'}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Detalles de Entrega</div>
          <div class="section-content">
            <div class="shipping-method">
              <span class="method-name">${parsedNotes.shipping || delivery.label}</span>
            </div>
            ${parsedNotes.extraNotes ? '<div style="margin-top: 1.5mm; font-size: 11px; border-left: 2px solid #000; padding-left: 6px; font-style: italic;"><strong>Notas:</strong> ' + parsedNotes.extraNotes + '</div>' : ''}
          </div>
        </div>

        <div class="barcode-section">
          <p class="barcode">${barcodeVal}</p>
          <div class="barcode-text">ORD-PED-${order.ord_ordernumber}</div>
        </div>
      </div>
      `;

      if (index < orders.length - 1) {
        pagesHtml += `<div class="page-break"></div>`;
      }
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Lote de Etiquetas de Envío</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Libre+Barcode+39&display=swap" rel="stylesheet">
  <style>
    @media print {
      @page {
        size: 100mm 150mm;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
        background: #fff;
      }
      .page-break {
        page-break-after: always;
        clear: both;
      }
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', sans-serif;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 0;
    }
    .label-box {
      width: 100mm;
      height: 150mm;
      padding: 5mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 3px solid #000;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #000;
      padding-bottom: 2mm;
    }
    .header-logo {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .header-badge {
      font-size: 13px;
      font-weight: 900;
      border: 2px solid #000;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      background: #000;
      color: #fff;
    }
    .section {
      border-bottom: 2px dashed #000;
      padding: 3mm 0;
    }
    .section:last-of-type {
      border-bottom: none;
    }
    .section-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 1.5mm;
      letter-spacing: 0.5px;
    }
    .section-content {
      font-size: 13px;
      line-height: 1.4;
    }
    .sender-details {
      font-size: 11px;
      line-height: 1.3;
    }
    .barcode-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2mm 0;
      text-align: center;
    }
    .barcode {
      font-family: 'Libre Barcode 39', cursive;
      font-size: 60px;
      margin: 0;
      line-height: 1;
    }
    .barcode-text {
      font-size: 12px;
      font-weight: 700;
      margin-top: 1mm;
      font-family: monospace;
      letter-spacing: 1px;
    }
    .shipping-method {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .method-name {
      font-size: 16px;
      font-weight: 900;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 850);
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
      this.allOrders[idx].ords_uuid = 'PROCESSING';

      // Persistir el cambio de estado a preparación en el backend
      if (this.incidentOrder.cmp_uuid && this.incidentOrder.ord_uuid) {
        this._ordersService.changeOrderStatus(this.incidentOrder.cmp_uuid, this.incidentOrder.ord_uuid, 'PROCESSING').subscribe({
          next: (res) => console.info('Incidencia registrada y devuelta a preparación en el servidor:', res),
          error: (err) => console.error('Error al registrar incidencia en el servidor:', err)
        });
      }
      
      this.filterOrdersIntoTabs();
      this.message.warning(`Incidencia registrada. Pedido #${this.incidentOrder.ord_ordernumber} regresó a preparación.`);

      // Notificar en tiempo real al cliente
      this._notificationService.broadcastOrderStatusUpdate(this.incidentOrder.ord_uuid, 'PROCESSING', reasonText);
      this._notificationService.pushNotification({
        usr_uuid: this.incidentOrder.usr_uuid,
        cus_uuid: this.incidentOrder.cus_uuid,
        cmp_uuid: this.incidentOrder.cmp_uuid,
        ntf_title: 'Incidencia en tu envío ⚠️',
        ntf_message: `Tu pedido #${this.incidentOrder.ord_ordernumber} reportó novedad: "${reasonText}". Regresó a preparación.`,
        ntf_type: 'warning',
        ntf_actionurl: '/application/my-purchases'
      });

      this.isIncidentVisible = false;
      this.incidentOrder = null;
    }
  }

  public getOrderItems(order: OrderInterface | null): { name: string; qty: number; unitPrice?: number }[] {
    if (!order) return [];
    if (order.orderDetails && order.orderDetails.length > 0) {
      return order.orderDetails.map(detail => ({
        name: detail.ordd_productname,
        qty: detail.ordd_quantity,
        unitPrice: detail.ordd_unitprice
      }));
    }

    // Carga diferida automática desde la API si no está en proceso de carga
    if (order.cmp_uuid && order.ord_uuid && !this.loadingOrders[order.ord_uuid]) {
      this.loadingOrders[order.ord_uuid] = true;
      this._ordersService.getOrderById(order.cmp_uuid, order.ord_uuid).subscribe({
        next: (res: any) => {
          if (res && res.data && res.data.orderDetails) {
            order.orderDetails = res.data.orderDetails;
            // Actualizar en el listado local para caché
            const idx = this.allOrders.findIndex(o => o.ord_uuid === order.ord_uuid);
            if (idx !== -1) {
              this.allOrders[idx].orderDetails = res.data.orderDetails;
              this.filterOrdersIntoTabs();
            }
          }
          this.loadingOrders[order.ord_uuid] = false;
        },
        error: (err: any) => {
          console.error('Error fetching order items:', err);
          this.loadingOrders[order.ord_uuid] = false;
        }
      });
    }

    return [];
  }

  // --- COMPLEMENTOS DE GPS RASTREO RUTA DEL CHOFER ---

  public initializeRiderMap(order: OrderInterface): void {
    if (typeof L === 'undefined') return;

    const mapId = 'rider-map-' + order.ord_uuid;
    // Retraso para esperar que el div exista
    setTimeout(() => {
      const container = document.getElementById(mapId);
      if (!container) return;

      if (this.activeRiderMaps[order.ord_uuid]) {
        this.activeRiderMaps[order.ord_uuid].remove();
        delete this.activeRiderMaps[order.ord_uuid];
      }

      const addr = this.deliveryAddressesCache[order.adr_uuid];
      
      // Tienda (Origen)
      const originLat = this.companyCoords ? this.companyCoords.lat : -34.6037;
      const originLng = this.companyCoords ? this.companyCoords.lng : -58.3816;
      const origin: [number, number] = [originLat, originLng];

      // Cliente (Destino)
      const destLat = addr && addr.adr_lat ? Number(addr.adr_lat) : originLat + 0.015;
      const destLng = addr && addr.adr_lng ? Number(addr.adr_lng) : originLng + 0.015;
      const destination: [number, number] = [destLat, destLng];

      const map = L.map(mapId, {
        zoomControl: false,
        attributionControl: false
      }).setView(origin, 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      const shopIcon = L.divIcon({
        className: 'leaflet-custom-marker',
        html: '<div style="background: #1890ff; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2)">🏪</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const homeIcon = L.divIcon({
        className: 'leaflet-custom-marker',
        html: '<div style="background: #52c41a; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2)">🏠</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const courierIcon = L.divIcon({
        className: 'leaflet-custom-marker',
        html: '<div style="background: #fa8c16; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 0 10px rgba(250,140,22,0.8)">🛵</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker(origin, { icon: shopIcon }).addTo(map);
      L.marker(destination, { icon: homeIcon }).addTo(map);

      const routePoly = L.polyline([origin, destination], {
        color: '#fa8c16',
        weight: 4,
        opacity: 0.7,
        dashArray: '4, 8'
      }).addTo(map);

      map.fitBounds(routePoly.getBounds(), { padding: [30, 30] });

      // Moto del repartidor
      const startPos: [number, number] = this.riderCoords ? [this.riderCoords.lat, this.riderCoords.lng] : origin;
      const courierMarker = L.marker(startPos, { icon: courierIcon }).addTo(map);
      
      // Adjuntar referencia del marcador móvil al objeto del mapa
      (map as any).courierMarker = courierMarker;
      this.activeRiderMaps[order.ord_uuid] = map;
    }, 400);
  }

  public startActiveGpsTracking(): void {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      this.activeGpsWatchId = navigator.geolocation.watchPosition(
        (position) => {
          this.riderCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.info('GPS de Repartidor actualizado:', this.riderCoords);
          
          // Mover dinámicamente el marcador en los mapas activos de paradas
          Object.keys(this.activeRiderMaps).forEach(uuid => {
            const mapObj = this.activeRiderMaps[uuid];
            if (mapObj && mapObj.courierMarker) {
              mapObj.courierMarker.setLatLng([this.riderCoords!.lat, this.riderCoords!.lng]);
            }
          });
        },
        (err) => console.warn('Error leyendo GPS nativo del chofer:', err),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    }
  }

  public stopActiveGpsTracking(): void {
    if (this.activeGpsWatchId !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(this.activeGpsWatchId);
      this.activeGpsWatchId = null;
    }
  }

  public openChat(order: OrderInterface, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.activeChatOrder = order;
    this.chatMessageText = '';
    this.isChatVisible = true;

    this._chatService.loadActiveChat(order.cmp_uuid, order.ord_uuid);

    if (this._chatMessagesSub) {
      this._chatMessagesSub.unsubscribe();
    }
    this._chatMessagesSub = this._chatService.activeChatMessages$.subscribe(messages => {
      this.activeChatMessages = messages;
      this.scrollToBottom();
    });
  }

  public closeChat(): void {
    this.isChatVisible = false;
    this._chatService.clearActiveChat();
    if (this._chatMessagesSub) {
      this._chatMessagesSub.unsubscribe();
      this._chatMessagesSub = null;
    }
    this.activeChatOrder = null;
    this.activeChatMessages = [];
  }

  public sendChatMessage(): void {
    if (!this.activeChatOrder || !this.chatMessageText.trim()) return;

    const companyUuid = this.activeChatOrder.cmp_uuid;
    const orderUuid = this.activeChatOrder.ord_uuid;
    const sender = this.isDeliveryMode ? 'RIDER' : 'MERCHANT';
    
    const company = this._sessionService.getCompany();
    const identity = this._sessionService.getCurrentSession() as any;
    const senderName = this.isDeliveryMode 
      ? (identity?.identity?.usr_name || 'Repartidor ATS')
      : (company?.cmp_name || 'Tienda ATS');

    const text = this.chatMessageText;
    const usrUuid = identity?.identity?.usr_uuid || '';
    const cusUuid = this.activeChatOrder.cus_uuid;

    this._chatService.sendMessage(companyUuid, orderUuid, sender, senderName, text, usrUuid, cusUuid).subscribe({
      next: () => {
        this.chatMessageText = '';
        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.chat-messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}
