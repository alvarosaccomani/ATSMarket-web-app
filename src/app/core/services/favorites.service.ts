import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Favorite {
  fav_uuid: string;
  usr_uuid: string;
  cmp_uuid: string;
  pro_uuid: string;
  prov_uuid: string;
  fav_createdat?: Date;
  fav_updatedat?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private apiUrl = `${environment.apiUrl}favorites`;
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();
  public favoritesCount$ = this.favoritesSubject.asObservable().pipe(map(list => list ? list.length : 0));

  constructor(private http: HttpClient) { }

  /**
   * Carga los favoritos del usuario logueado en el estado local.
   */
  public loadFavorites(): Observable<string[]> {
    return this.http.get<{ success: boolean; data: Favorite[] }>(this.apiUrl).pipe(
      map(res => res.success && res.data ? res.data.map(f => f.prov_uuid) : []),
      tap(favUuids => this.favoritesSubject.next(favUuids)),
      catchError(() => {
        this.favoritesSubject.next([]);
        return of([]);
      })
    );
  }

  /**
   * Obtiene la lista completa de favoritos poblada con detalles de variantes y tiendas.
   */
  public getFavoritesDetails(): Observable<any[]> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}?details=true`).pipe(
      map(res => res.success && res.data ? res.data : []),
      catchError(() => of([]))
    );
  }

  /**
   * Agrega un producto a favoritos
   */
  public addFavorite(cmp_uuid: string, pro_uuid: string, prov_uuid: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { cmp_uuid, pro_uuid, prov_uuid }).pipe(
      tap(() => {
        const current = this.favoritesSubject.value;
        if (!current.includes(prov_uuid)) {
          this.favoritesSubject.next([...current, prov_uuid]);
        }
      })
    );
  }

  /**
   * Elimina un producto de favoritos
   */
  public removeFavorite(prov_uuid: string, cmp_uuid?: string): Observable<any> {
    const url = cmp_uuid ? `${this.apiUrl}/${prov_uuid}?cmp_uuid=${cmp_uuid}` : `${this.apiUrl}/${prov_uuid}`;
    return this.http.delete<any>(url).pipe(
      tap(() => {
        const current = this.favoritesSubject.value;
        this.favoritesSubject.next(current.filter(id => id !== prov_uuid));
      })
    );
  }

  /**
   * Verifica de manera sincrónica si una variante está en favoritos
   */
  public isFavorited(prov_uuid: string): boolean {
    return this.favoritesSubject.value.includes(prov_uuid);
  }

  /**
   * Limpia el estado de favoritos (al cerrar sesión)
   */
  public clearFavorites(): void {
    this.favoritesSubject.next([]);
  }
}
