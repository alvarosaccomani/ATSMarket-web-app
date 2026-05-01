import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GlobalItemResults } from '@interfaces/global-item';

@Injectable({
  providedIn: 'root'
})
export class GlobalItemsService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todos los rubros globales.
   * @returns Observable de un array de rubros globales.
   */
  public getGlobalItems(): Observable<GlobalItemResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<GlobalItemResults>(`${environment.apiUrl}global-items`, { headers, params });
  }

  /**
   * Obtiene un rubro global por su UUID.
   */
  public getGlobalItemById(gitm_uuid: string): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<{ data: any }>(`${environment.apiUrl}global-item/${gitm_uuid}`, { headers });
  }

  /**
   * Crea un nuevo rubro global.
   */
  public saveGlobalItem(globalItem: any): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post<{ data: any }>(`${environment.apiUrl}global-item`, globalItem, { headers });
  }

  /**
   * Actualiza un rubro global existente.
   */
  public updateGlobalItem(gitm_uuid: string, item: any): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put<{ data: any }>(`${environment.apiUrl}global-item/${gitm_uuid}`, item, { headers });
  }

  /**
   * Elimina un rubro global.
   */
  public deleteGlobalItem(gitm_uuid: string): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete<{ data: any }>(`${environment.apiUrl}global-item/${gitm_uuid}`, { headers });
  }
}
