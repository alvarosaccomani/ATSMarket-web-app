import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserRolCompanyResults } from '../interfaces/user-rol-company';

@Injectable({
  providedIn: 'root'
})
export class UserRolesCompanyService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todos los roles de usuario por compañia.
   * @returns Observable de un array de roles de usuario por compañia.
   */
  public getUserRolesCompany(cmp_uuid: string): Observable<UserRolCompanyResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    return this._http.get<UserRolCompanyResults>(`${environment.apiUrl}user-roles-company/${cmp_uuid}`, { headers, params });
  }

  /**
   * Obtiene un rol de usuario por compañia por su UUID.
   */
  public getUserRolCompanyById(cmp_uuid: string, usr_uuid: string, rol_uuid: string): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<{ data: any }>(`${environment.apiUrl}user-rol-company/${cmp_uuid}/${usr_uuid}/${rol_uuid}`, { headers });
  }

  /**
   * Crea un nuevo rol de usuario por compañia.
   */
  public saveUserRolCompany(userRolCompany: any): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post<{ data: any }>(`${environment.apiUrl}user-rol-company`, userRolCompany, { headers });
  }

  /**
   * Actualiza un rol de usuario por compañia existente.
   */
  public updateUserRolCompany(cmp_uuid: string, usr_uuid: string, rol_uuid: string, userRolCompany: any): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put<{ data: any }>(`${environment.apiUrl}user-rol-company/${cmp_uuid}/${usr_uuid}/${rol_uuid}`, userRolCompany, { headers });
  }

  /**
   * Elimina un rol de usuario por compañia.
   */
  public deleteUserRolCompany(cmp_uuid: string, usr_uuid: string, rol_uuid: string): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete<{ data: any }>(`${environment.apiUrl}user-rol-company/${cmp_uuid}/${usr_uuid}/${rol_uuid}`, { headers });
  }

  /**
   * Obtiene los roles por usuario.
   * @returns Observable de un array de roles por usuario.
   */
  public getUserRolesCompanyByUser(usr_uuid: string): Observable<UserRolCompanyResults> {
    let headers = new HttpHeaders().set('content-type', 'application/json');

    return this._http.get<UserRolCompanyResults>(environment.apiUrl + 'user-roles-company-by-user/' + usr_uuid, { headers: headers })
  }

  /**
   * Obtiene los roles por compania y usuario.
   */
  public getUserRolesCompanyByCompanyyUser(cmp_uuid: string, usr_uuid: string): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<{ data: any }>(`${environment.apiUrl}user-roles-company-by-company-user/${cmp_uuid}/${usr_uuid}`, { headers });
  }
}
