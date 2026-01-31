import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Camera, Printer, Package, AlertTriangle, X } from 'lucide-react';
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
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueReported, setIssueReported] = useState(false);
  const [issueType, setIssueType] = useState<string | null>(null);

  const order = mockOrders.find(o => o.id === orderId);
  if (!order) return <div>Order not found</div>;

  const totalItems = order.items.length;
  const totalUnits = order.items.reduce((sum, item) => sum + item.requestedQuantity, 0);

  const allChecked = Object.values(checklist).every(v => v);
  // Permitir continuar si todo está verificado O si se reportó un problema
  const canProceed = allChecked || issueReported;

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

      {/* Checklist */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Verificación antes de empacar:</p>
        {[
          { key: 'packed', label: 'Productos empacados correctamente' },
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

        {/* Report issue button when not all checked */}
        {!allChecked && !issueReported && (
          <button
            onClick={() => setShowIssueModal(true)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800 text-sm font-medium hover:bg-yellow-100 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            Reportar problema
          </button>
        )}

        {/* Issue reported confirmation */}
        {issueReported && (
          <div className="mt-3 flex items-center gap-2 py-2 px-4 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-700">
              Problema reportado: <strong>{issueType}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Issue Report Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Reportar Problema</h3>
              <button
                onClick={() => setShowIssueModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Selecciona el tipo de problema encontrado:
            </p>
            <div className="space-y-2">
              {[
                'Producto dañado',
                'Cantidad incorrecta',
                'Producto equivocado',
                'Empaque defectuoso',
                'Otro problema',
              ].map((issue) => (
                <button
                  key={issue}
                  onClick={() => {
                    setIssueType(issue);
                    setIssueReported(true);
                    setShowIssueModal(false);
                  }}
                  className="w-full py-3 px-4 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {issue}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowIssueModal(false)}
              className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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
              disabled={!canProceed}
              className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                generatedLabels.includes(num)
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300'
              } ${!canProceed ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {generatedLabels.includes(num) ? '✓' : ''} Cartón {num}/{cartonCount}
            </button>
          ))}
        </div>

        {/* Generate all labels button */}
        <Button
          onClick={handleGenerateAllLabels}
          disabled={!canProceed}
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
          disabled={!canProceed}
          onClick={handleFinalize}
        >
          FINALIZAR DESPACHO
        </Button>
      </div>
    </div>
  );
};

export default Packing;
