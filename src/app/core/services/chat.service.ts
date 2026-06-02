import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MessageInterface } from '../interfaces/message/message.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnDestroy {

  private channel: BroadcastChannel;
  
  // Subject para emitir los mensajes del chat activo actual
  private activeChatMessagesSubject = new BehaviorSubject<MessageInterface[]>([]);
  public activeChatMessages$ = this.activeChatMessagesSubject.asObservable();
  
  private currentActiveOrdUuid: string | null = null;

  constructor(
    private _http: HttpClient
  ) {
    // Inicializar el canal BroadcastChannel para intercomunicación en tiempo real entre pestañas
    this.channel = new BroadcastChannel('ats_market_realtime');
    this.setupBroadcastListener();
  }

  ngOnDestroy(): void {
    if (this.channel) {
      this.channel.close();
    }
  }

  /**
   * Configura el listener del canal para recibir mensajes enviados desde otras pestañas
   */
  private setupBroadcastListener(): void {
    this.channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'NEW_CHAT_MESSAGE') {
        this.receiveMessage(payload);
      }
    };
  }

  /**
   * Carga los mensajes de un pedido y los establece como el chat activo actual
   */
  public loadActiveChat(cmp_uuid: string, ord_uuid: string): void {
    this.currentActiveOrdUuid = ord_uuid;
    
    this.getMessages(cmp_uuid, ord_uuid).subscribe({
      next: (messages) => {
        if (this.currentActiveOrdUuid === ord_uuid) {
          this.activeChatMessagesSubject.next(messages);
        }
      },
      error: (err) => {
        console.error('Error al cargar chat activo:', err);
        this.activeChatMessagesSubject.next([]);
      }
    });
  }

  /**
   * Limpia el chat activo al cerrar el cajón
   */
  public clearActiveChat(): void {
    this.currentActiveOrdUuid = null;
    this.activeChatMessagesSubject.next([]);
  }

  /**
   * Obtiene los mensajes históricos de una orden, consultando al backend y usando localStorage de fallback
   */
  public getMessages(cmp_uuid: string, ord_uuid: string): Observable<MessageInterface[]> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    
    return this._http.get<{ data: MessageInterface[] }>(`${environment.apiUrl}messages/${cmp_uuid}/${ord_uuid}`, { headers }).pipe(
      map(res => res.data || []),
      catchError(err => {
        // Fallback local: recuperar del almacenamiento local
        console.warn(`No se pudo conectar a la base de datos de chat. Recuperando de la caché local para #PED-${ord_uuid}`);
        const localData = localStorage.getItem(`ats_chats_${cmp_uuid}_${ord_uuid}`);
        if (localData) {
          try {
            return of(JSON.parse(localData));
          } catch (e) {
            console.error('Error al parsear chat del almacenamiento local:', e);
          }
        }
        return of([]);
      })
    );
  }

  /**
   * Envía un nuevo mensaje al chat, persistiendo en el backend y difundiéndolo en caliente
   */
  public sendMessage(
    cmp_uuid: string,
    ord_uuid: string,
    sender: 'BUYER' | 'MERCHANT' | 'RIDER',
    senderName: string,
    text: string,
    usr_uuid: string,
    cus_uuid: string | null
  ): Observable<MessageInterface> {
    
    const newMessage: MessageInterface = {
      cmp_uuid,
      msg_uuid: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      ord_uuid,
      msg_sender: sender,
      usr_uuid,
      cus_uuid,
      msg_sendername: senderName,
      msg_text: text,
      msg_createdat: new Date(),
      msg_updatedat: new Date()
    };

    // 1. Guardar en almacenamiento local (Caché síncrona en memoria)
    this.saveToLocalCache(cmp_uuid, ord_uuid, newMessage);

    // 2. Difundir en tiempo real a otras pestañas locales (Comprador/Vendedor en el mismo navegador)
    this.channel.postMessage({ type: 'NEW_CHAT_MESSAGE', payload: newMessage });

    // 3. Si la orden es la que está abierta en pantalla, inyectar el mensaje de inmediato
    this.receiveMessage(newMessage);

    // 4. Intentar guardar en la base de datos del backend
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post<any>(`${environment.apiUrl}message`, newMessage, { headers }).pipe(
      map(res => newMessage),
      catchError(err => {
        console.warn('Error al guardar mensaje en el backend. Conservado en memoria local:', err);
        return of(newMessage);
      })
    );
  }

  /**
   * Procesa la llegada de un mensaje en caliente (propio o de terceros)
   */
  public receiveMessage(message: MessageInterface): void {
    // Si el mensaje no corresponde al chat que tenemos abierto en el drawer, solo lo guardamos en la caché local
    if (message.ord_uuid !== this.currentActiveOrdUuid) {
      this.saveToLocalCache(message.cmp_uuid, message.ord_uuid, message);
      return;
    }

    const currentMessages = this.activeChatMessagesSubject.value;
    
    // Evitar inyectar duplicados
    if (currentMessages.some(m => m.msg_uuid === message.msg_uuid)) return;

    // Inyectar al flujo activo
    const updated = [...currentMessages, message];
    this.activeChatMessagesSubject.next(updated);
    
    // Sincronizar cache
    this.saveToLocalCache(message.cmp_uuid, message.ord_uuid, message);
  }

  /**
   * Guarda un mensaje en el almacenamiento local para la orden especificada
   */
  private saveToLocalCache(cmp_uuid: string, ord_uuid: string, message: MessageInterface): void {
    const key = `ats_chats_${cmp_uuid}_${ord_uuid}`;
    const stored = localStorage.getItem(key);
    let list: MessageInterface[] = [];
    
    if (stored) {
      try {
        list = JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing localStorage chats:', e);
      }
    }
    
    if (!list.some(m => m.msg_uuid === message.msg_uuid)) {
      list.push(message);
      localStorage.setItem(key, JSON.stringify(list));
    }
  }
}
