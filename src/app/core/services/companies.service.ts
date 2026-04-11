import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompanyResults } from '@interfaces/company';


@Injectable({
  providedIn: 'root'
})
export class CompaniesService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todos los companies.
   * @returns Observable de un array de companies.
   */
  public getCompanies(): Observable<CompanyResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<CompanyResults>(`${environment.apiUrl}companies`, { headers, params });
  }

  /**
   * Obtiene la información de una company por su slug.
   * @param cmp_slug El identificador de la company en la URL.
   * @returns Observable de la company o null si no se encuentra.
   */
  public getCompanyBySlug(cmp_slug: string): Observable<CompanyResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<CompanyResults>(`${environment.apiUrl}company-by-slug/${cmp_slug}`, { headers, params });
  }

  public getFeaturedCompanies(): Observable<CompanyResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<CompanyResults>(`${environment.apiUrl}featured-companies`, { headers, params });
  }

  /**
   * Obtiene la información de una company por su UUID.
   * @param cmp_uuid El identificador único de la company.
   */
  public getCompanyById(cmp_uuid: string): Observable<CompanyResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<CompanyResults>(`${environment.apiUrl}company/${cmp_uuid}`, { headers });
  }

  /**
   * Actualiza la información de una company.
   * @param cmp_uuid El identificador único de la company.
   * @param data Los datos a actualizar.
   */
  public updateCompany(cmp_uuid: string, data: any): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}company/${cmp_uuid}`, data, { headers });
  }
}
