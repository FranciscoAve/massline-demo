import React, { useState, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, ScanBarcode, Minus, Plus, CheckCircle2, Package, X, AlertTriangle, Bell, RefreshCw } from 'lucide-react';
import { QRScannerWrapper } from '../components/scanner/QRScannerWrapper';
import Button from '../components/ui/Button';
import { mockOrders, type PickingItem } from '../data/mockData';

// Inventario mock por ubicación (simula lo almacenado en recepción)
interface ShelfProduct {
  sku: string;
  name: string;
  image: string;
  availableQuantity: number;
}

// Inventario por ubicación con formato: Fila-Columna-Nivel (ej: 05-B-00)
const mockShelfInventory: Record<string, ShelfProduct[]> = {
  // Fila 05
  '05-B-00': [
    { sku: 'RE-R250-H10313', name: 'Direccional Delantera LH', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100', availableQuantity: 50 },
  ],
  '05-B-08': [
    { sku: 'RE-R250-I10312', name: 'Direccional Delantera RH', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 30 },
  ],
  // Fila 08
  '08-D-01': [
    { sku: 'RE-R250-I10504', name: 'Comando Derecho Chief 4V Ninja 2.5/3.0', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 3 },
  ],
  // Fila 11
  '11-F-04': [
    { sku: 'RE-R250-I0709', name: 'Estribo de Conductor C/Pedales Izq./Der.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 28 },
  ],
  // Fila 12
  '12-B-03': [
    { sku: 'RE-R250-K20415', name: 'Disco de Freno Ventilado', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 22 },
  ],
  // Fila 14
  '14-C-02': [
    { sku: 'RE-R250-L40820', name: 'Aceite Motor 10W-40 Sintético', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 120 },
  ],
  // Fila 17
  '17-E-01': [
    { sku: 'RE-RNJ-250302', name: 'Cañería del Enfriador de Aceite Set 2pcs', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 67 },
  ],
  // Fila 18
  '18-C-06': [
    { sku: 'RE-RNJ-110237', name: 'Piñón de Velocímetro Chief II', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 15 },
  ],
  // Fila 23
  '23-A-01': [
    { sku: 'RE-RNJ-330501', name: 'Batería 12V 7Ah', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 35 },
    { sku: 'RE-R200-142125', name: 'Asiento Delantero & Posterior Set Chief II', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 8 },
  ],
};

// Mapa de reemplazos de productos (simulación de algoritmo de concordancia)
// Cada producto tiene un reemplazo "similar" - en producción sería un algoritmo real
interface ProductReplacement {
  sku: string;
  name: string;
  location: string;
}

const productReplacements: Record<string, ProductReplacement> = {
  'RE-R250-H10313': { sku: 'RE-R250-I10312', name: 'Direccional Delantera RH', location: '05-B-08' },
  'RE-R250-I10312': { sku: 'RE-R250-H10313', name: 'Direccional Delantera LH', location: '05-B-00' },
  'RE-R250-I10504': { sku: 'RE-R250-I0709', name: 'Estribo de Conductor C/Pedales', location: '11-F-04' },
  'RE-R250-I0709': { sku: 'RE-R250-I10504', name: 'Comando Derecho Chief 4V', location: '08-D-01' },
  'RE-RNJ-250302': { sku: 'RE-R250-L40820', name: 'Aceite Motor 10W-40 Sintético', location: '14-C-02' },
  'RE-RNJ-110237': { sku: 'RE-R250-K20415', name: 'Disco de Freno Ventilado', location: '12-B-03' },
  'RE-R200-142125': { sku: 'RE-RNJ-330501', name: 'Batería 12V 7Ah', location: '23-A-01' },
  'RE-R250-K20415': { sku: 'RE-RNJ-110237', name: 'Piñón de Velocímetro Chief II', location: '18-C-06' },
  'RE-RNJ-330501': { sku: 'RE-R200-142125', name: 'Asiento Delantero & Posterior Set', location: '23-A-01' },
  'RE-R250-L40820': { sku: 'RE-RNJ-250302', name: 'Cañería del Enfriador de Aceite', location: '17-E-01' },
};

// Parsear ubicación para ordenar (formato: Fila-Columna-Nivel)
const parseLocation = (loc: string) => {
  const parts = loc.split('-');
  return {
    fila: parseInt(parts[0] || '0'),
    columna: parts[1] || '',
    nivel: parseInt(parts[2] || '0'),
  };
};


const PickingProcess: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const order = mockOrders.find(o => o.id === orderId);

  const [items, setItems] = useState<PickingItem[]>(order?.items || []);
  const [shelfInventory, setShelfInventory] = useState(mockShelfInventory);
  const [stockAlertSent, setStockAlertSent] = useState<Record<string, boolean>>({});

  // Estado para escaneo
  const [showScanner, setShowScanner] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [simulatedLocation, setSimulatedLocation] = useState<string>('');

  // Índice para simulación secuencial de escaneo
  const lastProcessedIndexRef = useRef(-1);

  // Estado para reemplazos y notificaciones
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [replacementInfo, setReplacementInfo] = useState<{
    originalSku: string;
    originalName: string;
    requestedQty: number;
    originalStock: number;
    replacement: ProductReplacement | null;
    replacementStock: number;
  } | null>(null);
  const [originalQtyToUse, setOriginalQtyToUse] = useState(0);
  const [replacementQtyToUse, setReplacementQtyToUse] = useState(0);
  const [replacementsUsed, setReplacementsUsed] = useState<Record<string, { sku: string; name: string; qty: number }>>({});

  // Ordenar items por ubicación (debe estar antes del return condicional)
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const locA = parseLocation(a.locationCode);
      const locB = parseLocation(b.locationCode);

      if (locA.fila !== locB.fila) return locA.fila - locB.fila;
      if (locA.columna !== locB.columna) return locA.columna.localeCompare(locB.columna);
      return locA.nivel - locB.nivel;
    });
  }, [items]);

  const completedItems = items.filter(item => item.status === 'picked').length;
  const allCompleted = completedItems === items.length;

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Orden no encontrada</div>;
  }

  // Obtener stock disponible para un item
  const getAvailableStock = (item: PickingItem) => {
    const productsOnShelf = shelfInventory[item.locationCode] || [];
    const product = productsOnShelf.find(p => p.sku === item.productSku);
    return product?.availableQuantity ?? 0;
  };

  // Abrir escáner general con ubicación simulada secuencial
  const openScannerWithSimulatedLocation = () => {
    // Buscar el siguiente producto pendiente después del último procesado
    let nextLocation = '';

    for (let i = lastProcessedIndexRef.current + 1; i < sortedItems.length; i++) {
      const item = sortedItems[i];
      if (item.status !== 'picked') {
        nextLocation = item.locationCode;
        break;
      }
    }

    // Si no hay más productos pendientes después, buscar desde el inicio
    if (!nextLocation) {
      for (let i = 0; i < sortedItems.length; i++) {
        const item = sortedItems[i];
        if (item.status !== 'picked') {
          nextLocation = item.locationCode;
          break;
        }
      }
    }

    // Si todos están completados, usar el primero
    if (!nextLocation) {
      nextLocation = sortedItems[0]?.locationCode || 'UBICACION';
    }

    setSimulatedLocation(nextLocation);
    setShowScanner(true);
  };

  // Procesar resultado del escaneo
  const handleScanResult = (qrCode: string) => {
    let locationCode = qrCode;
    if (qrCode.startsWith('SS:L:')) {
      locationCode = qrCode.substring(5);
    }

    // Buscar el producto que corresponde a esta ubicación (que no esté completado)
    const itemIndex = sortedItems.findIndex(
      item => item.locationCode === locationCode && item.status !== 'picked'
    );

    if (itemIndex === -1) {
      // Verificar si la ubicación existe pero el producto ya está completado
      const completedItem = sortedItems.find(item => item.locationCode === locationCode);
      if (completedItem) {
        alert(`El producto en ${locationCode} ya fue recolectado.`);
      } else {
        alert(`No hay productos pendientes en la ubicación: ${locationCode}`);
      }
      setShowScanner(false);
      return;
    }

    const item = sortedItems[itemIndex];

    // Cerrar escáner y abrir modal de cantidad
    setShowScanner(false);
    setSelectedItemIndex(itemIndex);
    const availableStock = getAvailableStock(item);
    setQuantity(Math.min(item.requestedQuantity, availableStock));
    setShowQuantityModal(true);
  };

  // Confirmar cantidad y marcar como recolectado
  const handleConfirmQuantity = () => {
    if (selectedItemIndex === null) return;

    const item = sortedItems[selectedItemIndex];

    // Encontrar el índice real en el array original
    const originalIndex = items.findIndex(i => i.productSku === item.productSku && i.locationCode === item.locationCode);
    if (originalIndex === -1) return;

    // Actualizar item como recolectado
    const updatedItems = [...items];
    updatedItems[originalIndex] = {
      ...items[originalIndex],
      status: 'picked',
      pickedQuantity: quantity,
    };
    setItems(updatedItems);

    // Restar cantidad del inventario del estante
    const updatedInventory = { ...shelfInventory };
    const locationProducts = [...(updatedInventory[item.locationCode] || [])];
    const productIndex = locationProducts.findIndex(p => p.sku === item.productSku);
    if (productIndex >= 0) {
      locationProducts[productIndex] = {
        ...locationProducts[productIndex],
        availableQuantity: locationProducts[productIndex].availableQuantity - quantity,
      };
      updatedInventory[item.locationCode] = locationProducts;
      setShelfInventory(updatedInventory);
    }

    // Guardar índice del último procesado para el flujo secuencial
    lastProcessedIndexRef.current = selectedItemIndex;

    // Cerrar modal
    setShowQuantityModal(false);
    setSelectedItemIndex(null);
    setQuantity(0);
  };

  const handleCancelModal = () => {
    setShowQuantityModal(false);
    setShowReplacementModal(false);
    setSelectedItemIndex(null);
    setQuantity(0);
    setShowScanner(false);
    setReplacementInfo(null);
  };

  // Obtener stock de un producto por SKU (busca en todo el inventario)
  const getStockBySku = (sku: string): number => {
    for (const locationProducts of Object.values(shelfInventory)) {
      const product = locationProducts.find(p => p.sku === sku);
      if (product) return product.availableQuantity;
    }
    return 0;
  };

  // Buscar reemplazo disponible (cadena de reemplazos)
  const findAvailableReplacement = (originalSku: string, visited: Set<string> = new Set()): { replacement: ProductReplacement; stock: number } | null => {
    if (visited.has(originalSku)) return null;
    visited.add(originalSku);

    const replacement = productReplacements[originalSku];
    if (!replacement) return null;

    const stock = getStockBySku(replacement.sku);
    if (stock > 0) {
      return { replacement, stock };
    }

    // Buscar en la cadena de reemplazos
    return findAvailableReplacement(replacement.sku, visited);
  };

  // Iniciar proceso de reemplazo
  const handleStartReplacement = () => {
    if (selectedItemIndex === null) return;
    const item = sortedItems[selectedItemIndex];
    const availableStock = getAvailableStock(item);

    const replacementResult = findAvailableReplacement(item.productSku);
    const replacementStock = replacementResult?.stock || 0;

    // Calcular valores iniciales: usar todo el stock original + lo que falta del reemplazo
    const missingQty = item.requestedQuantity - availableStock;
    const initialReplacementQty = Math.min(missingQty, replacementStock);

    setOriginalQtyToUse(availableStock);
    setReplacementQtyToUse(initialReplacementQty);

    setReplacementInfo({
      originalSku: item.productSku,
      originalName: item.productName,
      requestedQty: item.requestedQuantity,
      originalStock: availableStock,
      replacement: replacementResult?.replacement || null,
      replacementStock: replacementStock,
    });
    setShowReplacementModal(true);
  };

  // Confirmar reemplazo con cantidades flexibles
  const handleConfirmReplacement = (qtyToReplace: number) => {
    if (!replacementInfo || !replacementInfo.replacement || selectedItemIndex === null) return;

    const item = sortedItems[selectedItemIndex];
    const originalIndex = items.findIndex(i => i.productSku === item.productSku && i.locationCode === item.locationCode);
    if (originalIndex === -1) return;

    // Guardar info de reemplazo usado (solo si se usa reemplazo)
    if (qtyToReplace > 0) {
      setReplacementsUsed(prev => ({
        ...prev,
        [item.productSku]: {
          sku: replacementInfo.replacement!.sku,
          name: replacementInfo.replacement!.name,
          qty: qtyToReplace,
        },
      }));
    }

    // Actualizar item con cantidad original + reemplazo (usando valores del estado)
    const updatedItems = [...items];
    updatedItems[originalIndex] = {
      ...items[originalIndex],
      status: 'picked',
      pickedQuantity: originalQtyToUse + qtyToReplace, // cantidad original seleccionada + reemplazo
    };
    setItems(updatedItems);

    // Restar del inventario original (solo la cantidad seleccionada)
    const updatedInventory = { ...shelfInventory };
    const locationProducts = [...(updatedInventory[item.locationCode] || [])];
    const productIndex = locationProducts.findIndex(p => p.sku === item.productSku);
    if (productIndex >= 0) {
      locationProducts[productIndex] = {
        ...locationProducts[productIndex],
        availableQuantity: locationProducts[productIndex].availableQuantity - originalQtyToUse,
      };
      updatedInventory[item.locationCode] = locationProducts;
    }

    // Restar del inventario del reemplazo (solo si se usa)
    if (qtyToReplace > 0) {
      const replacementLocation = replacementInfo.replacement.location;
      const replacementProducts = [...(updatedInventory[replacementLocation] || [])];
      const replacementProductIndex = replacementProducts.findIndex(p => p.sku === replacementInfo.replacement!.sku);
      if (replacementProductIndex >= 0) {
        replacementProducts[replacementProductIndex] = {
          ...replacementProducts[replacementProductIndex],
          availableQuantity: replacementProducts[replacementProductIndex].availableQuantity - qtyToReplace,
        };
        updatedInventory[replacementLocation] = replacementProducts;
      }
    }

    setShelfInventory(updatedInventory);

    // Cerrar modales y limpiar estado
    setShowQuantityModal(false);
    setShowReplacementModal(false);
    setSelectedItemIndex(null);
    setQuantity(0);
    setReplacementInfo(null);
    setOriginalQtyToUse(0);
    setReplacementQtyToUse(0);
  };

  const selectedItem = selectedItemIndex !== null ? sortedItems[selectedItemIndex] : null;
  const selectedAvailableStock = selectedItem ? getAvailableStock(selectedItem) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-base font-bold text-gray-900">#{order.orderNumber}</h1>
            <p className="text-xs text-gray-500">{order.destination.name}</p>
          </div>
          <div className="w-10" />
        </div>

        {/* Progress bar */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(completedItems / items.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 font-medium">
            {completedItems}/{items.length}
          </span>
        </div>
      </div>

      {/* Lista de productos ordenada por ubicación */}
      <div className="flex-1 p-4 pb-28 overflow-y-auto">
        {/* Botón de escaneo general */}
        {sortedItems.length > 0 && !allCompleted && (
          <div className="bg-white rounded-xl shadow-sm p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Escanear Estantería</h3>
                <p className="text-xs text-gray-500">Escanea la ubicación del siguiente producto</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">{completedItems}/{items.length}</p>
                <p className="text-xs text-gray-500">productos</p>
              </div>
            </div>
            <button
              onClick={openScannerWithSimulatedLocation}
              className="w-full py-3 bg-blue-500 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <ScanBarcode className="w-5 h-5 text-white" />
              <span className="text-white font-bold">ESCANEAR UBICACIÓN</span>
            </button>
          </div>
        )}

        {/* Contenedor con scroll horizontal para móvil */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="min-w-[600px]">
            {/* Encabezado de tabla */}
            <div className="bg-gray-100 rounded-t-xl px-4 py-3 grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600">
              <div className="col-span-2">Ubicación</div>
              <div className="col-span-3">Código</div>
              <div className="col-span-4">Producto</div>
              <div className="col-span-1 text-center">Ped.</div>
              <div className="col-span-1 text-center">Conf.</div>
              <div className="col-span-1 text-center"></div>
            </div>

            <div className="bg-white rounded-b-xl shadow-sm overflow-hidden">
          {sortedItems.map((item) => {
            const availableStock = getAvailableStock(item);
            const isPicked = item.status === 'picked';
            const hasStockIssue = availableStock < item.requestedQuantity;
            const hasReplacement = replacementsUsed[item.productSku];

            return (
              <div
                key={`${item.productSku}-${item.locationCode}`}
                className={`grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-100 last:border-none items-center ${
                  isPicked ? (hasReplacement ? 'bg-blue-50' : 'bg-green-50') : hasStockIssue ? 'bg-yellow-50' : ''
                }`}
              >
                {/* Ubicación */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1">
                    <MapPin className={`w-4 h-4 flex-shrink-0 ${isPicked ? 'text-green-600' : 'text-blue-500'}`} />
                    <span className="text-sm font-bold font-mono text-blue-600">{item.locationCode}</span>
                  </div>
                </div>

                {/* Código */}
                <div className="col-span-3">
                  <span className="text-xs font-mono text-gray-600 break-all leading-tight">{item.productSku}</span>
                </div>

                {/* Nombre del Producto */}
                <div className="col-span-4">
                  <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight">{item.productName}</p>
                  {hasStockIssue && !isPicked && (
                    <div className="flex items-center gap-1 text-xs text-yellow-700 mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Stock bajo ({availableStock})</span>
                    </div>
                  )}
                  {hasReplacement && isPicked && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                      <RefreshCw className="w-3 h-3" />
                      <span>+{hasReplacement.qty} de {hasReplacement.sku.slice(-6)}</span>
                    </div>
                  )}
                </div>

                {/* Cantidad Pedida */}
                <div className="col-span-1 text-center">
                  <span className="text-base font-bold text-blue-600">{item.requestedQuantity}</span>
                </div>

                {/* Cantidad Confirmada */}
                <div className="col-span-1 text-center">
                  <span className={`text-base font-bold ${isPicked ? 'text-green-600' : 'text-gray-400'}`}>
                    {item.pickedQuantity}
                  </span>
                </div>

                {/* Estado */}
                <div className="col-span-1 flex justify-center">
                  {isPicked && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
            );
          })}
            </div>
          </div>
        </div>

        {/* Estado vacío */}
        {sortedItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No hay productos para despachar</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 fixed bottom-0 left-0 right-0">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-gray-600">
            {completedItems}/{items.length} recolectados
          </span>
          {allCompleted && (
            <span className="text-green-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Todo listo
            </span>
          )}
        </div>
        <Button
          onClick={() => {
            // Guardar en sessionStorage para persistencia
            sessionStorage.setItem(`picking_${orderId}`, JSON.stringify({
              pickedItems: items,
              replacementsUsed: replacementsUsed,
            }));
            navigate(`/dispatch/packing/${orderId}`, {
              state: {
                pickedItems: items,
                replacementsUsed: replacementsUsed,
              }
            });
          }}
          disabled={!allCompleted}
          fullWidth
        >
          {allCompleted ? 'CONTINUAR A EMPAQUE' : `COMPLETAR PICKING (${items.length - completedItems} restantes)`}
        </Button>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScannerWrapper
          onScan={handleScanResult}
          onClose={handleCancelModal}
          title="Escanear Estantería"
          subtitle={`Siguiente: ${simulatedLocation}`}
          expectedType="location"
          simulateValue={simulatedLocation}
        />
      )}

      {/* Quantity Confirmation Modal */}
      {showQuantityModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Confirmar Cantidad</h2>
                <p className="text-sm text-gray-500">{selectedItem.locationCode}</p>
              </div>
              <button
                onClick={handleCancelModal}
                className="w-8 h-8 flex items-center justify-center text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Producto info */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <img
                src={selectedItem.productImage}
                alt={selectedItem.productName}
                className="w-12 h-12 rounded-lg bg-gray-100 object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{selectedItem.productName}</p>
                <p className="text-xs text-gray-500 font-mono">{selectedItem.productSku}</p>
              </div>
            </div>

            {/* Quantity Adjuster */}
            <p className="text-center text-gray-700 font-semibold mb-3">
              ¿Cuántas unidades despachar?
            </p>

            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => setQuantity(Math.max(0, quantity - 1))}
                className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              >
                <Minus className="w-5 h-5 text-gray-700" />
              </button>
              <div className={`rounded-xl px-6 py-4 min-w-[100px] text-center ${
                quantity >= selectedItem.requestedQuantity ? 'bg-green-50' : 'bg-blue-50'
              }`}>
                <span className={`text-4xl font-bold ${
                  quantity >= selectedItem.requestedQuantity ? 'text-green-600' : 'text-gray-900'
                }`}>{quantity}</span>
              </div>
              <button
                onClick={() => setQuantity(Math.min(selectedAvailableStock, quantity + 1))}
                className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Validación de cantidad - similar a reemplazos */}
            <div className={`rounded-lg p-3 mb-4 ${
              quantity >= selectedItem.requestedQuantity
                ? 'bg-green-100 border border-green-300'
                : 'bg-red-100 border border-red-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Cantidad a despachar:</span>
                <span className={`text-xl font-bold ${
                  quantity >= selectedItem.requestedQuantity ? 'text-green-700' : 'text-red-700'
                }`}>
                  {quantity} / {selectedItem.requestedQuantity}
                </span>
              </div>
              {quantity < selectedItem.requestedQuantity && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Faltan {selectedItem.requestedQuantity - quantity} unidades para completar el pedido
                </p>
              )}
              {quantity >= selectedItem.requestedQuantity && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Cantidad completa
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Pedido: <strong>{selectedItem.requestedQuantity}</strong></span>
              <span>Disponible: <strong>{selectedAvailableStock}</strong></span>
            </div>

            {/* Warning si no alcanza */}
            {selectedAvailableStock < selectedItem.requestedQuantity && !showReplacementModal && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-3 py-2 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-yellow-800 font-semibold">
                      Stock insuficiente - Faltan {selectedItem.requestedQuantity - selectedAvailableStock} unidades
                    </p>
                    <p className="text-xs text-yellow-700 mb-2">
                      Solo hay {selectedAvailableStock} disponibles de {selectedItem.requestedQuantity} solicitados.
                    </p>

                    <div className="flex flex-col gap-2">
                      {/* Opción 1: Notificar problema */}
                      {stockAlertSent[selectedItem.productSku] ? (
                        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1.5 rounded-lg">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="text-xs font-medium">Problema notificado</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setStockAlertSent(prev => ({ ...prev, [selectedItem.productSku]: true }));
                          }}
                          className="flex items-center gap-1 text-xs font-medium text-yellow-800 bg-yellow-200 hover:bg-yellow-300 px-2 py-1.5 rounded-lg transition-colors"
                        >
                          <Bell className="w-3 h-3" />
                          Notificar problema
                        </button>
                      )}

                      {/* Opción 2: Buscar reemplazo */}
                      <button
                        onClick={handleStartReplacement}
                        className="flex items-center gap-1 text-xs font-medium text-blue-800 bg-blue-100 hover:bg-blue-200 px-2 py-1.5 rounded-lg transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Buscar producto similar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Reemplazo inline - versión compacta */}
            {showReplacementModal && replacementInfo && (
              <div className="bg-blue-50 border border-blue-300 rounded-lg px-2 py-2 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-800">Combinar con reemplazo</p>
                  </div>
                  <button
                    onClick={() => setShowReplacementModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {replacementInfo.replacement ? (
                  <>
                    {/* Info del reemplazo - compacta */}
                    <div className="bg-white rounded p-1.5 mb-2 text-xs">
                      <p className="font-medium text-gray-900 truncate">{replacementInfo.replacement.name}</p>
                      <p className="text-gray-500 font-mono text-[10px]">{replacementInfo.replacement.sku} • {replacementInfo.replacement.location}</p>
                    </div>

                    {/* Selectores en una fila */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {/* Original */}
                      <div className="bg-white rounded p-1.5">
                        <p className="text-[10px] text-gray-500 mb-1">Original ({replacementInfo.originalStock})</p>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setOriginalQtyToUse(Math.max(0, originalQtyToUse - 1))}
                            className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center active:scale-95"
                          >
                            <Minus className="w-2.5 h-2.5 text-gray-600" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-gray-900">{originalQtyToUse}</span>
                          <button
                            onClick={() => setOriginalQtyToUse(Math.min(replacementInfo.originalStock, originalQtyToUse + 1))}
                            className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center active:scale-95"
                          >
                            <Plus className="w-2.5 h-2.5 text-white" />
                          </button>
                        </div>
                      </div>
                      {/* Reemplazo */}
                      <div className="bg-white rounded p-1.5">
                        <p className="text-[10px] text-blue-600 mb-1">Reemplazo ({replacementInfo.replacementStock})</p>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setReplacementQtyToUse(Math.max(0, replacementQtyToUse - 1))}
                            className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center active:scale-95"
                          >
                            <Minus className="w-2.5 h-2.5 text-gray-600" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-blue-600">{replacementQtyToUse}</span>
                          <button
                            onClick={() => setReplacementQtyToUse(Math.min(replacementInfo.replacementStock, replacementQtyToUse + 1))}
                            className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center active:scale-95"
                          >
                            <Plus className="w-2.5 h-2.5 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Total y botón en una fila */}
                    <div className="flex items-center gap-2">
                      <div className={`flex-1 rounded px-2 py-1 text-center ${
                        originalQtyToUse + replacementQtyToUse >= replacementInfo.requestedQty
                          ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <span className={`text-sm font-bold ${
                          originalQtyToUse + replacementQtyToUse >= replacementInfo.requestedQty
                            ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {originalQtyToUse + replacementQtyToUse}/{replacementInfo.requestedQty}
                        </span>
                      </div>
                      <button
                        onClick={() => handleConfirmReplacement(replacementQtyToUse)}
                        disabled={originalQtyToUse + replacementQtyToUse < replacementInfo.requestedQty}
                        className={`flex-1 text-xs font-medium px-2 py-1.5 rounded transition-colors ${
                          originalQtyToUse + replacementQtyToUse >= replacementInfo.requestedQty
                            ? 'text-white bg-blue-500 hover:bg-blue-600'
                            : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                        }`}
                      >
                        Confirmar
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded p-2 text-center">
                    <p className="text-xs text-red-600 font-medium">No hay productos similares</p>
                    <button
                      onClick={() => setShowReplacementModal(false)}
                      className="mt-1 text-xs text-gray-500 underline"
                    >
                      Cerrar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Resumen de resta */}
            <div className="bg-gray-50 rounded-lg px-4 py-3 mb-6">
              <p className="text-xs text-gray-500 mb-1">Después del despacho:</p>
              <p className="text-sm font-semibold text-gray-900">
                {selectedAvailableStock} - {quantity} ={' '}
                <span className={`${selectedAvailableStock - quantity <= 10 ? 'text-red-600' : 'text-green-600'}`}>
                  {selectedAvailableStock - quantity} unidades restantes
                </span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleCancelModal}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmQuantity}
                disabled={quantity < selectedItem.requestedQuantity}
                className="flex-1"
              >
                {quantity >= selectedItem.requestedQuantity ? 'CONFIRMAR' : `FALTAN ${selectedItem.requestedQuantity - quantity}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickingProcess;
