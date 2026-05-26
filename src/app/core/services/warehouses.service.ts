import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WarehouseResults } from '@interfaces/warehouse';

@Injectable({
  providedIn: 'root'
})
export class WarehousesService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todos los depósitos de una empresa.
   * @returns Observable de un array de depositos.
   */
  public getWarehouses(cmp_uuid: string): Observable<WarehouseResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    return this._http.get<WarehouseResults>(`${environment.apiUrl}warehouses/${cmp_uuid}`, { headers, params });
  }

  /**
   * Obtiene un depósito específico por su UUID.
   */
  public getWarehouseById(cmp_uuid: string, war_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}warehouse/${cmp_uuid}/${war_uuid}`, { headers });
  }

  /**
   * Crea un nuevo depósito.
   */
  public saveWarehouse(warehouse: any): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    const params = JSON.stringify(warehouse);
    return this._http.post<any>(`${environment.apiUrl}warehouse`, params, { headers });
  }

  /**
   * Actualiza un depósito existente.
   */
  public updateWarehouse(warehouse: any): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    const params = JSON.stringify(warehouse);
    return this._http.put<any>(`${environment.apiUrl}warehouse/${warehouse.cmp_uuid}/${warehouse.war_uuid}`, params, { headers });
  }
}
