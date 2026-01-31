// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'operator' | 'supervisor' | 'admin';
  avatar?: string;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

// Task types
export interface Task {
  id: string;
  type: 'reception' | 'dispatch' | 'query' | 'report';
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo: string;
  createdAt: Date;
  dueDate?: Date;
  orderId?: string; // ID de la orden asociada (para dispatch/reception)
  orderNumber?: string; // Número de orden para mostrar
}

// Product types
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  quantity: number;
  location?: string;
  price: number;
}

// Order types
export interface Order {
  id: string;
  orderNumber: string;
  type: 'purchase' | 'sale' | 'transfer';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  products: OrderProduct[];
  supplier?: string;
  destination?: string;
  createdAt: Date;
  completedAt?: Date;
  notes?: string;
}

export interface OrderProduct {
  product: Product;
  quantity: number;
  received?: number;
}

// Location types
export interface Location {
  id: string;
  code: string; // e.g., "Z01-Pa-E2-N1" (Zona-Pasillo-Estante-Nivel)
  zone: string;
  aisle: string;
  shelf: string;
  level: string;
  capacity: number;
  occupied: number;
  products: Product[];
}

// Dashboard stats
export interface DashboardStats {
  pendingOrders: number;
  productsReceivedToday: number;
  tasksAssigned: number;
  lowStockAlerts: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
