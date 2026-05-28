import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventoryStockResults, InventoryStockInterface } from '@interfaces/inventory-stock';

@Injectable({
  providedIn: 'root'
})
export class InventoryStocksService {

  constructor(
    private _http: HttpClient
  ) { }
  
  /**
   * Obtiene todos los registros de stock de inventario por depósito.
   * @returns Observable con los resultados de stocks de inventario.
   */
  public getInventoryStocks(): Observable<InventoryStockResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    return this._http.get<InventoryStockResults>(`${environment.apiUrl}inventory-stocks`, { headers, params });
  }

  /**
   * Obtiene los registros de stock de un depósito específico de la empresa.
   */
  public getStocksByWarehouse(cmp_uuid: string, war_uuid: string): Observable<{ success: boolean, data: InventoryStockInterface[] }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<{ success: boolean, data: InventoryStockInterface[] }>(`${environment.apiUrl}inventory-stocks/${cmp_uuid}/${war_uuid}`, { headers });
  }

  /**
   * Obtiene la distribución de stock de una variante específica de producto en todos los depósitos.
   */
  public getStocksByVariation(cmp_uuid: string, pro_uuid: string, prov_uuid: string): Observable<{ success: boolean, data: InventoryStockInterface[] }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<{ success: boolean, data: InventoryStockInterface[] }>(`${environment.apiUrl}inventory-by-variation/${cmp_uuid}/${pro_uuid}/${prov_uuid}`, { headers });
  }

  /**
   * Registra inicialmente un registro de stock físico para una variante en un depósito específico (POST).
   */
  public saveWarehouseStock(stock: Partial<InventoryStockInterface>): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    const params = JSON.stringify(stock);
    return this._http.post<any>(`${environment.apiUrl}inventory-stock`, params, { headers });
  }

  /**
   * Actualiza el stock físico disponible y reservado de una variante dentro de un depósito específico, asociándola a un casillero.
   */
  public updateWarehouseStock(cmp_uuid: string, pro_uuid: string, prov_uuid: string, war_uuid: string, warl_uuid: string, quantity: number, reservedQuantity: number = 0): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    const params = JSON.stringify({ ist_quanty: quantity, ist_quantyreserved: reservedQuantity });
    return this._http.put<any>(`${environment.apiUrl}inventory-stock/${cmp_uuid}/${pro_uuid}/${prov_uuid}/${war_uuid}/${warl_uuid}`, params, { headers });
  }
}
