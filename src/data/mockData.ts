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

// Reception Order interfaces
export interface ReceptionItem {
  productId: string;
  productSku: string;
  productName: string;
  productImage: string;
  expectedQuantity: number;
  receivedQuantity: number;
  locationCode: string;
  status: 'pending' | 'received' | 'partial' | 'not_found';
  hasDiscrepancy?: boolean;
  problemNotified?: boolean;
}

export interface ReceptionOrder {
  id: string;
  orderNumber: string;
  type: 'purchase' | 'return' | 'transfer';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  releaseStatus: 'released' | 'unreleased';
  supplier: {
    name: string;
    contact?: string;
  };
  items: ReceptionItem[];
  createdAt: string;
  completedAt?: string;
  receivedBy?: string;
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
// Formato: Fila-Columna-Nivel (ej: 05-B-03)
// Fila = número (01-32), Columna = letra (A-G), Nivel = número (01-05)
export const mockLocations: WarehouseLocation[] = [
  // Fila 05 - Alta rotación
  { id: '1', code: '05-B-03', zone: '05', aisle: 'B', rack: '03', level: '03', type: 'storage', maxUnits: 100, currentUtilization: 0.65, status: 'active' },
  { id: '2', code: '05-B-04', zone: '05', aisle: 'B', rack: '04', level: '04', type: 'storage', maxUnits: 100, currentUtilization: 0.72, status: 'active' },
  { id: '3', code: '08-D-01', zone: '08', aisle: 'D', rack: '01', level: '01', type: 'storage', maxUnits: 120, currentUtilization: 0.45, status: 'active' },
  { id: '4', code: '11-F-04', zone: '11', aisle: 'F', rack: '04', level: '04', type: 'storage', maxUnits: 120, currentUtilization: 0.15, status: 'active' },
  { id: '5', code: '17-E-01', zone: '17', aisle: 'E', rack: '01', level: '01', type: 'storage', maxUnits: 100, currentUtilization: 0.80, status: 'active' },
  { id: '6', code: '18-C-05', zone: '18', aisle: 'C', rack: '05', level: '05', type: 'storage', maxUnits: 100, currentUtilization: 0.10, status: 'active' },

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
// Ubicaciones en formato: Fila-Columna-Nivel (ej: 05-B-03)
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
        locationCode: '05-B-03',
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
        locationCode: '05-B-04',
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
      name: 'Taller de Ensamblaje - Thomas Lombeida',
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
        locationCode: '05-B-03',
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
        locationCode: '05-B-04',
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
      name: 'Taller de Ensamblaje - María Fernanda Ruiz',
    },
    items: [
      {
        productId: '1',
        productSku: 'RE-R250-H10313',
        productName: 'Direccional Delantera LH',
        productImage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100',
        requestedQuantity: 20,
        pickedQuantity: 0,
        locationCode: '05-B-03',
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
        locationCode: '05-B-04',
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
      name: 'Taller de Ensamblaje - Carlos Mendoza',
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

// Inventario mock por ubicación (simula lo almacenado en recepción)
export interface ShelfProduct {
  sku: string;
  name: string;
  image: string;
  availableQuantity: number;
}

// Inventario por ubicación con formato: Fila-Columna-Nivel (ej: 05-B-03)
// Niveles van de 1 (abajo) a 5 (arriba)
export const mockShelfInventory: Record<string, ShelfProduct[]> = {
  //Fila 01
  '01-A-01': [
    { sku: 'RE-R250-Q80001', name: 'Radiador Completo', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 14 },
  ],
  '01-A-02': [
    { sku: 'RE-R250-Q80002', name: 'Ventilador de Radiador', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 22 },
  ],
  '01-B-03': [
    { sku: 'RE-R250-Q80003', name: 'Termostato Motor', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 18 },

  ],
  '01-B-04': [
    { sku: 'RE-R250-Q80004', name: 'Sensor de Temperatura', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 30 },
  ],
  '01-D-01': [
    { sku: 'RE-R250-Q80005', name: 'Bomba de Agua', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 12 },
  ],
  '01-D-02': [
    { sku: 'RE-R250-Q80006', name: 'Horquilla Delantera', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 6 },

  ],
  '01-F-01': [
    { sku: 'RE-R250-Q80007', name: 'Retenes de Horquilla', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 45 },
  ],
  //Fila 02
  '02-A-05': [
    { sku: 'RE-R250-Q80007', name: 'Retenes de Horquilla', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 45 },
  ],
  '02-A-02': [
    { sku: 'RE-R250-Q80008', name: 'Aceite de Horquilla', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 50 },

  ],
  '02-C-01': [
    { sku: 'RE-R250-Q80009', name: 'Amortiguador Trasero', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 10 },
  ],
  '02-D-04': [
    { sku: 'RE-R250-Q80010', name: 'Link de Suspensión', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 16 },

  ],
  '02-D-02': [
    { sku: 'RE-R250-Q80011', name: 'Corona Trasera 42T', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 20 },
  ],
  '02-D-01': [
    { sku: 'RE-R250-Q80012', name: 'Piñón Delantero 14T', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 35 },
  ],
  '02-F-01': [
    { sku: 'RE-R250-Q80013', name: 'Tensor de Cadena', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 28 },
  ],
  '02-G-05': [
    { sku: 'RE-R250-Q80014', name: 'Guía de Cadena', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 19 },
  ],
  // Fila 03
  '03-A-02': [
    { sku: 'RE-R250-M50101', name: 'Filtro de Aceite Premium', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 85 },
  ],
  '03-C-04': [
    { sku: 'RE-R250-M50102', name: 'Filtro de Aire Deportivo', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 42 },
  ],
  '03-F-04': [
    { sku: 'RE-R250-Q80015', name: 'Protector de Cadena', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 11 },
  ],
  //Fila 04
  '04-A-02': [
    { sku: 'RE-R250-Q80016', name: 'Espejo Retrovisor Izquierdo', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 40 },
  ],
  '04-A-04': [
    { sku: 'RE-R250-Q80017', name: 'Espejo Retrovisor Derecho', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 40 },

  ],
  '04-B-02': [
    { sku: 'RE-R250-Q80018', name: 'Parabrisas Deportivo', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 7 },

  ],
  '04-B-03': [
    { sku: 'RE-R250-Q80019', name: 'Portaplaca Universal', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 26 },

  ],
  '04-E-01': [
    { sku: 'RE-R250-Q80020', name: 'Guardabarros Delantero', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 13 },
  ],
  // Fila 05
  '05-B-03': [
    { sku: 'RE-R250-H10313', name: 'Direccional Delantera LH', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100', availableQuantity: 50 },
  ],
  '05-B-04': [
    { sku: 'RE-R250-I10312', name: 'Direccional Delantera RH', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 30 },
  ],
  '05-D-02': [
    { sku: 'RE-R250-H10314', name: 'Direccional Trasera LH', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 25 },
  ],
  '05-D-03': [
    { sku: 'RE-R250-H10315', name: 'Direccional Trasera RH', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 25 },
  ],
  '05-F-01': [
    { sku: 'RE-R250-H10320', name: 'Faro Delantero LED', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 18 },
  ],
  //Fila 06
  '06-A-02': [
    { sku: 'RE-R250-Q80021', name: 'Guardabarros Trasero', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 13 },
  ],
  '06-A-04': [
    { sku: 'RE-R250-Q80022', name: 'Soporte de Motor', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 9 },

  ],
  '06-B-05': [
    { sku: 'RE-R250-Q80023', name: 'Protector de Motor', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 15 },

  ],
  '06-D-03': [
    { sku: 'RE-R250-Q80024', name: 'Slider de Motor', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 18 },

  ],
  '06-D-05': [
    { sku: 'RE-R250-Q80025', name: 'Soporte de Radiador', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 12 },
  ],
  '06-F-01': [
    { sku: 'RE-R250-Q80026', name: 'Interruptor de Freno', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 33 },

  ],
  '06-G-02': [
    { sku: 'RE-R250-Q80027', name: 'Interruptor de Embrague', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 27 },
  ],
  //Fila 07
  '07-C-04': [
    { sku: 'RE-R250-Q80028', name: 'Relay de Arranque', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 21 },
  ],
  '07-C-02': [
    { sku: 'RE-R250-Q80029', name: 'Motor de Arranque', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 8 },

  ],
  // Fila 08
  '08-D-01': [
    { sku: 'RE-R250-I10504', name: 'Comando Derecho Chief 4V Ninja 2.5/3.0', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 3 },
  ],
  '08-D-02': [
    { sku: 'RE-R250-I10505', name: 'Comando Izquierdo Chief 4V', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 5 },
  ],
  '08-E-03': [
    { sku: 'RE-R250-I10510', name: 'Manubrio Cromado', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 12 },
  ],
  //Fila 09
  '09-A-01': [
    { sku: 'RE-R250-I10510', name: 'Manubrio Cromado', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 12 },
  ],
  '09-A-03': [
    { sku: 'RE-R250-Q80030', name: 'Bendix de Arranque', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 17 },
  ],
  '09-A-05': [
   { sku: 'RE-R250-Q80031', name: 'Cable de Embrague', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 34 },
  ],
  '09-B-02': [
    { sku: 'RE-R250-Q80032', name: 'Cable de Acelerador', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 38 },
  ],
  '09-C-04': [
    { sku: 'RE-R250-Q80033', name: 'Cable de Freno Delantero', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 29 },
  ],
  '09-C-05': [
    { sku: 'RE-R250-Q80034', name: 'Cable de Freno Trasero', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 29 },
  ],
  '09-D-01': [
    { sku: 'RE-R250-Q80035', name: 'Soporte de Batería', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 14 },
  ],
  '09-D-02': [
    { sku: 'RE-R250-Q80036', name: 'Caja de Fusibles', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 23 },
  ],
  '09-D-04': [
    { sku: 'RE-R250-Q80037', name: 'Fusible 15A', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 100 },
  ],
  '09-E-01': [
    { sku: 'RE-R250-Q80038', name: 'Fusible 20A', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 100 },
  ],
  '09-F-02': [
    { sku: 'RE-R250-Q80039', name: 'Arnés Eléctrico Principal', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 6 },
  ],
  '09-F-05': [
    { sku: 'RE-R250-Q80040', name: 'Sensor de Velocidad', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 19 },
  ],
  '09-G-01': [
    { sku: 'RE-R250-Q80041', name: 'Tablero Digital', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 7 },
  ],
  // ============================================
  // FILA 10 - COMPLETAMENTE LLENA (35 ubicaciones)
  // Componentes de Motor y Sistema de Escape
  // ============================================
  // Columna A (Nivel 1-5)
  '10-A-01': [
    { sku: 'RE-R250-E30001', name: 'Carburador Completo 26mm', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 12 },
  ],
  '10-A-02': [
    { sku: 'RE-R250-E30002', name: 'Kit de Reparación Carburador', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 45 },
  ],
  '10-A-03': [
    { sku: 'RE-R250-E30003', name: 'Filtro de Gasolina Universal', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 120 },
  ],
  '10-A-04': [
    { sku: 'RE-R250-E30004', name: 'Bomba de Gasolina Eléctrica', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 18 },
  ],
  '10-A-05': [
    { sku: 'RE-R250-E30005', name: 'Tanque de Gasolina 15L', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 6 },
  ],
  // Columna B (Nivel 1-5)
  '10-B-01': [
    { sku: 'RE-R250-E30010', name: 'Culata Completa 250cc', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 8 },
  ],
  '10-B-02': [
    { sku: 'RE-R250-E30011', name: 'Válvula de Admisión', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 35 },
  ],
  '10-B-03': [
    { sku: 'RE-R250-E30012', name: 'Válvula de Escape', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 35 },
  ],
  '10-B-04': [
    { sku: 'RE-R250-E30013', name: 'Guías de Válvula Set', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 28 },
  ],
  '10-B-05': [
    { sku: 'RE-R250-E30014', name: 'Resortes de Válvula Kit', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 42 },
  ],
  // Columna C (Nivel 1-5) - CON MÚLTIPLES PRODUCTOS EN ALGUNAS UBICACIONES
  '10-C-01': [
    { sku: 'RE-R250-E30020', name: 'Pistón Completo STD', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 25 },
  ],
  '10-C-02': [
    // UBICACIÓN CON 5 PRODUCTOS DIFERENTES
    { sku: 'RE-R250-E30021', name: 'Anillos de Pistón STD', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 50 },
    { sku: 'RE-R250-E30022', name: 'Anillos de Pistón +0.25', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 30 },
    { sku: 'RE-R250-E30023', name: 'Anillos de Pistón +0.50', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 28 },
    { sku: 'RE-R250-E30024', name: 'Anillos de Pistón +0.75', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 22 },
    { sku: 'RE-R250-E30025', name: 'Anillos de Pistón +1.00', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 18 },
  ],
  '10-C-03': [
    { sku: 'RE-R250-E30026', name: 'Biela Completa', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 15 },
  ],
  '10-C-04': [
    { sku: 'RE-R250-E30027', name: 'Rodamiento de Biela', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 40 },
  ],
  '10-C-05': [
    { sku: 'RE-R250-E30028', name: 'Pasador de Pistón', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 55 },
  ],
  // Columna D (Nivel 1-5)
  '10-D-01': [
    { sku: 'RE-R250-E30030', name: 'Cigüeñal Completo', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 5 },
  ],
  '10-D-02': [
    { sku: 'RE-R250-E30031', name: 'Rodamiento de Cigüeñal LH', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 30 },
  ],
  '10-D-03': [
    { sku: 'RE-R250-E30032', name: 'Rodamiento de Cigüeñal RH', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 30 },
  ],
  '10-D-04': [
    { sku: 'RE-R250-E30033', name: 'Retenedor de Aceite Motor LH', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 60 },
  ],
  '10-D-05': [
    { sku: 'RE-R250-E30034', name: 'Retenedor de Aceite Motor RH', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 60 },
  ],
  // Columna E (Nivel 1-5)
  '10-E-01': [
    { sku: 'RE-R250-E30040', name: 'Árbol de Levas', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 10 },
  ],
  '10-E-02': [
    { sku: 'RE-R250-E30041', name: 'Cadena de Distribución', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 35 },
  ],
  '10-E-03': [
    { sku: 'RE-R250-E30042', name: 'Tensor de Cadena Automático', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 25 },
  ],
  '10-E-04': [
    // UBICACIÓN CON 5 PRODUCTOS DIFERENTES
    { sku: 'RE-R250-E30043', name: 'Junta de Culata Original', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 40 },
    { sku: 'RE-R250-E30044', name: 'Junta de Base Cilindro', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 45 },
    { sku: 'RE-R250-E30045', name: 'Junta de Carter', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 35 },
    { sku: 'RE-R250-E30046', name: 'Junta de Tapa de Válvulas', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 50 },
    { sku: 'RE-R250-E30047', name: 'Kit Completo de Juntas Motor', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 20 },
  ],
  '10-E-05': [
    { sku: 'RE-R250-E30048', name: 'Empaque de Escape', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 80 },
  ],
  // Columna F (Nivel 1-5)
  '10-F-01': [
    { sku: 'RE-R250-E30050', name: 'Silenciador de Escape Completo', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 8 },
  ],
  '10-F-02': [
    { sku: 'RE-R250-E30051', name: 'Tubo de Escape Header', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 12 },
  ],
  '10-F-03': [
    { sku: 'RE-R250-E30052', name: 'Abrazadera de Escape', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 65 },
  ],
  '10-F-04': [
    { sku: 'RE-R250-E30053', name: 'Protector Térmico de Escape', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 22 },
  ],
  '10-F-05': [
    { sku: 'RE-R250-E30054', name: 'Soporte de Escape', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 30 },
  ],
  // Columna G (Nivel 1-5)
  '10-G-01': [
    { sku: 'RE-R250-E30060', name: 'Bujía NGK CR8E', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 150 },
  ],
  '10-G-02': [
    { sku: 'RE-R250-E30061', name: 'Bobina de Encendido', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 25 },
  ],
  '10-G-03': [
    { sku: 'RE-R250-E30062', name: 'CDI Electrónico', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 15 },
  ],
  '10-G-04': [
    { sku: 'RE-R250-E30063', name: 'Regulador de Voltaje', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 20 },
  ],
  '10-G-05': [
    { sku: 'RE-R250-E30064', name: 'Estator Magneto', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 10 },
  ],
  // ============================================

  // Fila 11
  '11-F-04': [
    { sku: 'RE-R250-I0709', name: 'Estribo de Conductor C/Pedales Izq./Der.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 28 },
  ],
  '11-F-05': [
    { sku: 'RE-R250-I0710', name: 'Estribo Pasajero Set', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 20 },
  ],
  '11-G-02': [
    { sku: 'RE-R250-I0715', name: 'Pedal de Freno Trasero', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 35 },
  ],
  '11-G-03': [
    { sku: 'RE-R250-I0720', name: 'Pedal de Freno Delantero', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 35 },
  ],
  '11-A-01': [
    { sku: 'RE-R250-Q80042', name: 'Soporte de Tablero', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 12 },
  ],
  '11-B-03': [
    { sku: 'RE-R250-Q80043', name: 'Switch de Encendido', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 16 },

  ],
  '11-C-03': [
    { sku: 'RE-R250-Q80044', name: 'Tapa de Tanque', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 18 },
  ],
  '11-D-03': [
    { sku: 'RE-R250-Q80045', name: 'Llave de Gasolina', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 21 },
  ],
  // Fila 12
  '12-B-03': [
    { sku: 'RE-R250-K20415', name: 'Disco de Freno Ventilado', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 22 },
  ],
  '12-B-04': [
    { sku: 'RE-R250-K20416', name: 'Pastillas de Freno Delanteras', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 60 },
  ],
  '12-C-01': [
    { sku: 'RE-R250-K20420', name: 'Pastillas de Freno Traseras', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 55 },
  ],
  '12-C-02': [
    { sku: 'RE-R250-Q80046', name: 'Soporte de Farola', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 9 },
  ],
  '12-D-01': [
    { sku: 'RE-R250-Q80047', name: 'Base de Asiento', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 8 },
  ],
  '12-E-01': [
    { sku: 'RE-R250-Q80048', name: 'Chasis Auxiliar', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 4 },
  ],
  '12-F-01': [
    { sku: 'RE-R250-Q80049', name: 'Soporte de Estribo', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 15 },
  ],
  '12-G-01': [
    { sku: 'RE-R250-Q80050', name: 'Pedal de Cambios', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 24 },
  ],
  // Fila 14
  '14-C-02': [
    { sku: 'RE-R250-L40820', name: 'Aceite Motor 10W-40 Sintético', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 120 },
  ],
  '14-C-03': [
    { sku: 'RE-R250-L40821', name: 'Aceite Motor 20W-50 Mineral', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 95 },
  ],
  '14-D-01': [
    { sku: 'RE-R250-L40830', name: 'Líquido de Frenos DOT4', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 80 },
  ],
  // Fila 17
  '17-E-01': [
    { sku: 'RE-RNJ-250302', name: 'Cañería del Enfriador de Aceite Set 2pcs', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 67 },
  ],
  '17-E-02': [
    { sku: 'RE-RNJ-250303', name: 'Manguera Radiador Superior', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 40 },
  ],
  // Fila 18
  '18-C-05': [
    { sku: 'RE-RNJ-110237', name: 'Piñón de Velocímetro Chief II', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 15 },
  ],
  '18-A-03': [
    { sku: 'RE-RNJ-110240', name: 'Cable de Velocímetro', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 30 },
  ],
  // Fila 23
  '23-A-01': [
    { sku: 'RE-RNJ-330501', name: 'Batería 12V 7Ah', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 35 },
  ],
  '23-A-02': [
    { sku: 'RE-R200-142125', name: 'Asiento Delantero & Posterior Set Chief II', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 8 },
  ],
  '23-B-04': [
    { sku: 'RE-RNJ-330510', name: 'Batería 12V 12Ah Reforzada', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 20 },
  ],
  // Fila 27
  '27-G-03': [
    { sku: 'RE-R250-N60101', name: 'Kit de Cadena y Piñones', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 15 },
  ],
  '27-G-04': [
    { sku: 'RE-R250-N60102', name: 'Cadena de Transmisión 428H', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 25 },
  ],
  // Fila 30
  '30-A-01': [
    { sku: 'RE-R250-P70201', name: 'Llanta Delantera 275-18', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 8 },
  ],
  '30-A-02': [
    { sku: 'RE-R250-P70202', name: 'Llanta Trasera 300-18', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 10 },
  ],
  '30-B-03': [
    { sku: 'RE-R250-P70210', name: 'Cámara de Aire 275-18', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 45 },
  ],
  '30-B-04': [
    { sku: 'RE-R250-P70211', name: 'Cámara de Aire 300-18', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 40 },
  ],
};

// Mapa de SKU a ubicación para búsqueda rápida
export const skuToLocation: Record<string, string> = Object.entries(mockShelfInventory).reduce(
  (acc, [location, products]) => {
    products.forEach(product => {
      acc[product.sku] = location;
    });
    return acc;
  },
  {} as Record<string, string>
);

// Helper para obtener ubicación de un producto por SKU
export const getLocationBySku = (sku: string): string => {
  return skuToLocation[sku] || '';
};

// Helper para obtener stock disponible de un producto por SKU
export const getAvailableStockBySku = (sku: string): number => {
  const location = skuToLocation[sku];
  if (!location) return 0;
  const products = mockShelfInventory[location] || [];
  const product = products.find(p => p.sku === sku);
  return product?.availableQuantity ?? 0;
};

// Mapa de reemplazos de productos (simulación de algoritmo de concordancia)
// Cada producto tiene un reemplazo "similar" - en producción sería un algoritmo real
export interface ProductReplacement {
  sku: string;
  name: string;
  location: string;
}

export const productReplacements: Record<string, ProductReplacement> = {
  'RE-R250-H10313': { sku: 'RE-R250-I10312', name: 'Direccional Delantera RH', location: '05-B-04' },
  'RE-R250-I10312': { sku: 'RE-R250-H10313', name: 'Direccional Delantera LH', location: '05-B-03' },
  'RE-R250-I10504': { sku: 'RE-R250-I0709', name: 'Estribo de Conductor C/Pedales', location: '11-F-04' },
  'RE-R250-I0709': { sku: 'RE-R250-I10504', name: 'Comando Derecho Chief 4V', location: '08-D-01' },
  'RE-RNJ-250302': { sku: 'RE-R250-L40820', name: 'Aceite Motor 10W-40 Sintético', location: '14-C-02' },
  'RE-RNJ-110237': { sku: 'RE-R250-K20415', name: 'Disco de Freno Ventilado', location: '12-B-03' },
  'RE-R200-142125': { sku: 'RE-RNJ-330501', name: 'Batería 12V 7Ah', location: '23-A-01' },
  'RE-R250-K20415': { sku: 'RE-RNJ-110237', name: 'Piñón de Velocímetro Chief II', location: '18-C-06' },
  'RE-RNJ-330501': { sku: 'RE-R200-142125', name: 'Asiento Delantero & Posterior Set', location: '23-A-01' },
  'RE-R250-L40820': { sku: 'RE-RNJ-250302', name: 'Cañería del Enfriador de Aceite', location: '17-E-01' },
};

// Helper para obtener el producto que este SKU puede reemplazar
export const getReplacementFor = (sku: string): ProductReplacement | null => {
  return productReplacements[sku] || null;
};

// Helper para obtener el producto que puede reemplazar a este SKU
export const getReplacedBy = (sku: string): ProductReplacement | null => {
  for (const [replacerSku, replacement] of Object.entries(productReplacements)) {
    if (replacement.sku === sku) {
      const product = mockProducts.find(p => p.sku === replacerSku);
      if (product) {
        return {
          sku: replacerSku,
          name: product.name,
          location: getLocationBySku(replacerSku),
        };
      }
    }
  }
  return null;
};

// Mock Reception Orders
export const mockReceptionOrders: ReceptionOrder[] = [
  // Recepciones Liberadas (completadas)
  {
    id: 'r1',
    orderNumber: 'OC-2025-001230',
    type: 'purchase',
    priority: 'normal',
    status: 'completed',
    releaseStatus: 'released',
    supplier: {
      name: 'AutoParts Supply Co.',
      contact: 'ventas@autoparts.com',
    },
    items: [
      {
        productId: '1',
        productSku: 'RE-R250-H10313',
        productName: 'Direccional Delantera LH',
        productImage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100',
        expectedQuantity: 25,
        receivedQuantity: 25,
        locationCode: '05-B-03',
        status: 'received',
      },
      {
        productId: '2',
        productSku: 'RE-R250-I10312',
        productName: 'Direccional Delantera RH',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        expectedQuantity: 25,
        receivedQuantity: 25,
        locationCode: '05-B-04',
        status: 'received',
      },
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    receivedBy: 'Juan Pérez',
  },
  {
    id: 'r2',
    orderNumber: 'OC-2025-001228',
    type: 'purchase',
    priority: 'high',
    status: 'completed',
    releaseStatus: 'released',
    supplier: {
      name: 'Mega Repuestos S.A.',
      contact: 'pedidos@megarepuestos.ec',
    },
    items: [
      {
        productId: '9',
        productSku: 'RE-RNJ-330501',
        productName: 'Batería 12V 7Ah',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        expectedQuantity: 20,
        receivedQuantity: 18,
        locationCode: '23-A-01',
        status: 'partial',
        hasDiscrepancy: true,
        problemNotified: true,
      },
      {
        productId: '10',
        productSku: 'RE-R250-L40820',
        productName: 'Aceite Motor 10W-40 Sintético',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        expectedQuantity: 50,
        receivedQuantity: 50,
        locationCode: '14-C-02',
        status: 'received',
      },
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    receivedBy: 'María García',
  },
  {
    id: 'r3',
    orderNumber: 'OC-2025-001225',
    type: 'return',
    priority: 'low',
    status: 'completed',
    releaseStatus: 'released',
    supplier: {
      name: 'Tienda Centro - Local 5',
      contact: 'devolucion@tiendacentro.com',
    },
    items: [
      {
        productId: '8',
        productSku: 'RE-R250-K20415',
        productName: 'Disco de Freno Ventilado',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        expectedQuantity: 3,
        receivedQuantity: 3,
        locationCode: '12-B-03',
        status: 'received',
      },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    receivedBy: 'Carlos López',
  },
  // Recepciones No Liberadas (pendientes)
  {
    id: 'r4',
    orderNumber: 'OC-2025-001234',
    type: 'purchase',
    priority: 'urgent',
    status: 'pending',
    releaseStatus: 'unreleased',
    supplier: {
      name: 'AutoParts Supply Co.',
      contact: 'ventas@autoparts.com',
    },
    items: [
      {
        productId: '3',
        productSku: 'RE-R250-I10504',
        productName: 'Comando Derecho Chief 4V Ninja 2.5/3.0',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        expectedQuantity: 15,
        receivedQuantity: 0,
        locationCode: '08-D-01',
        status: 'pending',
      },
      {
        productId: '4',
        productSku: 'RE-R250-I0709',
        productName: 'Estribo de Conductor C/Pedales Izq./Der.',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        expectedQuantity: 10,
        receivedQuantity: 0,
        locationCode: '11-F-04',
        status: 'pending',
      },
      {
        productId: '5',
        productSku: 'RE-RNJ-250302',
        productName: 'Cañería del Enfriador de Aceite Set 2pcs',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        expectedQuantity: 8,
        receivedQuantity: 0,
        locationCode: '17-E-01',
        status: 'pending',
      },
    ],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r5',
    orderNumber: 'OC-2025-001235',
    type: 'purchase',
    priority: 'high',
    status: 'pending',
    releaseStatus: 'unreleased',
    supplier: {
      name: 'Distribuidora Nacional',
      contact: 'compras@distnacional.ec',
    },
    items: [
      {
        productId: '6',
        productSku: 'RE-RNJ-110237',
        productName: 'Piñón de Velocímetro Chief II',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        expectedQuantity: 12,
        receivedQuantity: 0,
        locationCode: '18-C-06',
        status: 'pending',
      },
      {
        productId: '7',
        productSku: 'RE-R200-142125',
        productName: 'Asiento Delantero & Posterior Set Chief II',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        expectedQuantity: 5,
        receivedQuantity: 0,
        locationCode: '23-A-02',
        status: 'pending',
      },
    ],
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'r6',
    orderNumber: 'OC-2025-001236',
    type: 'transfer',
    priority: 'normal',
    status: 'pending',
    releaseStatus: 'unreleased',
    supplier: {
      name: 'Bodega Sur - Transferencia',
    },
    items: [
      {
        productId: '1',
        productSku: 'RE-R250-H10313',
        productName: 'Direccional Delantera LH',
        productImage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100',
        expectedQuantity: 30,
        receivedQuantity: 0,
        locationCode: '05-B-03',
        status: 'pending',
      },
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];
