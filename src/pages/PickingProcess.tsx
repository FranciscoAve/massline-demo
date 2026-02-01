import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, ScanBarcode, Minus, Plus, CheckCircle2, Package, X, AlertTriangle, Bell } from 'lucide-react';
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

// Inventario por ubicación con nuevo formato: Z[01-32]-P[a-g]-E[1-9]-N[1-5]
const mockShelfInventory: Record<string, ShelfProduct[]> = {
  // Zona 01 - Pasillo a
  'Z01-Pa-E1-N1': [
    { sku: 'REP-11111', name: 'Amortiguador Delantero', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 28 },
  ],
  'Z01-Pa-E1-N2': [
    { sku: 'REP-22222', name: 'Cadena de Transmisión 520', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 67 },
  ],
  'Z01-Pa-E2-N1': [
    { sku: 'REP-12345', name: 'Filtro de Aceite XYZ Premium', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100', availableQuantity: 50 },
    { sku: 'REP-55555', name: 'Bujía NGK Iridium', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 8 },
  ],
  'Z01-Pa-E2-N2': [
    { sku: 'REP-98765', name: 'Pastilla de Freno Delantera', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 30 },
  ],
  // Zona 01 - Pasillo b
  'Z01-Pb-E1-N1': [
    { sku: 'REP-55555', name: 'Bujía NGK Iridium', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 3 },
  ],
  'Z01-Pb-E1-N2': [
    { sku: 'REP-12345', name: 'Filtro de Aceite XYZ Premium', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100', availableQuantity: 25 },
  ],
  // Zona 02 - Pasillo a
  'Z02-Pa-E1-N1': [
    { sku: 'REP-77777', name: 'Batería 12V 7Ah', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 35 },
  ],
  'Z02-Pa-E1-N2': [
    { sku: 'REP-44444', name: 'Kit de Embrague', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 8 },
  ],
  // Zona 02 - Pasillo b
  'Z02-Pb-E3-N2': [
    { sku: 'REP-98765', name: 'Pastilla de Freno Delantera', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 12 },
    { sku: 'REP-66666', name: 'Disco de Freno Ventilado', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 22 },
  ],
  // Zona 02 - Pasillo c
  'Z02-Pc-E2-N1': [
    { sku: 'REP-88888', name: 'Aceite Motor 10W-40 Sintético', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 120 },
  ],
  // Zona 03 - Pasillo a
  'Z03-Pa-E1-N1': [
    { sku: 'REP-33333', name: 'Llanta Delantera 17"', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 15 },
  ],
};

// Parsear ubicación para ordenar
const parseLocation = (loc: string) => {
  const parts = loc.split('-');
  return {
    zona: parseInt(parts[0]?.replace('Z', '') || '0'),
    pasillo: parts[1]?.replace('P', '') || '',
    estante: parseInt(parts[2]?.replace('E', '') || '0'),
    nivel: parseInt(parts[3]?.replace('N', '') || '0'),
  };
};

// Formatear ubicación para mostrar
const formatLocation = (loc: string) => {
  const parts = loc.split('-');
  const zona = parts[0]?.replace('Z', '') || '';
  const pasillo = parts[1]?.replace('P', '').toUpperCase() || '';
  const estante = parts[2]?.replace('E', '') || '';
  const nivel = parts[3]?.replace('N', '') || '';
  return `Zona ${zona} - Pasillo ${pasillo} - Estante ${estante} - Nivel ${nivel}`;
};

const PickingProcess: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const order = mockOrders.find(o => o.id === orderId);

  const [items, setItems] = useState<PickingItem[]>(order?.items || []);
  const [shelfInventory, setShelfInventory] = useState(mockShelfInventory);
  const [stockAlertSent, setStockAlertSent] = useState<Record<string, boolean>>({});

  // Estado para escaneo
  const [scanningItemIndex, setScanningItemIndex] = useState<number | null>(null);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(0);

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Orden no encontrada</div>;
  }

  // Ordenar items por ubicación
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const locA = parseLocation(a.locationCode);
      const locB = parseLocation(b.locationCode);

      if (locA.zona !== locB.zona) return locA.zona - locB.zona;
      if (locA.pasillo !== locB.pasillo) return locA.pasillo.localeCompare(locB.pasillo);
      if (locA.estante !== locB.estante) return locA.estante - locB.estante;
      return locA.nivel - locB.nivel;
    });
  }, [items]);

  const completedItems = items.filter(item => item.status === 'picked').length;
  const allCompleted = completedItems === items.length;

  // Obtener stock disponible para un item
  const getAvailableStock = (item: PickingItem) => {
    const productsOnShelf = shelfInventory[item.locationCode] || [];
    const product = productsOnShelf.find(p => p.sku === item.productSku);
    return product?.availableQuantity ?? 0;
  };

  // Iniciar escaneo de estantería para un item
  const handleStartScan = (index: number) => {
    setScanningItemIndex(index);
  };

  // Procesar resultado del escaneo
  const handleScanResult = (qrCode: string) => {
    if (scanningItemIndex === null) return;

    const item = sortedItems[scanningItemIndex];
    let locationCode = qrCode;
    if (qrCode.startsWith('SS:L:')) {
      locationCode = qrCode.substring(5);
    }

    // Verificar que la ubicación escaneada coincide con la esperada
    if (locationCode !== item.locationCode) {
      alert(`Ubicación incorrecta.\nEscaneó: ${locationCode}\nEsperada: ${item.locationCode}`);
      setScanningItemIndex(null);
      return;
    }

    // Abrir modal de cantidad
    setScanningItemIndex(null);
    setSelectedItemIndex(scanningItemIndex);
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

    // Cerrar modal
    setShowQuantityModal(false);
    setSelectedItemIndex(null);
    setQuantity(0);
  };

  const handleCancelModal = () => {
    setShowQuantityModal(false);
    setSelectedItemIndex(null);
    setQuantity(0);
    setScanningItemIndex(null);
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
        <p className="text-sm text-gray-600 mb-3 font-medium">
          Productos a despachar (ordenados por ubicación):
        </p>

        <div className="space-y-3">
          {sortedItems.map((item, index) => {
            const availableStock = getAvailableStock(item);
            const isPicked = item.status === 'picked';
            const hasStockIssue = availableStock < item.requestedQuantity;

            return (
              <div
                key={`${item.productSku}-${item.locationCode}`}
                className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 ${
                  isPicked ? 'border-green-400 bg-green-50' : hasStockIssue ? 'border-yellow-300' : 'border-transparent'
                }`}
              >
                {/* Ubicación header */}
                <div className={`px-4 py-2 flex items-center gap-2 ${isPicked ? 'bg-green-100' : 'bg-gray-50'}`}>
                  <MapPin className={`w-4 h-4 ${isPicked ? 'text-green-600' : 'text-blue-500'}`} />
                  <span className="text-sm font-bold font-mono text-blue-600">{item.locationCode}</span>
                  <span className="text-xs text-gray-500">• {formatLocation(item.locationCode)}</span>
                </div>

                <div className="p-4">
                  <div className="flex gap-3">
                    {/* Imagen */}
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-16 rounded-lg bg-gray-100 object-cover flex-shrink-0"
                    />

                    {/* Info del producto */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{item.productName}</h3>
                      <p className="text-xs text-gray-500 font-mono mb-1">{item.productSku}</p>

                      {/* Cantidades */}
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-600">
                          Pedido: <strong className="text-blue-600">{item.requestedQuantity}</strong>
                        </span>
                        <span className={`${availableStock < item.requestedQuantity ? 'text-red-600' : 'text-green-600'}`}>
                          Disponible: <strong>{availableStock}</strong>
                        </span>
                      </div>

                      {/* Alerta de stock */}
                      {hasStockIssue && !isPicked && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-yellow-700">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Stock insuficiente</span>
                        </div>
                      )}

                      {/* Estado de recolección */}
                      {isPicked && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="font-semibold">Recolectado: {item.pickedQuantity} unidades</span>
                        </div>
                      )}
                    </div>

                    {/* Botón de escaneo */}
                    {!isPicked && (
                      <button
                        onClick={() => handleStartScan(index)}
                        className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center active:scale-95 transition-transform flex-shrink-0 self-center"
                        title="Escanear estantería"
                      >
                        <ScanBarcode className="w-6 h-6 text-white" />
                      </button>
                    )}

                    {isPicked && (
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 self-center">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
          onClick={() => navigate(`/dispatch/packing/${orderId}`)}
          disabled={!allCompleted}
          fullWidth
        >
          {allCompleted ? 'CONTINUAR A EMPAQUE' : `COMPLETAR PICKING (${items.length - completedItems} restantes)`}
        </Button>
      </div>

      {/* QR Scanner Modal */}
      {scanningItemIndex !== null && (
        <QRScannerWrapper
          onScan={handleScanResult}
          onClose={handleCancelModal}
          title="Escanear Estantería"
          subtitle={`Buscar: ${sortedItems[scanningItemIndex]?.locationCode}`}
          expectedType="location"
          simulateValue={sortedItems[scanningItemIndex]?.locationCode}
        />
      )}

      {/* Quantity Confirmation Modal */}
      {showQuantityModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
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
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              >
                <Minus className="w-5 h-5 text-gray-700" />
              </button>
              <div className="bg-blue-50 rounded-xl px-6 py-4 min-w-[100px] text-center">
                <span className="text-4xl font-bold text-gray-900">{quantity}</span>
              </div>
              <button
                onClick={() => setQuantity(Math.min(selectedAvailableStock, quantity + 1))}
                className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Pedido: <strong>{selectedItem.requestedQuantity}</strong></span>
              <span>Disponible: <strong>{selectedAvailableStock}</strong></span>
            </div>

            {/* Warning si no alcanza */}
            {selectedAvailableStock < selectedItem.requestedQuantity && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-3 py-2 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-yellow-800 font-semibold">
                      Stock insuficiente
                    </p>
                    <p className="text-xs text-yellow-700">
                      Solo hay {selectedAvailableStock} disponibles de {selectedItem.requestedQuantity} solicitados.
                    </p>
                    {stockAlertSent[selectedItem.productSku] ? (
                      <div className="flex items-center gap-1 mt-2 text-green-600">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="text-xs font-medium">Alerta enviada al supervisor</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setStockAlertSent(prev => ({ ...prev, [selectedItem.productSku]: true }));
                        }}
                        className="flex items-center gap-1 mt-2 text-xs font-medium text-yellow-800 bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Bell className="w-3 h-3" />
                        Notificar a supervisor
                      </button>
                    )}
                  </div>
                </div>
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
                disabled={quantity <= 0}
                className="flex-1"
              >
                CONFIRMAR
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickingProcess;
