import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Minus, Trash2, Package, X, ScanBarcode, AlertTriangle, CheckCircle2, Bell } from 'lucide-react';
import Stepper from '../components/navigation/Stepper';
import Button from '../components/ui/Button';
import { QRScannerWrapper } from '../components/scanner/QRScannerWrapper';
import { mockProducts } from '../data/mockData';
import type { Product } from '../data/mockData';

interface ReceiptItem {
  id: string;
  sku: string;
  name: string;
  image: string;
  category: string;
  location: string;
  expectedQuantity: number;
  confirmedQuantity: number;
}

// Ubicaciones sugeridas por producto (mock)
const productLocations: Record<string, string> = {
  'REP-12345': 'Z01-Pa-E2-N1',
  'REP-98765': 'Z01-Pa-E2-N2',
  'REP-55555': 'Z01-Pb-E1-N1',
  'REP-11111': 'Z01-Pa-E1-N1',
  'REP-22222': 'Z01-Pa-E1-N2',
  'REP-33333': 'Z03-Pa-E1-N1',
  'REP-44444': 'Z02-Pa-E1-N2',
  'REP-66666': 'Z02-Pb-E3-N2',
  'REP-77777': 'Z02-Pa-E1-N1',
  'REP-88888': 'Z02-Pc-E2-N1',
};

// Mock de productos esperados en una orden de compra (para saber cantidad esperada)
const mockOrderExpectedProducts: Record<string, { expectedQty: number; location: string }> = {
  'REP-12345': { expectedQty: 9, location: 'Z01-Pa-E2-N1' },
  'REP-98765': { expectedQty: 9, location: 'Z01-Pa-E2-N2' },
  'REP-55555': { expectedQty: 4, location: 'Z01-Pb-E1-N1' },
  'REP-11111': { expectedQty: 8, location: 'Z01-Pa-E1-N1' },
  'REP-44444': { expectedQty: 7, location: 'Z02-Pa-E1-N2' },
  'REP-77777': { expectedQty: 2, location: 'Z02-Pa-E1-N1' },
  'REP-33333': { expectedQty: 5, location: 'Z03-Pa-E1-N1' },
};

const ProductScanning: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderState = location.state as {
    orderNumber?: string;
    supplier?: string;
    hasOrder?: boolean;
    reason?: string;
    order?: { orderNumber: string; supplier: string }
  } | null;

  // Extraer datos de orden que vienen de ReceptionStart
  const hasOrder = orderState?.hasOrder !== false && (orderState?.order || orderState?.orderNumber);
  const orderNumber = orderState?.order?.orderNumber || orderState?.orderNumber || '';
  const supplier = orderState?.order?.supplier || orderState?.supplier || '';

  // Lista de productos recibidos (se agregan uno a uno)
  const [receiptList, setReceiptList] = useState<ReceiptItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityInput, setQuantityInput] = useState('1');
  const [showScanner, setShowScanner] = useState(false);

  // Estado para notificaciones de problema
  const [problemNotified, setProblemNotified] = useState<Record<string, boolean>>({});
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [problemItemSku, setProblemItemSku] = useState<string | null>(null);

  // Filtrar productos por búsqueda
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return mockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Seleccionar producto de los resultados
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchQuery('');
    setQuantityInput('1');
  };

  // Manejar escaneo de código de barras
  const handleBarcodeScan = (barcode: string) => {
    let sku = barcode;
    if (barcode.startsWith('SS:P:')) {
      sku = barcode.substring(5);
    }

    const product = mockProducts.find(p => p.sku.toLowerCase() === sku.toLowerCase());

    if (product) {
      // Agregar directamente 1 unidad al escanear
      addProductToReceipt(product, 1);
      setShowScanner(false);
    } else {
      alert(`Producto no encontrado: ${sku}`);
      setShowScanner(false);
    }
  };

  // Función para agregar producto a la lista
  const addProductToReceipt = (product: Product, qty: number) => {
    const existingIndex = receiptList.findIndex((item) => item.sku === product.sku);

    // Obtener cantidad esperada si hay orden
    const orderExpected = hasOrder ? mockOrderExpectedProducts[product.sku] : null;
    const expectedQty = orderExpected?.expectedQty || 0;
    const suggestedLocation = orderExpected?.location || productLocations[product.sku] || 'Z01-Pa-E1-N1';

    if (existingIndex >= 0) {
      // Si ya está en la lista, sumar cantidad
      const updated = [...receiptList];
      updated[existingIndex].confirmedQuantity += qty;
      setReceiptList(updated);
    } else {
      // Agregar nuevo producto
      setReceiptList([
        ...receiptList,
        {
          id: product.id,
          sku: product.sku,
          name: product.name,
          image: product.thumbnailImage,
          category: product.category.name,
          location: suggestedLocation,
          expectedQuantity: expectedQty,
          confirmedQuantity: qty,
        },
      ]);
    }
  };

  // Agregar producto desde el buscador
  const handleAddToReceipt = () => {
    if (!selectedProduct) return;
    const qty = parseInt(quantityInput) || 1;
    addProductToReceipt(selectedProduct, qty);

    // Limpiar selección
    setSelectedProduct(null);
    setQuantityInput('1');
    setShowSearch(false);
  };

  const updateConfirmedQuantity = (index: number, delta: number) => {
    const updated = [...receiptList];
    const newQuantity = updated[index].confirmedQuantity + delta;
    if (newQuantity > 0) {
      updated[index].confirmedQuantity = newQuantity;
      setReceiptList(updated);
    }
  };

  const removeProduct = (index: number) => {
    setReceiptList(receiptList.filter((_, i) => i !== index));
  };

  // Notificar problema
  const handleNotifyProblem = (sku: string) => {
    setProblemItemSku(sku);
    setShowProblemModal(true);
  };

  const confirmProblemNotification = () => {
    if (problemItemSku) {
      setProblemNotified(prev => ({ ...prev, [problemItemSku]: true }));
    }
    setShowProblemModal(false);
    setProblemItemSku(null);
  };

  const totalProducts = receiptList.length;
  const totalUnits = receiptList.reduce((sum, p) => sum + p.confirmedQuantity, 0);
  const canContinue = receiptList.length > 0;

  // Verificar si hay discrepancias
  const hasDiscrepancies = receiptList.some(item =>
    item.expectedQuantity > 0 && item.confirmedQuantity < item.expectedQuantity
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900">Lista de Recibo</h1>
          {orderNumber && (
            <p className="text-xs text-gray-500">{orderNumber}</p>
          )}
        </div>
        <div className="w-10" />
      </div>

      {/* Stepper */}
      <Stepper
        steps={[
          { label: 'Inicio' },
          { label: 'Recibo' },
          { label: 'Ubicación' },
          { label: 'Confirmar' },
        ]}
        currentStep={1}
      />

      {/* Content */}
      <div className="flex-1 p-4 pb-44 overflow-y-auto">
        {/* Search Zone */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar producto por nombre o SKU..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearch(true);
                  setSelectedProduct(null);
                }}
                onFocus={() => setShowSearch(true)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedProduct(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Botón de escaneo de código de barras */}
            <button
              onClick={() => setShowScanner(true)}
              className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center active:scale-95 transition-transform flex-shrink-0"
              title="Escanear código de barras"
            >
              <ScanBarcode className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Search Results */}
          {showSearch && searchQuery && searchResults.length > 0 && !selectedProduct && (
            <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              {searchResults.map((product) => {
                const existingItem = receiptList.find((item) => item.sku === product.sku);
                const orderExpected = hasOrder ? mockOrderExpectedProducts[product.sku] : null;
                return (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full px-4 py-3 flex items-center gap-3 border-b border-gray-100 last:border-none hover:bg-gray-50 active:bg-gray-100 text-left"
                  >
                    <img
                      src={product.thumbnailImage}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg bg-gray-100 object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
                      <p className="text-xs text-gray-400">{product.category.name}</p>
                    </div>
                    {existingItem ? (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex-shrink-0">
                        {existingItem.confirmedQuantity} en lista
                      </span>
                    ) : orderExpected ? (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex-shrink-0">
                        Esperado: {orderExpected.expectedQty}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {showSearch && searchQuery && searchResults.length === 0 && !selectedProduct && (
            <div className="mt-2 p-4 text-center text-gray-500 text-sm">
              No se encontraron productos para "{searchQuery}"
            </div>
          )}

          {/* Selected Product - Quantity Input */}
          {selectedProduct && (
            <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={selectedProduct.thumbnailImage}
                  alt={selectedProduct.name}
                  className="w-14 h-14 rounded-lg bg-gray-100 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{selectedProduct.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{selectedProduct.sku}</p>
                  <p className="text-xs text-gray-400">{selectedProduct.category.name}</p>
                  {hasOrder && mockOrderExpectedProducts[selectedProduct.sku] && (
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      Esperado en orden: {mockOrderExpectedProducts[selectedProduct.sku].expectedQty}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Cantidad recibida:</label>
                <div className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() => setQuantityInput(String(Math.max(1, (parseInt(quantityInput) || 1) - 1)))}
                    className="w-10 h-10 rounded-lg bg-white border border-gray-300 flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Minus className="w-4 h-4 text-gray-700" />
                  </button>
                  <input
                    type="number"
                    value={quantityInput}
                    onChange={(e) => setQuantityInput(e.target.value)}
                    min="1"
                    className="w-20 text-center py-2 border border-gray-300 rounded-lg text-lg font-bold focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantityInput(String((parseInt(quantityInput) || 0) + 1))}
                    className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToReceipt}
                className="w-full mt-4 py-3 bg-blue-500 text-white font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                AGREGAR A LISTA
              </button>
            </div>
          )}
        </div>

        {/* Receipt List - Table Format */}
        {receiptList.length > 0 ? (
          <>
            {/* Encabezado de tabla */}
            <div className="bg-gray-100 rounded-t-xl px-3 py-2 grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600">
              <div className="col-span-2">Ubicación</div>
              <div className="col-span-2">Código</div>
              <div className="col-span-3">Producto</div>
              <div className="col-span-1 text-center">Pedido</div>
              <div className="col-span-1 text-center">Conf.</div>
              <div className="col-span-3 text-center">Acciones</div>
            </div>

            <div className="bg-white rounded-b-xl shadow-sm overflow-hidden">
              {receiptList.map((item, index) => {
                const isComplete = item.expectedQuantity > 0 && item.confirmedQuantity >= item.expectedQuantity;
                const hasDiscrepancy = item.expectedQuantity > 0 && item.confirmedQuantity < item.expectedQuantity;
                const isProblemNotified = problemNotified[item.sku];

                return (
                  <div
                    key={item.sku}
                    className={`grid grid-cols-12 gap-2 px-3 py-3 border-b border-gray-100 last:border-none items-center ${
                      isComplete ? 'bg-green-50' : hasDiscrepancy ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {/* Ubicación */}
                    <div className="col-span-2">
                      <span className="text-xs font-bold font-mono text-blue-600 break-all">{item.location}</span>
                    </div>

                    {/* Código */}
                    <div className="col-span-2">
                      <span className="text-xs font-mono text-gray-600 break-all">{item.sku}</span>
                    </div>

                    {/* Nombre del Producto */}
                    <div className="col-span-3">
                      <p className="text-xs font-medium text-gray-900 line-clamp-2">{item.name}</p>
                    </div>

                    {/* Cantidad Pedida */}
                    <div className="col-span-1 text-center">
                      <span className="text-sm font-bold text-gray-500">
                        {item.expectedQuantity > 0 ? item.expectedQuantity : '-'}
                      </span>
                    </div>

                    {/* Cantidad Confirmada */}
                    <div className="col-span-1 text-center">
                      <span className={`text-sm font-bold ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
                        {item.confirmedQuantity}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="col-span-3 flex items-center justify-center gap-1">
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <>
                          <button
                            onClick={() => updateConfirmedQuantity(index, -1)}
                            className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                          >
                            <Minus className="w-3 h-3 text-gray-700" />
                          </button>
                          <button
                            onClick={() => updateConfirmedQuantity(index, 1)}
                            className="w-7 h-7 rounded bg-blue-500 flex items-center justify-center active:scale-95 transition-transform"
                          >
                            <Plus className="w-3 h-3 text-white" />
                          </button>
                        </>
                      )}

                      {/* Botón de notificar problema (solo si hay discrepancia) */}
                      {hasDiscrepancy && !isProblemNotified && (
                        <button
                          onClick={() => handleNotifyProblem(item.sku)}
                          className="w-7 h-7 rounded bg-yellow-100 flex items-center justify-center active:scale-95 transition-transform"
                          title="Notificar problema"
                        >
                          <AlertTriangle className="w-3 h-3 text-yellow-600" />
                        </button>
                      )}

                      {/* Indicador de problema notificado */}
                      {isProblemNotified && (
                        <div className="w-7 h-7 rounded bg-orange-100 flex items-center justify-center" title="Problema notificado">
                          <Bell className="w-3 h-3 text-orange-500" />
                        </div>
                      )}

                      <button
                        onClick={() => removeProduct(index)}
                        className="w-7 h-7 flex items-center justify-center text-red-500 active:scale-95 transition-transform"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alerta global de discrepancias */}
            {hasDiscrepancies && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-800">Hay productos con cantidad menor a la esperada</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Usa el botón <AlertTriangle className="w-3 h-3 inline text-yellow-600" /> en cada producto para notificar el problema antes de continuar.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium mb-1">Lista de recibo vacía</p>
            <p className="text-sm text-gray-400">Escanea o busca los productos para agregarlos</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 fixed bottom-0 left-0 right-0">
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="text-gray-600">
            {totalProducts} productos | {totalUnits} unidades
          </span>
        </div>
        <Button
          onClick={() => navigate('/reception/location-assignment', {
            state: {
              receiptList: receiptList.map(item => ({
                id: item.id,
                sku: item.sku,
                name: item.name,
                image: item.image,
                category: item.category,
                quantity: item.confirmedQuantity,
              })),
              orderNumber,
              supplier,
            },
          })}
          disabled={!canContinue}
          fullWidth
        >
          CONTINUAR
        </Button>
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <QRScannerWrapper
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
          title="Escanear Código de Barras"
          subtitle="Escanea el código del producto"
          expectedType="product"
          simulateValue={mockProducts[0]?.sku || 'REP-12345'}
        />
      )}

      {/* Modal de Notificar Problema */}
      {showProblemModal && problemItemSku && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Notificar Problema</h2>
                <p className="text-sm text-gray-500">{problemItemSku}</p>
              </div>
            </div>

            {(() => {
              const item = receiptList.find(i => i.sku === problemItemSku);
              if (!item) return null;
              return (
                <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>{item.name}</strong>
                  </p>
                  <p className="text-sm text-yellow-800 mt-2">
                    Cantidad esperada: <strong>{item.expectedQuantity}</strong>
                  </p>
                  <p className="text-sm text-yellow-800">
                    Cantidad recibida: <strong>{item.confirmedQuantity}</strong>
                  </p>
                  <p className="text-sm text-red-600 font-semibold mt-1">
                    Faltante: {item.expectedQuantity - item.confirmedQuantity} unidades
                  </p>
                </div>
              );
            })()}

            <p className="text-sm text-gray-600 mb-4">
              Se notificará al supervisor sobre esta discrepancia en la recepción.
            </p>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowProblemModal(false);
                  setProblemItemSku(null);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmProblemNotification}
                className="flex-1 !bg-yellow-500 hover:!bg-yellow-600"
              >
                <Bell className="w-4 h-4 mr-2" />
                NOTIFICAR
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductScanning;
