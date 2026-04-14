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

@Injectable({
  providedIn: 'root'
})
export class GeocoderService {

  private baseUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(
    private http: HttpClient
  ) {}

  public search(query: string): Observable<GeocodingResult[]> {
    const params = {
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '5'
    };

    return this.http.get<GeocodingResult[]>(this.baseUrl, { params }).pipe(
      map(results => results.map(r => ({
        ...r,
        lat: r.lat,
        lon: r.lon
      })))
    );
  }

  public reverseGeocode(lat: number, lon: number): Observable<string | null> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    return this.http.get<any>(url).pipe(
      map((res: any) => res?.display_name || null),
      catchError(() => of(null))
    );
  }
}
