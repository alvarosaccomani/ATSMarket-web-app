import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AddressInterface } from '../interfaces/address/address.interface';

@Injectable({
  providedIn: 'root'
})
export class AddressesService {
  private addressesSubject: BehaviorSubject<AddressInterface[]> = new BehaviorSubject<AddressInterface[]>([]);
  public addresses$: Observable<AddressInterface[]> = this.addressesSubject.asObservable();

  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene la lista actual en memoria.
   */
  public getAddresses(): AddressInterface[] {
    return this.addressesSubject.value;
  }

  /**
   * Inserta una nueva dirección en el servidor y actualiza la lista local.
   * @param addressData Datos de la dirección
   */
  public saveAddress(addressData: Partial<AddressInterface>): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post<{ success: boolean; message: string; data: AddressInterface }>(
      `${environment.apiUrl}address`,
      addressData,
      { headers }
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentList = this.addressesSubject.value;
          this.addressesSubject.next([response.data, ...currentList]);
        }
      })
    );
  }

  /**
   * Elimina una dirección en el servidor y de la memoria local.
   * @param adr_uuid UUID de la dirección a eliminar
   */
  public deleteAddress(adr_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete<{ success: boolean; message: string; data: any }>(
      `${environment.apiUrl}address/${adr_uuid}`,
      { headers }
    ).pipe(
      tap(response => {
        if (response.success) {
          const filteredList = this.addressesSubject.value.filter(a => a.adr_uuid !== adr_uuid);
          this.addressesSubject.next(filteredList);
        }
      })
    );
  }

  /**
   * Carga las direcciones asociadas a un cliente específico desde el servidor.
   * @param cus_uuid UUID del cliente
   */
  public getAddressesByCustomer(cus_uuid: string): void {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    this._http.get<{ success: boolean; message: string; data: AddressInterface[] }>(
      `${environment.apiUrl}addresses-by-customer/${cus_uuid}`,
      { headers }
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.addressesSubject.next(response.data);
        } else {
          this.addressesSubject.next([]);
        }
      },
      error: (err) => {
        console.error('Error al cargar direcciones desde el servidor:', err);
        this.addressesSubject.next([]);
      }
    });
  }
}
