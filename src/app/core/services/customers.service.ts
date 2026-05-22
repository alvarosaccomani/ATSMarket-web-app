import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerResults } from '@interfaces/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todas las monedas.
   * @returns Observable de un array de monedas.
   */
  public getCustomers(): Observable<CustomerResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    return this._http.get<CustomerResults>(`${environment.apiUrl}customers`, { headers, params });
  }

  /**
   * Crea un nuevo cliente.
   */
  public saveCustomer(customer: any): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post<{ data: any }>(`${environment.apiUrl}customer`, customer, { headers });
  }

  /**
   * Obtiene el cliente de un usuario.
   * @param usr_uuid UUID del usuario.
   * @returns Observable del cliente.
   */
  public getCustomerByUserId(usr_uuid: string): Observable<CustomerResults> {
    const endpoint = `${environment.apiUrl}customer-by-user/${usr_uuid}`;
    return this._http.get<CustomerResults>(endpoint);
  }
}
