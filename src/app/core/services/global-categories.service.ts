import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GlobalCategoryResults } from '@interfaces/global-category';

@Injectable({
  providedIn: 'root'
})
export class GlobalCategoriesService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todas las categorías globales.
   * @returns Observable de un array de categorías globales.
   */
  public getGlobalCategories(): Observable<GlobalCategoryResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    return this._http.get<GlobalCategoryResults>(`${environment.apiUrl}global-categories`, { headers, params });
  }

  /**
   * Obtiene una categoría global por su UUID.
   */
  public getGlobalCategoryById(gitm_uuid: string, gcat_uuid: string): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<{ data: any }>(`${environment.apiUrl}global-category/${gitm_uuid}/${gcat_uuid}`, { headers });
  }

  /**
   * Crea una nueva categoría global.
   */
  public saveGlobalCategory(category: any): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post<{ data: any }>(`${environment.apiUrl}global-category`, category, { headers });
  }

  /**
   * Actualiza una categoría global existente.
   */
  public updateGlobalCategory(gitm_uuid: string, gcat_uuid: string, category: any): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put<{ data: any }>(`${environment.apiUrl}global-category/${gitm_uuid}/${gcat_uuid}`, category, { headers });
  }

  /**
   * Elimina una categoría global.
   */
  public deleteGlobalCategory(gitm_uuid: string, gcat_uuid: string): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete<{ data: any }>(`${environment.apiUrl}global-category/${gitm_uuid}/${gcat_uuid}`, { headers });
  }
}
