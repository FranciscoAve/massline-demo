import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical, MapPin, ChevronDown, Camera, Minus, Plus, CheckCircle2, Package, X } from 'lucide-react';
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

const mockShelfInventory: Record<string, ShelfProduct[]> = {
  'A-03-E2-N1': [
    { sku: 'REP-12345', name: 'Filtro de Aceite XYZ Premium', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100', availableQuantity: 50 },
    { sku: 'REP-55555', name: 'Bujía NGK Iridium', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 8 },
  ],
  'A-03-E2-N2': [
    { sku: 'REP-98765', name: 'Pastilla de Freno Delantera', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 30 },
  ],
  'B-01-E3-N2': [
    { sku: 'REP-98765', name: 'Pastilla de Freno Delantera', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 12 },
    { sku: 'REP-66666', name: 'Disco de Freno Ventilado', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 22 },
  ],
  'A-01-E1-N1': [
    { sku: 'REP-11111', name: 'Amortiguador Delantero', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 28 },
  ],
  'A-01-E1-N2': [
    { sku: 'REP-22222', name: 'Cadena de Transmisión 520', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 67 },
  ],
  'A-03-E3-N1': [
    { sku: 'REP-55555', name: 'Bujía NGK Iridium', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 3 },
  ],
  'B-01-E1-N1': [
    { sku: 'REP-77777', name: 'Batería 12V 7Ah', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 35 },
  ],
  'B-01-E1-N2': [
    { sku: 'REP-44444', name: 'Kit de Embrague', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 8 },
  ],
  'B-02-E2-N1': [
    { sku: 'REP-88888', name: 'Aceite Motor 10W-40 Sintético', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 120 },
  ],
  'C-01-E1-N1': [
    { sku: 'REP-33333', name: 'Llanta Delantera 17"', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100', availableQuantity: 15 },
  ],
};

type PickingStep = 'idle' | 'scanning' | 'shelf_products' | 'quantity_confirm';

const PickingProcess: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const order = mockOrders.find(o => o.id === orderId);

  const [items, setItems] = useState<PickingItem[]>(order?.items || []);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [step, setStep] = useState<PickingStep>('idle');
  const [scannedLocation, setScannedLocation] = useState<string | null>(null);
  const [shelfProducts, setShelfProducts] = useState<ShelfProduct[]>([]);
  const [selectedShelfProduct, setSelectedShelfProduct] = useState<ShelfProduct | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [shelfInventory, setShelfInventory] = useState(mockShelfInventory);

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Orden no encontrada</div>;
  }

  const currentItem = items[currentItemIndex];
  const completedItems = items.filter(item => item.status === 'picked').length;
  const pendingItems = items.filter(item => item.status === 'pending').length;

  // Paso 1: Abrir escáner QR para la estantería
  const handleStartScan = () => {
    setStep('scanning');
  };

  // Paso 2: Procesar resultado del escaneo QR
  const handleScanResult = (qrCode: string) => {
    // Extraer código de ubicación (soporta formato SS:L:CODE o directo)
    let locationCode = qrCode;
    if (qrCode.startsWith('SS:L:')) {
      locationCode = qrCode.substring(5);
    }

    // Verificar que la ubicación escaneada coincide con la esperada
    if (locationCode !== currentItem.locationCode) {
      alert(`Ubicación incorrecta. Escaneó: ${locationCode}\nEsperada: ${currentItem.locationCode}`);
      setStep('idle');
      return;
    }

    // Obtener productos almacenados en esta ubicación
    const productsOnShelf = shelfInventory[locationCode] || [];
    setScannedLocation(locationCode);
    setShelfProducts(productsOnShelf);
    setStep('shelf_products');
  };

  // Paso 3: Seleccionar producto del estante
  const handleSelectShelfProduct = (product: ShelfProduct) => {
    // Verificar que es el producto correcto de la orden
    if (product.sku !== currentItem.productSku) {
      alert(`Producto incorrecto. Seleccionó: ${product.sku}\nBuscando: ${currentItem.productSku} (${currentItem.productName})`);
      return;
    }

    setSelectedShelfProduct(product);
    // Pre-llenar con la cantidad de la orden de despacho
    setQuantity(Math.min(currentItem.requestedQuantity, product.availableQuantity));
    setStep('quantity_confirm');
  };

  // Paso 4: Confirmar cantidad y restar del inventario
  const handleConfirmQuantity = () => {
    if (!selectedShelfProduct || !scannedLocation) return;

    // Actualizar item como recolectado
    const updatedItems = [...items];
    updatedItems[currentItemIndex] = {
      ...currentItem,
      status: 'picked',
      pickedQuantity: quantity,
    };
    setItems(updatedItems);

    // Restar cantidad del inventario del estante
    const updatedInventory = { ...shelfInventory };
    const locationProducts = [...(updatedInventory[scannedLocation] || [])];
    const productIndex = locationProducts.findIndex(p => p.sku === selectedShelfProduct.sku);
    if (productIndex >= 0) {
      locationProducts[productIndex] = {
        ...locationProducts[productIndex],
        availableQuantity: locationProducts[productIndex].availableQuantity - quantity,
      };
      updatedInventory[scannedLocation] = locationProducts;
      setShelfInventory(updatedInventory);
    }

    // Resetear estado
    setStep('idle');
    setScannedLocation(null);
    setShelfProducts([]);
    setSelectedShelfProduct(null);
    setQuantity(0);

    // Mover al siguiente item o finalizar
    setTimeout(() => {
      if (currentItemIndex < items.length - 1) {
        setCurrentItemIndex(currentItemIndex + 1);
      } else {
        navigate(`/dispatch/packing/${orderId}`);
      }
    }, 1000);
  };

  const handleCancelStep = () => {
    setStep('idle');
    setScannedLocation(null);
    setShelfProducts([]);
    setSelectedShelfProduct(null);
    setQuantity(0);
  };

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
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <div className="h-1.5 bg-gray-200 rounded-full w-20">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(completedItems / items.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">
                {completedItems}/{items.length}
              </span>
            </div>
          </div>
          <button className="w-10 h-10 flex items-center justify-center">
            <MoreVertical className="w-6 h-6 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Order Info */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <button className="w-full flex items-center justify-between text-sm active:bg-gray-50 py-1">
          <span className="text-gray-700">
            {order.destination.name} | {items.length} items
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pb-28 overflow-y-auto">
        {/* Current Item Card */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2 text-center">
            PRODUCTO {currentItemIndex + 1} de {items.length}
          </p>

          <div className="bg-white rounded-xl shadow-md p-4">
            {/* Picked indicator */}
            {currentItem.status === 'picked' && (
              <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-semibold text-green-700">
                  Recolectado: {currentItem.pickedQuantity} unidades
                </span>
              </div>
            )}

            {/* Product Image */}
            <img
              src={currentItem.productImage}
              alt={currentItem.productName}
              className="w-full h-48 object-cover rounded-lg bg-gray-100 mb-4"
            />

            {/* Product Info */}
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {currentItem.productName}
            </h2>
            <p className="text-sm text-gray-500 font-mono mb-4">{currentItem.productSku}</p>

            {/* Quantity Box */}
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Cantidad a despachar:</p>
              <div className="bg-white rounded-lg px-4 py-3 inline-flex flex-col items-center min-w-[80px]">
                <span className="text-3xl font-bold text-gray-900">
                  {currentItem.requestedQuantity}
                </span>
                <span className="text-xs text-gray-500">unidades</span>
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">UBICACION DEL PRODUCTO:</p>
              <div className="bg-white rounded-lg p-3 mb-2">
                <p className="text-xl font-bold font-mono text-blue-600 text-center mb-1">
                  {currentItem.locationCode}
                </p>
                <p className="text-sm text-gray-600 text-center">
                  ZONA {currentItem.locationCode.split('-')[0]} - PASILLO{' '}
                  {currentItem.locationCode.split('-')[1]} - ESTANTE{' '}
                  {currentItem.locationCode.split('-')[2]} - NIVEL{' '}
                  {currentItem.locationCode.split('-')[3]}
                </p>
              </div>

              {currentItem.distance && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{currentItem.distance} metros ({Math.round(currentItem.distance * 1.3)} pasos)</span>
                </div>
              )}
            </div>

            {/* Stock disponible en esa ubicación */}
            <div className="mt-4 text-sm text-gray-600">
              <p>
                Stock en {currentItem.locationCode}:{' '}
                <span className="font-semibold">
                  {(shelfInventory[currentItem.locationCode] || []).find(p => p.sku === currentItem.productSku)?.availableQuantity ?? '?'} unidades
                </span>
              </p>
            </div>

            {/* Scan Button */}
            {currentItem.status !== 'picked' && (
              <div className="flex gap-2 mt-4">
                <button
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold active:scale-95 transition-transform"
                  onClick={() => alert('Vista de mapa (próximamente)')}
                >
                  VER MAPA
                </button>
                <button
                  onClick={handleStartScan}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  ESCANEAR ESTANTERIA
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Next Items Preview */}
        {currentItemIndex < items.length - 1 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Próximos:</p>
            <div className="space-y-2">
              {items.slice(currentItemIndex + 1, currentItemIndex + 3).map((item, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-lg p-2 text-sm flex items-center gap-2 ${
                    item.status === 'picked' ? 'text-green-600' : 'text-gray-600'
                  }`}
                >
                  <span className="font-semibold">{currentItemIndex + idx + 2}.</span>
                  <span className="flex-1 truncate">{item.productName}</span>
                  <span className="text-xs text-blue-600 font-mono">{item.locationCode}</span>
                  {item.status === 'picked' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 fixed bottom-0 left-0 right-0">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-gray-600">
            {completedItems}/{items.length} recolectados | {pendingItems} pendientes
          </span>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              if (currentItemIndex > 0) setCurrentItemIndex(currentItemIndex - 1);
            }}
            disabled={currentItemIndex === 0}
            className="flex-1"
          >
            Anterior
          </Button>
          <Button
            onClick={() => {
              if (currentItem.status === 'picked' && currentItemIndex < items.length - 1) {
                setCurrentItemIndex(currentItemIndex + 1);
              } else if (completedItems === items.length) {
                navigate(`/dispatch/packing/${orderId}`);
              }
            }}
            disabled={currentItem.status !== 'picked'}
            className="flex-1"
          >
            {currentItemIndex === items.length - 1 && completedItems === items.length
              ? 'FINALIZAR'
              : 'SIGUIENTE'}
          </Button>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {step === 'scanning' && (
        <QRScannerWrapper
          onScan={handleScanResult}
          onClose={handleCancelStep}
          title="Escanear Estantería"
          subtitle={`Buscar: ${currentItem.locationCode}`}
          expectedType="location"
          simulateValue={currentItem.locationCode}
        />
      )}

      {/* Shelf Products Modal - muestra productos almacenados en el estante escaneado */}
      {step === 'shelf_products' && scannedLocation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-2xl w-full max-h-[85vh] flex flex-col animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Estante {scannedLocation}</h2>
                <p className="text-sm text-gray-500">Selecciona el producto a despachar</p>
              </div>
              <button
                onClick={handleCancelStep}
                className="w-10 h-10 flex items-center justify-center text-gray-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Products on shelf */}
            <div className="flex-1 overflow-y-auto p-4">
              {shelfProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">Estante vacío</p>
                  <p className="text-sm text-gray-400">No hay productos en esta ubicación</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Indicador del producto buscado */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-2">
                    <p className="text-xs text-blue-600 font-semibold mb-1">BUSCANDO:</p>
                    <p className="text-sm font-bold text-blue-900">{currentItem.productName}</p>
                    <p className="text-xs text-blue-600 font-mono">{currentItem.productSku} - {currentItem.requestedQuantity} unidades</p>
                  </div>

                  {shelfProducts.map((product) => {
                    const isTarget = product.sku === currentItem.productSku;
                    return (
                      <button
                        key={product.sku}
                        onClick={() => handleSelectShelfProduct(product)}
                        className={`w-full rounded-xl p-4 flex items-start gap-3 active:scale-[0.98] transition-transform text-left ${
                          isTarget
                            ? 'bg-green-50 border-2 border-green-400'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-14 h-14 rounded-lg bg-gray-100 object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-gray-900 truncate">{product.name}</h3>
                              <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
                            </div>
                            {isTarget && (
                              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                                Coincide
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">
                              Disponible: {product.availableQuantity} unidades
                            </span>
                          </div>
                          {/* Barra de stock */}
                          <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                product.availableQuantity > 50 ? 'bg-green-500' :
                                product.availableQuantity > 20 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min((product.availableQuantity / 100) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quantity Confirmation Modal */}
      {step === 'quantity_confirm' && selectedShelfProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </div>
              <p className="text-sm font-semibold text-green-600">Producto seleccionado</p>
              <p className="text-base font-bold text-gray-900 mt-1">{selectedShelfProduct.name}</p>
              <p className="text-xs text-gray-500 font-mono">{selectedShelfProduct.sku}</p>
            </div>

            <p className="text-center text-gray-700 font-semibold mb-4">
              ¿Cuántas unidades despachar?
            </p>

            {/* Quantity Adjuster */}
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
                onClick={() => setQuantity(Math.min(selectedShelfProduct.availableQuantity, quantity + 1))}
                className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Pedido: <strong>{currentItem.requestedQuantity}</strong></span>
              <span>Disponible: <strong>{selectedShelfProduct.availableQuantity}</strong></span>
            </div>

            {/* Warning si no alcanza */}
            {selectedShelfProduct.availableQuantity < currentItem.requestedQuantity && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-3 py-2 mb-4">
                <p className="text-xs text-yellow-800">
                  Stock insuficiente. Solo hay {selectedShelfProduct.availableQuantity} disponibles de {currentItem.requestedQuantity} solicitados.
                </p>
              </div>
            )}

            {/* Resumen de resta */}
            <div className="bg-gray-50 rounded-lg px-4 py-3 mb-6">
              <p className="text-xs text-gray-500 mb-1">Después del despacho:</p>
              <p className="text-sm font-semibold text-gray-900">
                {selectedShelfProduct.availableQuantity} - {quantity} ={' '}
                <span className={`${selectedShelfProduct.availableQuantity - quantity <= 10 ? 'text-red-600' : 'text-green-600'}`}>
                  {selectedShelfProduct.availableQuantity - quantity} unidades restantes
                </span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleCancelStep}
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
