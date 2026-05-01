import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GlobalMaterialResults } from '@interfaces/global-material';

@Injectable({
  providedIn: 'root'
})
export class GlobalMaterialsService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todos los materiales globales.
   * @returns Observable de un array de materiales globales.
   */
  public getGlobalMaterials(): Observable<GlobalMaterialResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    return this._http.get<GlobalMaterialResults>(`${environment.apiUrl}global-materials`, { headers, params });
  }

  /**
   * Obtiene un material global por su UUID.
   */
  public getGlobalMaterialById(gmat_uuid: string): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<{ data: any }>(`${environment.apiUrl}global-material/${gmat_uuid}`, { headers });
  }

  /**
   * Crea un nuevo material global.
   */
  public saveGlobalMaterial(material: any): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post<{ data: any }>(`${environment.apiUrl}global-material`, material, { headers });
  }

  /**
   * Actualiza un material global existente.
   */
  public updateGlobalMaterial(gmat_uuid: string, material: any): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put<{ data: any }>(`${environment.apiUrl}global-material/${gmat_uuid}`, material, { headers });
  }

  /**
   * Elimina un material global.
   */
  public deleteGlobalMaterial(gmat_uuid: string): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete<{ data: any }>(`${environment.apiUrl}global-material/${gmat_uuid}`, { headers });
  }
}
