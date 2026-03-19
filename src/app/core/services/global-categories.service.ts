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
   * Obtiene todos las categorias globales.
   * En una aplicación real, aquí usarías this.http.get<IItem[]>('URL_DE_TU_API').
   * @returns Observable de un array de categorias globales.
   */
  public getGlobalCategories(): Observable<GlobalCategoryResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<GlobalCategoryResults>(`${environment.apiUrl}global-categories`, { headers, params });
  }
}
