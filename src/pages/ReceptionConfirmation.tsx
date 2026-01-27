import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, ChevronDown, Mail, Printer } from 'lucide-react';
import Stepper from '../components/navigation/Stepper';
import Button from '../components/ui/Button';

interface ConfirmedProduct {
  name: string;
  sku: string;
  quantity: number;
  location: string;
}

const ReceptionConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as {
    orderNumber?: string;
    supplier?: string;
    products?: ConfirmedProduct[];
  } | null;

  const [showProductsTable, setShowProductsTable] = useState(true);

  const confirmedProducts = locationState?.products || [];
  const totalProducts = confirmedProducts.length;
  const totalUnits = confirmedProducts.reduce((sum, p) => sum + p.quantity, 0);

  const receptionData = {
    orderNumber: locationState?.orderNumber || 'Sin orden',
    supplier: locationState?.supplier || 'No especificado',
    date: new Date().toLocaleString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    operator: 'Operador actual',
    products: confirmedProducts,
    totalProducts,
    totalUnits,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 text-center sticky top-0 z-10">
          <h1 className="text-lg font-bold text-gray-900">Resumen de Recepción</h1>
        </div>

        {/* Stepper */}
        <Stepper
          steps={[
            { label: 'Inicio' },
            { label: 'Recibo' },
            { label: 'Ubicación' },
            { label: 'Confirmar' },
          ]}
          currentStep={3}
        />

        {/* Content */}
        <div className="flex-1 p-4 pb-32 overflow-y-auto">
        {/* Success Animation */}
        <div className="flex flex-col items-center py-8 mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-500" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            ✓ RECEPCIÓN COMPLETA
          </h2>
          <p className="text-gray-600">Orden {receptionData.orderNumber} procesada</p>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Proveedor:</p>
              <p className="font-semibold text-gray-900">{receptionData.supplier}</p>
            </div>
            <div>
              <p className="text-gray-500">Fecha:</p>
              <p className="font-semibold text-gray-900">{receptionData.date}</p>
            </div>
            <div>
              <p className="text-gray-500">Operador:</p>
              <p className="font-semibold text-gray-900">{receptionData.operator}</p>
            </div>
            <div>
              <p className="text-gray-500">Total unidades:</p>
              <p className="font-semibold text-gray-900">{receptionData.totalUnits}</p>
            </div>
          </div>
        </div>

        {/* Products Table (Collapsible) */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <button
            onClick={() => setShowProductsTable(!showProductsTable)}
            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 border-b border-gray-200"
          >
            <span className="text-sm font-semibold text-gray-700">
              {receptionData.totalProducts} productos recibidos ({receptionData.totalUnits}{' '}
              und)
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform ${
                showProductsTable ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showProductsTable && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                      Producto
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">
                      Cant
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">
                      Ubic.
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {receptionData.products.map((product, index) => (
                    <tr key={index} className="border-b border-gray-100 last:border-none">
                      <td className="px-4 py-3">
                        <p className="text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{product.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-900">
                        {product.quantity}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-blue-600 text-xs">
                        {product.location}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>


        {/* Actions */}
        <div className="flex gap-3 mb-4">
          <button className="flex-1 py-3 border border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-700 font-medium active:scale-95 transition-transform">
            <Mail className="w-5 h-5" />
            <span>Enviar</span>
          </button>
          <button className="flex-1 py-3 border border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-700 font-medium active:scale-95 transition-transform">
            <Printer className="w-5 h-5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 fixed bottom-0 left-0 right-0">
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => navigate('/reception/start')}>
            NUEVA RECEPCIÓN
          </Button>
          <Button className="flex-1" onClick={() => navigate('/dashboard')}>
            IR AL HOME
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReceptionConfirmation;
