import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
}