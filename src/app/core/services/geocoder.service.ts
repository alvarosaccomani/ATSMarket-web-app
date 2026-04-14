import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

export interface GeocodingResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export interface FullAddress {
  lat: number;
  lng: number;
  address: string;        // dirección completa
  provincia?: string;     // state, region, etc.
  ciudad?: string;        // city, town, village
  codigoPostal?: string;  // postcode
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
    [key: string]: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GeocoderService {

  private baseUrl = 'https://nominatim.openstreetmap.org/search'; // ✅ sin espacios

  constructor(
    private http: HttpClient
  ) {}

  public search(query: string): Observable<GeocodingResult[]>;
  public search(query: string, full: true): Observable<FullAddress[]>;
  public search(query: string, full: boolean = false): Observable<GeocodingResult[] | FullAddress[]> {
    const params = {
      q: query,
      format: 'json',
      addressdetails: '1', // ← clave para obtener address desglosado
      limit: '5'
    };

    return this.http.get<NominatimResult[]>(this.baseUrl, { params }).pipe(
      map(results => {
        if (full) {
          return results.map(r => this.parseToFullAddress(r));
        } else {
          // Compatibilidad con interfaz antigua
          return results.map(r => ({
            place_id: r.place_id,
            display_name: r.display_name,
            lat: r.lat,
            lon: r.lon
          }));
        }
      }),
      catchError(() => of(full ? [] : []))
    );
  }

  // ✅ Nuevo método: reverse geocoding con datos completos
  public reverseGeocode(lat: number, lng: number): Observable<FullAddress> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    return this.http.get<NominatimResult>(url).pipe(
      map(result => this.parseToFullAddress(result)),
      catchError(() => of(this.fallbackAddress(lat, lng)))
    );
  }

  // ✅ Helper: convierte resultado de Nominatim → FullAddress
  private parseToFullAddress(result: NominatimResult): FullAddress {
    const addr = result.address || {};
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    // Ciudad: prioridad city > town > village
    const ciudad = addr.city || addr.town || addr.village || undefined;

    return {
      lat,
      lng,
      address: result.display_name,
      provincia: addr.state || undefined,
      ciudad,
      codigoPostal: addr.postcode || undefined
    };
  }

  // ✅ Fallback si falla la geocodificación inversa
  private fallbackAddress(lat: number, lng: number): FullAddress {
    return {
      lat,
      lng,
      address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
      provincia: undefined,
      ciudad: undefined,
      codigoPostal: undefined
    };
  }
}