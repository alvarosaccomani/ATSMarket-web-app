import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(
    private _http: HttpClient
  ) { }

  public getUsers(filter: string = '', page: number = 1, perPage: number = 100): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    if (filter) {
      params = params.set('filter', filter);
    }

    if (page) {
      params = params.set('page', page.toString());
    }

    if (perPage) {
      params = params.set('perPage', perPage.toString());
    }
    
    return this._http.get<any>(`${environment.apiUrl}users`, { headers });
  }
}
