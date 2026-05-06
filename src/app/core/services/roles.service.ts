import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todos los roles.
   * @returns Observable de un array de roles.
   */
  public getRoles(filter: string = '', page: number = 1, perPage: number = 100): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    if (filter) {
      params = params.set('filter', filter);
    }

    if (page) {
      params = params.set('page', page.toString());
    }

    if (perPage) {
      params = params.set('perPage', perPage.toString());
    }

    return this._http.get<any>(`${environment.apiUrl}roles`, { headers });
  }

  /**
   * Obtiene un rol por su UUID.
   */
  public getRolById(rol_uuid: string): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<{ data: any }>(`${environment.apiUrl}rol/${rol_uuid}`, { headers });
  }
}
