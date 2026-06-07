import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CouponsService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Valida un cupón de descuento para una tienda específica y calcula el descuento.
   * @param cmp_uuid UUID de la empresa/tienda.
   * @param code Código del cupón (Ej: DESCUENTO10).
   * @param purchaseAmount Subtotal de compra para la validación.
   * @returns Observable de la respuesta de validación.
   */
  public validateCoupon(cmp_uuid: string, code: string, purchaseAmount: number): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    const payload = { cmp_uuid, code, purchaseAmount };
    return this._http.post(`${environment.apiUrl}coupon/validate`, JSON.stringify(payload), { headers });
  }

  /**
   * Obtiene todos los cupones de una tienda (requiere autenticación).
   */
  public getCoupons(cmp_uuid: string): Observable<any> {
    return this._http.get(`${environment.apiUrl}coupons/${cmp_uuid}`);
  }

  /**
   * Crea un nuevo cupón (requiere autenticación).
   */
  public saveCoupon(coupon: any): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}coupon`, JSON.stringify(coupon), { headers });
  }

  /**
   * Actualiza un cupón existente (requiere autenticación).
   */
  public updateCoupon(coupon: any): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}coupon/${coupon.cmp_uuid}/${coupon.cou_uuid}`, JSON.stringify(coupon), { headers });
  }

  /**
   * Elimina un cupón (requiere autenticación).
   */
  public deleteCoupon(cmp_uuid: string, cou_uuid: string): Observable<any> {
    return this._http.delete(`${environment.apiUrl}coupon/${cmp_uuid}/${cou_uuid}`);
  }
}
