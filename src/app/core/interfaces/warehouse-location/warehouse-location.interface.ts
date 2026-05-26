export interface WarehouseLocationInterface {
  cmp_uuid: string;
  war_uuid: string;
  warl_uuid: string;
  warl_aisle?: string;      // Pasillo (ej: 'A', '02')
  warl_sector?: string;     // Sector (ej: 'Norte', 'Refrigerados')
  warl_rack?: string;       // Estantería / Rack (ej: 'EST-12')
  warl_shelf?: string;      // Estante / Altura (ej: 'Nivel 3')
  warl_bincode: string;    // Código Único de Ubicación (ej: A-01-Nivel3)
  warl_active: boolean;
  warl_createdat: Date;
  warl_updatedat: Date;
}
