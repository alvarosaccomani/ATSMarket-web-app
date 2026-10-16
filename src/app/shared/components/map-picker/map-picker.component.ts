import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import maplibregl, { Map, Marker } from 'maplibre-gl';
import { GeocoderService } from '../../../core/services/geocoder.service'; // tu servicio

/**
 * @description Estructura de datos resultante tras la selección o geocodificación de un punto en el mapa.
 */
export interface SelectedLocation {
  /**
   * @description Dirección normalizada en texto (calle y numeración).
   */
  address: string;
  /**
   * @description Localidad o municipio detectado.
   */
  ciudad: string | null | undefined;
  /**
   * @description Código postal de la zona geográfica.
   */
  codigoPostal: string | null | undefined;
  /**
   * @description Coordenada geográfica de latitud decimal.
   */
  lat: number;
  /**
   * @description Coordenada geográfica de longitud decimal.
   */
  lng: number;
  /**
   * @description Provincia, estado o región administrativa.
   */
  provincia: string | null | undefined;
}

/**
 * @description Componente selector de mapas interactivo basado en MapLibre GL.
 * Permite buscar domicilios con autocompletado inverso, arrastrar un marcador para afinar
 * la posición y emitir las coordenadas y datos normalizados para domicilios de entrega o sucursales.
 */
@Component({
  selector: 'app-map-picker',
  imports: [
    FormsModule,
    NzInputModule,
    NzButtonModule
  ],
  templateUrl: './map-picker.component.html',
  styleUrl: './map-picker.component.scss'
})
export class MapPickerComponent {

  /**
   * @description Muestra u oculta la caja de búsqueda superior de geocodificación directa.
   */
  @Input() showSearch = true;
  /**
   * @description Determina si se despliega el bloque de depuración con la salida JSON.
   */
  @Input() showJsonOutput = true;
  /**
   * @description Latitud inicial de centrado del mapa.
   */
  @Input() initialLat: number | null = null;
  /**
   * @description Longitud inicial de centrado del mapa.
   */
  @Input() initialLng: number | null = null;
  /**
   * @description Objeto con datos de dirección preexistentes para inicializar el marcador.
   */
  @Input() initialAddressData: {
    address?: string | null;
    ciudad?: string | null;
    provincia?: string | null;
    codigoPostal?: string | null;
  } | null = null;

  /**
   * @description Evento emitido cada vez que el usuario fija una nueva posición en el mapa.
   */
  @Output() locationSelected = new EventEmitter<SelectedLocation>();

  @ViewChild('map', { static: true }) mapContainer!: ElementRef;

  map!: Map;
  searchQuery = '';
  selectedLocation: SelectedLocation | null = null;
  private tempMarker: Marker | null = null;

  constructor(
    private geocoder: GeocoderService,
    private msg: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const latChanged = changes['initialLat'];
    const lngChanged = changes['initialLng'];

    if ((latChanged || lngChanged) && this.initialLat !== null && this.initialLng !== null) {
      this.setInitialLocation();
    }
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }

  public initializeMap(): void {
    this.map = new maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [-58.3816, -34.6037], // Buenos Aires
      zoom: 11
    });

    // Clic en el mapa → geocodificación inversa
    this.map.on('click', (e) => {
      const { lat, lng } = e.lngLat;
      this.handleMapClick(lat, lng);
    });
  }

  private setInitialLocation(): void {
    if (!this.map || this.initialLat === null || this.initialLng === null) return;

    const location: SelectedLocation = {
      lat: this.initialLat || 0,
      lng: this.initialLng || 0,
      address: this.initialAddressData?.address || `Lat: ${this.initialLat}, Lng: ${this.initialLng}`,
      ciudad: this.initialAddressData?.ciudad,
      provincia: this.initialAddressData?.provincia,
      codigoPostal: this.initialAddressData?.codigoPostal
    };

    // Reutiliza tu lógica existente
    this.selectedLocation = location;

    if (this.tempMarker) this.tempMarker.remove();
    this.tempMarker = new maplibregl.Marker({ color: '#ff4136' })
      .setLngLat([location.lng, location.lat])
      .addTo(this.map);

    this.map.flyTo({ center: [location.lng, location.lat], zoom: 15 });
  }

  // === Búsqueda por dirección (geocodificación directa) ===
  public onSearch(): void {
    if (!this.searchQuery.trim()) return;

    this.geocoder.search(this.searchQuery).subscribe({
      next: (results) => {
        if (results.length > 0) {
          const first = results[0];
          const lat = parseFloat(first.lat);
          const lng = parseFloat(first.lon);
          this.updateLocation(first.display_name, "", "", lat, lng, "");
          this.map.flyTo({ center: [lng, lat], zoom: 15 });
        } else {
          this.msg.warning('No se encontraron resultados');
        }
      },
      error: () => this.msg.error('Error al buscar dirección')
    });
  }

  // === Clic en el mapa → geocodificación inversa ===
  private handleMapClick(lat: number, lng: number): void {
    this.geocoder.reverseGeocode(lat, lng).subscribe({
      next: (address) => {
        const displayName = address.address || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        this.updateLocation(displayName, address.ciudad, address.codigoPostal, lat, lng, address.provincia);
      },
      error: () => {
        const fallback = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        this.updateLocation(fallback, "", "", lat, lng, "");
      }
    });
  }

  private updateLocation(address: string, ciudad: string | undefined, codigoPostal: string | undefined, lat: number, lng: number, provincia: string | undefined): void {
    this.selectedLocation = { address, ciudad, codigoPostal, lat, lng, provincia };

    this.locationSelected.emit(this.selectedLocation);

    // Eliminar marcador anterior
    if (this.tempMarker) this.tempMarker.remove();

    // Nuevo marcador
    this.tempMarker = new maplibregl.Marker({ color: '#ff4136' })
      .setLngLat([lng, lat])
      .addTo(this.map);
  }

  // === Emitir o usar el JSON ===
  get locationJson(): string {
    return this.selectedLocation ? JSON.stringify(this.selectedLocation, null, 2) : '';
  }
}
