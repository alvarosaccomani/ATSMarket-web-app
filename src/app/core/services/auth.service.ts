import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private _http: HttpClient) { }

  public singup(user: any): Observable<any> {
    const params = JSON.stringify(user);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}register`, params, { headers });
  }

  public login(user: any, gettoken: string | null = null): Observable<any> {
    if (gettoken != null) {
      user.gettoken = gettoken;
    }
    const params = JSON.stringify(user);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}login`, params, { headers });
  }

  public confirmAccount(token: string): Observable<any> {
    const params = JSON.stringify({ token });
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}confirm-account`, params, { headers });
  }

  public forgotPassword(usr_email: string): Observable<any> {
    const params = JSON.stringify({ usr_email });
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}forgot-password`, params, { headers });
  }

  public resetPassword(payload: any): Observable<any> {
    const params = JSON.stringify(payload);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}reset-password`, params, { headers });
  }

  public verifySSOToken(ssoToken: string): Observable<any> {
    const body = JSON.stringify({ sso_token: ssoToken });
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}auth/sso/verify`, body, { headers });
  }

  public getAppConfig(): Observable<any> {
    return this._http.get<any>(`${environment.apiUrl}auth/sso/config`);
  }

  public logAuth(usr_uuid: string, app_cod: string, action: string = 'LOGIN_SUCCESS'): Observable<any> {
    const body = {
      usr_uuid,
      app_cod,
      usraulo_action: action,
      usraulo_ipaddress: '0.0.0.0',
      usraulo_useragent: navigator.userAgent
    };
    return this._http.post<any>(`${environment.apiUrl}auth/sso/log-auth`, body);
  }
}
