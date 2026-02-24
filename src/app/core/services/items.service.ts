import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ItemResults } from '@interfaces/item';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todos los rubros.
   * En una aplicación real, aquí usarías this.http.get<IItem[]>('URL_DE_TU_API').
   * @returns Observable de un array de rubros.
   */
  public getItems(cmp_uuid: string): Observable<ItemResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<ItemResults>(`${environment.apiUrl}items/${cmp_uuid}`, { headers, params });
  }
}
