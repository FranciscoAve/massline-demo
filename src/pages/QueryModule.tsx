import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ScanBarcode, MapPin, X, Package, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';
import { QRScannerWrapper } from '../components/scanner/QRScannerWrapper';
import EmptyState from '../components/ui/EmptyState';
import { mockProducts, getAvailableStockBySku, getLocationBySku, getReplacementFor, getReplacedBy } from '../data/mockData';

// Helper para obtener el estado del stock
const getStockStatus = (stock: number): { label: string; color: string; bgColor: string } => {
  if (stock >= 20) {
    return { label: 'Disponible', color: 'text-green-700', bgColor: 'bg-green-100' };
  } else if (stock >= 10) {
    return { label: 'Cerca del límite', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
  } else {
    return { label: 'Crítico', color: 'text-red-700', bgColor: 'bg-red-100' };
  }
};

const QueryModule: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'map'>('products');
  const [showScanner, setShowScanner] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const filteredProducts = searchQuery
    ? mockProducts.filter(
        p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockProducts; // Mostrar todos los productos si no hay búsqueda

  const handleScan = (qrCode: string) => {
    setShowScanner(false);
    // Intentar buscar directamente por SKU (puede venir con o sin prefijo SS:P:)
    let sku = qrCode;
    const parts = qrCode.split(':');
    if (parts[0] === 'SS' && parts[1] === 'P') {
      sku = parts[2];
    }

    setSearchQuery(sku);
    const product = mockProducts.find(p => p.sku === sku);
    if (product) {
      setSelectedProduct(product.id);
    }
  };

  const product = selectedProduct
    ? mockProducts.find(p => p.id === selectedProduct)
    : null;

  const productStock = product ? getAvailableStockBySku(product.sku) : 0;
  const productLocation = product ? getLocationBySku(product.sku) : '';
  const stockStatus = product ? getStockStatus(productStock) : null;

  // Obtener productos de compatibilidad
  const replacementFor = product ? getReplacementFor(product.sku) : null;
  const replacedBy = product ? getReplacedBy(product.sku) : null;

  // Evitar duplicados: si replacementFor y replacedBy son el mismo producto, solo mostrar uno
  const isDuplicateReplacement = replacementFor && replacedBy && replacementFor.sku === replacedBy.sku;

  // Navegar al producto de compatibilidad
  const navigateToProduct = (sku: string) => {
    const targetProduct = mockProducts.find(p => p.sku === sku);
    if (targetProduct) {
      setSelectedProduct(targetProduct.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Consultar Inventario</h1>
          <div className="w-10" /> {/* Spacer para centrar el título */}
        </div>

        {/* Search Bar con botón de escanear */}
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar producto o código SKU"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setSelectedProduct(null); // Limpiar selección al buscar
              }}
              className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedProduct(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowScanner(true)}
            className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
          >
            <ScanBarcode className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Method Tabs - Solo Productos y Mapa */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'products'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Package className="w-4 h-4" />
            Productos
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'map'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Mapa
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'map' ? (
          /* Vista de Mapa */
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Mapa del Almacén</h3>
            <p className="text-sm text-gray-500">
              Visualización del layout del almacén próximamente disponible.
            </p>
          </div>
        ) : selectedProduct && product ? (
          /* Product Detail View - Sin tabs, una sola sección */
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4">
              {/* Botón de volver */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex items-center gap-1 text-blue-600 text-sm font-medium mb-3 hover:text-blue-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Volver a la lista
              </button>

              {/* Header del producto */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h2>
                  <p className="text-sm text-gray-500 font-mono">{product.sku}</p>
                </div>
              </div>

              {/* Descripción general */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">
                  Producto para línea de motocicletas dedicado a manufactura y ensamblaje de vehículos.
                </p>
              </div>

              {/* Ubicación */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">Ubicación</p>
                  <p className="text-lg font-bold text-gray-900 font-mono">
                    {productLocation || 'Sin ubicación asignada'}
                  </p>
                </div>
              </div>

              {/* Stock y Estado */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Stock Disponible</p>
                  <p className="text-2xl font-bold text-gray-900">{productStock}</p>
                  <p className="text-xs text-gray-500">unidades</p>
                </div>
                <div className={`rounded-lg p-3 ${stockStatus?.bgColor}`}>
                  <p className="text-xs text-gray-600 mb-1">Estado</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      productStock >= 20 ? 'bg-green-500' :
                      productStock >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <p className={`text-lg font-bold ${stockStatus?.color}`}>
                      {stockStatus?.label}
                    </p>
                  </div>
                </div>
              </div>

              {/* Compatibilidad de Reemplazo */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-3 py-2 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                  <p className="text-sm font-semibold text-gray-700">Compatibilidad de Reemplazo</p>
                </div>

                <div className="p-3">
                  {/* Solo mostrar si hay al menos un reemplazo */}
                  {replacementFor || replacedBy ? (
                    <>
                      {/* Si hay duplicado, mostrar solo una vez con texto combinado */}
                      {isDuplicateReplacement ? (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Producto compatible:</p>
                          <button
                            onClick={() => navigateToProduct(replacementFor!.sku)}
                            className="w-full flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                          >
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-900">{replacementFor!.name}</p>
                              <p className="text-xs text-gray-500 font-mono">{replacementFor!.sku}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-purple-600" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Este producto puede reemplazar a: */}
                          {replacementFor && (
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Este producto puede reemplazar a:</p>
                              <button
                                onClick={() => navigateToProduct(replacementFor.sku)}
                                className="w-full flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                              >
                                <div className="text-left">
                                  <p className="text-sm font-medium text-gray-900">{replacementFor.name}</p>
                                  <p className="text-xs text-gray-500 font-mono">{replacementFor.sku}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-green-600" />
                              </button>
                            </div>
                          )}

                          {/* Este producto puede ser reemplazado por: */}
                          {replacedBy && (
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Puede ser reemplazado por:</p>
                              <button
                                onClick={() => navigateToProduct(replacedBy.sku)}
                                className="w-full flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                              >
                                <div className="text-left">
                                  <p className="text-sm font-medium text-gray-900">{replacedBy.name}</p>
                                  <p className="text-xs text-gray-500 font-mono">{replacedBy.sku}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-blue-600" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 italic p-2">No hay productos compatibles</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Search Results - Lista compacta sin imágenes */
          <div>
            <p className="text-sm text-gray-600 mb-3">
              {searchQuery ? `Resultados (${filteredProducts.length}):` : `Todos los productos (${filteredProducts.length}):`}
            </p>
            {filteredProducts.length === 0 ? (
              <EmptyState type="no_results" />
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {filteredProducts.map((product, index) => {
                  const stock = getAvailableStockBySku(product.sku);
                  const status = getStockStatus(stock);

                  return (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product.id)}
                      className={`w-full p-3 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors text-left ${
                        index !== filteredProducts.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {product.sku}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-lg ${status.bgColor}`}>
                          <p className={`text-sm font-bold ${status.color}`}>
                            {stock}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scanner Modal con QRScannerWrapper */}
      {showScanner && (
        <QRScannerWrapper
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          title="Escanear Producto"
          subtitle="Escanea el código de barras"
          expectedType="product"
        />
      )}

      {/* Bottom Nav Spacer */}
      <div className="h-20" />
    </div>
  );
};

export default QueryModule;
