import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderResults } from '@interfaces/order';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todas las ordenes de una empresa.
   * En una aplicación real, aquí usarías this.http.get<IProduct[]>('URL_DE_TU_API').
   * @returns Observable de un array de productos.
   */
  public getOrders(cmp_uuid: string): Observable<OrderResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<OrderResults>(`${environment.apiUrl}orders/${cmp_uuid}`, { headers, params });
  }
}
