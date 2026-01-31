import type {
  LoginCredentials,
  AuthResponse,
  User,
  Task,
  Product,
  Order,
  DashboardStats,
} from '../types';

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
};

// Mock tasks
const mockTasks: Task[] = [
  {
    id: '1',
    type: 'dispatch',
    title: 'Orden #12345',
    description: 'Tienda Norte - 5 productos',
    priority: 'urgent',
    status: 'pending',
    assignedTo: '2',
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
  },
  {
    id: '2',
    type: 'reception',
    title: 'Recepción #OC-2025-001',
    description: 'Proveedor AutoParts - 12 productos',
    priority: 'normal',
    status: 'pending',
    assignedTo: '2',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: '3',
    type: 'dispatch',
    title: 'Orden #12346',
    description: 'Tienda Sur - 8 productos',
    priority: 'high',
    status: 'pending',
    assignedTo: '2',
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
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
      return {
        pendingOrders: 12,
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
      // Mock order
      if (orderNumber === 'OC-2025-001234') {
        return {
          id: 'ORD001',
          orderNumber: 'OC-2025-001234',
          type: 'purchase',
          status: 'pending',
          supplier: 'AutoParts Supply Co.',
          products: mockProducts.map((p) => ({
            product: p,
            quantity: 10,
            received: 0,
          })),
          createdAt: new Date(),
        };
      }
      return null;
    },
  },
};
