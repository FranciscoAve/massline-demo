import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Camera, Printer, Package } from 'lucide-react';
import Button from '../components/ui/Button';
import { mockOrders } from '../data/mockData';
import { generateLabelFromOrder } from '../utils/dispatchLabelPdf';

const Packing: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState({
    packed: false,
    verified: false,
    noDamage: false,
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [cartonCount, setCartonCount] = useState(1);
  const [generatedLabels, setGeneratedLabels] = useState<number[]>([]);

  const order = mockOrders.find(o => o.id === orderId);
  if (!order) return <div>Order not found</div>;

  const totalItems = order.items.length;
  const totalUnits = order.items.reduce((sum, item) => sum + item.requestedQuantity, 0);

  const allChecked = Object.values(checklist).every(v => v);

  const handleGenerateLabel = (cartonNumber: number) => {
    generateLabelFromOrder(order, cartonNumber, cartonCount);
    setGeneratedLabels((prev) => [...prev, cartonNumber]);
  };

  const handleGenerateAllLabels = () => {
    for (let i = 1; i <= cartonCount; i++) {
      setTimeout(() => {
        generateLabelFromOrder(order, i, cartonCount);
      }, i * 300); // Small delay between each PDF
    }
    setGeneratedLabels(Array.from({ length: cartonCount }, (_, i) => i + 1));
  };

  const handleFinalize = () => {
    if (generatedLabels.length === 0) {
      // Generate at least one label before finalizing
      generateLabelFromOrder(order, 1, cartonCount);
    }
    navigate(`/dispatch/confirmation/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Empaque y Etiquetado
      </h1>

      {/* Summary Card */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-600">✓ RECOLECCIÓN COMPLETA</p>
            <p className="text-xs text-gray-600">Orden {order.orderNumber}</p>
          </div>
        </div>
        <div className="text-sm text-gray-700">
          <p>{order.destination.name}</p>
          <p className="mt-1">
            📦 {totalItems}/{totalItems} productos recolectados
          </p>
          <p>✓ {totalUnits}/{totalUnits} unidades</p>
          <p className="text-blue-600 mt-1">⏱️ Tiempo de picking: 12 min</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
        <p className="text-sm font-semibold text-gray-900 mb-2">📋 INSTRUCCIONES</p>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded mb-2">
          <p className="text-sm text-yellow-800">
            ⚠️ Notas especiales: "Empacar por separado las bujías"
          </p>
        </div>
        <p className="text-sm text-gray-700">Paquetes sugeridos: 2</p>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Verificación:</p>
        {[
          { key: 'packed', label: 'Productos empacados' },
          { key: 'verified', label: 'Cantidades verificadas' },
          { key: 'noDamage', label: 'Sin daños visibles' },
        ].map(item => (
          <label key={item.key} className="flex items-center gap-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={checklist[item.key as keyof typeof checklist]}
              onChange={(e) =>
                setChecklist({ ...checklist, [item.key]: e.target.checked })
              }
              className="w-5 h-5 text-blue-500 rounded"
            />
            <span className="text-gray-700">{item.label}</span>
          </label>
        ))}
      </div>

      {/* Photo */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <p className="text-sm text-gray-700 mb-2">📸 Foto del empaque (opcional):</p>
        {photo ? (
          <div className="relative">
            <img src={photo} alt="Package" className="w-full h-40 object-cover rounded-lg" />
            <button
              onClick={() => setPhoto(null)}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setPhoto('https://via.placeholder.com/400x300')}
            className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center gap-2 text-gray-500 active:scale-95 transition-transform"
          >
            <Camera className="w-8 h-8" />
            <span className="text-sm">Tomar foto</span>
          </button>
        )}
      </div>

      {/* Carton Count & Label Generation */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          <Package className="w-4 h-4 inline mr-2" />
          Etiquetas de Despacho
        </p>

        {/* Carton count selector */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-gray-600">Número de cartones:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCartonCount(Math.max(1, cartonCount - 1))}
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold"
            >
              -
            </button>
            <span className="w-8 text-center font-bold text-lg">{cartonCount}</span>
            <button
              onClick={() => setCartonCount(cartonCount + 1)}
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Individual carton labels */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {Array.from({ length: cartonCount }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => handleGenerateLabel(num)}
              disabled={!allChecked}
              className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                generatedLabels.includes(num)
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300'
              } ${!allChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {generatedLabels.includes(num) ? '✓' : ''} Cartón {num}/{cartonCount}
            </button>
          ))}
        </div>

        {/* Generate all labels button */}
        <Button
          onClick={handleGenerateAllLabels}
          disabled={!allChecked}
          fullWidth
          variant="secondary"
        >
          <Printer className="w-5 h-5 mr-2" />
          GENERAR TODAS ({cartonCount} etiquetas)
        </Button>
      </div>

      {/* Generated labels summary */}
      {generatedLabels.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
          <p className="text-sm text-green-700">
            ✓ {generatedLabels.length} de {cartonCount} etiquetas generadas
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={() => navigate(-1)}>
          Guardar para después
        </Button>
        <Button
          className="flex-1"
          disabled={!allChecked}
          onClick={handleFinalize}
        >
          FINALIZAR DESPACHO
        </Button>
      </div>
    </div>
  );
};

export default Packing;
