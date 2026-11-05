import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  PresignedUploadRequest,
  PresignedUploadResponse,
  PresignedUploadData,
  PresignedDownloadResponse,
  StorageBucketType
} from '../interfaces/storage';

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 a 1 (por defecto 0.85)
}

/**
 * Servicio para gestión de almacenamiento directo hacia Cloudflare R2 (Object Storage).
 * Permite solicitar URLs prefirmadas a la API, comprimir imágenes a WebP al 85% en el cliente
 * y subir binarios directamente a R2 evitando saturar el servidor Node.js.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  /**
   * Comprime y redimensiona cualquier imagen (File, Blob o Data URL) a formato WebP nativo
   * con calidad 85% (0.85) utilizando HTML5 Canvas.
   *
   * @param source Archivo, Blob o cadena Base64/DataURL de origen.
   * @param options Configuración de dimensiones máximas y factor de calidad.
   * @returns Promise con el Blob WebP resultante y sus dimensiones finales.
   */
  public compressToWebpBlob(
    source: File | Blob | string,
    options: CompressImageOptions = {}
  ): Promise<{ blob: Blob; width: number; height: number }> {
    const { maxWidth = 1200, maxHeight = 1200, quality = 0.85 } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();

      const cleanup = () => {
        if (typeof source !== 'string' && objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };

      let objectUrl = '';
      if (typeof source === 'string') {
        img.src = source;
      } else {
        objectUrl = URL.createObjectURL(source);
        img.src = objectUrl;
      }

      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round(height * (maxWidth / width));
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round(width * (maxHeight / height));
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            cleanup();
            return reject(new Error('No se pudo obtener el contexto 2D del Canvas'));
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              cleanup();
              if (!blob) {
                return reject(new Error('Fallo al exportar el Canvas a formato WebP'));
              }
              resolve({ blob, width, height });
            },
            'image/webp',
            quality
          );
        } catch (err) {
          cleanup();
          reject(err);
        }
      };

      img.onerror = (err) => {
        cleanup();
        reject(err);
      };
    });
  }

  /**
   * Solicita a la API una URL prefirmada para subida directa (HTTP PUT) a Cloudflare R2.
   */
  public getPresignedUploadUrl(request: PresignedUploadRequest): Observable<PresignedUploadResponse> {
    const url = `${this.baseUrl}storage/presigned-upload`;
    return this.http.post<PresignedUploadResponse>(url, request);
  }

  /**
   * Solicita a la API una URL temporal prefirmada para descargar o visualizar un recurso privado.
   */
  public getPresignedDownloadUrl(key: string, expiresInSeconds?: number): Observable<PresignedDownloadResponse> {
    const url = `${this.baseUrl}storage/presigned-download`;
    return this.http.post<PresignedDownloadResponse>(url, { key, expiresInSeconds });
  }

  /**
   * Sube un binario (Blob o File) directamente a Cloudflare R2 mediante HTTP PUT con reporte de progreso porcentual (0-100).
   */
  public uploadToR2WithProgress(uploadUrl: string, file: Blob | File, contentType: string): Observable<number> {
    const headers = new HttpHeaders({
      'Content-Type': contentType
    });

    const req = new HttpRequest('PUT', uploadUrl, file, {
      headers,
      reportProgress: true
    });

    return this.http.request(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          return Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          return 100;
        }
        return 0;
      })
    );
  }

  /**
   * Sube un binario directamente a Cloudflare R2 mediante HTTP PUT sin reporte de progreso intermedio.
   */
  public uploadDirect(uploadUrl: string, file: Blob | File, contentType: string): Observable<void> {
    const headers = new HttpHeaders({
      'Content-Type': contentType
    });
    return this.http.put<void>(uploadUrl, file, { headers });
  }

  /**
   * Flujo integral: obtiene la URL prefirmada y sube el binario a R2 en un solo pipeline observable.
   */
  public uploadFile(
    file: File | Blob,
    filename: string,
    usr_uuid: string,
    options?: {
      bucketType?: StorageBucketType;
      folder?: string;
      contentType?: string;
    }
  ): Observable<PresignedUploadData> {
    const inferredType = options?.contentType || (file instanceof File ? file.type : 'image/webp') || 'image/webp';
    const bucketType = options?.bucketType || 'private';
    const folder = options?.folder || 'vouchers';

    return this.getPresignedUploadUrl({
      usr_uuid,
      filename,
      contentType: inferredType,
      bucketType,
      folder
    }).pipe(
      switchMap((response: PresignedUploadResponse) => {
        const presignedData = response.data;
        return this.uploadDirect(presignedData.uploadUrl, file, inferredType).pipe(
          map(() => presignedData)
        );
      })
    );
  }

  /**
   * Convierte una cadena DataURL / Base64 a un objeto binario Blob con su tipo MIME correspondiente.
   */
  public dataUrlToBlob(dataUrl: string): { blob: Blob; contentType: string } {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const contentType = mimeMatch ? mimeMatch[1] : 'image/webp';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return {
      blob: new Blob([u8arr], { type: contentType }),
      contentType
    };
  }
}
