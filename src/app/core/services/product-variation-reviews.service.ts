import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductVariationReviewResults, ProductVariationReviewInterface } from '@interfaces/product-variation-review';

@Injectable({
  providedIn: 'root'
})
export class ProductVariationReviewsService {

  constructor(
    private _http: HttpClient
  ) { }
  
  /**
   * Obtiene todas las reseñas de variaciones de productos filtradas opcionalmente por producto y variación.
   * @returns Observable de un array de reseñas de variaciones de productos.
   */
  public getProductVariationReviews(cmp_uuid: string, pro_uuid?: string, prov_uuid?: string): Observable<ProductVariationReviewResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<ProductVariationReviewResults>(`${environment.apiUrl}product-variation-reviews/${cmp_uuid}/${pro_uuid}/${prov_uuid}`, { headers });
  }

  /**
   * Crea una nueva reseña de variación de producto en el sistema.
   * @param reviewData Datos de la reseña a insertar.
   */
  public saveProductVariationReview(reviewData: Partial<ProductVariationReviewInterface>): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}product-variation-review`, reviewData, { headers });
  }
}
