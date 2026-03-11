import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StoreInterface } from '@interfaces/store.interface';


@Injectable({
  providedIn: 'root'
})
export class CompaniesService {

  // Simulación de la base de datos de tiendas
  private companiesData: StoreInterface[] = [
    {
      id: 1,
      slug: 'cajasantos33',
      nombre: 'Caja Santos 33',
      logoUrl: 'assets/logos/caja33.png',
      descripcion: 'Artículos de fe y devoción con diseño exclusivo, desde Luján.',
      rubroPersonalizado: 'Diseño de autor',
      categoriasPersonalizadas: ['Rosarios de Misión', 'Estatuas Premium', 'Medallas Litúrgicas']
    },
    {
      id: 2,
      slug: 'tallerfe',
      nombre: 'Taller de Fe',
      logoUrl: 'assets/logos/tallerfe.png',
      descripcion: 'Taller artesanal de imágenes religiosas en madera.',
      rubroPersonalizado: 'Artesanía en Madera',
      categoriasPersonalizadas: ['Cruces de Madera', 'Figuras Talladas']
    }
  ];

  constructor() { }

  /**
   * Obtiene la información de una tienda por su slug.
   * @param slug El identificador de la tienda en la URL.
   * @returns Observable de la tienda o null si no se encuentra.
   */
  public getStoreBySlug(slug: string): Observable<StoreInterface | null> {
    const store = this.companiesData.find(s => s.slug === slug);
    return of(store || null);
  }

  public getFeaturedCompanies(): Observable<StoreInterface[]> {
    // Simulación de tiendas más visitadas
    return of(this.companiesData.slice(0, 4));
  }
}
