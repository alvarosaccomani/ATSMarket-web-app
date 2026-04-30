import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GlobalMaterialResults } from '@interfaces/global-material';

@Injectable({
  providedIn: 'root'
})
export class GlobalMaterialsService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todos los materiales globales.
   * @returns Observable de un array de materiales globales.
   */
  public getGlobalMaterials(): Observable<GlobalMaterialResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<GlobalMaterialResults>(`${environment.apiUrl}global-materials`, { headers, params });
  }
}
