import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderHistoryResults } from '@interfaces/order-history';

@Injectable({
  providedIn: 'root'
})
export class OrdersHistoryService {

  constructor(
    private _http: HttpClient
  ) { }
  
  /**
   * Obtiene todos los materiales.
   * @returns Observable de un array con el historico de una orden.
   */
  public getOrderHistory(cmp_uuid: string, ord_uuid: string): Observable<OrderHistoryResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    return this._http.get<OrderHistoryResults>(`${environment.apiUrl}order-history/${cmp_uuid}/${ord_uuid}`, { headers, params });
  }
}
