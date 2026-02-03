import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Package, ScanBarcode, AlertTriangle, CheckCircle2, Bell, Minus, Plus, X } from 'lucide-react';
import Stepper from '../components/navigation/Stepper';
import Button from '../components/ui/Button';
import { QRScannerWrapper } from '../components/scanner/QRScannerWrapper';
import type { Order } from '../types';

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

const ProductScanning: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderState = location.state as {
    orderNumber?: string;
    supplier?: string;
    hasOrder?: boolean;
    reason?: string;
    order?: Order;
  } | null;

  // Extraer datos de orden que vienen de ReceptionStart o ReceptionList
  const order = orderState?.order;
  const hasOrder = orderState?.hasOrder === true || !!order;
  const orderNumber = order?.orderNumber || orderState?.orderNumber || '';
  const supplier = order?.supplier || orderState?.supplier || '';

  // Lista de productos a recibir
  // Inicializar lista de recepción con productos de la orden real
  const getInitialReceiptList = (): ReceiptItem[] => {
    if (!hasOrder || !order?.products) return [];
    return order.products.map((orderProduct) => {
      const product = orderProduct.product;
      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        image: product.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        category: product.category || 'Repuestos',
        location: product.location || '',
        expectedQuantity: orderProduct.quantity,
        confirmedQuantity: orderProduct.received || 0,
      };
    });
  };

  const [receiptList, setReceiptList] = useState<ReceiptItem[]>(getInitialReceiptList);
  const [showScanner, setShowScanner] = useState(false);

  // Estado para modal de confirmación de cantidad
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [quantityInput, setQuantityInput] = useState(0);

  // Estado para notificaciones de problema
  const [problemNotified, setProblemNotified] = useState<Record<string, boolean>>({});
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [problemItemSku, setProblemItemSku] = useState<string | null>(null);
  const [simulatedSku, setSimulatedSku] = useState<string>('');

  // Índice para simulación secuencial de escaneo (guarda el índice del último producto procesado)
  const lastProcessedIndexRef = useRef(-1);

  // Manejar escaneo de código de barras de producto
  const handleProductBarcodeScan = (barcode: string) => {
    let sku = barcode;
    if (barcode.startsWith('SS:P:')) {
      sku = barcode.substring(5);
    }

    // Buscar el producto en la lista por SKU
    const itemIndex = receiptList.findIndex(item => item.sku.toLowerCase() === sku.toLowerCase());

    if (itemIndex >= 0) {
      // Abrir modal de confirmación de cantidad
      setSelectedItemIndex(itemIndex);
      const item = receiptList[itemIndex];
      // Sugerir la cantidad restante por recibir
      const remaining = item.expectedQuantity - item.confirmedQuantity;
      setQuantityInput(remaining > 0 ? remaining : 1);
      setShowScanner(false);
      setShowQuantityModal(true);
    } else {
      alert(`Producto no encontrado en la orden: ${sku}`);
      setShowScanner(false);
    }
  };

  // Confirmar cantidad escaneada
  const handleConfirmQuantity = () => {
    if (selectedItemIndex === null) return;

    const updated = [...receiptList];
    updated[selectedItemIndex].confirmedQuantity += quantityInput;
    setReceiptList(updated);

    const item = updated[selectedItemIndex];
    const hasDiscrepancy = item.confirmedQuantity < item.expectedQuantity;

    // Guardar el índice del último producto procesado para el flujo secuencial
    lastProcessedIndexRef.current = selectedItemIndex;

    // Cerrar modal de cantidad
    setShowQuantityModal(false);
    setSelectedItemIndex(null);
    setQuantityInput(0);

    // Si hay discrepancia y no se ha notificado, mostrar opción de reportar
    if (hasDiscrepancy && !problemNotified[item.sku]) {
      setProblemItemSku(item.sku);
      setShowProblemModal(true);
    }
  };

  // Abrir modal para agregar más cantidad a un producto (botón manual en la tabla)
  const handleAddMoreQuantity = (index: number) => {
    setSelectedItemIndex(index);
    const item = receiptList[index];
    const remaining = item.expectedQuantity - item.confirmedQuantity;
    setQuantityInput(remaining > 0 ? remaining : 1);
    setShowQuantityModal(true);
  };

  // Cancelar modal de cantidad
  const handleCancelQuantityModal = () => {
    setShowQuantityModal(false);
    setSelectedItemIndex(null);
    setQuantityInput(0);
  };

  // Para simulación: obtener el siguiente SKU a escanear (secuencial)
  // Esta función se llama desde un event handler, no durante render
  const openScannerWithSimulatedSku = () => {
    // Buscar el siguiente producto después del último procesado que no tenga cantidad confirmada
    let nextSku = '';
    for (let i = lastProcessedIndexRef.current + 1; i < receiptList.length; i++) {
      const item = receiptList[i];
      if (item.confirmedQuantity === 0) {
        nextSku = item.sku;
        break;
      }
    }
    // Si no hay más productos sin confirmar, buscar desde el inicio
    if (!nextSku) {
      for (let i = 0; i < receiptList.length; i++) {
        const item = receiptList[i];
        if (item.confirmedQuantity === 0) {
          nextSku = item.sku;
          break;
        }
      }
    }
    // Si todos tienen algo confirmado, devolver el primero
    if (!nextSku) {
      nextSku = receiptList[0]?.sku || 'PRODUCTO';
    }
    setSimulatedSku(nextSku);
    setShowScanner(true);
  };

  // Notificar problema desde la tabla
  const handleNotifyProblemFromTable = (sku: string) => {
    setProblemItemSku(sku);
    setShowProblemModal(true);
  };

  // Confirmar notificación de problema
  const confirmProblemNotification = () => {
    if (problemItemSku) {
      setProblemNotified(prev => ({ ...prev, [problemItemSku]: true }));
    }
    setShowProblemModal(false);
    setProblemItemSku(null);
  };

  // Saltar notificación de problema (continuar sin reportar)
  const skipProblemNotification = () => {
    setShowProblemModal(false);
    setProblemItemSku(null);
  };

  const selectedItem = selectedItemIndex !== null ? receiptList[selectedItemIndex] : null;

  const totalProducts = receiptList.length;
  const totalConfirmed = receiptList.filter(item => item.confirmedQuantity >= item.expectedQuantity).length;
  const totalUnits = receiptList.reduce((sum, p) => sum + p.confirmedQuantity, 0);
  const totalExpected = receiptList.reduce((sum, p) => sum + p.expectedQuantity, 0);
  const canContinue = totalUnits > 0;
  const allComplete = totalConfirmed === totalProducts && totalProducts > 0;

  // Verificar si hay discrepancias no notificadas
  const hasUnreportedDiscrepancies = receiptList.some(item =>
    item.confirmedQuantity > 0 &&
    item.confirmedQuantity < item.expectedQuantity &&
    !problemNotified[item.sku]
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
          { label: 'Confirmar' },
        ]}
        currentStep={1}
      />

      {/* Content */}
      <div className="flex-1 p-4 pb-44 overflow-y-auto">
        {/* Botón de escaneo general */}
        {receiptList.length > 0 && !allComplete && (
          <div className="bg-white rounded-xl shadow-sm p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Escanear Productos</h3>
                <p className="text-xs text-gray-500">Escanea el código de barras del producto</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">{totalUnits}/{totalExpected}</p>
                <p className="text-xs text-gray-500">unidades</p>
              </div>
            </div>
            <button
              onClick={openScannerWithSimulatedSku}
              className="w-full py-3 bg-blue-500 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <ScanBarcode className="w-5 h-5 text-white" />
              <span className="text-white font-bold">ESCANEAR PRODUCTO</span>
            </button>
          </div>
        )}

        {/* Progress indicator */}
        {receiptList.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progreso de recepción</span>
              <span className="text-sm font-semibold text-gray-900">{totalConfirmed}/{totalProducts} productos</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${allComplete ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${(totalUnits / totalExpected) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Receipt List - Table Format con scroll horizontal en móvil */}
        {receiptList.length > 0 ? (
          <>
          <div className="overflow-x-auto rounded-xl shadow-sm -mx-4 px-4">
            <div className="min-w-[650px]">
              {/* Encabezado de tabla */}
              <div className="bg-gray-100 rounded-t-xl px-4 py-3 grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600">
                <div className="col-span-2">Ubicación</div>
                <div className="col-span-3">Código</div>
                <div className="col-span-3">Producto</div>
                <div className="col-span-1 text-center">Ped.</div>
                <div className="col-span-1 text-center">Conf.</div>
                <div className="col-span-2 text-center"></div>
              </div>

              <div className="bg-white rounded-b-xl overflow-hidden">
              {receiptList.map((item) => {
                const isComplete = item.confirmedQuantity >= item.expectedQuantity;
                const hasDiscrepancy = item.confirmedQuantity > 0 && item.confirmedQuantity < item.expectedQuantity;
                const isProblemNotified = problemNotified[item.sku];

                return (
                  <div
                    key={item.sku}
                    className={`grid grid-cols-12 gap-3 px-4 py-4 border-b border-gray-100 last:border-none items-center ${
                      isComplete ? 'bg-green-50' : hasDiscrepancy ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {/* Ubicación */}
                    <div className="col-span-2">
                      <span className="text-sm font-bold font-mono text-blue-600">{item.location}</span>
                    </div>

                    {/* Código */}
                    <div className="col-span-3">
                      <span className="text-xs font-mono text-gray-600 break-all leading-tight">{item.sku}</span>
                    </div>

                    {/* Nombre del Producto */}
                    <div className="col-span-3">
                      <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight">{item.name}</p>
                    </div>

                    {/* Cantidad Pedida */}
                    <div className="col-span-1 text-center">
                      <span className="text-base font-bold text-gray-500">
                        {item.expectedQuantity}
                      </span>
                    </div>

                    {/* Cantidad Confirmada */}
                    <div className="col-span-1 text-center">
                      <span className={`text-base font-bold ${isComplete ? 'text-green-600' : item.confirmedQuantity > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                        {item.confirmedQuantity}
                      </span>
                    </div>

                    {/* Estado/Acciones */}
                    <div className="col-span-2 flex items-center justify-center gap-2">
                      {isComplete ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <>
                          {/* Botón para agregar más cantidad */}
                          {item.confirmedQuantity > 0 && (
                            <button
                              onClick={() => handleAddMoreQuantity(receiptList.findIndex(r => r.sku === item.sku))}
                              className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center active:scale-95 transition-transform"
                              title="Agregar más cantidad"
                            >
                              <Plus className="w-4 h-4 text-blue-600" />
                            </button>
                          )}
                          {/* Botón de notificar problema */}
                          {hasDiscrepancy && !isProblemNotified && (
                            <button
                              onClick={() => handleNotifyProblemFromTable(item.sku)}
                              className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center active:scale-95 transition-transform"
                              title="Notificar problema"
                            >
                              <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            </button>
                          )}
                          {/* Indicador de problema notificado */}
                          {isProblemNotified && (
                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center" title="Problema notificado">
                              <Bell className="w-4 h-4 text-orange-500" />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            </div>
          </div>

          {/* Alerta global de discrepancias no reportadas */}
          {hasUnreportedDiscrepancies && (
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
            <p className="text-gray-500 font-medium mb-1">Sin productos para recibir</p>
            <p className="text-sm text-gray-400">No hay una orden de compra cargada</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 fixed bottom-0 left-0 right-0">
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="text-gray-600">
            {totalConfirmed}/{totalProducts} productos completos
          </span>
          {allComplete && (
            <span className="text-green-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Todo recibido
            </span>
          )}
        </div>
        <Button
          onClick={() => navigate('/reception/confirmation', {
            state: {
              orderNumber,
              supplier,
              products: receiptList.filter(item => item.confirmedQuantity > 0).map(item => ({
                name: item.name,
                sku: item.sku,
                quantity: item.confirmedQuantity,
                expectedQuantity: item.expectedQuantity,
                location: item.location,
                hasDiscrepancy: item.confirmedQuantity < item.expectedQuantity,
                problemNotified: problemNotified[item.sku] || false,
              })),
            },
          })}
          disabled={!canContinue}
          fullWidth
        >
          {allComplete ? 'CONTINUAR' : `CONTINUAR (${totalUnits} unidades recibidas)`}
        </Button>
      </div>

      {/* Barcode Scanner Modal for Products */}
      {showScanner && (
        <QRScannerWrapper
          onScan={handleProductBarcodeScan}
          onClose={() => setShowScanner(false)}
          title="Escanear Producto"
          subtitle="Escanea el código de barras del producto"
          expectedType="product"
          simulateValue={simulatedSku}
        />
      )}

      {/* Modal de Confirmación de Cantidad */}
      {showQuantityModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Confirmar Cantidad</h2>
                <p className="text-sm text-gray-500">{selectedItem.sku}</p>
              </div>
              <button
                onClick={handleCancelQuantityModal}
                className="w-8 h-8 flex items-center justify-center text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Producto info */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-12 h-12 rounded-lg bg-gray-100 object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{selectedItem.name}</p>
                <p className="text-xs text-gray-500">Ubicación: {selectedItem.location}</p>
              </div>
            </div>

            {/* Cantidad actual */}
            <div className="bg-blue-50 rounded-lg px-3 py-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Esperado:</span>
                <span className="font-bold text-gray-900">{selectedItem.expectedQuantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ya recibido:</span>
                <span className="font-bold text-blue-600">{selectedItem.confirmedQuantity}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-blue-200 mt-1 pt-1">
                <span className="text-gray-600">Faltante:</span>
                <span className="font-bold text-orange-600">{selectedItem.expectedQuantity - selectedItem.confirmedQuantity}</span>
              </div>
            </div>

            {/* Quantity Adjuster */}
            <p className="text-center text-gray-700 font-semibold mb-3">
              ¿Cuántas unidades recibiste?
            </p>

            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setQuantityInput(Math.max(1, quantityInput - 1))}
                className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              >
                <Minus className="w-5 h-5 text-gray-700" />
              </button>
              <div className="bg-blue-50 rounded-xl px-6 py-4 min-w-[100px] text-center">
                <span className="text-4xl font-bold text-gray-900">{quantityInput}</span>
              </div>
              <button
                onClick={() => setQuantityInput(quantityInput + 1)}
                className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Resumen */}
            <div className="bg-gray-50 rounded-lg px-4 py-3 mb-6">
              <p className="text-xs text-gray-500 mb-1">Después de confirmar:</p>
              <p className="text-sm font-semibold text-gray-900">
                {selectedItem.confirmedQuantity} + {quantityInput} ={' '}
                <span className={`${selectedItem.confirmedQuantity + quantityInput >= selectedItem.expectedQuantity ? 'text-green-600' : 'text-blue-600'}`}>
                  {selectedItem.confirmedQuantity + quantityInput} unidades recibidas
                </span>
              </p>
              {selectedItem.confirmedQuantity + quantityInput < selectedItem.expectedQuantity && (
                <p className="text-xs text-orange-600 mt-1">
                  Aún faltarían {selectedItem.expectedQuantity - (selectedItem.confirmedQuantity + quantityInput)} unidades
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleCancelQuantityModal}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmQuantity}
                disabled={quantityInput <= 0}
                className="flex-1"
              >
                CONFIRMAR
              </Button>
            </div>
          </div>
        </div>
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
                <h2 className="text-lg font-bold text-gray-900">Cantidad Incompleta</h2>
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
              ¿Deseas notificar al supervisor sobre esta discrepancia?
            </p>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={skipProblemNotification}
                className="flex-1"
              >
                Omitir
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