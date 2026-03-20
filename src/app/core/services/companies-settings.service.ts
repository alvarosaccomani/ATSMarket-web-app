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
}
