import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Camera, MapPin, Mic, Clock, X } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import MockQRScanner from '../components/scanner/MockQRScanner';
import EmptyState from '../components/ui/EmptyState';
import { mockProducts } from '../data/mockData';

const QueryModule: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMethod, setSearchMethod] = useState<'text' | 'scan' | 'location'>('text');
  const [showScanner, setShowScanner] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const filteredProducts = searchQuery
    ? mockProducts.filter(
        p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleScan = (qrCode: string) => {
    setShowScanner(false);
    const parts = qrCode.split(':');
    if (parts[0] === 'SS' && parts[1] === 'P') {
      const sku = parts[2];
      const product = mockProducts.find(p => p.sku === sku);
      if (product) {
        setSelectedProduct(product.id);
      }
    }
  };

  const product = selectedProduct
    ? mockProducts.find(p => p.id === selectedProduct)
    : null;

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
          <button className="w-10 h-10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar producto o ubicación"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <button className="absolute right-10 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center">
            <Mic className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Method Tabs */}
        <div className="flex gap-2 mt-3">
          {[
            { id: 'text', label: '🔤 Texto', icon: Search },
            { id: 'scan', label: '📷 Escanear', icon: Camera },
            { id: 'location', label: '📍 Ubic', icon: MapPin },
          ].map(method => (
            <button
              key={method.id}
              onClick={() => {
                setSearchMethod(method.id as 'text' | 'scan' | 'location');
                if (method.id === 'scan') setShowScanner(true);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                searchMethod === method.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {method.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 p-4 overflow-y-auto">
        {!searchQuery && !selectedProduct ? (
          <EmptyState
            type="no_results"
            customTitle="Buscar productos"
            customDescription="Ingrese un nombre, código SKU o escanee un código QR para buscar productos"
          />
        ) : selectedProduct && product ? (
          /* Product Detail View */
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <img
              src={product.thumbnailImage}
              alt={product.name}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h2>
              <p className="text-sm text-gray-500 font-mono mb-4">{product.sku}</p>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-4">
                <div className="flex gap-4 text-sm">
                  {['General', 'Stock', 'Movimientos', 'Compat'].map((tab, idx) => (
                    <button
                      key={tab}
                      className={`pb-2 px-1 font-medium ${
                        idx === 1
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Tab Content */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Stock Total:</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {product.totalStock} unidades
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                      product.status === 'ok'
                        ? 'bg-green-100 text-green-700'
                        : product.status === 'low'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    ✓ Disponible
                  </div>
                </div>

                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Distribución por ubicación:
                </p>

                {/* Mock locations for this product */}
                {[
                  { code: 'Z01-Pa-E2-N1', quantity: 25, percentage: 55 },
                  { code: 'Z01-Pb-E1-N1', quantity: 15, percentage: 33 },
                  { code: 'Z02-Pa-E1-N2', quantity: 5, percentage: 11 },
                ].map(loc => (
                  <div
                    key={loc.code}
                    className="bg-gray-50 rounded-lg p-3 mb-2 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-900 font-mono">
                          {loc.code}
                        </span>
                        <span className="text-xs text-gray-600">{loc.percentage}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${loc.percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-600">
                          {loc.quantity} unidades
                        </span>
                        <button className="text-xs text-blue-600 font-medium">
                          Ver mapa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Punto de reorden:</span>
                    <span className="font-semibold">{product.reorderPoint} unidades</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stock seguridad:</span>
                    <span className="font-semibold">{product.safetyStock} unidades</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-semibold text-yellow-600">
                      ⚠️ Cerca del límite
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Search Results */
          <div>
            <p className="text-sm text-gray-600 mb-3">Resultados ({filteredProducts.length}):</p>
            {filteredProducts.length === 0 ? (
              <EmptyState type="no_results" />
            ) : (
              filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={() => setSelectedProduct(product.id)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <MockQRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          expectedType="product"
        />
      )}

      {/* Bottom Nav Spacer */}
      <div className="h-20" />
    </div>
  );
};

export default QueryModule;
