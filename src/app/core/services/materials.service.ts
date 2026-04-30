import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MaterialResults } from '@interfaces/material';

@Injectable({
  providedIn: 'root'
})
export class MaterialsService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todos los materiales.
   * @returns Observable de un array de materiales.
   */
  public getMaterials(cmp_uuid: string): Observable<MaterialResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<MaterialResults>(`${environment.apiUrl}materials/${cmp_uuid}`, { headers, params });
  }
}
