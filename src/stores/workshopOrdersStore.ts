import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PickingOrder, PickingItem } from '../data/mockData';

interface WorkshopOrdersState {
  orders: PickingOrder[];
  orderCounter: number;
  addOrder: (items: PickingItem[], createdBy: string) => PickingOrder;
  updateOrderStatus: (orderId: string, status: PickingOrder['status']) => void;
  updateOrderReleaseStatus: (orderId: string, releaseStatus: PickingOrder['releaseStatus']) => void;
  deleteOrder: (orderId: string) => boolean;
  getNextOrderNumber: () => string;
}

export const useWorkshopOrdersStore = create<WorkshopOrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      orderCounter: 26, // Empieza después de INT-2025-0025 existente

      getNextOrderNumber: () => {
        const year = new Date().getFullYear();
        const counter = get().orderCounter;
        return `INT-${year}-${counter.toString().padStart(4, '0')}`;
      },

      addOrder: (items, createdBy) => {
        const orderNumber = get().getNextOrderNumber();
        const newOrder: PickingOrder = {
          id: `workshop-${Date.now()}`,
          orderNumber,
          type: 'internal_request',
          priority: 'normal',
          status: 'pending',
          releaseStatus: 'internal',
          destination: {
            name: `Taller de Ensamblaje - ${createdBy}`,
          },
          items,
          createdAt: new Date().toISOString(),
          dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

        set((state) => ({
          orders: [...state.orders, newOrder],
          orderCounter: state.orderCounter + 1,
        }));

        return newOrder;
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          ),
        }));
      },

      updateOrderReleaseStatus: (orderId, releaseStatus) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, releaseStatus } : order
          ),
        }));
      },

      deleteOrder: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        // Solo permitir eliminar órdenes pendientes
        if (!order || order.status !== 'pending') {
          return false;
        }
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== orderId),
        }));
        return true;
      },
    }),
    {
      name: 'workshop-orders-storage',
      partialize: (state) => ({
        orders: state.orders,
        orderCounter: state.orderCounter,
      }),
    }
  )
);
