import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MenuResults } from '../interfaces/menu';

@Injectable({
  providedIn: 'root'
})
export class MenusService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todas los menús.
   * @returns Observable de un array de menús.
   */
  public getMenus(): Observable<MenuResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    return this._http.get<MenuResults>(`${environment.apiUrl}menus`, { headers, params });
  }

  /**
   * Obtiene un menú por su UUID.
   */
  public getMenuById(mnu_uuid: string): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<{ data: any }>(`${environment.apiUrl}menu/${mnu_uuid}`, { headers });
  }

  /**
   * Crea un nuevo menú.
   */
  public saveMenu(menu: any): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post<{ data: any }>(`${environment.apiUrl}menu`, menu, { headers });
  }

  /**
   * Actualiza un menú existente.
   */
  public updateMenu(mnu_uuid: string, menu: any): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put<{ data: any }>(`${environment.apiUrl}menu/${mnu_uuid}`, menu, { headers });
  }

  /**
   * Elimina un menú.
   */
  public deleteMenu(mnu_uuid: string): Observable<{ data: any }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete<{ data: any }>(`${environment.apiUrl}menu/${mnu_uuid}`, { headers });
  }
}
