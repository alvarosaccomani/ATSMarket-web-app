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

  /**
   * Obtiene una orden por su UUID.
   */
  public getOrderById(cmp_uuid: string, ord_uuid: string): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<{ data: any }>(`${environment.apiUrl}order/${cmp_uuid}/${ord_uuid}`, { headers });
  }

  /**
   * Obtiene todas las ordenes asociadas a un cliente específico.
   * @param cus_uuid UUID del cliente.
   * @returns Observable con los resultados de las ordenes.
   */
  public getOrdersByCustomer(cus_uuid: string): Observable<OrderResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<OrderResults>(`${environment.apiUrl}orders-by-customer/${cus_uuid}`, { headers });
  }

  /**
   * Crea una nueva orden en el sistema.
   * @param orderData Datos de la orden a insertar.
   */
  public saveOrder(orderData: any): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}order`, orderData, { headers });
  }
}

