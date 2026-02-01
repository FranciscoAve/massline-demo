import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Minus, Trash2, Package, X, ScanBarcode } from 'lucide-react';
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
  quantity: number;
}

const ProductScanning: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderState = location.state as { orderNumber?: string; supplier?: string; hasOrder?: boolean; reason?: string; order?: { orderNumber: string; supplier: string } } | null;

  // Extraer datos de orden que vienen de ReceptionStart
  const orderNumber = orderState?.order?.orderNumber || orderState?.orderNumber || '';
  const supplier = orderState?.order?.supplier || orderState?.supplier || '';

  const [receiptList, setReceiptList] = useState<ReceiptItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityInput, setQuantityInput] = useState('1');
  const [showScanner, setShowScanner] = useState(false);

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
    // Buscar producto por SKU (el código de barras es el SKU)
    let sku = barcode;
    if (barcode.startsWith('SS:P:')) {
      sku = barcode.substring(5);
    }

    const product = mockProducts.find(p => p.sku.toLowerCase() === sku.toLowerCase());

    if (product) {
      setSelectedProduct(product);
      setQuantityInput('1');
      setShowScanner(false);
      setShowSearch(false);
    } else {
      alert(`Producto no encontrado: ${sku}`);
      setShowScanner(false);
    }
  };

  // Agregar producto a la lista de recibo
  const handleAddToReceipt = () => {
    if (!selectedProduct) return;

    const qty = parseInt(quantityInput) || 1;

    // Si ya está en la lista, sumar cantidad
    const existingIndex = receiptList.findIndex((item) => item.sku === selectedProduct.sku);
    if (existingIndex >= 0) {
      const updated = [...receiptList];
      updated[existingIndex].quantity += qty;
      setReceiptList(updated);
    } else {
      setReceiptList([
        ...receiptList,
        {
          id: selectedProduct.id,
          sku: selectedProduct.sku,
          name: selectedProduct.name,
          image: selectedProduct.thumbnailImage,
          category: selectedProduct.category.name,
          quantity: qty,
        },
      ]);
    }

    // Limpiar selección
    setSelectedProduct(null);
    setQuantityInput('1');
    setShowSearch(false);
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...receiptList];
    const newQuantity = updated[index].quantity + delta;
    if (newQuantity > 0) {
      updated[index].quantity = newQuantity;
      setReceiptList(updated);
    }
  };

  const removeProduct = (index: number) => {
    setReceiptList(receiptList.filter((_, i) => i !== index));
  };

  const totalProducts = receiptList.length;
  const totalUnits = receiptList.reduce((sum, p) => sum + p.quantity, 0);
  const canContinue = receiptList.length > 0;

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
        <h1 className="text-lg font-bold text-gray-900">Lista de Recibo</h1>
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
                const alreadyAdded = receiptList.some((item) => item.sku === product.sku);
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
                    {alreadyAdded && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex-shrink-0">
                        En lista
                      </span>
                    )}
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

        {/* Receipt List */}
        {receiptList.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-700">
                Lista de Recibo ({totalProducts} productos, {totalUnits} unidades)
              </span>
            </div>

            {receiptList.map((item, index) => (
              <div key={item.sku} className="border-b border-gray-100 last:border-none">
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg bg-gray-100 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono">{item.sku}</p>
                      <p className="text-xs text-gray-400">{item.category}</p>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 font-medium">Cantidad:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(index, -1)}
                        className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <Minus className="w-4 h-4 text-gray-700" />
                      </button>
                      <span className="w-12 text-center font-bold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(index, 1)}
                        className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    <div className="flex-1" />

                    <button
                      onClick={() => removeProduct(index)}
                      className="w-8 h-8 flex items-center justify-center text-red-500 active:scale-95 transition-transform"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium mb-1">Lista de recibo vacía</p>
            <p className="text-sm text-gray-400">Busca y agrega los productos del contenedor</p>
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
              receiptList,
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
    </div>
  );
};

export default ProductScanning;
