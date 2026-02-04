import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  Package,
  CheckCircle2,
  X,
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';
import { useWorkshopOrdersStore } from '../stores/workshopOrdersStore';
import { mockProducts, getLocationBySku, getAvailableStockBySku, type PickingItem, type Product } from '../data/mockData';

interface SelectedProduct {
  product: Product;
  quantity: number;
}

const CreateInternalOrder: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addOrder } = useWorkshopOrdersStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);

  // Filtrar productos por búsqueda (solo productos con stock disponible)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return mockProducts.filter(
      (p) =>
        (p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category.name.toLowerCase().includes(query)) &&
        getAvailableStockBySku(p.sku) > 0 // Solo mostrar productos con stock
    );
  }, [searchQuery]);

  // Productos ya seleccionados (para no mostrarlos en búsqueda)
  const selectedSkus = new Set(selectedProducts.map((sp) => sp.product.sku));

  // Filtrar resultados excluyendo ya seleccionados
  const filteredResults = searchResults.filter((p) => !selectedSkus.has(p.sku));

  // Totales
  const totalProducts = selectedProducts.length;
  const totalUnits = selectedProducts.reduce((sum, sp) => sum + sp.quantity, 0);

  const addProduct = (product: Product) => {
    setSelectedProducts((prev) => [
      ...prev,
      { product, quantity: 1 },
    ]);
    setSearchQuery('');
  };

  const removeProduct = (sku: string) => {
    setSelectedProducts((prev) => prev.filter((sp) => sp.product.sku !== sku));
  };

  const updateQuantity = (sku: string, delta: number) => {
    setSelectedProducts((prev) =>
      prev.map((sp) => {
        if (sp.product.sku === sku) {
          const maxStock = getAvailableStockBySku(sku);
          const newQty = Math.max(1, Math.min(maxStock, sp.quantity + delta));
          return { ...sp, quantity: newQty };
        }
        return sp;
      })
    );
  };

  const handleCreateOrder = () => {
    if (selectedProducts.length === 0) return;

    // Convertir a PickingItem format con ubicación correcta
    const items: PickingItem[] = selectedProducts.map((sp) => ({
      productId: sp.product.id,
      productSku: sp.product.sku,
      productName: sp.product.name,
      productImage: sp.product.thumbnailImage,
      requestedQuantity: sp.quantity,
      pickedQuantity: 0,
      locationCode: getLocationBySku(sp.product.sku), // Asignar ubicación real del inventario
      status: 'pending',
    }));

    // Crear orden
    const newOrder = addOrder(items, user?.name || 'Taller');

    // Mostrar confirmación
    setCreatedOrderNumber(newOrder.orderNumber);
    setShowSuccess(true);
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  const handleCreateAnother = () => {
    setShowSuccess(false);
    setCreatedOrderNumber(null);
    setSelectedProducts([]);
    setSearchQuery('');
  };

  // Pantalla de éxito
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Orden Creada</h1>
          <p className="text-gray-500 mb-4">Tu solicitud ha sido enviada al almacén</p>

          <div className="bg-purple-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Número de orden:</p>
            <p className="text-2xl font-bold font-mono text-purple-600">{createdOrderNumber}</p>
          </div>

          <div className="space-y-3">
            <Button fullWidth onClick={handleFinish}>
              VOLVER AL INICIO
            </Button>
            <Button fullWidth variant="secondary" onClick={handleCreateAnother}>
              CREAR OTRA ORDEN
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Nueva Orden Interna</h1>
        </div>
      </header>

      <div className="flex-1 p-3 space-y-3">
        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar producto por nombre o código..."
              className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Results */}
          {filteredResults.length > 0 && (
            <div className="mt-3 border-t border-gray-100 pt-2 space-y-1 max-h-48 overflow-y-auto">
              {filteredResults.map((product) => {
                const availableStock = getAvailableStockBySku(product.sku);
                const location = getLocationBySku(product.sku);
                return (
                  <button
                    key={product.id}
                    onClick={() => addProduct(product)}
                    className="w-full flex items-center gap-2 p-2 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors text-left"
                  >
                    <img
                      src={product.thumbnailImage}
                      alt={product.name}
                      className="hidden sm:block w-9 h-9 rounded-lg object-cover bg-gray-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate leading-tight">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {product.sku} · <span className="text-green-600">{availableStock}</span> · <span className="text-blue-500">{location}</span>
                      </p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Plus className="w-4 h-4 text-purple-600" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {searchQuery && filteredResults.length === 0 && (
            <div className="mt-3 p-4 text-center text-gray-500 text-sm">
              No se encontraron productos
            </div>
          )}
        </div>

        {/* Selected Products */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Seleccionados</h3>
            {totalProducts > 0 && (
              <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full">
                {totalProducts} · {totalUnits} uds
              </span>
            )}
          </div>

          {selectedProducts.length === 0 ? (
            <div className="p-6 text-center">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No hay productos seleccionados</p>
              <p className="text-gray-400 text-xs">
                Usa el buscador para agregar
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {selectedProducts.map((sp) => {
                const availableStock = getAvailableStockBySku(sp.product.sku);
                const isAtMax = sp.quantity >= availableStock;
                return (
                  <div key={sp.product.sku} className="px-3 py-2">
                    {/* Diseño compacto para móvil */}
                    <div className="flex items-center gap-2">
                      {/* Imagen - oculta en móvil pequeño */}
                      <img
                        src={sp.product.thumbnailImage}
                        alt={sp.product.name}
                        className="hidden sm:block w-10 h-10 rounded-lg object-cover bg-gray-200 flex-shrink-0"
                      />
                      {/* Info del producto */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate leading-tight">
                          {sp.product.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono truncate">
                          {sp.product.sku} · <span className={isAtMax ? 'text-orange-500' : 'text-green-600'}>{availableStock} disp.</span>
                        </p>
                      </div>
                      {/* Controles de cantidad - compactos */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => updateQuantity(sp.product.sku, -1)}
                          disabled={sp.quantity <= 1}
                          className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-40 active:scale-95"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className={`w-8 text-center font-bold text-base ${isAtMax ? 'text-orange-600' : 'text-gray-900'}`}>
                          {sp.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(sp.product.sku, 1)}
                          disabled={isAtMax}
                          className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-40 active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* Botón eliminar */}
                      <button
                        onClick={() => removeProduct(sp.product.sku)}
                        className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-500 active:scale-95 flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 shadow-lg">
        <Button
          fullWidth
          disabled={selectedProducts.length === 0}
          onClick={handleCreateOrder}
          className="bg-purple-600 hover:bg-purple-700 py-2.5"
        >
          <Package className="w-4 h-4 mr-2" />
          CREAR ORDEN ({totalProducts} prod. · {totalUnits} uds)
        </Button>
      </div>
    </div>
  );
};

export default CreateInternalOrder;
