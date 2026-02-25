import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule, NzImageService } from 'ng-zorro-antd/image';

export interface Producto {
  seccion: string;
  fotos: string[];
  descripcion: string;
  codigo: string;
  precio: string;
}

@Component({
  selector: 'app-dist-price-list',
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzCarouselModule,
    NzGridModule,
    NzTagModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzImageModule
  ],
  templateUrl: './dist-price-list.component.html',
  styleUrl: './dist-price-list.component.scss'
})
export class DistPriceListComponent implements OnInit {
  public searchTerm: string = '';
  public catalogData: Producto[] = [
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0136_11.jpg', './assets/imgs/0136_12.jpg', './assets/imgs/0136_13.jpg', './assets/imgs/0136_14.jpg'],
      descripcion: 'Llamador metalico chico - 45 cm - surtido',
      codigo: '0136',
      precio: '$ 4088.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0166.jpg'],
      descripcion: 'Llamador casita chica - 58 cm',
      codigo: '0166',
      precio: '$ 5936.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0205.jpg'],
      descripcion: 'Llamador campana cristal colorido - largo 32cm',
      codigo: '0205',
      precio: '$ 7950.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0205A.jpg'],
      descripcion: 'Llamador campana cristal transparente - largo 32cm',
      codigo: '0205-A',
      precio: '$ 7100.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0137_11.jpg'],
      descripcion: 'Llamador elefante',
      codigo: '0137',
      precio: '$ 6650.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0147_13.jpg', './assets/imgs/0147_11.jpg', './assets/imgs/0147_12.jpg'],
      descripcion: 'Llamador caño ondulado',
      codigo: '0147',
      precio: '$ 5050.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0149.jpg'],
      descripcion: 'Llamador elefante',
      codigo: '0149',
      precio: '$ 8250.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0209.jpg'],
      descripcion: 'Llamador campanita luna',
      codigo: '0209',
      precio: '$ 8200.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0210.jpg'],
      descripcion: 'Llamador campanita sol',
      codigo: '0210',
      precio: '$ 8200.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0211.jpg'],
      descripcion: 'Llamador campanita delfin',
      codigo: '0211',
      precio: '$ 8200.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0212.jpg'],
      descripcion: 'Llamador campanita aguila',
      codigo: '0212',
      precio: '$ 8200.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0213_11.jpg'],
      descripcion: 'Llamador fila x15',
      codigo: '0213',
      precio: '$ 6700.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0214.jpg'],
      descripcion: 'Llamador fila x18 - 30x50 cm - plateado / dorado',
      codigo: '0214',
      precio: '$ 18500.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0152.jpg'],
      descripcion: 'Llamador arpa - largo 100 cm',
      codigo: '0152',
      precio: '$ 13500.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0201A.jpg'],
      descripcion: 'Colgante ojo turco c/ campanitas',
      codigo: '0201',
      precio: '$ 3350.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0194.jpg'],
      descripcion: 'Llamador c/ cristal',
      codigo: '0194',
      precio: '$ 7900.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0160_5.jpg', './assets/imgs/0160_4.jpg', './assets/imgs/0160_3.jpg', './assets/imgs/0160_2.jpg', './assets/imgs/0160_1.jpg'],
      descripcion: 'Llamador acero - caño dorado - 70 cm - elefante/corazon/mano/estrella/mandala',
      codigo: '0160',
      precio: '$ 7056.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0189_11.jpg', './assets/imgs/0189_12.jpg', './assets/imgs/0189_13.jpg', './assets/imgs/0189_4.jpg', './assets/imgs/0189_5.jpg'],
      descripcion: 'Llamador acero - 70 cm - buho/arbol vida/sol/mariposa/colibri',
      codigo: '0189',
      precio: '$ 7056.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0190_11.jpg', './assets/imgs/0190_15.jpg', './assets/imgs/0190_12.jpg', './assets/imgs/0190_13.jpg', './assets/imgs/0190_14.jpg'],
      descripcion: 'Llamador acero - 70 cm - elefantes/arbol vida/buho/sol',
      codigo: '0190',
      precio: '$ 7056.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0161_11.jpg'],
      descripcion: 'Llamador c/colibri - 70 cm',
      codigo: '0161',
      precio: '$ 7056.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0187.jpg'],
      descripcion: 'Llamador spinner multicolor',
      codigo: '0187',
      precio: '$ 8950.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0197_11.jpg'],
      descripcion: 'Llamador ojo turco',
      codigo: '0197',
      precio: '$ 7504.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0198_11.jpg'],
      descripcion: 'Llamador mariposa ojo turco',
      codigo: '0198',
      precio: '$ 7504.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0199.jpg'],
      descripcion: 'Llamador c/ corazon',
      codigo: '0199',
      precio: '$ 7500.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0167_11.jpg'],
      descripcion: 'Llamador c/ cristal',
      codigo: '0167',
      precio: '$ 7900.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0162.jpg'],
      descripcion: 'Llamador dorado - colibri / mariposa / buho',
      codigo: '0162',
      precio: '$ 6950.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0200.jpg'],
      descripcion: 'Llamador plateado - buho',
      codigo: '0200',
      precio: '$ 6950.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0202.jpg'],
      descripcion: 'Llamador plateado - colibri',
      codigo: '0202',
      precio: '$ 7200.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0206_11.jpg', './assets/imgs/0206_12.jpg'],
      descripcion: 'Llamador c/ colibri',
      codigo: '0206',
      precio: '$ 7200.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0203.jpg'],
      descripcion: 'Llamador plateado - arbol de la vida',
      codigo: '0203',
      precio: '$ 7200.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0170.jpg'],
      descripcion: 'Llamador 6 caños',
      codigo: '0170',
      precio: '$ 11850.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0150.jpg'],
      descripcion: 'Llamador c/ moneda',
      codigo: '0150',
      precio: '$ 12350.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0207.jpg'],
      descripcion: 'Llamador grande - largo 130 cm - dorado',
      codigo: '0207',
      precio: '$ 35900.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0208.jpg'],
      descripcion: 'Llamador grande - largo 140 cm - dorado / negro',
      codigo: '0208',
      precio: '$ 48900.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0108_11.jpg', './assets/imgs/0108_12.jpg', './assets/imgs/0108_13.jpg', './assets/imgs/0108_14.jpg', './assets/imgs/0108_15.jpg'],
      descripcion: 'Llamador 5 elementos - oro/tierra/agua/madera/fuego - 80 cm',
      codigo: '0108',
      precio: '$ 7336.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0107-12.jpg', './assets/imgs/0107-13.jpg'],
      descripcion: 'Llamador yingyang - yingyang/fortuna - 80 cm',
      codigo: '0107',
      precio: '$ 7839.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0179_11.jpg'],
      descripcion: 'Llamador arpa multicolor - 65 cm',
      codigo: '0179',
      precio: '$ 6048.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0182_11.jpg'],
      descripcion: 'Llamador angel s/ luna',
      codigo: '0182',
      precio: '$ 6496.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0148_11.jpg'],
      descripcion: 'Llamador c/ moneda - 60 cm',
      codigo: '0148',
      precio: '$ 6496.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0185_11.jpg'],
      descripcion: 'Llamador campanita c/ arbol vida - 70 cm',
      codigo: '0185',
      precio: '$ 7056.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0186_11.jpg'],
      descripcion: 'Llamador campanita c/ elefante - 70 cm',
      codigo: '0186',
      precio: '$ 7056.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0184_11.jpg'],
      descripcion: 'Llamador campanita c/ libedula - 70 cm',
      codigo: '0184',
      precio: '$ 7504.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0163_B11.jpg', './assets/imgs/0163_E11.jpg'],
      descripcion: 'Llamador ojo turco - buho / elefante - 70 cm',
      codigo: '0163',
      precio: '$ 7504.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0171_12.jpg', './assets/imgs/0171_13.jpg'],
      descripcion: 'Llamador c/ caracoles - 60 cm',
      codigo: '0171',
      precio: '$ 7672.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0192_11.jpg'],
      descripcion: 'Llamador c/ elefante - 66 cm',
      codigo: '0141',
      precio: '$ 7504.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0151.jpg'],
      descripcion: 'Llamador c/ libedula - 70 cm',
      codigo: '0151',
      precio: '$ 8008.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0191_11.jpg'],
      descripcion: 'Llamador c/ mariposas - 70 cm',
      codigo: '0191',
      precio: '$ 8008.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0134.jpg'],
      descripcion: 'Llamador c/ peces - 55 cm',
      codigo: '0134',
      precio: '$ 8120.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0145_11.jpg'],
      descripcion: 'Llamador 6 caños - plateado - 80 cm',
      codigo: '0145',
      precio: '$ 11760.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0158_11.jpg'],
      descripcion: 'Llamador p/ puerta (c/ iman) - gato - 40 cm',
      codigo: '0158',
      precio: '$ 11698.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0159_11.jpg'],
      descripcion: 'Llamador p/ puerta (c/ iman) - buho - 40 cm',
      codigo: '0159',
      precio: '$ 11698.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/bali052.jpg'],
      descripcion: 'Llamadores de bambu - 30/40/55/65 cm',
      codigo: 'REP-03/06',
      precio: 'Desde $ 6138.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0142__2.jpg'],
      descripcion: 'Llamador pez dorado - 55 cm',
      codigo: '0142',
      precio: '$ 7118.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0104-0.JPG'],
      descripcion: 'Llamador campana sol - 55 cm',
      codigo: '0104-0',
      precio: '$ 6250.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0104-2.JPG'],
      descripcion: 'Llamador campana luna - 55 cm',
      codigo: '0104-1',
      precio: '$ 6250.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0104-5.jpg'],
      descripcion: 'Llamador campana angel - 55 cm',
      codigo: '0104-5',
      precio: '$ 6250.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0104-1.JPG'],
      descripcion: 'Llamador campana elefante - 55 cm',
      codigo: '0104-6',
      precio: '$ 6250.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0104-7.jpg'],
      descripcion: 'Llamador campana buho/mariposa/estrella - 55 cm',
      codigo: '0104-7/9',
      precio: '$ 6250.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0114.jpg'],
      descripcion: 'Llamador moneda - 75 cm',
      codigo: '0114',
      precio: '$ 6416.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0109.JPG'],
      descripcion: 'Llamador casita china - 80 cm',
      codigo: '0109',
      precio: '$ 10086.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/01061.jpg'],
      descripcion: 'Llamador doble fila - dorado - 70 cm',
      codigo: '0168',
      precio: '$ 10775.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/01062.jpg'],
      descripcion: 'Llamador doble fila - plateado - 70 cm',
      codigo: '0169',
      precio: '$ 10775.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0127_11.jpg'],
      descripcion: 'Llamador sol - 60 cm',
      codigo: '0127',
      precio: '$ 12997.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0119_11.jpg'],
      descripcion: 'Llamador buho - 60 cm',
      codigo: '0119',
      precio: '$ 12997.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/01011.jpg'],
      descripcion: 'Llamador c/ 6 caños - negro - largo 100 cm',
      codigo: '0101',
      precio: '$ 28628.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0105-0.jpg'],
      descripcion: 'Llamador fila angel - 65 cm',
      codigo: '01050',
      precio: '$ 6857.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0105-3.jpg'],
      descripcion: 'Llamador fila sol/luna - 65 cm',
      codigo: '01051/2',
      precio: '$ 6857.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0105-1.JPG'],
      descripcion: 'Llamador fila delfin - 65 cm',
      codigo: '01053',
      precio: '$ 6857.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0164.jpg'],
      descripcion: 'Colgante sol luna chico - 40 cm',
      codigo: '0164',
      precio: '$ 4872.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0165_13.jpg'],
      descripcion: 'Colgante sol ojo turco chico - 40 cm',
      codigo: '0165',
      precio: '$ 4872.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0131.jpg'],
      descripcion: 'Llamador iguana metalica - 55 cm',
      codigo: '0131',
      precio: '$ 5418.-'
    },
    {
      seccion: 'Llamadores',
      fotos: ['./assets/imgs/0132.jpg'],
      descripcion: 'Llamador sol metalica - 55 cm',
      codigo: '0132',
      precio: '$ 5418.-'
    }
  ];

  public filteredData: Producto[] = [];

  constructor(
    private nzImageService: NzImageService
  ) { }

  ngOnInit(): void {
    this.filteredData = this.catalogData;
  }

  public onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredData = this.catalogData;
    } else {
      this.filteredData = this.catalogData.filter(item => 
        item.codigo.toLowerCase().includes(term) || 
        item.descripcion.toLowerCase().includes(term)
      );
    }
  }

  public verImagen(item: Producto): void {
    const images = item.fotos.map(src => ({
      src: src,
      alt: item.descripcion
    }));

    this.nzImageService.preview(images, { nzZoom: 1, nzRotate: 0 });
  }
}
