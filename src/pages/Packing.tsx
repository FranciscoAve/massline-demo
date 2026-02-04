import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { CheckCircle2, Camera, Printer, Package, AlertTriangle, X, RefreshCw, Plus, Minus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { mockOrders, type PickingItem } from '../data/mockData';
import { useWorkshopOrdersStore } from '../stores/workshopOrdersStore';
import { generateLabelFromOrder, generateMultiCartonPdf, type ReplacementInfo, type CartonData } from '../utils/dispatchLabelPdf';

interface LocationState {
  pickedItems?: PickingItem[];
  replacementsUsed?: Record<string, ReplacementInfo>;
}

interface CartonProduct {
  productSku: string;
  productName: string;
  quantity: number;
  maxQuantity: number;
}

const Packing: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  // Obtener datos de picking - primero de location.state, luego de sessionStorage
  const getPickingData = (): LocationState => {
    if (locationState?.pickedItems || locationState?.replacementsUsed) {
      return locationState;
    }
    // Intentar recuperar de sessionStorage
    const stored = sessionStorage.getItem(`picking_${orderId}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }
    return {};
  };

  const pickingData = getPickingData();
  const pickedItems = pickingData.pickedItems;
  const replacementsUsed = pickingData.replacementsUsed || {};
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

  // Estado para asignación de productos a cartones
  const [cartonProducts, setCartonProducts] = useState<Record<number, CartonProduct[]>>({});
  const [expandedCarton, setExpandedCarton] = useState<number | null>(1);
  const [showProductSelector, setShowProductSelector] = useState<number | null>(null);

  // Combinar órdenes mock con órdenes del taller
  const { orders: workshopOrders } = useWorkshopOrdersStore();
  const allOrders = useMemo(() => [...mockOrders, ...workshopOrders], [workshopOrders]);
  const order = allOrders.find(o => o.id === orderId);

  // Calcular productos disponibles (no asignados a ningún cartón o con cantidad restante)
  // IMPORTANTE: Este hook debe estar antes de cualquier return condicional
  const availableProducts = useMemo(() => {
    if (!order) return [];

    const assigned: Record<string, number> = {};

    // Sumar cantidades asignadas por producto
    Object.values(cartonProducts).forEach(products => {
      products.forEach(p => {
        assigned[p.productSku] = (assigned[p.productSku] || 0) + p.quantity;
      });
    });

    // Retornar productos con cantidad disponible
    return order.items
      .map(item => {
        const pickedItem = pickedItems?.find(p => p.productSku === item.productSku);
        const totalQty = pickedItem?.pickedQuantity ?? item.requestedQuantity;
        const assignedQty = assigned[item.productSku] || 0;
        const availableQty = totalQty - assignedQty;

        return {
          productSku: item.productSku,
          productName: item.productName,
          availableQuantity: availableQty,
          totalQuantity: totalQty,
        };
      })
      .filter(p => p.availableQuantity > 0);
  }, [order, cartonProducts, pickedItems]);

  if (!order) return <div>Order not found</div>;

  const totalItems = order.items.length;
  const totalUnits = order.items.reduce((sum, item) => sum + item.requestedQuantity, 0);

  const allChecked = Object.values(checklist).every(v => v);
  // Permitir continuar si todo está verificado O si se reportó un problema
  const canProceed = allChecked || issueReported;

  // Verificar si todos los productos están asignados
  const allProductsAssigned = availableProducts.length === 0;

  // Obtener productos de un cartón específico
  const getCartonProducts = (cartonNum: number): CartonProduct[] => {
    return cartonProducts[cartonNum] || [];
  };

  // Contar productos en un cartón
  const getCartonProductCount = (cartonNum: number): number => {
    return getCartonProducts(cartonNum).length;
  };

  // Verificar si un cartón puede generar etiqueta (tiene al menos 1 producto)
  const canGenerateLabel = (cartonNum: number): boolean => {
    return getCartonProductCount(cartonNum) >= 1;
  };

  // Agregar producto a un cartón
  const addProductToCarton = (cartonNum: number, productSku: string, quantity: number) => {
    const currentProducts = getCartonProducts(cartonNum);

    // Verificar límite de 10 productos por cartón
    if (currentProducts.length >= 10) {
      alert('Máximo 10 productos por cartón');
      return;
    }

    const product = order.items.find(i => i.productSku === productSku);
    if (!product) return;

    const pickedItem = pickedItems?.find(p => p.productSku === productSku);
    const maxQty = pickedItem?.pickedQuantity ?? product.requestedQuantity;

    // Verificar si el producto ya está en el cartón
    const existingIndex = currentProducts.findIndex(p => p.productSku === productSku);

    if (existingIndex >= 0) {
      // Actualizar cantidad
      const updated = [...currentProducts];
      updated[existingIndex].quantity += quantity;
      setCartonProducts(prev => ({ ...prev, [cartonNum]: updated }));
    } else {
      // Agregar nuevo producto
      setCartonProducts(prev => ({
        ...prev,
        [cartonNum]: [
          ...currentProducts,
          {
            productSku,
            productName: product.productName,
            quantity,
            maxQuantity: maxQty,
          },
        ],
      }));
    }
    setShowProductSelector(null);
  };

  // Quitar producto de un cartón
  const removeProductFromCarton = (cartonNum: number, productSku: string) => {
    const currentProducts = getCartonProducts(cartonNum);
    setCartonProducts(prev => ({
      ...prev,
      [cartonNum]: currentProducts.filter(p => p.productSku !== productSku),
    }));
  };

  // Actualizar cantidad de producto en un cartón
  const updateProductQuantity = (cartonNum: number, productSku: string, delta: number) => {
    const currentProducts = getCartonProducts(cartonNum);
    const productIndex = currentProducts.findIndex(p => p.productSku === productSku);

    if (productIndex < 0) return;

    const product = currentProducts[productIndex];
    const availableForProduct = availableProducts.find(p => p.productSku === productSku);
    const maxAvailable = (availableForProduct?.availableQuantity || 0) + product.quantity;

    const newQty = Math.max(1, Math.min(product.quantity + delta, maxAvailable));

    const updated = [...currentProducts];
    updated[productIndex] = { ...product, quantity: newQty };
    setCartonProducts(prev => ({ ...prev, [cartonNum]: updated }));
  };

  // Al cambiar número de cartones, limpiar asignaciones de cartones eliminados
  const handleCartonCountChange = (newCount: number) => {
    const validCount = Math.max(1, newCount);
    setCartonCount(validCount);

    // Limpiar cartones que ya no existen
    const newCartonProducts: Record<number, CartonProduct[]> = {};
    for (let i = 1; i <= validCount; i++) {
      if (cartonProducts[i]) {
        newCartonProducts[i] = cartonProducts[i];
      }
    }
    setCartonProducts(newCartonProducts);
    setGeneratedLabels(prev => prev.filter(n => n <= validCount));
  };

  // Generar datos del pedido para un cartón específico
  const getOrderForCarton = (cartonNum: number) => {
    const cartonItems = getCartonProducts(cartonNum);

    return {
      ...order,
      items: cartonItems.map(cp => {
        const originalItem = order.items.find(i => i.productSku === cp.productSku);
        return {
          productSku: cp.productSku,
          productName: cp.productName,
          requestedQuantity: cp.quantity,
          pickedQuantity: cp.quantity,
          locationCode: originalItem?.locationCode || '',
        };
      }),
    };
  };

  const handleGenerateLabel = (cartonNumber: number) => {
    if (!canGenerateLabel(cartonNumber)) {
      alert('Agrega al menos 1 producto al cartón antes de generar la etiqueta');
      return;
    }

    const orderForCarton = getOrderForCarton(cartonNumber);
    generateLabelFromOrder(orderForCarton, cartonNumber, cartonCount, replacementsUsed);
    setGeneratedLabels((prev) => [...prev, cartonNumber]);
  };

  const handleGenerateAllLabels = () => {
    // Verificar que todos los cartones tengan al menos 1 producto
    for (let i = 1; i <= cartonCount; i++) {
      if (!canGenerateLabel(i)) {
        alert(`El cartón ${i} necesita al menos 1 producto`);
        return;
      }
    }

    // Preparar datos de todos los cartones para un solo PDF multi-página
    const cartonsData: CartonData[] = [];
    for (let i = 1; i <= cartonCount; i++) {
      const products = getCartonProducts(i);
      cartonsData.push({
        cartonNumber: i,
        items: products.map(p => ({
          productSku: p.productSku,
          productName: p.productName,
          quantity: p.quantity,
        })),
      });
    }

    // Generar un solo PDF con todas las páginas
    generateMultiCartonPdf(order, cartonsData, replacementsUsed);
    setGeneratedLabels(Array.from({ length: cartonCount }, (_, i) => i + 1));
  };

  const handleFinalize = () => {
    // Guardar datos de cartones en sessionStorage para uso en confirmación
    const cartonsData: CartonData[] = [];
    for (let i = 1; i <= cartonCount; i++) {
      const products = getCartonProducts(i);
      if (products.length > 0) {
        cartonsData.push({
          cartonNumber: i,
          items: products.map(p => ({
            productSku: p.productSku,
            productName: p.productName,
            quantity: p.quantity,
          })),
        });
      }
    }

    sessionStorage.setItem(`cartons_${orderId}`, JSON.stringify({
      cartons: cartonsData,
      totalCartons: cartonCount,
      replacementsUsed,
    }));

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

      {/* Productos con reemplazos */}
      {Object.keys(replacementsUsed).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-semibold text-blue-800">Productos con reemplazo</p>
          </div>
          <div className="space-y-2">
            {Object.entries(replacementsUsed).map(([originalSku, replacement]) => {
              const originalItem = order.items.find(i => i.productSku === originalSku);
              return (
                <div key={originalSku} className="bg-white rounded-lg p-3 text-sm">
                  <p className="font-medium text-gray-900">{originalItem?.productName || originalSku}</p>
                  <div className="flex items-center gap-1 mt-1 text-blue-600">
                    <span className="text-xs">↳</span>
                    <span className="text-xs font-medium">+{replacement.qty} und de:</span>
                    <span className="text-xs">{replacement.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-1">{replacement.sku}</p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-blue-600 mt-3">
            ℹ️ Los reemplazos se mostrarán en las etiquetas generadas
          </p>
        </div>
      )}

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
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Número de cartones:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCartonCountChange(cartonCount - 1)}
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold active:scale-95"
            >
              -
            </button>
            <span className="w-8 text-center font-bold text-lg">{cartonCount}</span>
            <button
              onClick={() => handleCartonCountChange(cartonCount + 1)}
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Productos disponibles */}
        {!allProductsAssigned && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-700 font-medium mb-1">
              Productos por asignar: {availableProducts.length}
            </p>
            <p className="text-xs text-blue-600">
              {availableProducts.reduce((sum, p) => sum + p.availableQuantity, 0)} unidades restantes
            </p>
          </div>
        )}

        {allProductsAssigned && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-green-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Todos los productos asignados
            </p>
          </div>
        )}

        {/* Lista de cartones con asignación de productos */}
        <div className="space-y-3 mb-4">
          {Array.from({ length: cartonCount }, (_, i) => i + 1).map((cartonNum) => {
            const products = getCartonProducts(cartonNum);
            const isExpanded = expandedCarton === cartonNum;
            const productCount = products.length;
            const isGenerated = generatedLabels.includes(cartonNum);
            const canGenerate = canGenerateLabel(cartonNum) && canProceed;

            return (
              <div
                key={cartonNum}
                className={`border-2 rounded-xl overflow-hidden transition-all ${
                  isGenerated
                    ? 'border-green-400 bg-green-50'
                    : productCount > 0
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {/* Carton header */}
                <button
                  onClick={() => setExpandedCarton(isExpanded ? null : cartonNum)}
                  className="w-full px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                      isGenerated ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {isGenerated ? '✓' : cartonNum}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">
                        Cartón {cartonNum}/{cartonCount}
                      </p>
                      <p className="text-xs text-gray-500">
                        {productCount === 0
                          ? 'Sin productos'
                          : `${productCount} producto${productCount !== 1 ? 's' : ''} · ${products.reduce((s, p) => s + p.quantity, 0)} und.`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {productCount >= 10 && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Máx</span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Carton content (expanded) */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200">
                    {/* Lista de productos en el cartón */}
                    {products.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {products.map((product) => (
                          <div
                            key={product.productSku}
                            className="flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-100"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">
                                {product.productName}
                              </p>
                              <p className="text-xs text-gray-500 font-mono">
                                {product.productSku}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateProductQuantity(cartonNum, product.productSku, -1)}
                                className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-600 active:scale-95"
                                disabled={product.quantity <= 1}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-bold">
                                {product.quantity}
                              </span>
                              <button
                                onClick={() => updateProductQuantity(cartonNum, product.productSku, 1)}
                                className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-600 active:scale-95"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeProductFromCarton(cartonNum, product.productSku)}
                              className="w-7 h-7 rounded bg-red-100 flex items-center justify-center text-red-600 active:scale-95"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Botón para agregar producto */}
                    {productCount < 10 && availableProducts.length > 0 && (
                      <button
                        onClick={() => setShowProductSelector(cartonNum)}
                        className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Agregar producto</span>
                      </button>
                    )}

                    {/* Botón generar etiqueta */}
                    <button
                      onClick={() => handleGenerateLabel(cartonNum)}
                      disabled={!canGenerate}
                      className={`mt-3 w-full py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                        isGenerated
                          ? 'bg-green-500 text-white'
                          : canGenerate
                          ? 'bg-blue-500 text-white active:scale-[0.98]'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Printer className="w-4 h-4" />
                      {isGenerated ? 'Etiqueta generada' : 'Generar etiqueta'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Generate all labels button */}
        <Button
          onClick={handleGenerateAllLabels}
          disabled={!canProceed || !allProductsAssigned}
          fullWidth
        >
          <Printer className="w-5 h-5 mr-2" />
          GENERAR ETIQUETAS
        </Button>
      </div>

      {/* Modal selector de productos */}
      {showProductSelector !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center pb-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[70vh] overflow-hidden mx-4">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Agregar a Cartón {showProductSelector}
              </h3>
              <button
                onClick={() => setShowProductSelector(null)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(70vh-60px)]">
              {availableProducts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay productos disponibles
                </p>
              ) : (
                <div className="space-y-2">
                  {availableProducts.map((product) => (
                    <button
                      key={product.productSku}
                      onClick={() => addProductToCarton(showProductSelector, product.productSku, product.availableQuantity)}
                      className="w-full p-3 bg-gray-50 hover:bg-blue-50 rounded-lg text-left transition-colors border border-gray-200 hover:border-blue-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.productName}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            {product.productSku}
                          </p>
                        </div>
                        <div className="ml-3 text-right">
                          <p className="text-lg font-bold text-blue-600">
                            {product.availableQuantity}
                          </p>
                          <p className="text-xs text-gray-400">disponibles</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generated labels summary */}
      {generatedLabels.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
          <p className="text-sm text-green-700">
            ✓ {generatedLabels.length} de {cartonCount} etiquetas generadas
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1 text-center whitespace-normal break-words
             text-sm sm:text-base py-3" onClick={() => navigate(-1)}>
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
