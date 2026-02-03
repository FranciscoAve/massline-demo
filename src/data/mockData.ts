/**
 * Comprehensive Mock Data for SmartStock System
 * Includes: Products, Locations, Orders, Inventory, Transactions
 */

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: {
    id: string;
    name: string;
    path: string[];
  };
  thumbnailImage: string;
  totalStock: number;
  locationCount: number;
  status: 'ok' | 'low' | 'critical';
  reorderPoint: number;
  safetyStock: number;
}

export interface WarehouseLocation {
  id: string;
  code: string;
  zone: string;
  aisle: string;
  rack: string;
  level: string;
  type: 'storage' | 'receiving' | 'dispatch' | 'staging';
  maxUnits: number;
  currentUtilization: number;
  status: 'active' | 'maintenance' | 'blocked';
}

export interface PickingItem {
  productId: string;
  productSku: string;
  productName: string;
  productImage: string;
  requestedQuantity: number;
  pickedQuantity: number;
  locationCode: string;
  distance?: number;
  status: 'pending' | 'current' | 'picked' | 'partial' | 'not_found';
}

export interface PickingOrder {
  id: string;
  orderNumber: string;
  type: 'dispatch' | 'transfer' | 'internal_request';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'pending' | 'assigned' | 'in_progress' | 'packed' | 'dispatched';
  releaseStatus: 'released' | 'unreleased' | 'internal';
  destination: {
    name: string;
    address?: string;
  };
  items: PickingItem[];
  createdAt: string;
  assignedTo?: string;
  dueAt: string;
}

// Mock Products
// Formato de código: RE-R[serie]-[código] (basado en catálogo real)
export const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'RE-R250-H10313',
    name: 'Direccional Delantera LH',
    description: 'Direccional delantera izquierda para motocicletas',
    category: {
      id: 'cat-1',
      name: 'Iluminación',
      path: ['Repuestos', 'Eléctrico', 'Iluminación'],
    },
    thumbnailImage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100',
    totalStock: 45,
    locationCount: 3,
    status: 'ok',
    reorderPoint: 20,
    safetyStock: 10,
  },
  {
    id: '2',
    sku: 'RE-R250-I10312',
    name: 'Direccional Delantera RH',
    description: 'Direccional delantera derecha para motocicletas',
    category: {
      id: 'cat-1',
      name: 'Iluminación',
      path: ['Repuestos', 'Eléctrico', 'Iluminación'],
    },
    thumbnailImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
    totalStock: 12,
    locationCount: 2,
    status: 'low',
    reorderPoint: 15,
    safetyStock: 8,
  },
  {
    id: '3',
    sku: 'RE-R250-I10504',
    name: 'Comando Derecho Chief 4V Ninja 2.5/3.0',
    description: 'Comando derecho para sistema de control',
    category: {
      id: 'cat-3',
      name: 'Controles',
      path: ['Repuestos', 'Manubrio', 'Controles'],
    },
    thumbnailImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
    totalStock: 3,
    locationCount: 1,
    status: 'critical',
    reorderPoint: 10,
    safetyStock: 5,
  },
  {
    id: '4',
    sku: 'RE-R250-I0709',
    name: 'Estribo de Conductor C/Pedales Izq./Der.',
    description: 'Estribos con pedales para conductor',
    category: {
      id: 'cat-4',
      name: 'Estribos',
      path: ['Repuestos', 'Chasis', 'Estribos'],
    },
    thumbnailImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
    totalStock: 28,
    locationCount: 2,
    status: 'ok',
    reorderPoint: 12,
    safetyStock: 6,
  },
  {
    id: '5',
    sku: 'RE-RNJ-250302',
    name: 'Cañería del Enfriador de Aceite Set 2pcs',
    description: 'Set de cañerías para sistema de enfriamiento',
    category: {
      id: 'cat-5',
      name: 'Motor',
      path: ['Repuestos', 'Motor', 'Enfriamiento'],
    },
    thumbnailImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
    totalStock: 67,
    locationCount: 4,
    status: 'ok',
    reorderPoint: 25,
    safetyStock: 15,
  },
  {
    id: '6',
    sku: 'RE-RNJ-110237',
    name: 'Piñón de Velocímetro Chief II',
    description: 'Piñón para sistema de velocímetro',
    category: {
      id: 'cat-6',
      name: 'Transmisión',
      path: ['Repuestos', 'Transmisión', 'Piñones'],
    },
    thumbnailImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
    totalStock: 15,
    locationCount: 2,
    status: 'ok',
    reorderPoint: 8,
    safetyStock: 4,
  },
  {
    id: '7',
    sku: 'RE-R200-142125',
    name: 'Asiento Delantero & Posterior Set Chief II',
    description: 'Set completo de asientos',
    category: {
      id: 'cat-7',
      name: 'Asientos',
      path: ['Repuestos', 'Carrocería', 'Asientos'],
    },
    thumbnailImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
    totalStock: 8,
    locationCount: 1,
    status: 'low',
    reorderPoint: 10,
    safetyStock: 5,
  },
  {
    id: '8',
    sku: 'RE-R250-K20415',
    name: 'Disco de Freno Ventilado',
    description: 'Disco de freno con ventilación interna',
    category: {
      id: 'cat-2',
      name: 'Frenos',
      path: ['Repuestos', 'Sistema de Frenos', 'Discos'],
    },
    thumbnailImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
    totalStock: 22,
    locationCount: 2,
    status: 'ok',
    reorderPoint: 10,
    safetyStock: 5,
  },
  {
    id: '9',
    sku: 'RE-RNJ-330501',
    name: 'Batería 12V 7Ah',
    description: 'Batería de gel libre de mantenimiento',
    category: {
      id: 'cat-8',
      name: 'Baterías',
      path: ['Repuestos', 'Sistema Eléctrico', 'Baterías'],
    },
    thumbnailImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
    totalStock: 35,
    locationCount: 3,
    status: 'ok',
    reorderPoint: 15,
    safetyStock: 8,
  },
  {
    id: '10',
    sku: 'RE-R250-L40820',
    name: 'Aceite Motor 10W-40 Sintético',
    description: 'Aceite sintético para motores 4 tiempos',
    category: {
      id: 'cat-9',
      name: 'Lubricantes',
      path: ['Consumibles', 'Lubricantes', 'Aceites Motor'],
    },
    thumbnailImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
    totalStock: 120,
    locationCount: 5,
    status: 'ok',
    reorderPoint: 50,
    safetyStock: 30,
  },
];

// Mock Locations
// Formato: Fila-Columna-Nivel (ej: 05-B-00)
// Fila = número (01-99), Columna = letra (A-Z), Nivel = número (00-99)
export const mockLocations: WarehouseLocation[] = [
  // Fila 05 - Alta rotación
  { id: '1', code: '05-B-00', zone: '05', aisle: 'B', rack: '00', level: '00', type: 'storage', maxUnits: 100, currentUtilization: 0.65, status: 'active' },
  { id: '2', code: '05-B-08', zone: '05', aisle: 'B', rack: '08', level: '08', type: 'storage', maxUnits: 100, currentUtilization: 0.72, status: 'active' },
  { id: '3', code: '08-D-01', zone: '08', aisle: 'D', rack: '01', level: '01', type: 'storage', maxUnits: 120, currentUtilization: 0.45, status: 'active' },
  { id: '4', code: '11-F-04', zone: '11', aisle: 'F', rack: '04', level: '04', type: 'storage', maxUnits: 120, currentUtilization: 0.15, status: 'active' },
  { id: '5', code: '17-E-01', zone: '17', aisle: 'E', rack: '01', level: '01', type: 'storage', maxUnits: 100, currentUtilization: 0.80, status: 'active' },
  { id: '6', code: '18-C-06', zone: '18', aisle: 'C', rack: '06', level: '06', type: 'storage', maxUnits: 100, currentUtilization: 0.10, status: 'active' },

  // Fila 23 - Alta rotación
  { id: '7', code: '23-A-01', zone: '23', aisle: 'A', rack: '01', level: '01', type: 'storage', maxUnits: 150, currentUtilization: 0.55, status: 'active' },
  { id: '8', code: '23-A-02', zone: '23', aisle: 'A', rack: '02', level: '02', type: 'storage', maxUnits: 150, currentUtilization: 0.40, status: 'active' },
  { id: '9', code: '12-B-03', zone: '12', aisle: 'B', rack: '03', level: '03', type: 'storage', maxUnits: 150, currentUtilization: 0.68, status: 'active' },
  { id: '10', code: '14-C-02', zone: '14', aisle: 'C', rack: '02', level: '02', type: 'storage', maxUnits: 130, currentUtilization: 0.45, status: 'active' },

  // Filas adicionales
  { id: '11', code: '20-A-01', zone: '20', aisle: 'A', rack: '01', level: '01', type: 'storage', maxUnits: 200, currentUtilization: 0.35, status: 'active' },
  { id: '12', code: '20-A-03', zone: '20', aisle: 'A', rack: '03', level: '03', type: 'storage', maxUnits: 180, currentUtilization: 0.22, status: 'active' },
  { id: '13', code: '25-D-03', zone: '25', aisle: 'D', rack: '03', level: '03', type: 'storage', maxUnits: 180, currentUtilization: 0.18, status: 'active' },

  // Más ubicaciones
  { id: '14', code: '30-A-01', zone: '30', aisle: 'A', rack: '01', level: '01', type: 'storage', maxUnits: 100, currentUtilization: 0.50, status: 'active' },
  { id: '15', code: '30-A-02', zone: '30', aisle: 'A', rack: '02', level: '02', type: 'storage', maxUnits: 100, currentUtilization: 0.60, status: 'active' },
  { id: '16', code: '30-B-01', zone: '30', aisle: 'B', rack: '01', level: '01', type: 'storage', maxUnits: 100, currentUtilization: 0.45, status: 'active' },

  // Baja rotación
  { id: '17', code: '35-A-01', zone: '35', aisle: 'A', rack: '01', level: '01', type: 'storage', maxUnits: 200, currentUtilization: 0.30, status: 'active' },
  { id: '18', code: '35-C-04', zone: '35', aisle: 'C', rack: '04', level: '04', type: 'storage', maxUnits: 180, currentUtilization: 0.25, status: 'active' },

  // Áreas de recepción y despacho
  { id: '19', code: 'RCV-01', zone: 'R', aisle: '00', rack: 'E0', level: 'N0', type: 'receiving', maxUnits: 500, currentUtilization: 0.12, status: 'active' },
  { id: '20', code: 'RCV-02', zone: 'R', aisle: '00', rack: 'E0', level: 'N0', type: 'receiving', maxUnits: 500, currentUtilization: 0.08, status: 'active' },
  { id: '21', code: 'DSP-01', zone: 'D', aisle: '00', rack: 'E0', level: 'N0', type: 'dispatch', maxUnits: 300, currentUtilization: 0.45, status: 'active' },
  { id: '22', code: 'DSP-02', zone: 'D', aisle: '00', rack: 'E0', level: 'N0', type: 'dispatch', maxUnits: 300, currentUtilization: 0.32, status: 'active' },
  { id: '23', code: 'STG-01', zone: 'S', aisle: '00', rack: 'E0', level: 'N0', type: 'staging', maxUnits: 200, currentUtilization: 0.25, status: 'active' },
];

// Mock Picking Orders
// Ubicaciones en formato: Fila-Columna-Nivel (ej: 05-B-00)
export const mockOrders: PickingOrder[] = [
  {
    id: '1',
    orderNumber: 'DP-2025-0145',
    type: 'dispatch',
    priority: 'urgent',
    status: 'pending',
    releaseStatus: 'unreleased',
    destination: {
      name: 'Tienda Centro - Local 5',
      address: 'Av. Principal #123, Guayaquil',
    },
    items: [
      {
        productId: '1',
        productSku: 'RE-R250-H10313',
        productName: 'Direccional Delantera LH',
        productImage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100',
        requestedQuantity: 10,
        pickedQuantity: 0,
        locationCode: '05-B-00',
        distance: 15,
        status: 'pending',
      },
      {
        productId: '2',
        productSku: 'RE-R250-I10312',
        productName: 'Direccional Delantera RH',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 4,
        pickedQuantity: 0,
        locationCode: '05-B-08',
        distance: 22,
        status: 'pending',
      },
      {
        productId: '4',
        productSku: 'RE-R250-I0709',
        productName: 'Estribo de Conductor C/Pedales Izq./Der.',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 2,
        pickedQuantity: 0,
        locationCode: '11-F-04',
        distance: 8,
        status: 'pending',
      },
      {
        productId: '3',
        productSku: 'RE-R250-I10504',
        productName: 'Comando Derecho Chief 4V Ninja 2.5/3.0',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 8,
        pickedQuantity: 0,
        locationCode: '08-D-01',
        distance: 2,
        status: 'pending',
      },
      {
        productId: '9',
        productSku: 'RE-RNJ-330501',
        productName: 'Batería 12V 7Ah',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 3,
        pickedQuantity: 0,
        locationCode: '23-A-01',
        distance: 18,
        status: 'pending',
      },
    ],
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    dueAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    orderNumber: 'DP-2025-0146',
    type: 'dispatch',
    priority: 'normal',
    status: 'dispatched',
    releaseStatus: 'released',
    destination: {
      name: 'Mantenimiento - Taller Norte',
      address: 'Km 12.5 Vía a Daule',
    },
    items: [
      {
        productId: '5',
        productSku: 'RE-RNJ-250302',
        productName: 'Cañería del Enfriador de Aceite Set 2pcs',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 5,
        pickedQuantity: 5,
        locationCode: '17-E-01',
        distance: 12,
        status: 'picked',
      },
      {
        productId: '10',
        productSku: 'RE-R250-L40820',
        productName: 'Aceite Motor 10W-40 Sintético',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 12,
        pickedQuantity: 12,
        locationCode: '14-C-02',
        distance: 25,
        status: 'picked',
      },
      {
        productId: '7',
        productSku: 'RE-R200-142125',
        productName: 'Asiento Delantero & Posterior Set Chief II',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 2,
        pickedQuantity: 2,
        locationCode: '23-A-01',
        distance: 20,
        status: 'picked',
      },
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Hace 2 días
    dueAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    orderNumber: 'INT-2025-0023',
    type: 'internal_request',
    priority: 'high',
    status: 'pending',
    releaseStatus: 'internal',
    destination: {
      name: 'Taller de Ensamblaje - Línea 1',
    },
    items: [
      {
        productId: '6',
        productSku: 'RE-RNJ-110237',
        productName: 'Piñón de Velocímetro Chief II',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 4,
        pickedQuantity: 0,
        locationCode: '18-C-06',
        distance: 35,
        status: 'pending',
      },
      {
        productId: '8',
        productSku: 'RE-R250-K20415',
        productName: 'Disco de Freno Ventilado',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 6,
        pickedQuantity: 0,
        locationCode: '12-B-03',
        distance: 22,
        status: 'pending',
      },
    ],
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    dueAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    orderNumber: 'DP-2025-0148',
    type: 'dispatch',
    priority: 'low',
    status: 'dispatched',
    releaseStatus: 'released',
    destination: {
      name: 'Tienda Sur - Local 8',
      address: 'Av. del Sur #456',
    },
    items: [
      {
        productId: '1',
        productSku: 'RE-R250-H10313',
        productName: 'Direccional Delantera LH',
        productImage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100',
        requestedQuantity: 15,
        pickedQuantity: 15,
        locationCode: '05-B-00',
        distance: 15,
        status: 'picked',
      },
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Hace 3 días
    dueAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    orderNumber: 'DP-2025-0149',
    type: 'dispatch',
    priority: 'urgent',
    status: 'pending',
    releaseStatus: 'unreleased',
    destination: {
      name: 'Cliente VIP - Empresa ABC',
      address: 'Cdla. Kennedy, Guayaquil',
    },
    items: [
      {
        productId: '9',
        productSku: 'RE-RNJ-330501',
        productName: 'Batería 12V 7Ah',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 6,
        pickedQuantity: 0,
        locationCode: '23-A-01',
        distance: 18,
        status: 'pending',
      },
      {
        productId: '2',
        productSku: 'RE-R250-I10312',
        productName: 'Direccional Delantera RH',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 8,
        pickedQuantity: 0,
        locationCode: '05-B-08',
        distance: 22,
        status: 'pending',
      },
    ],
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    dueAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
  },
  // Órdenes internas adicionales para taller de ensamblaje
  {
    id: '6',
    orderNumber: 'INT-2025-0024',
    type: 'internal_request',
    priority: 'normal',
    status: 'pending',
    releaseStatus: 'internal',
    destination: {
      name: 'Taller de Ensamblaje - Línea 2',
    },
    items: [
      {
        productId: '1',
        productSku: 'RE-R250-H10313',
        productName: 'Direccional Delantera LH',
        productImage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100',
        requestedQuantity: 20,
        pickedQuantity: 0,
        locationCode: '05-B-00',
        distance: 15,
        status: 'pending',
      },
      {
        productId: '2',
        productSku: 'RE-R250-I10312',
        productName: 'Direccional Delantera RH',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 20,
        pickedQuantity: 0,
        locationCode: '05-B-08',
        distance: 22,
        status: 'pending',
      },
    ],
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    dueAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    orderNumber: 'INT-2025-0025',
    type: 'internal_request',
    priority: 'urgent',
    status: 'pending',
    releaseStatus: 'internal',
    destination: {
      name: 'Taller de Ensamblaje - Línea 3',
    },
    items: [
      {
        productId: '9',
        productSku: 'RE-RNJ-330501',
        productName: 'Batería 12V 7Ah',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 15,
        pickedQuantity: 0,
        locationCode: '23-A-01',
        distance: 18,
        status: 'pending',
      },
    ],
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    dueAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
  },
  // Orden liberada adicional (completada)
  {
    id: '8',
    orderNumber: 'DP-2025-0150',
    type: 'dispatch',
    priority: 'high',
    status: 'dispatched',
    releaseStatus: 'released',
    destination: {
      name: 'Distribuidora Central',
      address: 'Av. de las Américas #789, Guayaquil',
    },
    items: [
      {
        productId: '5',
        productSku: 'RE-RNJ-250302',
        productName: 'Cañería del Enfriador de Aceite Set 2pcs',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 10,
        pickedQuantity: 10,
        locationCode: '17-E-01',
        distance: 12,
        status: 'picked',
      },
      {
        productId: '8',
        productSku: 'RE-R250-K20415',
        productName: 'Disco de Freno Ventilado',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 8,
        pickedQuantity: 8,
        locationCode: '12-B-03',
        distance: 22,
        status: 'picked',
      },
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Hace 5 días
    dueAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
