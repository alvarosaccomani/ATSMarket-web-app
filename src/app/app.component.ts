import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// 1. Interfaz para tipar tus datos
interface Product {
  id: number;
  nombre: string;
  precio: number;
}

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ATSMarket-web-app';

  products: Product[] = [
    {
      "id": 1,
      "nombre": "Abanico",
      "precio": 3000
    },
    {
      "id": 2,
      "nombre": "Almanaque grande",
      "precio": 2000
    },
    {
      "id": 3,
      "nombre": "Almanaque 3d Basilica de Lujan",
      "precio": 1200
    },
    {
      "id": 4,
      "nombre": "Almohadones",
      "precio": 5000
    },
    {
      "id": 5,
      "nombre": "Angeles con luz",
      "precio": 12000
    },
    {
      "id": 6,
      "nombre": "Anillos",
      "precio": 5000
    },
    {
      "id": 7,
      "nombre": "Anillos acero quirurgico blanco giratorio",
      "precio": 15000
    },
    {
      "id": 8,
      "nombre": "Anillos alianza par",
      "precio": 5000
    },
    {
      "id": 9,
      "nombre": "Anillos solos",
      "precio": 5000
    },
    {
      "id": 10,
      "nombre": "Anillos Virgen",
      "precio": 3000
    },
    {
      "id": 11,
      "nombre": "Arbol de navidad con luz",
      "precio": 12000
    },
    {
      "id": 12,
      "nombre": "Arcangeles por 7",
      "precio": 66000
    },
    {
      "id": 13,
      "nombre": "Arcangeles por unidad",
      "precio": 11000
    },
    {
      "id": 14,
      "nombre": "Arito",
      "precio": 3000
    },
    {
      "id": 15,
      "nombre": "Atrapasueños 7 chakras",
      "precio": 10000
    },
    {
      "id": 16,
      "nombre": "Atrapasueños aro chicos",
      "precio": 6000
    },
    {
      "id": 17,
      "nombre": "Atrapasueños aro grande",
      "precio": 7000
    },
    {
      "id": 18,
      "nombre": "Babero",
      "precio": 4000
    },
    {
      "id": 19,
      "nombre": "Bidon 2 litros (grande)",
      "precio": 4000
    },
    {
      "id": 20,
      "nombre": "Bidon 1 litro (chico)",
      "precio": 3500
    },
    {
      "id": 21,
      "nombre": "Billeteras",
      "precio": 10000
    },
    {
      "id": 22,
      "nombre": "Bombilla virgen de lujan",
      "precio": 6000
    },
    {
      "id": 23,
      "nombre": "Bombillas alpaca (con bolsa)",
      "precio": 15000
    },
    {
      "id": 24,
      "nombre": "Bombillas colores",
      "precio": 2500
    },
    {
      "id": 25,
      "nombre": "Botella chica",
      "precio": 2000
    },
    {
      "id": 26,
      "nombre": "Botella grande",
      "precio": 3000
    },
    {
      "id": 27,
      "nombre": "Botella Virgen",
      "precio": 2500
    },
    {
      "id": 28,
      "nombre": "Cadena de acero quirurgico blanco con dije",
      "precio": 15000
    },
    {
      "id": 29,
      "nombre": "Cadenas acero solas",
      "precio": 5000
    },
    {
      "id": 30,
      "nombre": "Cinta auto",
      "precio": 2000
    },
    {
      "id": 31,
      "nombre": "Cinta clubes",
      "precio": 3000
    },
    {
      "id": 32,
      "nombre": "Cintita roja - celeste - violeta",
      "precio": 1000
    },
    {
      "id": 33,
      "nombre": "Colgante auto",
      "precio": 1000
    },
    {
      "id": 34,
      "nombre": "Conjunto cadena y dije",
      "precio": 10000
    },
    {
      "id": 35,
      "nombre": "Cruz madera y bronce chica",
      "precio": 10000
    },
    {
      "id": 36,
      "nombre": "Cruz madera y bronce grande",
      "precio": 30000
    },
    {
      "id": 37,
      "nombre": "Cruz madera y bronce mediana",
      "precio": 20000
    },
    {
      "id": 38,
      "nombre": "Denario comunion",
      "precio": 4000
    },
    {
      "id": 39,
      "nombre": "Denario corazon",
      "precio": 4000
    },
    {
      "id": 40,
      "nombre": "Dijes",
      "precio": 5000
    },
    {
      "id": 41,
      "nombre": "Esfera de nieve c/luz",
      "precio": 8000
    },
    {
      "id": 42,
      "nombre": "Estampita",
      "precio": 100
    },
    {
      "id": 43,
      "nombre": "Estampita triptica 3d",
      "precio": 1000
    },
    {
      "id": 44,
      "nombre": "Herradura caballo",
      "precio": 15000
    },
    {
      "id": 45,
      "nombre": "Imágenes pvc varias",
      "precio": 15000
    },
    {
      "id": 46,
      "nombre": "Juguetes 3d articulados",
      "precio": 2000
    },
    {
      "id": 47,
      "nombre": "Lampara de sal",
      "precio": 22000
    },
    {
      "id": 48,
      "nombre": "Llamador 3d",
      "precio": 30000
    },
    {
      "id": 49,
      "nombre": "Llamador acero",
      "precio": 30000
    },
    {
      "id": 50,
      "nombre": "Llamador angeles colibri/delfin",
      "precio": 15000
    },
    {
      "id": 51,
      "nombre": "Almanaque chico",
      "precio": 1500
    },
    {
      "id": 52,
      "nombre": "Llavero acero",
      "precio": 2500
    },
    {
      "id": 53,
      "nombre": "Llavero cuero",
      "precio": 4000
    },
    {
      "id": 54,
      "nombre": "Llavero impresora 3d",
      "precio": 2000
    },
    {
      "id": 55,
      "nombre": "Llavero letra",
      "precio": 3000
    },
    {
      "id": 56,
      "nombre": "Llavero nene",
      "precio": 4000
    },
    {
      "id": 57,
      "nombre": "Mano de fatima/7 chacra/atrapa sueños",
      "precio": 10000
    },
    {
      "id": 58,
      "nombre": "Matera cuero",
      "precio": 22000
    },
    {
      "id": 59,
      "nombre": "Mates grabados",
      "precio": 12000
    },
    {
      "id": 60,
      "nombre": "Mates media tapa e imperial",
      "precio": 18000
    },
    {
      "id": 61,
      "nombre": "Monedero",
      "precio": 3000
    },
    {
      "id": 62,
      "nombre": "Novena de vela TODAS",
      "precio": 5000
    },
    {
      "id": 63,
      "nombre": "Perro mueve cabeza",
      "precio": 5000
    },
    {
      "id": 64,
      "nombre": "Pesebre",
      "precio": 12000
    },
    {
      "id": 65,
      "nombre": "Pesebre campana",
      "precio": 20000
    },
    {
      "id": 66,
      "nombre": "Piedras",
      "precio": 4000
    },
    {
      "id": 67,
      "nombre": "Porta mate cuero",
      "precio": 22000
    },
    {
      "id": 68,
      "nombre": "Porta sahumerio",
      "precio": 5000
    },
    {
      "id": 69,
      "nombre": "Portavelas arcangeles chacras",
      "precio": 10000
    },
    {
      "id": 70,
      "nombre": "Pulsera acero quirurgico premium stainlees steel",
      "precio": 10000
    },
    {
      "id": 71,
      "nombre": "Pulsera rosario",
      "precio": 5000
    },
    {
      "id": 72,
      "nombre": "Pulsera San Benito",
      "precio": 4000
    },
    {
      "id": 73,
      "nombre": "Pulseras acero",
      "precio": 5000
    },
    {
      "id": 74,
      "nombre": "Pulseras nene",
      "precio": 2000
    },
    {
      "id": 75,
      "nombre": "Recuerdo de lujan capilla (todas)",
      "precio": 4500
    },
    {
      "id": 76,
      "nombre": "Recuerdo de lujan basilica y virgen",
      "precio": 4000
    },
    {
      "id": 77,
      "nombre": "Recuerdo de lujan vela",
      "precio": 5000
    },
    {
      "id": 78,
      "nombre": "Reloj",
      "precio": 22000
    },
    {
      "id": 79,
      "nombre": "Resto de bombilla acero inoxidable",
      "precio": 7000
    },
    {
      "id": 80,
      "nombre": "Rosario acero",
      "precio": 10000
    },
    {
      "id": 81,
      "nombre": "Rosario nene",
      "precio": 2500
    },
    {
      "id": 82,
      "nombre": "Rosario palo de rosa",
      "precio": 5000
    },
    {
      "id": 83,
      "nombre": "Rosario perlado",
      "precio": 7000
    },
    {
      "id": 84,
      "nombre": "Rosario porfis",
      "precio": 5000
    },
    {
      "id": 85,
      "nombre": "Rosarios todos (menos perlado)",
      "precio": 3500
    },
    {
      "id": 86,
      "nombre": "Rosarios en cadenero",
      "precio": 1000
    },
    {
      "id": 87,
      "nombre": "Rosarios plasticos",
      "precio": 2500
    },
    {
      "id": 88,
      "nombre": "Sagrado corazon o virgenes varias pvc (menos lujan)",
      "precio": 10000
    },
    {
      "id": 89,
      "nombre": "Sales perfumadas",
      "precio": 10000
    },
    {
      "id": 90,
      "nombre": "Sticker grande",
      "precio": 2000
    },
    {
      "id": 91,
      "nombre": "Sticker mediano",
      "precio": 1500
    },
    {
      "id": 92,
      "nombre": "Stickers",
      "precio": 1500
    },
    /*{
      "id": 93,
      "nombre": "Vela corta por 2",
      "precio": 2500
    },*/
    {
      "id": 94,
      "nombre": "Velas largagas bautismo x 2",
      "precio": 2500
    },
    {
      "id": 95,
      "nombre": "Velon 3 dias",
      "precio": 3500
    },
    {
      "id": 96,
      "nombre": "Velon 7 dias",
      "precio": 6000
    },
    {
      "id": 97,
      "nombre": "veloncito navidad",
      "precio": 5000
    },
    {
      "id": 98,
      "nombre": "Virgen 3d",
      "precio": 1000
    },
    {
      "id": 99,
      "nombre": "Virgen acero chica",
      "precio": 1000
    },
    {
      "id": 100,
      "nombre": "Virgen blanca mediana 3d",
      "precio": 12000
    },
    {
      "id": 101,
      "nombre": "Virgen blanca o celeste grande 3d",
      "precio": 23000
    },
    {
      "id": 102,
      "nombre": "Virgen bronce",
      "precio": 8000
    },
    {
      "id": 103,
      "nombre": "Virgen con tronco",
      "precio": 1500
    },
    {
      "id": 104,
      "nombre": "Virgen con vitraux chico",
      "precio": 3000
    },
    {
      "id": 105,
      "nombre": "Virgen con vitraux grande",
      "precio": 4500
    },
    {
      "id": 106,
      "nombre": "Virgen del tiempo",
      "precio": 4000
    },
    {
      "id": 107,
      "nombre": "Virgen grande de yeso",
      "precio": 30000
    },
    {
      "id": 108,
      "nombre": "Virgen importada color",
      "precio": 5000
    },
    {
      "id": 109,
      "nombre": "Virgen pvc",
      "precio": 8000
    },
    {
      "id": 110,
      "nombre": "Virgen pvc chica",
      "precio": 5000
    },
    {
      "id": 111,
      "nombre": "Virgen pvc mediana",
      "precio": 6000
    },
    {
      "id": 112,
      "nombre": "Virgen yeso color",
      "precio": 10000
    },
    {
      "id": 113,
      "nombre": "Virgen acero mediana",
      "precio": 2000
    },
    {
      "id": 114,
      "nombre": "Vitraux base",
      "precio": 6000
    },
    {
      "id": 115,
      "nombre": "Yerbero y azucarero",
      "precio": 8000
    },
    {
      "id": 116,
      "nombre": "Llavero alpaca",
      "precio": 10000
    },
    {
      "id": 117,
      "nombre": "Llamador vaca san antonio/colibri",
      "precio": 30000
    }
  ]

  // 3. Lista que se muestra en la vista (será la lista filtrada)
  filteredProducts: Product[] = [];

  // 4. Modelo para el input de filtrado
  filterText: string = '';

  constructor() { }

  ngOnInit(): void {
    // Inicialmente, la lista filtrada es igual a la lista completa
    this.filteredProducts = [...this.products];
  }

  /**
   * 💡 Función Auxiliar para eliminar acentos.
   * Utiliza la normalización Unicode (NFD) para separar el carácter base del acento.
   */
  private removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // 5. Función de filtrado
  applyFilter(): void {
    const rawFilterValue = this.filterText.toLowerCase().trim();

    if (!rawFilterValue) {
      this.filteredProducts = [...this.products];
      return;
    }

    // 1. Normalizar el valor de búsqueda (el input del usuario)
    const normalizedFilterValue = this.removeAccents(rawFilterValue);

    this.filteredProducts = this.products.filter(product => {
      // 2. Normalizar el nombre del producto para la comparación
      const normalizedProductName = this.removeAccents(product.nombre.toLowerCase());

      return (
        // Búsqueda en Nombre (Normalizado)
        normalizedProductName.includes(normalizedFilterValue) ||
        // Búsqueda en ID (sin normalización, ya que es un número)
        product.id.toString().includes(rawFilterValue)
      );
    });
  }
}
