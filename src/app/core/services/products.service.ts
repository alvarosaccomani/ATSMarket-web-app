import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductResults } from '../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene todos los productos.
   * En una aplicación real, aquí usarías this.http.get<IProduct[]>('URL_DE_TU_API').
   * @returns Observable de un array de productos.
   */
  public getProducts(cmp_uuid: string): Observable<ProductResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<ProductResults>(`${environment.apiUrl}products/${cmp_uuid}`, { headers, params });
  }

  /**
   * Obtiene un producto por id.
   * @returns Observable de un array de productos.
   */
  public getProductById(cmp_uuid: string, pro_uuid?: string): Observable<ProductResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<ProductResults>(`${environment.apiUrl}product/${cmp_uuid}/${pro_uuid}`, { headers, params });
  }

  /**
   * Crear un producto.
   * @returns Observable de un array de productos.
   */
  public saveProduct(product: any): Observable<any> {
    let params = JSON.stringify(product);
    let headers = new HttpHeaders().set('content-type', 'application/json');

    return this._http.post(environment.apiUrl + 'product', params, { headers: headers });
  }

  /**
   * Actualizar un producto.
   * @returns Observable de un array de productos.
   */
  public updateProduct(product: any): Observable<any> {
    let params = JSON.stringify(product);
    let headers = new HttpHeaders().set('content-type', 'application/json');

    return this._http.put(`${environment.apiUrl}product/${product.cmp_uuid}/${product.pro_uuid}`, params, { headers: headers });
  }

  // Datos simulados para 'productsData'
  private productsData: any[] = [
    {
      cmp_uuid: '1',
      pro_uuid: '101',
      pro_code: 'P001',
      pro_name: 'Producto Destacado 1',
      pro_image: 'https://via.placeholder.com/150',
      pro_description: 'Descripción del producto 1',
      itm_uuid: 'I1',
      cat_uuid: 'C1',
      pro_createdat: new Date(),
      pro_updatedat: new Date()
    },
    {
      cmp_uuid: '1',
      pro_uuid: '102',
      pro_code: 'P002',
      pro_name: 'Producto Destacado 2',
      pro_image: 'https://via.placeholder.com/150',
      pro_description: 'Descripción del producto 2',
      itm_uuid: 'I2',
      cat_uuid: 'C2',
      pro_createdat: new Date(),
      pro_updatedat: new Date()
    }
  ];

  /**
   * Obtiene productos destacados para el Home (simulación).
   * @param count El número de productos a destacar.
   * @returns Observable de un array de productos.
   */
  public getFeaturedProducts(count: number = 4): Observable<ProductResults> {
    // Simula obtener los primeros 'count' productos
    const featured = this.productsData.slice(0, count);
    const result: ProductResults = {
      item: 1,
      itemOf: featured.length,
      numElements: featured.length,
      totalPages: 1,
      data: featured
    };
    return of(result);
  }

}
