import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductVariationResults, ProductVariationInterface } from '@interfaces/product-variation';

@Injectable({
  providedIn: 'root'
})
export class ProductVariationsService {

  // Simulación de la base de datos de productos (en un entorno real, sería una base de datos)
  // private productsData: ProductVariationInterface[] = [
  //   {
  //     prov_uuid: "1",
  //     prov_code: "1",
  //     prov_sku: "1",
  //     prov_name: "Abanico",
  //     prov_image: null,
  //     prov_suggestedminimumsellingprice: 3000
  //   },
  //   {
  //     prov_uuid: "2",
  //     prov_code: "2",
  //     prov_sku: "2",
  //     prov_name: "Almanaque grande",
  //     prov_suggestedminimumsellingprice: 2000
  //   },
  //   {
  //     prov_uuid: "3",
  //     prov_code: "3",
  //     prov_sku: "3",
  //     prov_name: "Almanaque 3d Basilica de Lujan",
  //     prov_suggestedminimumsellingprice: 1200
  //   },
  //   {
  //     prov_uuid: "4",
  //     prov_code: "4",
  //     prov_sku: "4",
  //     prov_name: "Almohadones",
  //     prov_suggestedminimumsellingprice: 5000
  //   },
  //   {
  //     prov_uuid: "5",
  //     prov_code: "5",
  //     prov_sku: "5",
  //     prov_name: "Angeles con luz",
  //     prov_suggestedminimumsellingprice: 12000
  //   },
  //   {
  //     prov_uuid: "6",
  //     prov_code: "6",
  //     prov_sku: "6",
  //     prov_name: "Anillos",
  //     prov_suggestedminimumsellingprice: 5000
  //   },
  //   {
  //     prov_uuid: "7",
  //     prov_code: "7",
  //     prov_sku: "7",
  //     prov_name: "Anillos acero quirurgico blanco giratorio",
  //     prov_suggestedminimumsellingprice: 15000
  //   },
  //   {
  //     prov_uuid: "8",
  //     prov_code: "8",
  //     prov_sku: "8",
  //     prov_name: "Anillos alianza par",
  //     prov_suggestedminimumsellingprice: 5000
  //   },
  //   {
  //     prov_uuid: "9",
  //     prov_code: "9",
  //     prov_sku: "9",
  //     prov_name: "Anillos solos",
  //     prov_suggestedminimumsellingprice: 5000
  //   },
  //   {
  //     prov_uuid: "10",
  //     prov_code: "10",
  //     prov_sku: "10",
  //     prov_name: "Anillos Virgen",
  //     prov_suggestedminimumsellingprice: 3000
  //   },
  //   {
  //     prov_uuid: "11",
  //     prov_code: "11",
  //     prov_sku: "11",
  //     prov_name: "Arbol de navidad con luz",
  //     prov_suggestedminimumsellingprice: 12000
  //   },
  //   {
  //     prov_uuid: "12",
  //     prov_code: "12",
  //     prov_sku: "12",
  //     prov_name: "Arcangeles por 7",
  //     prov_suggestedminimumsellingprice: 66000
  //   },
  //   {
  //     prov_uuid: "13",
  //     prov_code: "13",
  //     prov_sku: "13",
  //     prov_name: "Arcangeles por unidad",
  //     prov_suggestedminimumsellingprice: 11000
  //   },
  //   {
  //     prov_uuid: "14",
  //     prov_code: "14",
  //     prov_sku: "14",
  //     prov_name: "Arito",
  //     prov_suggestedminimumsellingprice: 3000
  //   },
  //   {
  //     prov_uuid: "15",
  //     prov_code: "15",
  //     prov_sku: "15",
  //     prov_name: "Atrapasueños 7 chakras",
  //     prov_suggestedminimumsellingprice: 10000
  //   },
  //   {
  //     prov_uuid: "16",
  //     prov_code: "16",
  //     prov_sku: "16",
  //     prov_name: "Atrapasueños aro chicos",
  //     prov_suggestedminimumsellingprice: 6000
  //   },
  //   {
  //     prov_uuid: "17",
  //     prov_code: "17",
  //     prov_sku: "17",
  //     prov_name: "Atrapasueños aro grande",
  //     prov_suggestedminimumsellingprice: 7000
  //   },
  //   {
  //     prov_uuid: "18",
  //     prov_code: "18",
  //     prov_sku: "18",
  //     prov_name: "Babero",
  //     prov_suggestedminimumsellingprice: 4000
  //   },
  //   {
  //     prov_uuid: "19",
  //     prov_code: "19",
  //     prov_sku: "19",
  //     prov_name: "Bidon 2 litros (grande)",
  //     prov_suggestedminimumsellingprice: 4000
  //   },
  //   {
  //     prov_uuid: "20",
  //     prov_code: "20",
  //     prov_sku: "20",
  //     prov_name: "Bidon 1 litro (chico)",
  //     prov_suggestedminimumsellingprice: 3500
  //   },
  //   {
  //     prov_uuid: "21",
  //     prov_code: "21",
  //     prov_sku: "21",
  //     prov_name: "Billeteras",
  //     prov_suggestedminimumsellingprice: 10000
  //   },
  //   {
  //     prov_uuid: "22",
  //     prov_code: "22",
  //     prov_sku: "22",
  //     prov_name: "Bombilla virgen de lujan",
  //     prov_suggestedminimumsellingprice: 6000
  //   },
  //   {
  //     prov_uuid: "23",
  //     prov_code: "23",
  //     prov_sku: "23",
  //     prov_name: "Bombillas alpaca (con bolsa)",
  //     prov_suggestedminimumsellingprice: 15000
  //   },
  //   {
  //     prov_uuid: "24",
  //     prov_code: "24",
  //     prov_sku: "24",
  //     prov_name: "Bombillas colores",
  //     prov_suggestedminimumsellingprice: 2500
  //   },
  //   {
  //     prov_uuid: "25",
  //     prov_code: "25",
  //     prov_sku: "25",
  //     prov_name: "Botella chica",
  //     prov_suggestedminimumsellingprice: 2000
  //   },
  //   {
  //     prov_uuid: "26",
  //     prov_code: "26",
  //     prov_sku: "26",
  //     prov_name: "Botella grande",
  //     prov_suggestedminimumsellingprice: 3000
  //   },
  //   {
  //     prov_uuid: "27",
  //     prov_code: "27",
  //     prov_sku: "27",
  //     prov_name: "Botella Virgen",
  //     prov_suggestedminimumsellingprice: 2500
  //   },
  //   {
  //     prov_uuid: "28",
  //     prov_code: "28",
  //     prov_sku: "28",
  //     prov_name: "Cadena de acero quirurgico blanco con dije",
  //     prov_suggestedminimumsellingprice: 15000
  //   },
  //   {
  //     prov_uuid: "29",
  //     prov_code: "29",
  //     prov_sku: "29",
  //     prov_name: "Cadenas acero solas",
  //     prov_suggestedminimumsellingprice: 5000
  //   },
  //   {
  //     prov_uuid: "30",
  //     prov_code: "30",
  //     prov_sku: "30",
  //     prov_name: "Cinta auto",
  //     prov_suggestedminimumsellingprice: 2000
  //   },
  //   {
  //     prov_uuid: "31",
  //     prov_code: "31",
  //     prov_sku: "31",
  //     prov_name: "Cinta clubes",
  //     prov_suggestedminimumsellingprice: 3000
  //   },
  //   {
  //     prov_uuid: "32",
  //     prov_name: "Cintita roja - celeste - violeta",
  //     prov_suggestedminimumsellingprice: 1000
  //   },
  //   {
  //     prov_uuid: "33",
  //     prov_name: "Colgante auto",
  //     prov_suggestedminimumsellingprice: 1000
  //   },
  //   {
  //     prov_uuid: "34",
  //     prov_name: "Conjunto cadena y dije",
  //     prov_suggestedminimumsellingprice: 10000
  //   },
  //   {
  //     prov_uuid: "35",
  //     prov_name: "Cruz madera y bronce chica",
  //     prov_suggestedminimumsellingprice: 10000
  //   },
  //   {
  //     prov_uuid: "36",
  //     prov_name: "Cruz madera y bronce grande",
  //     prov_suggestedminimumsellingprice: 30000
  //   },
  //   {
  //     prov_uuid: "37",
  //     prov_name: "Cruz madera y bronce mediana",
  //     prov_suggestedminimumsellingprice: 20000
  //   },
  //   {
  //     prov_uuid: "38",
  //     prov_name: "Denario comunion",
  //     prov_suggestedminimumsellingprice: 4000
  //   },
  //   {
  //     prov_uuid: "39",
  //     prov_name: "Denario corazon",
  //     prov_suggestedminimumsellingprice: 4000
  //   },
  //   {
  //     prov_uuid: "40",
  //     prov_name: "Dijes",
  //     prov_suggestedminimumsellingprice: 5000
  //   },
  //   {
  //     prov_uuid: "41",
  //     prov_name: "Esfera de nieve c/luz",
  //     prov_suggestedminimumsellingprice: 8000
  //   },
  //   {
  //     prov_uuid: "42",
  //     prov_name: "Estampita",
  //     prov_suggestedminimumsellingprice: 100
  //   },
  //   {
  //     prov_uuid: "43",
  //     prov_name: "Estampita triptica 3d",
  //     prov_suggestedminimumsellingprice: 1000
  //   },
  //   {
  //     prov_uuid: "44",
  //     prov_name: "Herradura caballo",
  //     prov_suggestedminimumsellingprice: 15000
  //   },
  //   {
  //     prov_uuid: "45",
  //     prov_name: "Imágenes pvc varias",
  //     prov_suggestedminimumsellingprice: 15000
  //   },
  //   {
  //     prov_uuid: "46",
  //     prov_name: "Juguetes 3d articulados",
  //     prov_suggestedminimumsellingprice: 2000
  //   },
  //   {
  //     prov_uuid: "47",
  //     prov_name: "Lampara de sal",
  //     prov_suggestedminimumsellingprice: 22000
  //   },
  //   {
  //     prov_uuid: "48",
  //     prov_name: "Llamador 3d",
  //     prov_suggestedminimumsellingprice: 30000
  //   },
  //   {
  //     prov_uuid: "49",
  //     prov_name: "Llamador acero",
  //     prov_suggestedminimumsellingprice: 30000
  //   },
  //   {
  //     prov_uuid: "50",
  //     prov_name: "Llamador angeles colibri/delfin",
  //     prov_suggestedminimumsellingprice: 15000
  //   },
  //   {
  //     prov_uuid: "51",
  //     prov_name: "Almanaque chico",
  //     prov_suggestedminimumsellingprice: 1500
  //   },
  //   {
  //     prov_uuid: "52",
  //     prov_name: "Llavero acero",
  //     prov_suggestedminimumsellingprice: 2500
  //   },
  //   {
  //     prov_uuid: "53",
  //     prov_name: "Llavero cuero",
  //     prov_suggestedminimumsellingprice: 4000
  //   },
  //   {
  //     prov_uuid: "54",
  //     prov_name: "Llavero impresora 3d",
  //     prov_suggestedminimumsellingprice: 2000
  //   },
  //   {
  //     prov_uuid: "55",
  //     prov_name: "Llavero letra",
  //     prov_suggestedminimumsellingprice: 3000
  //   },
  //   {
  //     prov_uuid: "56",
  //     prov_name: "Llavero nene",
  //     prov_suggestedminimumsellingprice: 4000
  //   },
  //   {
  //     prov_uuid: "57",
  //     prov_name: "Mano de fatima/7 chacra/atrapa sueños",
  //     prov_suggestedminimumsellingprice: 10000
  //   },
  //   {
  //     prov_uuid: "58",
  //     prov_name: "Matera cuero",
  //     prov_suggestedminimumsellingprice: 22000
  //   },
  //   {
  //     prov_uuid: "59",
  //     prov_name: "Mates grabados",
  //     prov_suggestedminimumsellingprice: 12000
  //   },
  //   {
  //     prov_uuid: "60",
  //     prov_name: "Mates media tapa e imperial",
  //     prov_suggestedminimumsellingprice: 18000
  //   },
  //   {
  //     prov_uuid: "61",
  //     prov_name: "Monedero",
  //     prov_suggestedminimumsellingprice: 3000
  //   },
  //   {
  //     prov_uuid: "62",
  //     prov_name: "Novena de vela TODAS",
  //     prov_suggestedminimumsellingprice: 5000
  //   },
  //   {
  //     prov_uuid: "63",
  //     prov_name: "Perro mueve cabeza",
  //     prov_suggestedminimumsellingprice: 5000
  //   },
  //   {
  //     prov_uuid: "64",
  //     prov_name: "Pesebre",
  //     prov_suggestedminimumsellingprice: 12000
  //   },
  //   {
  //     prov_uuid: "65",
  //     prov_name: "Pesebre campana",
  //     prov_suggestedminimumsellingprice: 20000
  //   },
  //   {
  //     prov_uuid: "66",
  //     prov_name: "Piedras",
  //     prov_suggestedminimumsellingprice: 4000
  //   },
  //   {
  //     prov_uuid: "67",
  //     prov_name: "Porta mate cuero",
  //     prov_suggestedminimumsellingprice: 22000
  //   },
  //   {
  //     prov_uuid: "68",
  //     prov_name: "Porta sahumerio",
  //     prov_suggestedminimumsellingprice: 5000
  //   },
  //   {
  //     prov_uuid: "69",
  //     prov_name: "Portavelas arcangeles chacras",
  //     prov_suggestedminimumsellingprice: 10000
  //   },
  //   {
  //     prov_uuid: "70",
  //     prov_name: "Pulsera acero quirurgico premium stainlees steel",
  //     prov_suggestedminimumsellingprice: 10000
  //   },
  //   {
  //     prov_uuid: "71",
  //     prov_name: "Pulsera rosario",
  //     prov_suggestedminimumsellingprice: 5000
  //   },
  //   {
  //     prov_uuid: "72",
  //     prov_name: "Pulsera San Benito",
  //     prov_suggestedminimumsellingprice: 4000
  //   },
  //   {
  //     prov_uuid: "73",
  //     prov_name: "Pulseras acero",
  //     prov_suggestedminimumsellingprice: 5000
  //   },
  //   {
  //     prov_uuid: "74",
  //     prov_name: "Pulseras nene",
  //     prov_suggestedminimumsellingprice: 2000
  //   },
  //   {
  //     prov_uuid: "75",
  //     prov_name: "Recuerdo de lujan capilla (todas)",
  //     prov_suggestedminimumsellingprice: 4500
  //   },
  //   {
  //     prov_uuid: "76",
  //     prov_name: "Recuerdo de lujan basilica y virgen",
  //     prov_suggestedminimumsellingprice: 4000
  //   },
  //   {
  //     prov_uuid: "77",
  //     prov_name: "Recuerdo de lujan vela",
  //     prov_suggestedminimumsellingprice: 5000
  //   },
  //   {
  //     prov_uuid: "78",
  //     prov_name: "Reloj",
  //     prov_suggestedminimumsellingprice: 22000
  //   },
  //   {
  //     prov_uuid: "79",
  //     prov_name: "Resto de bombilla acero inoxidable",
  //     prov_suggestedminimumsellingprice: 7000
  //   },
  //   {
  //     prov_uuid: "80",
  //     prov_name: "Rosario acero",
  //     prov_suggestedminimumsellingprice: 10000
  //   },
  //   {
  //     prov_uuid: "81",
  //     prov_name: "Rosario nene",
  //     prov_suggestedminimumsellingprice: 2500
  //   },
  //   {
  //     prov_uuid: "82",
  //     prov_name: "Rosario palo de rosa",
  //     prov_suggestedminimumsellingprice: 5000
  //   },
  //   {
  //     prov_uuid: "83",
  //     prov_name: "Rosario perlado",
  //     prov_suggestedminimumsellingprice: 7000
  //   },
  //   {
  //     prov_uuid: "84",
  //     prov_name: "Rosario porfis",
  //     prov_suggestedminimumsellingprice: 5000
  //   },
  //   {
  //     prov_uuid: "85",
  //     prov_name: "Rosarios todos (menos perlado)",
  //     prov_suggestedminimumsellingprice: 3500
  //   },
  //   {
  //     prov_uuid: "86",
  //     prov_name: "Rosarios en cadenero",
  //     prov_suggestedminimumsellingprice: 1000
  //   },
  //   {
  //     prov_uuid: "87",
  //     prov_name: "Rosarios plasticos",
  //     prov_suggestedminimumsellingprice: 2500
  //   },
  //   {
  //     prov_uuid: "88",
  //     prov_name: "Sagrado corazon o virgenes varias pvc (menos lujan)",
  //     prov_suggestedminimumsellingprice: 10000
  //   },
  //   {
  //     prov_uuid: "89",
  //     prov_name: "Sales perfumadas",
  //     prov_suggestedminimumsellingprice: 10000
  //   },
  //   {
  //     prov_uuid: "90",
  //     prov_name: "Sticker grande",
  //     prov_suggestedminimumsellingprice: 2000
  //   },
  //   {
  //     prov_uuid: "91",
  //     prov_name: "Sticker mediano",
  //     prov_suggestedminimumsellingprice: 1500
  //   },
  //   {
  //     prov_uuid: "92",
  //     prov_name: "Stickers",
  //     prov_suggestedminimumsellingprice: 1500
  //   },
  //   /*{
  //     prov_uuid: "93",
  //     prov_name: "Vela corta por 2",
  //     prov_suggestedminimumsellingprice: 2500
  //   },*/
  //   {
  //     prov_uuid: "94",
  //     prov_name: "Velas largagas bautismo x 2",
  //     prov_suggestedminimumsellingprice: 2500
  //   },
  //   {
  //     prov_uuid: "95",
  //     prov_name: "Velon 3 dias",
  //     prov_suggestedminimumsellingprice: 3500
  //   },
  //   {
  //     prov_uuid: "96",
  //     prov_name: "Velon 7 dias",
  //     prov_suggestedminimumsellingprice: 6000
  //   },
  //   {
  //     prov_uuid: "97",
  //     prov_name: "veloncito navidad",
  //     prov_suggestedminimumsellingprice: 5000
  //   },
  //   {
  //     prov_uuid: "98",
  //     prov_name: "Virgen 3d",
  //     prov_suggestedminimumsellingprice: 1000
  //   },
  //   {
  //     prov_uuid: "99",
  //     prov_name: "Virgen acero chica",
  //     prov_suggestedminimumsellingprice: 1000
  //   },
  //   {
  //     prov_uuid: "100",
  //     prov_name: "Virgen blanca mediana 3d",
  //     prov_suggestedminimumsellingprice: 12000
  //   },
  //   {
  //     prov_uuid: "101",
  //     prov_name: "Virgen blanca o celeste grande 3d",
  //     prov_suggestedminimumsellingprice: 23000
  //   },
  //   {
  //     prov_uuid: "102",
  //     prov_name: "Virgen bronce",
  //     prov_suggestedminimumsellingprice: 8000
  //   },
  //   {
  //     prov_uuid: "103",
  //     prov_name: "Virgen con tronco",
  //     prov_suggestedminimumsellingprice: 1500
  //   },
  //   {
  //     prov_uuid: "104",
  //     prov_name: "Virgen con vitraux chico",
  //     prov_suggestedminimumsellingprice: 3000
  //   },
  //   {
  //     prov_uuid: "105",
  //     prov_name: "Virgen con vitraux grande",
  //     prov_suggestedminimumsellingprice: 4500
  //   },
  //   {
  //     prov_uuid: "106",
  //     prov_name: "Virgen del tiempo",
  //     prov_suggestedminimumsellingprice: 4000
  //   },
  //   {
  //     prov_uuid: "107",
  //     prov_name: "Virgen grande de yeso",
  //     prov_suggestedminimumsellingprice: 30000
  //   },
  //   {
  //     prov_uuid: "108",
  //     prov_name: "Virgen importada color",
  //     prov_suggestedminimumsellingprice: 5000
  //   },
  //   {
  //     prov_uuid: "109",
  //     prov_name: "Virgen pvc",
  //     prov_suggestedminimumsellingprice: 8000
  //   },
  //   {
  //     prov_uuid: "110",
  //     prov_name: "Virgen pvc chica",
  //     prov_suggestedminimumsellingprice: 5000
  //   },
  //   {
  //     prov_uuid: "111",
  //     prov_name: "Virgen pvc mediana",
  //     prov_suggestedminimumsellingprice: 6000
  //   },
  //   {
  //     prov_uuid: "112",
  //     prov_name: "Virgen yeso color",
  //     prov_suggestedminimumsellingprice: 10000
  //   },
  //   {
  //     prov_uuid: "113",
  //     prov_name: "Virgen acero mediana",
  //     prov_suggestedminimumsellingprice: 2000
  //   },
  //   {
  //     prov_uuid: "114",
  //     prov_name: "Vitraux base",
  //     prov_suggestedminimumsellingprice: 6000
  //   },
  //   {
  //     prov_uuid: "115",
  //     prov_name: "Yerbero y azucarero",
  //     prov_suggestedminimumsellingprice: 8000
  //   },
  //   {
  //     prov_uuid: "116",
  //     prov_name: "Llavero alpaca",
  //     prov_suggestedminimumsellingprice: 10000
  //   },
  //   {
  //     prov_uuid: "117",
  //     prov_name: "Llamador vaca san antonio/colibri vitraux",
  //     prov_suggestedminimumsellingprice: 30000
  //   },
  //   {
  //     prov_uuid: "118",
  //     prov_name: "Pulsera de piedra lujan colores",
  //     prov_suggestedminimumsellingprice: 4000
  //   },
  //   {
  //     prov_uuid: "119",
  //     prov_name: "Cuneros negrito manuel",
  //     prov_suggestedminimumsellingprice: 5000
  //   },
  //   {
  //     prov_uuid: "120",
  //     prov_name: "Cadena gruesa con cruz de acero quirurgico",
  //     prov_suggestedminimumsellingprice: 30000
  //   },
  //   {
  //     prov_uuid: "121",
  //     prov_name: "Cadena gruesa con cruz de acero quirurgico dorada y plateada con strass",
  //     prov_suggestedminimumsellingprice: 30000
  //   }
  // ];

  constructor(
    private _http: HttpClient
  ) { }

  /**
     * Obtiene todas las variaciones de productos.
     * En una aplicación real, aquí usarías this.http.get<IProduct[]>('URL_DE_TU_API').
     * @returns Observable de un array de productos.
     */
  public getProductsVariations(cmp_uuid: string, pro_uuid: string, slug?: string): Observable<ProductVariationResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<ProductVariationResults>(`http://195.200.2.27:3002/api/products-variations/${cmp_uuid}`, { headers, params });
  }

  /**
     * Obtiene todas las variaciones de productos.
     * En una aplicación real, aquí usarías this.http.get<IProduct[]>('URL_DE_TU_API').
     * @returns Observable de un array de productos.
     */
  public getProductVariationById(cmp_uuid: string, pro_uuid: string, prov_uuid: string): Observable<ProductVariationResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');

    let params = new HttpParams();

    return this._http.get<ProductVariationResults>(`${environment.apiUrl}product-variation/${cmp_uuid}/${pro_uuid}/${prov_uuid}`, { headers, params });
  }
}
