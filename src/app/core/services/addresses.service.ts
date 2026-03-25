import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { AddressInterface } from '../interfaces/address/address.interface';

@Injectable({
  providedIn: 'root'
})
export class AddressesService {
  private addressesSubject: BehaviorSubject<AddressInterface[]> = new BehaviorSubject<AddressInterface[]>([]);
  public addresses$: Observable<AddressInterface[]> = this.addressesSubject.asObservable();
  private readonly STORAGE_KEY = 'ats_market_addresses';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const savedAddresses = localStorage.getItem(this.STORAGE_KEY);
      if (savedAddresses) {
        try {
          const parsed = JSON.parse(savedAddresses);
          this.addressesSubject.next(parsed);
        } catch (e) {
          console.error('Error cargando las direcciones desde LocalStorage', e);
        }
      } else {
        // Mock inicial de domicilios si no hay nada guardado
        this.generateInitialMock();
      }
    }
  }

  private generateInitialMock(): void {
    const mockAddresses: AddressInterface[] = [
      {
        adr_uuid: 'adr-demo-1',
        cmp_uuid: 'cmp-000',
        cus_uuid: 'cus-123',
        sup_uuid: '',
        adr_alias: 'Casa',
        adr_recipientname: 'Alvaro',
        adr_contactphone: '123456789',
        adr_reference: 'Cerca de la plaza',
        adr_country: 'Argentina',
        adr_address: 'Av. Corrientes 1234, Piso 5 Depto A',
        adr_city: 'CABA',
        adr_province: 'Buenos Aires',
        adr_postalcode: '1043',
        adr_lat: -34.6037,
        adr_lng: -58.3816,
        adr_createdat: new Date(),
        adr_updatedat: new Date()
      },
      {
        adr_uuid: 'adr-demo-2',
        cmp_uuid: 'cmp-000',
        cus_uuid: 'cus-123',
        sup_uuid: '',
        adr_alias: 'Depósito',
        adr_recipientname: 'Alvaro',
        adr_contactphone: '123456789',
        adr_reference: 'Cerca de la plaza',
        adr_country: 'Argentina',
        adr_address: 'Ruta Nacional 9, Km 320 (Depósito Norte)',
        adr_city: 'Rosario',
        adr_province: 'Santa Fe',
        adr_postalcode: '2000',
        adr_lat: -34.6037,
        adr_lng: -58.3816,
        adr_createdat: new Date(),
        adr_updatedat: new Date()
      }
    ];
    this.addressesSubject.next(mockAddresses);
    this.syncToLocalStorage(mockAddresses);
  }

  private syncToLocalStorage(addresses: AddressInterface[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(addresses));
    }
  }

  public getAddresses(): AddressInterface[] {
    return this.addressesSubject.value;
  }

  public addAddress(addressData: Partial<AddressInterface>): void {
    const newAddress: AddressInterface = {
      adr_uuid: `adr-${new Date().getTime()}`,
      cmp_uuid: addressData.cmp_uuid || '',
      cus_uuid: addressData.cus_uuid || '',
      sup_uuid: addressData.sup_uuid || '',
      adr_alias: addressData.adr_alias || '',
      adr_recipientname: addressData.adr_recipientname || '',
      adr_contactphone: addressData.adr_contactphone || '',
      adr_reference: addressData.adr_reference || '',
      adr_country: addressData.adr_country || '',
      adr_address: addressData.adr_address || '',
      adr_city: addressData.adr_city || '',
      adr_province: addressData.adr_province || '',
      adr_postalcode: addressData.adr_postalcode || '',
      adr_lat: addressData.adr_lat || 0,
      adr_lng: addressData.adr_lng || 0,
      adr_createdat: new Date(),
      adr_updatedat: new Date()
    };

    const currentList = this.addressesSubject.value;
    const updatedList = [newAddress, ...currentList];

    this.addressesSubject.next(updatedList);
    this.syncToLocalStorage(updatedList);
  }

  public removeAddress(adr_uuid: string): void {
    const filteredList = this.addressesSubject.value.filter(a => a.adr_uuid !== adr_uuid);
    this.addressesSubject.next(filteredList);
    this.syncToLocalStorage(filteredList);
  }
}