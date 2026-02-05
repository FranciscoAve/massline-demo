import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ReportType =
  | 'insufficient_stock'
  | 'visible_damage'
  | 'inadequate_replacement'
  | 'wrong_location'
  | 'other';

export interface ProductReport {
  id: string;
  productSku: string;
  productName: string;
  productLocation: string;
  type: ReportType;
  description: string;
  photoBase64?: string; // Foto en base64 (opcional)
  createdAt: string;
  createdBy: string; // username del operador
}

export const reportTypeLabels: Record<ReportType, { label: string; icon: string; color: string }> = {
  insufficient_stock: {
    label: 'Stock Insuficiente',
    icon: '📉',
    color: 'text-red-600 bg-red-50 border-red-200'
  },
  visible_damage: {
    label: 'Daño Visible',
    icon: '🔧',
    color: 'text-orange-600 bg-orange-50 border-orange-200'
  },
  inadequate_replacement: {
    label: 'Reemplazo Inadecuado',
    icon: '🔄',
    color: 'text-purple-600 bg-purple-50 border-purple-200'
  },
  wrong_location: {
    label: 'Ubicación Incorrecta',
    icon: '📍',
    color: 'text-blue-600 bg-blue-50 border-blue-200'
  },
  other: {
    label: 'Otro',
    icon: '❓',
    color: 'text-gray-600 bg-gray-50 border-gray-200'
  },
};

interface ReportsState {
  reports: ProductReport[];
  addReport: (report: Omit<ProductReport, 'id' | 'createdAt'>) => ProductReport;
  getReportsByUser: (username: string) => ProductReport[];
  getReportsBySku: (sku: string) => ProductReport[];
}

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      reports: [],

      addReport: (reportData) => {
        const newReport: ProductReport = {
          ...reportData,
          id: `report-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          reports: [newReport, ...state.reports],
        }));

        return newReport;
      },

      getReportsByUser: (username: string) => {
        return get().reports.filter((r) => r.createdBy === username);
      },

      getReportsBySku: (sku: string) => {
        return get().reports.filter((r) => r.productSku === sku);
      },
    }),
    {
      name: 'massline-reports',
    }
  )
);
