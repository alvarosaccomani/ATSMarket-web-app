import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * @description Pipe para transformar claves relativas de Cloudflare R2 a URLs completas de CDN pública.
 * Soporta retrocompatibilidad con URLs absolutas completas (http/https) y cadenas Base64 legadas.
 * Si el valor es nulo o vacío, puede devolver un placeholder opcional.
 */
@Pipe({
  name: 'r2Url',
  standalone: true
})
export class R2UrlPipe implements PipeTransform {
  private readonly defaultPlaceholder = 'assets/images/default-placeholder.webp';

  transform(value: string | null | undefined, fallback?: string): string {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return fallback || this.defaultPlaceholder;
    }

    const trimmed = value.trim();

    // 1. Si ya es una URL absoluta o Base64 legado, no tocarla
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
      return trimmed;
    }

    // 2. Si es una ruta local de assets, devolverla directa
    if (trimmed.startsWith('assets/') || trimmed.startsWith('/assets/')) {
      return trimmed;
    }

    // 3. Clave relativa de R2: concatenar con la base del CDN
    const baseUrl = (environment.r2PublicUrl || 'https://cdn.atssuite.com.ar').replace(/\/+$/, '');
    const cleanKey = trimmed.replace(/^\/+/, '');

    return `${baseUrl}/${cleanKey}`;
  }
}
