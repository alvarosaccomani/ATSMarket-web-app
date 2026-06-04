import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryResults } from '@interfaces/category';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todas las categorias.
   * @returns Observable de un array de categorias.
   */
  public getCategories(cmp_uuid: string, itm_uuid: string): Observable<CategoryResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    return this._http.get<CategoryResults>(`${environment.apiUrl}categories/${cmp_uuid}/${itm_uuid}`, { headers, params });
  }

  /**
   * Obtiene una categoría local por su UUID.
   */
  public getCategoryById(cmp_uuid: string, itm_uuid: string, cat_uuid: string): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<{ data: any }>(`${environment.apiUrl}category/${cmp_uuid}/${itm_uuid}/${cat_uuid}`, { headers });
  }

  /**
   * Crea una nueva categoría local.
   */
  public saveCategory(category: any): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post<{ data: any }>(`${environment.apiUrl}category`, category, { headers });
  }

  /**
   * Actualiza una categoría local existente.
   */
  public updateCategory(cmp_uuid: string, itm_uuid: string, cat_uuid: string, category: any): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put<{ data: any }>(`${environment.apiUrl}category/${cmp_uuid}/${itm_uuid}/${cat_uuid}`, category, { headers });
  }

  /**
   * Elimina una categoría local.
   */
  public deleteCategory(cmp_uuid: string, itm_uuid: string, cat_uuid: string): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete<{ data: any }>(`${environment.apiUrl}category/${cmp_uuid}/${itm_uuid}/${cat_uuid}`, { headers });
  }
}
