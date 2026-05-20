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

  private _activeStore = new BehaviorSubject<CompanyInterface | null>(this.getStoredStore());
  public activeStore$ = this._activeStore.asObservable();

  private _storeSettings = new BehaviorSubject<{ [key: string]: any }>({});
  public storeSettings$ = this._storeSettings.asObservable();

  private _isLoading = new BehaviorSubject<boolean>(false);
  public isLoading$ = this._isLoading.asObservable();

  constructor(
    private _companiesService: CompaniesService,
    private _settingsService: CompaniesSettingsService
  ) { 
    // Si ya hay una tienda en el storage, cargar sus configuraciones iniciales
    const store = this._activeStore.value;
    if (store) {
      this.loadSettingsForStore(store);
    }
  }

  private getStoredStore(): CompanyInterface | null {
    try {
      const stored = localStorage.getItem('ats_active_store');
      debugger;
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Error al recuperar active store de localStorage:', e);
      return null;
    }
  }

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
            localStorage.setItem('ats_active_store', JSON.stringify(company));
            return company;
          }
        }
        throw new Error('Store not found');
      }),
      tap(company => {
        this.loadSettingsForStore(company);
      }),
      map(() => true),
      catchError(err => {
        console.error('Error setting store context:', err);
        this._activeStore.next(null);
        localStorage.removeItem('ats_active_store');
        this._storeSettings.next({});
        this._isLoading.next(false);
        return of(false);
      })
    );
  }

  /**
   * Carga las configuraciones y tema de una tienda.
   */
  public loadSettingsForStore(company: CompanyInterface): void {
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
        
        // Aplicar tema dinámico (Configuración tiene prioridad, fallback a Compañía)
        const primaryColor = settingsMap['THEME_PRIMARY_COLOR'] || company.cmp_primarycolor;
        if (primaryColor) {
          this.applyTheme(primaryColor);
        }

        // Aplicar color de Navbar
        const navColor = settingsMap['THEME_NAVBAR_COLOR'] || '#001529';
        document.documentElement.style.setProperty('--navbar-background-color', navColor);
        
        this._isLoading.next(false);
      },
      error: () => this._isLoading.next(false)
    });
  }

  /**
   * Obtiene un ajuste específico de la tienda actual con lógica de fallback.
   */
  public getSetting(key: string, defaultValue: any = null): any {
    const settings = this._storeSettings.getValue();
    const company = this._activeStore.getValue();

    let value = settings[key];

    // Si el valor no existe o es un string vacío, intentamos fallback a la tabla de empresa
    if (value === undefined || value === null || value === '') {
      if (company) {
        switch (key) {
          case 'STORE_LOGO_URL':
            value = company.cmp_logo;
            break;
          case 'HOME_BANNER_IMAGE':
            value = company.cmp_banner;
            break;
          case 'HOME_BANNER_TITLE':
            value = company.cmp_name;
            break;
          case 'STORE_WHATSAPP':
            value = company.cmp_whatsapp || company.cmp_phone;
            break;
          case 'STORE_INSTAGRAM':
            value = company.cmp_instagram;
            break;
          case 'STORE_FACEBOOK':
            value = company.cmp_facebook;
            break;
          case 'HOME_BANNER_DESCRIPTION': // Nueva clave renombrada
          case 'HOME_BANNER_SUBTITLE':    // Compatibilidad con clave anterior
            value = company.cmp_description;
            break;
          case 'CURRENCY':
            value = company.cmp_currency;
            break;
          case 'ALLOW_BACKORDERS':
            value = company.cmp_allowbackorders;
            break;
          case 'THEME_PRIMARY_COLOR':
            value = company.cmp_primarycolor;
            break;
        }
      }
    }

    return (value !== undefined && value !== null && value !== '') ? value : defaultValue;
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
    localStorage.removeItem('ats_active_store');
    this._storeSettings.next({});
    // Resetear el color primario al valor por defecto al salir de una tienda
    document.documentElement.style.removeProperty('--ant-primary-color');
    document.documentElement.style.removeProperty('--navbar-background-color');
  }
}
