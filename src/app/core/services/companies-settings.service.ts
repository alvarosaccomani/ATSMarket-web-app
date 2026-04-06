import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompanySettingResults } from '@interfaces/company-setting';

@Injectable({
  providedIn: 'root'
})
export class CompaniesSettingsService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todos los companies settings.
   * @returns Observable de un array de companies settings.
   */
  public getCompaniesSettings(cmp_uuid: string): Observable<CompanySettingResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<CompanySettingResults>(`${environment.apiUrl}companies-settings/${cmp_uuid}`, { headers, params });
  }

  /**
   * Guarda una configuración de empresa.
   * @returns Observable de una configuración de empresa.
   */
  public saveCompanySetting(companySetting: any): Observable<any> {
    let params = JSON.stringify(companySetting);
    let headers = new HttpHeaders().set('content-type', 'application/json');

    return this._http.post(environment.apiUrl + 'company-setting', params, { headers: headers });
  }

  /**
   * Actualiza una configuración de empresa.
   * @returns Observable de una configuración de empresa.
   */
  public updateCompanySetting(companySetting: any): Observable<any> {
    let params = JSON.stringify(companySetting);
    let headers = new HttpHeaders().set('content-type', 'application/json');

    return this._http.put(environment.apiUrl + 'company-setting/' + companySetting.cmp_uuid + '/' + companySetting.cmps_uuid, params, { headers: headers });
  }
}
