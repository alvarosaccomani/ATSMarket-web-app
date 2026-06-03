import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { NotificationInterface } from '@interfaces/notification/notification.interface';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketNotificationService implements OnDestroy {

  private socket: Socket | null = null;
  private channel: BroadcastChannel;
  
  // Observables para el estado y flujo de notificaciones
  private notificationsSubject = new BehaviorSubject<NotificationInterface[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  // Canal específico para notificaciones entrantes individuales en tiempo real
  private incomingNotificationSubject = new Subject<NotificationInterface>();
  public incomingNotification$ = this.incomingNotificationSubject.asObservable();

  // Canal específico para actualizaciones de órdenes en tiempo real
  private orderUpdatesSubject = new Subject<{ ord_uuid: string, status: string, notes?: string }>();
  public orderUpdates$ = this.orderUpdatesSubject.asObservable();

  // Canal específico para mensajes de chat en tiempo real
  private chatMessagesSubject = new Subject<any>();
  public chatMessages$ = this.chatMessagesSubject.asObservable();

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

    // Emitir la notificación individual recién llegada
    this.incomingNotificationSubject.next(notification);
  }

  /**
   * Reproduce un sonido armónico y agradable (chime) usando la API nativa de Audio Web del navegador.
   */
  public playNotificationSound(): void {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Primera nota (D5 - 587.33 Hz)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gain1.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.35);
      
      // Segunda nota (A5 - 880 Hz) con ligero retraso de 100ms
      setTimeout(() => {
        try {
          if (audioCtx.state === 'closed') return;
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(880, audioCtx.currentTime);
          gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
          osc2.start(audioCtx.currentTime);
          osc2.stop(audioCtx.currentTime + 0.5);
        } catch (innerErr) {
          // Capturar errores si el contexto se cerró en el medio
        }
      }, 100);
      
    } catch (e) {
      console.warn('No se pudo reproducir el sonido de notificación sintético:', e);
    }
  }

  /**
   * Intenta conectar al servidor de WebSockets si existe en el entorno.
   */
  private connectWebSocket(): void {
    const socketUrl = environment.apiUrlSocket || 'http://localhost:3002';
    
    try {
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('🔌 Conectado exitosamente al servidor Socket.io de ATSMarket.');
      });

      // Escuchar eventos en tiempo real transmitidos por el backend
      this.socket.on('NEW_NOTIFICATION', (payload: any) => {
        this.handleNewNotificationIncoming(payload);
      });

      this.socket.on('ORDER_STATUS_UPDATED', (payload: any) => {
        this.orderUpdatesSubject.next(payload);
        // También difundir localmente a otras pestañas (BroadcastChannel)
        this.channel.postMessage({ type: 'ORDER_STATUS_UPDATED', payload });
      });

      this.socket.on('NEW_CHAT_MESSAGE', (payload: any) => {
        this.chatMessagesSubject.next(payload);
        // También difundir localmente a otras pestañas (BroadcastChannel)
        this.channel.postMessage({ type: 'NEW_CHAT_MESSAGE', payload });
      });

      this.socket.on('connect_error', () => {
        // Silencioso
      });

      this.socket.on('disconnect', () => {
        console.warn('Conexión de socket de ATSMarket perdida.');
      });
    } catch (e) {
      console.warn('No se pudo establecer la conexión de Sockets. Operando en Modo Broadcast local.');
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

    // 2. Transmitir por Socket al servidor si está activo
    if (this.socket && this.socket.connected) {
      this.socket.emit('ORDER_STATUS_UPDATED', payload);
    }
  }

  /**
   * Emite un mensaje de chat en tiempo real al servidor
   */
  public emitChatMessage(message: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('NEW_CHAT_MESSAGE', message);
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

    // 4. Enviar por Socket al servidor
    if (this.socket && this.socket.connected) {
      this.socket.emit('NEW_NOTIFICATION', newNtf);
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
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
