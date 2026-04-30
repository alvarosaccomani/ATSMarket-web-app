import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MaterialResults } from '@interfaces/material';

@Injectable({
  providedIn: 'root'
})
export class MaterialsService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todos los materiales.
   * @returns Observable de un array de materiales.
   */
  public getMaterials(cmp_uuid: string): Observable<MaterialResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    return this._http.get<MaterialResults>(`${environment.apiUrl}materials/${cmp_uuid}`, { headers, params });
  }

  /**
   * Obtiene un material por su UUID.
   */
  public getMaterialById(cmp_uuid: string, mat_uuid: string): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<{ data: any }>(`${environment.apiUrl}material/${cmp_uuid}/${mat_uuid}`, { headers });
  }

  /**
   * Crea un nuevo material.
   */
  public saveMaterial(material: any): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post<{ data: any }>(`${environment.apiUrl}material`, material, { headers });
  }

  /**
   * Actualiza un material existente.
   */
  public updateMaterial(cmp_uuid: string, mat_uuid: string, material: any): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put<{ data: any }>(`${environment.apiUrl}material/${cmp_uuid}/${mat_uuid}`, material, { headers });
  }

  /**
   * Elimina un material.
   */
  public deleteMaterial(cmp_uuid: string, mat_uuid: string): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete<{ data: any }>(`${environment.apiUrl}material/${cmp_uuid}/${mat_uuid}`, { headers });
  }
}
