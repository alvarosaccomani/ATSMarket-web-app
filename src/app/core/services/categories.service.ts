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
}
