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
export const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'REP-12345',
    name: 'Filtro de Aceite XYZ Premium',
    description: 'Filtro de aceite de alta eficiencia para motocicletas Yamaha FZ150',
    category: {
      id: 'cat-1',
      name: 'Filtros',
      path: ['Repuestos', 'Motor', 'Filtros'],
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
    sku: 'REP-98765',
    name: 'Pastilla de Freno Delantera',
    description: 'Pastillas de freno cerámicas para Honda CB125',
    category: {
      id: 'cat-2',
      name: 'Frenos',
      path: ['Repuestos', 'Sistema de Frenos', 'Pastillas'],
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
    sku: 'REP-55555',
    name: 'Bujía NGK Iridium',
    description: 'Bujía de iridio de larga duración',
    category: {
      id: 'cat-3',
      name: 'Encendido',
      path: ['Repuestos', 'Sistema Eléctrico', 'Encendido'],
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
    sku: 'REP-11111',
    name: 'Amortiguador Delantero',
    description: 'Amortiguador hidráulico ajustable',
    category: {
      id: 'cat-4',
      name: 'Suspensión',
      path: ['Repuestos', 'Suspensión', 'Amortiguadores'],
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
    sku: 'REP-22222',
    name: 'Cadena de Transmisión 520',
    description: 'Cadena reforzada con retenes de goma',
    category: {
      id: 'cat-5',
      name: 'Transmisión',
      path: ['Repuestos', 'Transmisión', 'Cadenas'],
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
    sku: 'REP-33333',
    name: 'Llanta Delantera 17"',
    description: 'Llanta tubeless para motocicletas deportivas',
    category: {
      id: 'cat-6',
      name: 'Llantas',
      path: ['Repuestos', 'Ruedas', 'Llantas'],
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
    sku: 'REP-44444',
    name: 'Kit de Embrague',
    description: 'Kit completo de discos de embrague',
    category: {
      id: 'cat-7',
      name: 'Embrague',
      path: ['Repuestos', 'Transmisión', 'Embrague'],
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
    sku: 'REP-66666',
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
    sku: 'REP-77777',
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
    sku: 'REP-88888',
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
// Formato: Z[01-32]-P[a-g]-E[1-9]-N[1-5]
// Z = Zona (1-32), P = Pasillo (a-g), E = Estante (1-9), N = Nivel (1-5)
export const mockLocations: WarehouseLocation[] = [
  // Zona 01 - Alta rotación (Clase A)
  { id: '1', code: 'Z01-Pa-E1-N1', zone: '01', aisle: 'a', rack: 'E1', level: 'N1', type: 'storage', maxUnits: 100, currentUtilization: 0.65, status: 'active' },
  { id: '2', code: 'Z01-Pa-E1-N2', zone: '01', aisle: 'a', rack: 'E1', level: 'N2', type: 'storage', maxUnits: 100, currentUtilization: 0.72, status: 'active' },
  { id: '3', code: 'Z01-Pa-E2-N1', zone: '01', aisle: 'a', rack: 'E2', level: 'N1', type: 'storage', maxUnits: 120, currentUtilization: 0.45, status: 'active' },
  { id: '4', code: 'Z01-Pa-E2-N2', zone: '01', aisle: 'a', rack: 'E2', level: 'N2', type: 'storage', maxUnits: 120, currentUtilization: 0.15, status: 'active' },
  { id: '5', code: 'Z01-Pb-E1-N1', zone: '01', aisle: 'b', rack: 'E1', level: 'N1', type: 'storage', maxUnits: 100, currentUtilization: 0.80, status: 'active' },
  { id: '6', code: 'Z01-Pb-E1-N2', zone: '01', aisle: 'b', rack: 'E1', level: 'N2', type: 'storage', maxUnits: 100, currentUtilization: 0.10, status: 'active' },

  // Zona 02 - Alta rotación
  { id: '7', code: 'Z02-Pa-E1-N1', zone: '02', aisle: 'a', rack: 'E1', level: 'N1', type: 'storage', maxUnits: 150, currentUtilization: 0.55, status: 'active' },
  { id: '8', code: 'Z02-Pa-E1-N2', zone: '02', aisle: 'a', rack: 'E1', level: 'N2', type: 'storage', maxUnits: 150, currentUtilization: 0.40, status: 'active' },
  { id: '9', code: 'Z02-Pb-E3-N2', zone: '02', aisle: 'b', rack: 'E3', level: 'N2', type: 'storage', maxUnits: 150, currentUtilization: 0.68, status: 'active' },
  { id: '10', code: 'Z02-Pc-E2-N1', zone: '02', aisle: 'c', rack: 'E2', level: 'N1', type: 'storage', maxUnits: 130, currentUtilization: 0.45, status: 'active' },

  // Zona 03 - Media rotación
  { id: '11', code: 'Z03-Pa-E1-N1', zone: '03', aisle: 'a', rack: 'E1', level: 'N1', type: 'storage', maxUnits: 200, currentUtilization: 0.35, status: 'active' },
  { id: '12', code: 'Z03-Pa-E1-N3', zone: '03', aisle: 'a', rack: 'E1', level: 'N3', type: 'storage', maxUnits: 180, currentUtilization: 0.22, status: 'active' },
  { id: '13', code: 'Z03-Pd-E4-N3', zone: '03', aisle: 'd', rack: 'E4', level: 'N3', type: 'storage', maxUnits: 180, currentUtilization: 0.18, status: 'active' },

  // Zona 04 - Media rotación
  { id: '14', code: 'Z04-Pa-E1-N1', zone: '04', aisle: 'a', rack: 'E1', level: 'N1', type: 'storage', maxUnits: 100, currentUtilization: 0.50, status: 'active' },
  { id: '15', code: 'Z04-Pa-E2-N1', zone: '04', aisle: 'a', rack: 'E2', level: 'N1', type: 'storage', maxUnits: 100, currentUtilization: 0.60, status: 'active' },
  { id: '16', code: 'Z04-Pb-E1-N1', zone: '04', aisle: 'b', rack: 'E1', level: 'N1', type: 'storage', maxUnits: 100, currentUtilization: 0.45, status: 'active' },

  // Zona 05 - Baja rotación
  { id: '17', code: 'Z05-Pa-E1-N1', zone: '05', aisle: 'a', rack: 'E1', level: 'N1', type: 'storage', maxUnits: 200, currentUtilization: 0.30, status: 'active' },
  { id: '18', code: 'Z05-Pc-E2-N4', zone: '05', aisle: 'c', rack: 'E2', level: 'N4', type: 'storage', maxUnits: 180, currentUtilization: 0.25, status: 'active' },

  // Áreas de recepción y despacho
  { id: '19', code: 'RCV-01', zone: 'R', aisle: '00', rack: 'E0', level: 'N0', type: 'receiving', maxUnits: 500, currentUtilization: 0.12, status: 'active' },
  { id: '20', code: 'RCV-02', zone: 'R', aisle: '00', rack: 'E0', level: 'N0', type: 'receiving', maxUnits: 500, currentUtilization: 0.08, status: 'active' },
  { id: '21', code: 'DSP-01', zone: 'D', aisle: '00', rack: 'E0', level: 'N0', type: 'dispatch', maxUnits: 300, currentUtilization: 0.45, status: 'active' },
  { id: '22', code: 'DSP-02', zone: 'D', aisle: '00', rack: 'E0', level: 'N0', type: 'dispatch', maxUnits: 300, currentUtilization: 0.32, status: 'active' },
  { id: '23', code: 'STG-01', zone: 'S', aisle: '00', rack: 'E0', level: 'N0', type: 'staging', maxUnits: 200, currentUtilization: 0.25, status: 'active' },
];

// Mock Picking Orders
// Ubicaciones actualizadas al formato: Z[01-32]-P[a-g]-E[1-9]-N[1-5]
export const mockOrders: PickingOrder[] = [
  {
    id: '1',
    orderNumber: 'DP-2025-0145',
    type: 'dispatch',
    priority: 'urgent',
    status: 'pending',
    destination: {
      name: 'Tienda Centro - Local 5',
      address: 'Av. Principal #123, Guayaquil',
    },
    items: [
      {
        productId: '1',
        productSku: 'REP-12345',
        productName: 'Filtro de Aceite XYZ Premium',
        productImage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100',
        requestedQuantity: 10,
        pickedQuantity: 0,
        locationCode: 'Z01-Pa-E2-N1',
        distance: 15,
        status: 'pending',
      },
      {
        productId: '2',
        productSku: 'REP-98765',
        productName: 'Pastilla de Freno Delantera',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 4,
        pickedQuantity: 0,
        locationCode: 'Z02-Pb-E3-N2',
        distance: 22,
        status: 'pending',
      },
      {
        productId: '4',
        productSku: 'REP-11111',
        productName: 'Amortiguador Delantero',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 2,
        pickedQuantity: 0,
        locationCode: 'Z01-Pa-E1-N1',
        distance: 8,
        status: 'pending',
      },
      {
        productId: '3',
        productSku: 'REP-55555',
        productName: 'Bujía NGK Iridium',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 8,
        pickedQuantity: 0,
        locationCode: 'Z01-Pb-E1-N1',
        distance: 2,
        status: 'pending',
      },
      {
        productId: '9',
        productSku: 'REP-77777',
        productName: 'Batería 12V 7Ah',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 3,
        pickedQuantity: 0,
        locationCode: 'Z02-Pa-E1-N1',
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
    status: 'pending',
    destination: {
      name: 'Mantenimiento - Taller Norte',
      address: 'Km 12.5 Vía a Daule',
    },
    items: [
      {
        productId: '5',
        productSku: 'REP-22222',
        productName: 'Cadena de Transmisión 520',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 5,
        pickedQuantity: 0,
        locationCode: 'Z01-Pa-E1-N2',
        distance: 12,
        status: 'pending',
      },
      {
        productId: '10',
        productSku: 'REP-88888',
        productName: 'Aceite Motor 10W-40 Sintético',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 12,
        pickedQuantity: 0,
        locationCode: 'Z02-Pc-E2-N1',
        distance: 25,
        status: 'pending',
      },
      {
        productId: '7',
        productSku: 'REP-44444',
        productName: 'Kit de Embrague',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 2,
        pickedQuantity: 0,
        locationCode: 'Z02-Pa-E1-N2',
        distance: 20,
        status: 'pending',
      },
    ],
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    dueAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    orderNumber: 'DP-2025-0147',
    type: 'internal_request',
    priority: 'high',
    status: 'pending',
    destination: {
      name: 'Departamento de Ventas',
    },
    items: [
      {
        productId: '6',
        productSku: 'REP-33333',
        productName: 'Llanta Delantera 17"',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 4,
        pickedQuantity: 0,
        locationCode: 'Z03-Pa-E1-N1',
        distance: 35,
        status: 'pending',
      },
      {
        productId: '8',
        productSku: 'REP-66666',
        productName: 'Disco de Freno Ventilado',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 6,
        pickedQuantity: 0,
        locationCode: 'Z02-Pb-E3-N2',
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
    status: 'pending',
    destination: {
      name: 'Tienda Sur - Local 8',
      address: 'Av. del Sur #456',
    },
    items: [
      {
        productId: '1',
        productSku: 'REP-12345',
        productName: 'Filtro de Aceite XYZ Premium',
        productImage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100',
        requestedQuantity: 15,
        pickedQuantity: 0,
        locationCode: 'Z01-Pa-E2-N1',
        distance: 15,
        status: 'pending',
      },
    ],
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    orderNumber: 'DP-2025-0149',
    type: 'dispatch',
    priority: 'urgent',
    status: 'pending',
    destination: {
      name: 'Cliente VIP - Empresa ABC',
      address: 'Cdla. Kennedy, Guayaquil',
    },
    items: [
      {
        productId: '9',
        productSku: 'REP-77777',
        productName: 'Batería 12V 7Ah',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 6,
        pickedQuantity: 0,
        locationCode: 'Z02-Pa-E1-N1',
        distance: 18,
        status: 'pending',
      },
      {
        productId: '2',
        productSku: 'REP-98765',
        productName: 'Pastilla de Freno Delantera',
        productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        requestedQuantity: 8,
        pickedQuantity: 0,
        locationCode: 'Z02-Pb-E3-N2',
        distance: 22,
        status: 'pending',
      },
    ],
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    dueAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
  },
];
