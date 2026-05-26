import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { WarehouseInterface, WarehouseResults } from '@interfaces/warehouse';
import { WarehouseLocationInterface } from '@interfaces/warehouse-location';

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
    return this._http.get<any>(`${environment.apiUrl}warehouse/${cmp_uuid}/${war_uuid}`, { headers }).pipe(
      catchError(() => {
        const localData = localStorage.getItem(`warehouses_${cmp_uuid}`);
        const list: WarehouseInterface[] = localData ? JSON.parse(localData) : [];
        const found = list.find(w => w.war_uuid === war_uuid);
        return of({ success: !!found, data: found });
      })
    );
  }

  /**
   * Crea un nuevo depósito.
   */
  public saveWarehouse(warehouse: any): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    const params = JSON.stringify(warehouse);
    return this._http.post<any>(`${environment.apiUrl}warehouse`, params, { headers }).pipe(
      catchError(() => {
        const cmp_uuid = warehouse.cmp_uuid;
        const localData = localStorage.getItem(`warehouses_${cmp_uuid}`);
        const list: WarehouseInterface[] = localData ? JSON.parse(localData) : [];
        
        const newWarehouse: WarehouseInterface = {
          ...warehouse,
          war_uuid: 'war-' + Math.random().toString(36).substr(2, 9),
          war_active: warehouse.war_active !== undefined ? warehouse.war_active : true,
          war_createdat: new Date(),
          war_updatedat: new Date()
        };
        list.push(newWarehouse);
        localStorage.setItem(`warehouses_${cmp_uuid}`, JSON.stringify(list));
        return of({ success: true, data: newWarehouse });
      })
    );
  }

  /**
   * Actualiza un depósito existente.
   */
  public updateWarehouse(warehouse: any): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    const params = JSON.stringify(warehouse);
    return this._http.put<any>(`${environment.apiUrl}warehouse/${warehouse.cmp_uuid}/${warehouse.war_uuid}`, params, { headers }).pipe(
      catchError(() => {
        const cmp_uuid = warehouse.cmp_uuid;
        const localData = localStorage.getItem(`warehouses_${cmp_uuid}`);
        let list: WarehouseInterface[] = localData ? JSON.parse(localData) : [];
        
        const idx = list.findIndex(w => w.war_uuid === warehouse.war_uuid);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            ...warehouse,
            war_updatedat: new Date()
          };
          localStorage.setItem(`warehouses_${cmp_uuid}`, JSON.stringify(list));
          return of({ success: true, data: list[idx] });
        }
        return of({ success: false, error: 'Warehouse not found' });
      })
    );
  }

  /**
   * Obtiene todas las ubicaciones físicas de un depósito.
   */
  public getLocations(war_uuid: string): Observable<{ success: boolean, data: WarehouseLocationInterface[] }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<{ success: boolean, data: WarehouseLocationInterface[] }>(`${environment.apiUrl}warehouse-locations/${war_uuid}`, { headers }).pipe(
      catchError(() => {
        const localData = localStorage.getItem(`locations_${war_uuid}`);
        let list: WarehouseLocationInterface[] = localData ? JSON.parse(localData) : [];
        return of({ success: true, data: list });
      })
    );
  }

  /**
   * Guarda una única ubicación física.
   */
  public saveLocation(location: WarehouseLocationInterface): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    const params = JSON.stringify(location);
    return this._http.post<any>(`${environment.apiUrl}warehouse-location`, params, { headers }).pipe(
      catchError(() => {
        const war_uuid = location.war_uuid;
        const localData = localStorage.getItem(`locations_${war_uuid}`);
        const list: WarehouseLocationInterface[] = localData ? JSON.parse(localData) : [];
        
        const newLocation: WarehouseLocationInterface = {
          ...location,
          warl_uuid: 'loc-' + Math.random().toString(36).substr(2, 9),
          warl_active: true,
          warl_createdat: new Date(),
          warl_updatedat: new Date()
        };
        list.push(newLocation);
        localStorage.setItem(`locations_${war_uuid}`, JSON.stringify(list));
        return of({ success: true, data: newLocation });
      })
    );
  }

  /**
   * Guarda un lote masivo de ubicaciones.
   */
  public saveLocationsBatch(war_uuid: string, locations: WarehouseLocationInterface[]): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    const params = JSON.stringify({ war_uuid, locations });
    return this._http.post<any>(`${environment.apiUrl}warehouse-locations/batch`, params, { headers }).pipe(
      catchError(() => {
        const localData = localStorage.getItem(`locations_${war_uuid}`);
        const list: WarehouseLocationInterface[] = localData ? JSON.parse(localData) : [];
        
        const processed = locations.map(loc => ({
          ...loc,
          warl_uuid: 'loc-' + Math.random().toString(36).substr(2, 9),
          warl_active: true,
          warl_createdat: new Date(),
          warl_updatedat: new Date()
        }));
        
        const updatedList = [...list, ...processed];
        localStorage.setItem(`locations_${war_uuid}`, JSON.stringify(updatedList));
        return of({ success: true, count: processed.length, data: processed });
      })
    );
  }

  /**
   * Elimina una ubicación física del depósito.
   */
  public deleteLocation(war_uuid: string, warl_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete<any>(`${environment.apiUrl}warehouse-location/${war_uuid}/${warl_uuid}`, { headers }).pipe(
      catchError(() => {
        const localData = localStorage.getItem(`locations_${war_uuid}`);
        let list: WarehouseLocationInterface[] = localData ? JSON.parse(localData) : [];
        
        list = list.filter(l => l.warl_uuid !== warl_uuid);
        localStorage.setItem(`locations_${war_uuid}`, JSON.stringify(list));
        return of({ success: true });
      })
    );
  }
}
