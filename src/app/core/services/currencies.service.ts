import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CurrencyResults } from '@interfaces/currency';

@Injectable({
  providedIn: 'root'
})
export class CurrenciesService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todas las monedas.
   * @returns Observable de un array de monedas.
   */
  public getCurrencies(): Observable<CurrencyResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    return this._http.get<CurrencyResults>(`${environment.apiUrl}currencies`, { headers, params });
  }
}
