import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductVariationResults, ProductVariationInterface } from '@interfaces/product-variation';

@Injectable({
  providedIn: 'root'
})
export class ProductVariationsService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
     * Obtiene todas las variaciones de productos.
     * En una aplicación real, aquí usarías this.http.get<IProduct[]>('URL_DE_TU_API').
     * @returns Observable de un array de productos.
     */
  public getProductsVariations(cmp_uuid: string, pro_uuid: string, slug?: string): Observable<ProductVariationResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<ProductVariationResults>(`${environment.apiUrl}products-variations/${cmp_uuid}`, { headers, params });
  }

  /**
     * Obtiene todas las variaciones de productos.
     * En una aplicación real, aquí usarías this.http.get<IProduct[]>('URL_DE_TU_API').
     * @returns Observable de un array de productos.
     */
  public getProductVariationById(cmp_uuid: string, pro_uuid: string, prov_uuid: string): Observable<ProductVariationResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<ProductVariationResults>(`${environment.apiUrl}product-variation/${cmp_uuid}/${pro_uuid}/${prov_uuid}`, { headers, params });
  }

  /**
   * Actualizar una variación de producto.
   * @returns Observable de una variación de producto.
   */
  public updateProductVariation(productVariation: any): Observable<any> {
    let params = JSON.stringify(productVariation);
    let headers = new HttpHeaders().set('content-type', 'application/json');

    return this._http.put(`${environment.apiUrl}product-variation/${productVariation.cmp_uuid}/${productVariation.pro_uuid}/${productVariation.prov_uuid}`, params, { headers: headers });
  }

  /**
     * Obtiene el stock de una variacion de producto.
     * @returns Observable de un array de any.
     */
  public checkStock(cmp_uuid: string, pro_uuid: string, prov_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<any>(`${environment.apiUrl}check-stock/${cmp_uuid}/${pro_uuid}/${prov_uuid}`, { headers, params });
  }
}