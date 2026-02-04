import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Package, Clock, MapPin, Truck, User, Copy, Share2, Trophy, Printer } from 'lucide-react';
import Button from '../components/ui/Button';
import { mockOrders } from '../data/mockData';
import { generateMultiCartonPdf, generateLabelFromOrder, type CartonData, type ReplacementInfo } from '../utils/dispatchLabelPdf';

interface StoredCartonData {
  cartons: CartonData[];
  totalCartons: number;
  replacementsUsed?: Record<string, ReplacementInfo>;
}

const DispatchConfirmation: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const order = mockOrders.find(o => o.id === orderId);

  // Recuperar datos de cartones de sessionStorage
  // IMPORTANTE: Este hook debe estar antes de cualquier return condicional
  const storedData = useMemo((): StoredCartonData | null => {
    const stored = sessionStorage.getItem(`cartons_${orderId}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }, [orderId]);

  if (!order) return <div>Order not found</div>;

  const totalItems = order.items.length;
  const totalUnits = order.items.reduce((sum, item) => sum + item.requestedQuantity, 0);
  const totalCartons = storedData?.totalCartons || 1;

  const handleGenerateLabel = () => {
    if (storedData && storedData.cartons.length > 0) {
      // Generar PDF multi-página con los cartones configurados
      generateMultiCartonPdf(order, storedData.cartons, storedData.replacementsUsed);
    } else {
      // Fallback: generar etiqueta con todos los productos en un cartón
      generateLabelFromOrder(order, 1, 1);
    }
  };

  const trackingCode = order.orderNumber;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4">
      {/* Success Animation */}
      <div className="flex flex-col items-center py-8 mb-6">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <CheckCircle2 className="w-14 h-14 text-green-500" strokeWidth={3} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">✓ DESPACHO COMPLETO</h1>
        <p className="text-gray-600">Orden {order.orderNumber}</p>
        <p className="text-sm text-gray-500">procesada exitosamente</p>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 text-center">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Package className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            <p className="text-xs text-gray-500">productos</p>
          </div>
          <div>
            <Package className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">{totalUnits}</p>
            <p className="text-xs text-gray-500">unidades</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm text-left">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Tiempo total: <strong>18 minutos</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Destino: <strong>{order.destination.name}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Estado: <strong className="text-green-600">Listo para envío</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Operador: <strong>Juan Pérez</strong></span>
          </div>
        </div>
      </div>

      {/* Tracking Code */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
          CÓDIGO DE RASTREO:
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-3">
          <p className="text-center text-xl font-bold font-mono text-gray-900 mb-3">
            {trackingCode}
          </p>
          <div className="bg-white p-6 rounded-lg flex items-center justify-center">
            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-xs text-gray-500">[QR CODE]</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mb-3">
          <button className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Copy className="w-4 h-4" />
            Copiar
          </button>
          <button className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Share2 className="w-4 h-4" />
            Compartir
          </button>
        </div>

        {/* Botón para generar etiqueta PDF */}
        <button
          onClick={handleGenerateLabel}
          className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform bg-blue-500 text-white"
        >
          <Printer className="w-5 h-5" />
          GENERAR ETIQUETAS ({totalCartons} {totalCartons === 1 ? 'cartón' : 'cartones'})
        </button>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3 mb-3">
          <Trophy className="w-6 h-6 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-bold text-green-900 mb-2">¡BUEN TRABAJO!</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">⚡ Picking:</span>
                <span className="font-semibold text-green-700">18 min (Excelente)</span>
              </div>
              <div className="pl-4 text-xs text-gray-600">vs. promedio 25 min</div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">✓ Precisión:</span>
                <span className="font-semibold text-green-700">100%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">📈 Productividad hoy:</span>
                <span className="font-semibold text-green-700">+15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Orders Notice */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-700 mb-3">
          Hay <strong className="text-blue-600">4 órdenes urgentes</strong> pendientes
        </p>
        <button className="w-full py-2 bg-blue-500 text-white rounded-lg font-semibold active:scale-95 transition-transform">
          VER ÓRDENES URGENTES
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => navigate(`/dispatch/orders`)}
        >
          Ver detalle
        </Button>
        <Button className="flex-1" onClick={() => navigate('/dashboard')}>
          IR AL HOME
        </Button>
      </div>
    </div>
  );
};

export default DispatchConfirmation;
