import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

/**
 * @description Modelo de datos que encapsula el estado completo de la sesión activa en el cliente.
 */
export interface SessionData {
  /**
   * @description Datos del perfil y credenciales del usuario autenticado.
   */
  identity?: any;
  /**
   * @description Información de la compañía o comercio actualmente seleccionado en contexto.
   */
  company?: any;
  /**
   * @description Token de autenticación JWT para firmas de peticiones API.
   */
  token?: string;
  /**
   * @description Información del perfil de cliente asociado a la cuenta.
   */
  customer?: any;
}

/**
 * @description Servicio central de autenticación y gestión de estado de sesión.
 * Administra la persistencia segura en LocalStorage, la notificación reactiva a través
 * de BehaviorSubject y el control del contexto activo de empresa para navegación RBAC.
 */
@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private sessionSubject = new BehaviorSubject<SessionData | null>(this.getStoredSession());
  public refreshCompanies$ = new Subject<void>();

  constructor() { }

  // SETTERS individuales
  /**
   * @description Establece o actualiza la identidad del usuario en la sesión activa y almacenamiento local.
   * @param identity Objeto de usuario o cadena serializada en JSON.
   */
  public setIdentity(identity: any | string): void {
    const identityObj = typeof identity === 'string'
      ? JSON.parse(identity)
      : identity;

    const current = this.getCurrentSession();
    const updated = { ...current, identity: identityObj };
    this.updateSession(updated);
  }

  /**
   * @description Establece la empresa activa en el contexto de navegación y permisos de la sesión.
   * @param company Objeto de compañía o cadena serializada en JSON.
   */
  public setCompany(company: any | string): void {
    const companyObj = typeof company === 'string'
      ? JSON.parse(company)
      : company;

    const current = this.getCurrentSession();
    const updated = { ...current, company: companyObj };
    this.updateSession(updated);
  }

  /**
   * @description Registra el perfil de comprador o cliente vinculado a la sesión actual.
   * @param customer Objeto de cliente o cadena JSON.
   */
  public setCustomer(customer: any | string): void {
    const customerObj = typeof customer === 'string'
      ? JSON.parse(customer)
      : customer;

    const current = this.getCurrentSession();
    const updated = { ...current, customer: customerObj };
    this.updateSession(updated);
  }

  /**
   * @description Almacena el token de autorización JWT y sincroniza el estado de sesión.
   * @param token Cadena con el token Bearer emitido por el backend.
   */
  public setToken(token: string): void {
    const current = this.getCurrentSession();
    const updated = { ...current, token };
    this.updateSession(updated);
  }

  // GETTERS tipados
  /**
   * @description Obtiene los datos del usuario autenticado actualmente o null si es anónimo.
   * @returns {any | null} Objeto de identidad de usuario.
   */
  public getIdentity(): any | null {
    return this.getCurrentSession()?.identity || null;
  }

  /**
   * @description Obtiene la empresa activa seleccionada en el contexto operativo.
   * @returns {any | null} Objeto de compañía o null si no se seleccionó ninguna.
   */
  public getCompany(): any | null {
    return this.getCurrentSession()?.company || null;
  }

  /**
   * @description Obtiene la información del cliente vinculado.
   * @returns {any | null} Objeto de cliente o null.
   */
  public getCustomer(): any | null {
    return this.getCurrentSession()?.customer || null;
  }

  /**
   * @description Recupera la fotografía completa de la sesión activa en memoria.
   * @returns {SessionData | null} Datos de sesión vigentes.
   */
  public getCurrentSession(): SessionData | null {
    return this.sessionSubject.value;
  }

  /**
   * @description Cierra la sesión activa, eliminando las claves de localStorage y notificando a los observadores.
   * @returns {void}
   */
  public logout(): void {
    localStorage.removeItem('session');
    this.sessionSubject.next(null);
  }

  private updateSession(session: SessionData): void {
    localStorage.setItem('session', JSON.stringify(session));
    this.sessionSubject.next(session);
  }

  private getStoredSession(): SessionData | null {
    try {
      const stored = localStorage.getItem('session');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing stored session:', error);
      return null;
    }
  }
}

