// 1. Interfaz para tipar tus datos
export interface StoreInterface {
    id: number;
    slug: string; // Ej: 'cajasantos33' (clave de la URL)
    nombre: string;
    logoUrl: string;
    descripcion: string;
    rubroPersonalizado: string;
    categoriasPersonalizadas: string[]; // Ej: ['Rosarios Premium', 'Estatuas de Mármol']
    // ... otros campos (contacto, redes)
}