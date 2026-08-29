import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService
  ) { }

  /**
   * Registra un evento de analíticas (vistas de página, clics, etc.).
   * Filtra automáticamente y excluye visitas del propio vendedor de su propia tienda.
   */
  public trackEvent(cmpUuid: string, eventType: string, targetUuid?: string, metadata?: any): Observable<any> {
    try {
      const session = this._sessionService.getCurrentSession();
      const loggedInCompany = session?.company;

      if (loggedInCompany && loggedInCompany.cmp_uuid === cmpUuid) {
        // Tráfico propio del vendedor en su misma tienda -> Excluir silenciosamente
        return of({ skipped: true, reason: 'Merchant own traffic excluded' });
      }
    } catch (e) {
      console.warn('Error al verificar sesión en trackEvent:', e);
    }

    const headers = new HttpHeaders().set('content-type', 'application/json');
    const body = {
      cmp_uuid: cmpUuid,
      aev_eventtype: eventType,
      aev_targetuuid: targetUuid || '',
      aev_metadata: metadata ? JSON.stringify(metadata) : '{}'
    };
    return this._http.post<any>(`${environment.apiUrl}analytics/track`, body, { headers });
  }

  /**
   * Obtiene el resumen de analíticas consolidado para el vendedor.
   */
  public getSummary(cmpUuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}analytics/summary/${cmpUuid}`, { headers });
  }
}
