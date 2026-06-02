import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

import { OrdersService } from '../../core/services/orders.service';
import { SessionService } from '../../core/services/session.service';
import { CompaniesService } from '../../core/services/companies.service';
import { WebSocketNotificationService } from '../../core/services/web-socket-notification.service';
import { OrdersHistoryService } from '../../core/services/orders-history.service';
import { ChatService } from '../../core/services/chat.service';
import { ProductVariationReviewsService } from '../../core/services/product-variation-reviews.service';
import { OrderInterface } from '../../core/interfaces/order/order.interface';
import { OrderHistoryInterface } from '../../core/interfaces/order-history/order-history.interface';
import { MessageInterface } from '../../core/interfaces/message/message.interface';
import { ProductVariationReviewInterface } from '../../core/interfaces/product-variation-review/product-variation-review.interface';
import { Subscription, forkJoin } from 'rxjs';

declare const L: any;

@Component({
  selector: 'app-my-purchases',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
    NzAlertModule,
    NzCollapseModule,
    NzSpinModule,
    NzTimelineModule,
    NzDrawerModule,
    NzInputModule,
    NzRateModule,
    NzModalModule,
    NzMessageModule,
    NzAvatarModule
  ],
  templateUrl: './my-purchases.component.html',
  styleUrl: './my-purchases.component.scss'
})
export class MyPurchasesComponent implements OnInit, OnDestroy {

  public isLoading = true;
  public customer: any = null;
  public purchases: OrderInterface[] = [];
  public companyNamesCache: { [cmp_uuid: string]: string } = {};

  // Estructuras de rastreo GPS e interactividad
  public activeMaps: { [orderUuid: string]: any } = {};
  public activeIntervals: { [orderUuid: string]: any } = {};
  public simulatedETA: { [orderUuid: string]: number } = {};

  // Caché de historial de estados
  public orderHistoryCache: { [orderUuid: string]: OrderHistoryInterface[] } = {};
  public loadingHistory: { [orderUuid: string]: boolean } = {};

  // Estados del Chat en Vivo
  public isChatVisible = false;
  public activeChatOrder: OrderInterface | null = null;
  public chatMessageText = '';
  public activeChatMessages: MessageInterface[] = [];

  // Estados de Calificaciones / Opiniones posventa
  public isRatingVisible = false;
  public ratingOrder: OrderInterface | null = null;
  public ratingItems: any[] = [];
  public ratedOrdersCache: string[] = [];

  private _orderUpdateSub: Subscription | null = null;
  private _chatMessagesSub: Subscription | null = null;

  constructor(
    private _ordersService: OrdersService,
    private _sessionService: SessionService,
    private _companiesService: CompaniesService,
    private _notificationService: WebSocketNotificationService,
    private _ordersHistoryService: OrdersHistoryService,
    private _chatService: ChatService,
    private _reviewsService: ProductVariationReviewsService,
    private message: NzMessageService
  ) { }


  ngOnInit(): void {
    this.customer = this._sessionService.getCustomer();
    if (this.customer && this.customer.cus_uuid) {
      this.loadPurchases(this.customer.cus_uuid);
    } else {
      this.isLoading = false;
    }

    const storedRated = localStorage.getItem('ats_rated_orders');
    if (storedRated) {
      try {
        this.ratedOrdersCache = JSON.parse(storedRated);
      } catch (e) {
        console.error('Error parsing rated orders cache:', e);
      }
    }

    // Suscribirse a las actualizaciones de pedidos en tiempo real cruzadas por pestaña
    this._orderUpdateSub = this._notificationService.orderUpdates$.subscribe(update => {
      const order = this.purchases.find(o => o.ord_uuid === update.ord_uuid);
      if (order) {
        order.ords_uuid = update.status;
        
        if (update.notes) {
          // Limpiar incidencias previas
          const clean = order.ord_customernotes.replace(/\[⚠️ INCIDENCIA:[^\]]+\]\s*\|\s*/g, '');
          order.ord_customernotes = `[⚠️ INCIDENCIA: ${update.notes}] | ${clean}`;
        } else if (update.status === 'SHIPPED') {
          // Limpiar incidencias al retomar ruta
          order.ord_customernotes = order.ord_customernotes.replace(/\[⚠️ INCIDENCIA:[^\]]+\]\s*\|\s*/g, '');
        }

        // Si cambió a SHIPPED (En Camino), iniciar el mapa y el rider en vivo
        if (update.status === 'SHIPPED') {
          setTimeout(() => {
            this.initializeTrackingMap(order);
          }, 500);
        } else {
          this.cleanupMap(order.ord_uuid);
        }
      }
    });
  }

  private loadPurchases(cusUuid: string): void {
    this.isLoading = true;
    this._ordersService.getOrdersByCustomer(cusUuid).subscribe({
      next: (res: any) => {
        // En una respuesta real o mock api
        this.purchases = res.data || [];
        // Ordenar por fecha descendente (más recientes primero)
        this.purchases.sort((a, b) => {
          return new Date(b.ord_date).getTime() - new Date(a.ord_date).getTime();
        });
        
        // Cargar nombres de las empresas de forma diferida
        this.loadCompanyNames(this.purchases);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error al recuperar compras:', err);
        this.isLoading = false;
      }
    });
  }

  private loadCompanyNames(orders: OrderInterface[]): void {
    orders.forEach(order => {
      if (order.cmp_uuid && !this.companyNamesCache[order.cmp_uuid]) {
        this._companiesService.getCompanyById(order.cmp_uuid).subscribe({
          next: (res: any) => {
            if (res.success && res.data) {
              const cmp = Array.isArray(res.data) ? res.data[0] : res.data;
              if (cmp) {
                this.companyNamesCache[order.cmp_uuid] = cmp.cmp_name || 'Comercio ATSMarket';
              }
            }
          },
          error: (err: any) => {
            console.error('Error fetching company details:', err);
            this.companyNamesCache[order.cmp_uuid] = 'Comercio ATSMarket';
          }
        });
      }
    });
  }

  public getStatusStep(status: string): number {
    switch (status) {
      case 'PENDING': return 1;      // Pago Aprobado / Pendiente
      case 'PROCESSING': return 2;   // En Preparación
      case 'SHIPPED': return 3;      // En Camino / Despachado
      case 'DELIVERED': return 4;    // Entregado
      default: return 1;
    }
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
      case 'PENDING': return 'Pendiente de Aprobación';
      case 'PROCESSING': return 'En Preparación';
      case 'SHIPPED': return 'En Camino / Despachado';
      case 'DELIVERED': return 'Entregado';
      case 'CANCELLED': return 'Cancelado';
      default: return 'Desconocido';
    }
  }

  public getDeliveryType(notes: string): { label: string, icon: string, color: string } {
    if (!notes) return { label: 'Correo Postal', icon: 'global', color: 'blue' };
    if (notes.includes('Motomensajería Local')) {
      return { label: '🚴 Motomensajería Local (Express)', icon: 'car', color: 'cyan' };
    } else if (notes.includes('Correo Postal Nacional')) {
      return { label: '📦 Correo Postal Nacional', icon: 'global', color: 'blue' };
    } else if (notes.includes('Retiro en el Local')) {
      return { label: '🏪 Retiro en el Local (Gratis)', icon: 'shop', color: 'green' };
    } else if (notes.includes('Acordar con el Vendedor')) {
      return { label: '💬 Coordinar con el Vendedor (A convenir)', icon: 'message', color: 'orange' };
    }
    return { label: 'Envío General', icon: 'global', color: 'blue' };
  }

  public getIncidentDetail(notes: string): string | null {
    if (!notes) return null;
    const match = notes.match(/\[⚠️ INCIDENCIA:\s*([^\]]+)\]/);
    return match ? match[1] : null;
  }

  public parseCustomerNotes(notes: string): any {
    if (!notes) return { shipping: 'No especificado', payment: 'No especificado', voucher: 'N/A', cleanNotes: '' };
    
    let shipping = '';
    let payment = '';
    let voucher = '';

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

    // Limpiar notas para el cliente
    let cleanNotes = notes;
    // Eliminar etiquetas estructuradas del flete
    cleanNotes = cleanNotes.replace(/\[⚠️ INCIDENCIA:\s*([^\]]+)\]\s*\|\s*/g, '');
    cleanNotes = cleanNotes.replace(/\[Envío:\s*([^\]]+)\]\s*\|\s*/g, '');
    cleanNotes = cleanNotes.replace(/Método de pago:\s*([^.]+)\.?/g, '');
    cleanNotes = cleanNotes.replace(/Comprobante:\s*(\S+)/g, '');
    cleanNotes = cleanNotes.replace(/\|/g, '').trim();

    return {
      shipping: shipping || 'No especificado',
      payment: payment || 'No especificado',
      voucher: voucher || 'N/A',
      cleanNotes: cleanNotes
    };
  }

  private loadingOrders: { [key: string]: boolean } = {};

  public getOrderItems(order: OrderInterface): { name: string; qty: number }[] {
    if (order.orderDetails && order.orderDetails.length > 0) {
      return order.orderDetails.map(detail => ({
        name: detail.ordd_productname,
        qty: detail.ordd_quantity
      }));
    }

    // Carga diferida automática desde la API si no está en proceso de carga
    if (order.cmp_uuid && order.ord_uuid && !this.loadingOrders[order.ord_uuid]) {
      this.loadingOrders[order.ord_uuid] = true;
      this._ordersService.getOrderById(order.cmp_uuid, order.ord_uuid).subscribe({
        next: (res: any) => {
          if (res && res.data && res.data.orderDetails) {
            order.orderDetails = res.data.orderDetails;
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

  public getWhatsAppLink(order: OrderInterface): string {
    const storeName = this.companyNamesCache[order.cmp_uuid] || 'la tienda';
    const msg = `Hola ${storeName}! Te escribo por mi compra #PED-${order.ord_ordernumber}. Quería realizar una consulta sobre el estado del envío.`;
    // Retorna link de chat
    return `https://wa.me/5491100000000?text=${encodeURIComponent(msg)}`; // Usar teléfono mock o genérico
  }

  public onCollapseExpand(isActive: boolean, order: OrderInterface): void {
    // 1. Cargar detalles del pedido de forma diferida si se expande
    if (isActive && (!order.orderDetails || order.orderDetails.length === 0)) {
      if (order.cmp_uuid && order.ord_uuid) {
        this._ordersService.getOrderById(order.cmp_uuid, order.ord_uuid).subscribe({
          next: (res: any) => {
            if (res && res.data && res.data.orderDetails) {
              order.orderDetails = res.data.orderDetails;
            }
          },
          error: (err: any) => {
            console.error('Error fetching order details by ID:', err);
          }
        });
      }
    }

    // 2. Inicializar mapa de seguimiento interactivo si la orden está EN CAMINO (SHIPPED)
    if (order.ords_uuid === 'SHIPPED') {
      if (isActive) {
        // Delay ligero para permitir a Angular dibujar el div con [id] en el DOM
        setTimeout(() => {
          this.initializeTrackingMap(order);
        }, 300);
      } else {
        // Si se colapsa, limpiamos los intervalos y mapas activos para ahorrar recursos
        this.cleanupMap(order.ord_uuid);
      }
    }
  }

  public onHistoryExpand(isActive: boolean, order: OrderInterface): void {
    if (isActive && (!this.orderHistoryCache[order.ord_uuid] || this.orderHistoryCache[order.ord_uuid].length === 0)) {
      if (order.cmp_uuid && order.ord_uuid) {
        this.loadingHistory[order.ord_uuid] = true;
        this._ordersHistoryService.getOrderHistory(order.cmp_uuid, order.ord_uuid).subscribe({
          next: (res: any) => {
            if (res && res.data) {
              // Ordenar por fecha ascendente para mostrar el flujo cronológico
              this.orderHistoryCache[order.ord_uuid] = res.data.sort((a: any, b: any) => {
                return new Date(a.ordh_createdat).getTime() - new Date(b.ordh_createdat).getTime();
              });
            }
            this.loadingHistory[order.ord_uuid] = false;
          },
          error: (err: any) => {
            console.error('Error al recuperar historial de estados:', err);
            this.loadingHistory[order.ord_uuid] = false;
          }
        });
      }
    }
  }

  private initializeTrackingMap(order: OrderInterface): void {
    if (typeof L === 'undefined') {
      console.warn('Leaflet no está disponible en este momento.');
      return;
    }

    const mapId = 'map-' + order.ord_uuid;
    const container = document.getElementById(mapId);
    if (!container) {
      console.warn('Contenedor de mapa no encontrado en el DOM:', mapId);
      return;
    }

    // Limpiar mapas previos de esta misma orden si existiesen
    this.cleanupMap(order.ord_uuid);

    // Semilla numérica en base al UUID del pedido para generar coordenadas realistas y únicas por comercio/cliente
    const seed = order.ord_uuid ? order.ord_uuid.charCodeAt(0) : 10;
    
    // Coordenadas base (Buenos Aires Centro de referencia para coherencia visual)
    const originLat = -34.6037 + ((seed % 7) * 0.005) - 0.01;
    const originLng = -58.3816 + ((seed % 5) * 0.005) - 0.01;
    const origin: [number, number] = [originLat, originLng];

    // Destino (Cliente) perturbed de 3 a 7 km
    const destLat = originLat + 0.015 + ((seed % 3) * 0.004);
    const destLng = originLng + 0.015 + ((seed % 4) * 0.004);
    const destination: [number, number] = [destLat, destLng];

    // Punto intermedio en calle (para curvar la simulación de ruta)
    const midLat = originLat + (destLat - originLat) * 0.5 + 0.003;
    const midLng = originLng + (destLng - originLng) * 0.5 - 0.002;

    // 1. Inicializar mapa Leaflet
    const map = L.map(mapId, {
      zoomControl: true,
      attributionControl: false
    }).setView(origin, 14);

    // Mosaico claro de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // 2. Iconos personalizados premium estilizados con HTML/CSS
    const shopIcon = L.divIcon({
      className: 'leaflet-custom-marker',
      html: '<div style="background: #1890ff; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.25)">🏪</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const homeIcon = L.divIcon({
      className: 'leaflet-custom-marker',
      html: '<div style="background: #52c41a; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.25)">🏠</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const courierIcon = L.divIcon({
      className: 'leaflet-custom-marker',
      html: '<div style="background: #ff9c6e; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2px solid white; box-shadow: 0 0 12px rgba(255,156,110,0.8)">🛵</div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    // 3. Agregar Marcadores Estáticos
    L.marker(origin, { icon: shopIcon }).addTo(map).bindPopup('<b>Tienda Comercial</b><br>Despacho del pedido');
    L.marker(destination, { icon: homeIcon }).addTo(map).bindPopup('<b>Tu Domicilio</b><br>Destino del envío');

    // 4. Dibujar Ruta (Polyline con guiones)
    const polyline = L.polyline([origin, [midLat, midLng], destination], {
      color: '#1890ff',
      weight: 4,
      opacity: 0.6,
      dashArray: '5, 10'
    }).addTo(map);

    // Ajustar vista para abarcar toda la ruta despachada
    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

    // 5. Marcador Móvil del Repartidor (Simulador GPS)
    const courierMarker = L.marker(origin, { icon: courierIcon }).addTo(map);
    courierMarker.bindPopup('<b>Repartidor Express</b><br>En tránsito a tu hogar');

    // 6. Iniciar simulación de trayecto dinámico
    this.simulatedETA[order.ord_uuid] = 15; // ETA inicial: 15 minutos
    let currentStep = 0;
    const totalSteps = 100; // Cuadros de animación

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= totalSteps) {
        clearInterval(interval);
        this.simulatedETA[order.ord_uuid] = 0;
        courierMarker.setLatLng(destination);
        courierMarker.bindPopup('<b>Repartidor en destino</b><br>¡Llegó a tu domicilio!').openPopup();
        return;
      }

      // Interpolación suave paso a paso a través de los waypoints
      const t = currentStep / totalSteps;
      let currentLat, currentLng;

      if (t < 0.5) {
        // Tramo 1: Origen al punto intermedio
        const localT = t * 2;
        currentLat = origin[0] + (midLat - origin[0]) * localT;
        currentLng = origin[1] + (midLng - origin[1]) * localT;
      } else {
        // Tramo 2: Punto intermedio al destino
        const localT = (t - 0.5) * 2;
        currentLat = midLat + (destination[0] - midLat) * localT;
        currentLng = midLng + (destination[1] - midLng) * localT;
      }

      const currentPos: [number, number] = [currentLat, currentLng];
      courierMarker.setLatLng(currentPos);

      // Decrementar la estimación de tiempo proporcionalmente
      const remainingEta = Math.max(1, Math.round(15 * (1 - t)));
      this.simulatedETA[order.ord_uuid] = remainingEta;
    }, 2000); // Avanzar cuadro cada 2 segundos

    // Almacenar referencias para poder destruirlas adecuadamente
    this.activeMaps[order.ord_uuid] = map;
    this.activeIntervals[order.ord_uuid] = interval;
  }

  private cleanupMap(orderUuid: string): void {
    if (this.activeIntervals[orderUuid]) {
      clearInterval(this.activeIntervals[orderUuid]);
      delete this.activeIntervals[orderUuid];
    }
    if (this.activeMaps[orderUuid]) {
      this.activeMaps[orderUuid].remove();
      delete this.activeMaps[orderUuid];
    }
  }

  public openChat(order: OrderInterface): void {
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
    const sender = 'BUYER';
    const senderName = this.customer?.cus_fullname || this.customer?.cus_name || 'Comprador';
    const text = this.chatMessageText;
    const usrUuid = this.customer?.usr_uuid || '';
    const cusUuid = this.customer?.cus_uuid || '';

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

  // --- METODOS DE OPINIONES / FEEDBACK POSVENTA ---

  public openRatingWorkflow(order: OrderInterface): void {
    this.ratingOrder = order;
    this.ratingItems = [];

    const items = this.getOrderItems(order);

    // Si los items aún se están consultando en segundo plano, dar un breve delay
    if (items.length === 0) {
      setTimeout(() => {
        const loadedItems = this.getOrderItems(order);
        this.buildRatingItems(loadedItems);
      }, 900);
    } else {
      this.buildRatingItems(items);
    }

    this.isRatingVisible = true;
  }

  private buildRatingItems(items: any[]): void {
    if (!this.ratingOrder) return;
    const details = this.ratingOrder.orderDetails || [];

    this.ratingItems = details.map(d => ({
      pro_uuid: d.pro_uuid,
      prov_uuid: d.prov_uuid,
      name: d.ordd_productname,
      sku: d.ordd_sku,
      rating: 5,
      comment: '',
      submitted: false
    }));
  }

  public submitAllRatings(): void {
    if (!this.ratingOrder || this.ratingItems.length === 0) return;

    const unsubmitted = this.ratingItems.filter(i => !i.submitted);
    if (unsubmitted.length === 0) {
      this.closeRating();
      return;
    }

    this.isLoading = true; // Activar feedback visual global

    const requests = unsubmitted.map(item => {
      const reviewData: Partial<ProductVariationReviewInterface> = {
        cmp_uuid: this.ratingOrder!.cmp_uuid,
        pro_uuid: item.pro_uuid || '',
        prov_uuid: item.prov_uuid,
        usr_uuid: this.customer?.usr_uuid || '',
        cus_uuid: this.customer?.cus_uuid || '',
        provrev_rating: item.rating,
        provrev_comment: item.comment?.trim() || 'Compra calificada con éxito.',
        provrev_isverified: true
      };

      const authorName = this.customer?.cus_fullname || this.customer?.cus_name || 'Comprador ATS';
      (reviewData as any).provrev_author = authorName;
      (reviewData as any).provrev_avatar = authorName.substring(0, 2).toUpperCase();

      return this._reviewsService.saveProductVariationReview(reviewData);
    });

    forkJoin(requests).subscribe({
      next: () => {
        const ordUuid = this.ratingOrder!.ord_uuid;
        if (!this.ratedOrdersCache.includes(ordUuid)) {
          this.ratedOrdersCache.push(ordUuid);
          localStorage.setItem('ats_rated_orders', JSON.stringify(this.ratedOrdersCache));
        }

        this.message.success('¡Muchas gracias! Tus valoraciones de producto fueron guardadas y publicadas.');
        this.isLoading = false;
        this.closeRating();
      },
      error: (err) => {
        console.error('Error al enviar calificaciones posventa en lote:', err);
        this.message.error('Ocurrió un inconveniente al registrar tus opiniones en el servidor.');
        this.isLoading = false;
      }
    });
  }

  public isOrderAlreadyRated(ordUuid: string): boolean {
    return this.ratedOrdersCache.includes(ordUuid);
  }

  public closeRating(): void {
    this.isRatingVisible = false;
    this.ratingOrder = null;
    this.ratingItems = [];
  }

  ngOnDestroy(): void {
    // Limpiar todos los recursos activos para evitar fugas de memoria (memory leaks)
    if (this._orderUpdateSub) {
      this._orderUpdateSub.unsubscribe();
    }
    if (this._chatMessagesSub) {
      this._chatMessagesSub.unsubscribe();
    }
    Object.keys(this.activeIntervals).forEach(uuid => clearInterval(this.activeIntervals[uuid]));
    Object.keys(this.activeMaps).forEach(uuid => {
      if (this.activeMaps[uuid]) {
        this.activeMaps[uuid].remove();
      }
    });
  }
}
