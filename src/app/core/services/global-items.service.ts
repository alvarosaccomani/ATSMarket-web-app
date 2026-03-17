import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GlobalItemResults } from '@interfaces/global-item';

@Injectable({
  providedIn: 'root'
})
export class GlobalItemsService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todos los rubros globales.
   * En una aplicación real, aquí usarías this.http.get<IItem[]>('URL_DE_TU_API').
   * @returns Observable de un array de rubros globales.
   */
  public getGlobalItems(): Observable<GlobalItemResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<GlobalItemResults>(`${environment.apiUrl}global-items`, { headers, params });
  }
}
