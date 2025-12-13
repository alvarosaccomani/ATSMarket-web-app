// 1. Interfaz para tipar tus datos
export interface ProductInterface {
    id: number;
    nombre: string;
    referencia?: string;
    categoria?: 'estatuas' | 'rosarios' | 'medallas' | 'otros';
    material?: string;
    precio: number; // Precio base (Efectivo)
    imagenUrl?: string;
    stock?: number;
}