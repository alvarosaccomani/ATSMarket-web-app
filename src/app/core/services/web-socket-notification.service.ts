import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationInterface } from '@interfaces/notification/notification.interface';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketNotificationService implements OnDestroy {

  private ws: WebSocket | null = null;
  private channel: BroadcastChannel;
  
  // Observables para el estado y flujo de notificaciones
  private notificationsSubject = new BehaviorSubject<NotificationInterface[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  // Canal específico para actualizaciones de órdenes en tiempo real
  private orderUpdatesSubject = new Subject<{ ord_uuid: string, status: string, notes?: string }>();
  public orderUpdates$ = this.orderUpdatesSubject.asObservable();

  constructor(
    private _notificationsService: NotificationsService
  ) {
    // 1. Inicializar el canal de difusión entre pestañas del mismo navegador (BroadcastChannel)
    // Esto permite comunicación en tiempo real cruzada entre la pestaña del Repartidor y la del Comprador.
    this.channel = new BroadcastChannel('ats_market_realtime');
    this.setupBroadcastListener();

    // 2. Cargar notificaciones persistidas en localStorage
    this.loadFromStorage();

    // 3. Conectar al WebSocket del backend si está configurado
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    this.disconnect();
    if (this.channel) {
      this.channel.close();
    }
  }

  /**
   * Cargar notificaciones guardadas del almacenamiento local.
   */
  private loadFromStorage(): void {
    const stored = localStorage.getItem('ats_notifications');
    if (stored) {
      try {
        const list: NotificationInterface[] = JSON.parse(stored);
        this.notificationsSubject.next(list);
        this.updateUnreadCount(list);
      } catch (e) {
        console.error('Error al parsear notificaciones de localStorage:', e);
      }
    }
  }

  /**
   * Persistir notificaciones en localStorage.
   */
  private saveToStorage(list: NotificationInterface[]): void {
    localStorage.setItem('ats_notifications', JSON.stringify(list));
  }

  /**
   * Actualizar dinámicamente el contador de no leídos.
   */
  private updateUnreadCount(list: NotificationInterface[]): void {
    const count = list.filter(n => !n.ntf_isread).length;
    this.unreadCountSubject.next(count);
  }

  /**
   * Configura el listener del BroadcastChannel para escuchar eventos cruzados de pestañas.
   */
  private setupBroadcastListener(): void {
    this.channel.onmessage = (event) => {
      const { type, payload } = event.data;
      
      if (type === 'NEW_NOTIFICATION') {
        this.handleNewNotificationIncoming(payload);
      } else if (type === 'ORDER_STATUS_UPDATED') {
        this.orderUpdatesSubject.next(payload);
      }
    };
  }

  /**
   * Procesa la llegada de una nueva notificación.
   */
  private handleNewNotificationIncoming(notification: NotificationInterface): void {
    const current = this.notificationsSubject.value;
    // Evitar duplicados por ID
    if (current.some(n => n.ntf_uuid === notification.ntf_uuid)) return;

    const updated = [notification, ...current].slice(0, 30); // Limitar a las 30 más recientes
    this.notificationsSubject.next(updated);
    this.saveToStorage(updated);
    this.updateUnreadCount(updated);
  }

  /**
   * Intenta conectar al servidor de WebSockets si existe en el entorno.
   */
  private connectWebSocket(): void {
    const wsUrl = (environment as any).apiUrlSocket || 'ws://localhost:3000/realtime';
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('🔌 Conectado exitosamente al servidor WebSocket de ATSMarket.');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NEW_NOTIFICATION') {
            this.handleNewNotificationIncoming(data.payload);
          } else if (data.type === 'ORDER_STATUS_UPDATED') {
            this.orderUpdatesSubject.next(data.payload);
            // También difundir localmente a otras pestañas
            this.channel.postMessage({ type: 'ORDER_STATUS_UPDATED', payload: data.payload });
          }
        } catch (e) {
          console.warn('Mensaje de WebSocket recibido no parseable:', event.data);
        }
      };

      this.ws.onerror = () => {
        // Silencioso, ya que el BroadcastChannel local suplirá la comunicación en modo desarrollo
      };

      this.ws.onclose = () => {
        // Reintentar conexión de forma diferida cada 15 segundos
        setTimeout(() => this.connectWebSocket(), 15000);
      };
    } catch (e) {
      console.warn('No se pudo establecer la conexión de WebSockets. Operando en Modo Broadcast local.');
    }
  }

  /**
   * Difunde una actualización de estado de pedido en tiempo real.
   */
  public broadcastOrderStatusUpdate(ord_uuid: string, status: string, notes?: string): void {
    const payload = { ord_uuid, status, notes };
    
    // 1. Difundir cruzado a nivel local (BroadcastChannel)
    this.channel.postMessage({ type: 'ORDER_STATUS_UPDATED', payload });
    this.orderUpdatesSubject.next(payload);

    // 2. Transmitir por WebSocket al servidor si está activo
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ORDER_STATUS_UPDATED', payload }));
    }
  }

  /**
   * Genera e inyecta una nueva notificación en el flujo del usuario en tiempo real.
   */
  public pushNotification(notificationData: Omit<NotificationInterface, 'ntf_uuid' | 'ntf_createdat' | 'ntf_isread'>): void {
    const newNtf: NotificationInterface = {
      ...notificationData,
      ntf_uuid: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      ntf_createdat: new Date().toISOString(),
      ntf_isread: false
    };

    // 1. Guardar la notificación en el backend usando el servicio especializado
    this._notificationsService.saveNotification(newNtf).subscribe({
      next: (res) => console.log('Notificación guardada exitosamente en base de datos:', res),
      error: (err) => console.error('Error al persistir notificación en backend:', err)
    });

    // 2. Manejarla en la pestaña actual
    this.handleNewNotificationIncoming(newNtf);

    // 3. Difundirla a todas las demás pestañas abiertas (BroadcastChannel)
    this.channel.postMessage({ type: 'NEW_NOTIFICATION', payload: newNtf });

    // 4. Enviar por WebSocket al servidor
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'NEW_NOTIFICATION', payload: newNtf }));
    }
  }

  /**
   * Marca todas las notificaciones del historial del usuario como leídas.
   */
  public markAllAsRead(): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(n => ({ ...n, ntf_isread: true }));
    this.notificationsSubject.next(updated);
    this.saveToStorage(updated);
    this.updateUnreadCount(updated);
  }

  /**
   * Desconectar explícitamente el socket.
   */
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
