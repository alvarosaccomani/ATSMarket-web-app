import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SupplierResults } from '@interfaces/supplier';

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todos los proveedores.
   * @returns Observable de un array de proveedores.
   */
  public getSuppliers(cmp_uuid: string): Observable<SupplierResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<SupplierResults>(`${environment.apiUrl}suppliers/${cmp_uuid}`, { headers, params });
  }
}
