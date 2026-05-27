import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WarehouseLocationInterface } from '@interfaces/warehouse-location';

@Injectable({
  providedIn: 'root'
})
export class WarehousesLocationsService {

  constructor(
    private _http: HttpClient
  ) { }
  
  /**
   * Obtiene todas las ubicaciones físicas de un depósito.
   */
  public getLocations(cmp_uuid: string, war_uuid: string): Observable<{ success: boolean, data: WarehouseLocationInterface[] }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    return this._http.get<{ success: boolean, data: WarehouseLocationInterface[] }>(`${environment.apiUrl}warehouse-locations/${cmp_uuid}/${war_uuid}`, { headers, params });
  }

  /**
   * Guarda una única ubicación física.
   */
  public saveLocation(location: WarehouseLocationInterface): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    const params = JSON.stringify(location);
    return this._http.post<any>(`${environment.apiUrl}warehouse-location`, params, { headers });
  }

  /**
   * Guarda un lote masivo de ubicaciones.
   */
  public saveLocationsBatch(cmp_uuid: string, war_uuid: string, locations: WarehouseLocationInterface[]): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    const params = JSON.stringify({ cmp_uuid, war_uuid, locations });
    return this._http.post<any>(`${environment.apiUrl}warehouse-locations/batch`, params, { headers });
  }

  /**
   * Actualiza una ubicación física existente.
   */
  public updateLocation(location: WarehouseLocationInterface): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    const params = JSON.stringify(location);
    return this._http.put<any>(`${environment.apiUrl}warehouse-location/${location.cmp_uuid}/${location.war_uuid}/${location.warl_uuid}`, params, { headers });
  }

  /**
   * Elimina una ubicación física del depósito.
   */
  public deleteLocation(cmp_uuid: string, war_uuid: string, warl_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete<any>(`${environment.apiUrl}warehouse-location/${cmp_uuid}/${war_uuid}/${warl_uuid}`, { headers });
  }
}
