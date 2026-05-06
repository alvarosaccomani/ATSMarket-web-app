import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    return this._http.get<any>(`${environment.apiUrl}roles/${filter}/${page}/${perPage}`, { headers });
  }

  /**
   * Obtiene un rol por su UUID.
   */
  public getRolById(rol_uuid: string): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<{ data: any }>(`${environment.apiUrl}rol/${rol_uuid}`, { headers });
  }
}
