import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CompaniesService } from './companies.service';
import { CompaniesSettingsService } from './companies-settings.service';
import { CompanyInterface } from '@interfaces/company';

@Injectable({
  providedIn: 'root'
})
export class StoreContextService {

  private _activeStore = new BehaviorSubject<CompanyInterface | null>(null);
  public activeStore$ = this._activeStore.asObservable();

  private _storeSettings = new BehaviorSubject<{ [key: string]: any }>({});
  public storeSettings$ = this._storeSettings.asObservable();

  private _isLoading = new BehaviorSubject<boolean>(false);
  public isLoading$ = this._isLoading.asObservable();

  constructor(
    private _companiesService: CompaniesService,
    private _settingsService: CompaniesSettingsService
  ) { }

  /**
   * Carga la empresa y sus configuraciones basadas en el slug de la URL.
   */
  public setStoreBySlug(slug: string): Observable<boolean> {
    this._isLoading.next(true);

    return this._companiesService.getCompanyBySlug(slug).pipe(
      map(response => {
        if (response && response.data) {
          // data puede ser un array según la interfaz
          const company = Array.isArray(response.data) ? response.data[0] : (response.data as any);
          if (company) {
            this._activeStore.next(company);
            return company;
          }
        }
        throw new Error('Store not found');
      }),
      tap(company => {
        // Cargar settings una vez obtenida la empresa
        this._settingsService.getCompaniesSettings(company.cmp_uuid).subscribe({
          next: (res) => {
            const settingsMap: { [key: string]: any } = {};
            if (res && res.data) {
              res.data.forEach((s: any) => {
                let val = s.cmps_value;
                // Conversión básica de tipos
                if (val === 'true') val = true;
                if (val === 'false') val = false;
                if (!isNaN(val) && s.cmps_datatype === 'number') val = Number(val);
                
                settingsMap[s.cmps_key] = val;
              });
            }
            this._storeSettings.next(settingsMap);
            
            // Aplicar tema dinámico si existe el color
            if (settingsMap['THEME_PRIMARY_COLOR']) {
              this.applyTheme(settingsMap['THEME_PRIMARY_COLOR']);
            }
            
            this._isLoading.next(false);
          },
          error: () => this._isLoading.next(false)
        });
      }),
      map(() => true),
      catchError(err => {
        console.error('Error setting store context:', err);
        this._activeStore.next(null);
        this._storeSettings.next({});
        this._isLoading.next(false);
        return of(false);
      })
    );
  }

  /**
   * Obtiene un ajuste específico de la tienda actual.
   */
  public getSetting(key: string, defaultValue: any = null): any {
    const settings = this._storeSettings.getValue();
    return settings[key] !== undefined ? settings[key] : defaultValue;
  }

  /**
   * Aplica un color primario dinámicamente al documento.
   */
  public applyTheme(color: string): void {
    if (!color) return;
    document.documentElement.style.setProperty('--ant-primary-color', color);
    // También podemos actualizar el color de hover/active si es necesario, 
    // pero por ahora dependemos de la variable CSS principal.
  }
  
  public clearStore(): void {
    this._activeStore.next(null);
    this._storeSettings.next({});
    // Resetear el color primario al valor por defecto al salir de una tienda
    document.documentElement.style.removeProperty('--ant-primary-color');
  }
}
