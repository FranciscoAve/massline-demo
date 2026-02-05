import type {
  LoginCredentials,
  AuthResponse,
  User,
  Task,
  Product,
  Order,
  DashboardStats,
} from '../types';
import { mockReceptionOrders, mockOrders } from '../data/mockData';
import { useWorkshopOrdersStore } from '../stores/workshopOrdersStore';

// Mock delay to simulate network request
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock users database
const mockUsers: { [key: string]: { password: string; user: User } } = {
  'admin': {
    password: 'admin123',
    user: {
      id: '1',
      name: 'Carlos Mendoza',
      email: 'admin@massline.com',
      role: 'admin',
    },
  },
  'operator': {
    password: 'operator123',
    user: {
      id: '2',
      name: 'María González',
      email: 'operator@massline.com',
      role: 'operator',
    },
  },
  'supervisor': {
    password: 'supervisor123',
    user: {
      id: '3',
      name: 'Juan Pérez',
      email: 'supervisor@massline.com',
      role: 'supervisor',
    },
  },
  'taller': {
    password: 'taller123',
    user: {
      id: '4',
      name: 'Taller de Ensamblaje',
      email: 'taller@massline.com',
      role: 'workshop',
    },
  },
};

// Mock tasks - vinculadas a órdenes reales en mockData.ts
const mockTasks: Task[] = [
  {
    id: '1',
    type: 'dispatch',
    title: 'Despacho DP-2025-0145',
    description: 'Tienda Centro - Local 5 - 5 productos',
    priority: 'urgent',
    status: 'pending',
    assignedTo: '2',
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    orderId: '1', // Vincula a mockOrders[0]
    orderNumber: 'DP-2025-0145',
  },
  {
    id: '2',
    type: 'reception',
    title: 'Recepción OC-2025-001234',
    description: 'Proveedor AutoParts - 12 productos',
    priority: 'normal',
    status: 'pending',
    assignedTo: '2',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    orderNumber: 'OC-2025-001234',
  },
  {
    id: '3',
    type: 'dispatch',
    title: 'Despacho DP-2025-0149',
    description: 'Cliente VIP - Empresa ABC - 2 productos',
    priority: 'urgent',
    status: 'pending',
    assignedTo: '2',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    orderId: '5', // Vincula a mockOrders[4]
    orderNumber: 'DP-2025-0149',
  },
];

// Mock products
const mockProducts: Product[] = [
  {
    id: 'P001',
    sku: 'FLT-OIL-001',
    name: 'Filtro de Aceite Premium',
    description: 'Filtro de aceite para motores diésel',
    category: 'Filtros',
    quantity: 45,
    location: 'Z01-Pa-E2-N1',
    price: 12.50,
  },
  {
    id: 'P002',
    sku: 'BRK-PAD-002',
    name: 'Pastillas de Freno Delanteras',
    description: 'Juego completo de pastillas',
    category: 'Frenos',
    quantity: 28,
    location: 'Z01-Pe-E1-N2',
    price: 45.00,
  },
  {
    id: 'P003',
    sku: 'SPK-PLG-003',
    name: 'Bujías NGK Platino',
    description: 'Set de 4 bujías de platino',
    category: 'Motor',
    quantity: 15,
    location: 'Z02-Pb-E3-N1',
    price: 28.00,
  },
];

// Mock API
export const mockApi = {
  auth: {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      await delay(1000); // Simulate network delay

      const userRecord = mockUsers[credentials.username];

      if (!userRecord || userRecord.password !== credentials.password) {
        return {
          success: false,
          error: 'Usuario o contraseña incorrectos',
        };
      }

      // Generate mock token
      const token = `mock-token-${Date.now()}`;

      return {
        success: true,
        user: userRecord.user,
        token,
      };
    },

    logout: async (): Promise<void> => {
      await delay(300);
    },
  },

  dashboard: {
    getStats: async (): Promise<DashboardStats> => {
      await delay(500);

      // Calcular órdenes pendientes de despacho (mockOrders + workshopOrders)
      const workshopOrders = useWorkshopOrdersStore.getState().orders;
      const pendingDispatchOrders = mockOrders.filter(o => o.status === 'pending').length;
      const pendingWorkshopOrders = workshopOrders.filter(o => o.status === 'pending').length;

      // Calcular recepciones pendientes
      const pendingReceptions = mockReceptionOrders.filter(o => o.status === 'pending').length;

      // Total de órdenes pendientes (despacho + recepción + taller)
      const totalPendingOrders = pendingDispatchOrders + pendingWorkshopOrders + pendingReceptions;

      return {
        pendingOrders: totalPendingOrders,
        productsReceivedToday: 145,
        tasksAssigned: mockTasks.filter((t) => t.status === 'pending').length,
        lowStockAlerts: 5,
      };
    },

    getTasks: async (userId: string): Promise<Task[]> => {
      await delay(500);
      return mockTasks.filter((t) => t.assignedTo === userId);
    },
  },

  products: {
    search: async (query: string): Promise<Product[]> => {
      await delay(500);
      const lowerQuery = query.toLowerCase();
      return mockProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.sku.toLowerCase().includes(lowerQuery) ||
          p.category.toLowerCase().includes(lowerQuery)
      );
    },

    getById: async (id: string): Promise<Product | null> => {
      await delay(300);
      return mockProducts.find((p) => p.id === id) || null;
    },

    getBySku: async (sku: string): Promise<Product | null> => {
      await delay(300);
      return mockProducts.find((p) => p.sku === sku) || null;
    },
  },

  orders: {
    getByNumber: async (orderNumber: string): Promise<Order | null> => {
      await delay(500);

      // Buscar en órdenes de recepción
      const receptionOrder = mockReceptionOrders.find(o => o.orderNumber === orderNumber);
      if (receptionOrder) {
        return {
          id: receptionOrder.id,
          orderNumber: receptionOrder.orderNumber,
          type: receptionOrder.type,
          status: receptionOrder.status,
          supplier: receptionOrder.supplier.name,
          products: receptionOrder.items.map((item) => ({
            product: {
              id: item.productId,
              sku: item.productSku,
              name: item.productName,
              description: '',
              category: 'General',
              quantity: item.expectedQuantity,
              location: item.locationCode,
              price: 0,
              image: item.productImage,
            },
            quantity: item.expectedQuantity,
            received: item.receivedQuantity,
          })),
          createdAt: new Date(receptionOrder.createdAt),
        };
      }

      return null;
    },
  },
};
