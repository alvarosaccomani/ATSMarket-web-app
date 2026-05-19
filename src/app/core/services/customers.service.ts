import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
   * Obtiene el cliente de un usuario.
   * @param usr_uuid UUID del usuario.
   * @returns Observable del cliente.
   */
  public getCustomerByUserId(usr_uuid: string): Observable<CustomerResults> {
    const endpoint = `${environment.apiUrl}customer-by-user/${usr_uuid}`;
    return this._http.get<CustomerResults>(endpoint);
  }
}
