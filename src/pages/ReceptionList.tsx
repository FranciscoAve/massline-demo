import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Package, Clock, User, CheckCircle, AlertCircle, ChevronRight, Eye, Truck, ScanBarcode } from 'lucide-react';
import { mockReceptionOrders } from '../data/mockData';
import EmptyState from '../components/ui/EmptyState';
import { QRScannerWrapper } from '../components/scanner/QRScannerWrapper';
import { mockApi } from '../services/mockApi';

type ReleaseFilter = 'all' | 'released' | 'unreleased';

const ReceptionList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<ReleaseFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  // Contadores por categoría
  const releasedOrders = mockReceptionOrders.filter(o => o.releaseStatus === 'released');
  const unreleasedOrders = mockReceptionOrders.filter(o => o.releaseStatus === 'unreleased');

  const categories = [
    {
      id: 'released' as const,
      label: 'Liberadas',
      description: 'Recepciones completadas',
      count: releasedOrders.length,
      icon: CheckCircle,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
    },
    {
      id: 'unreleased' as const,
      label: 'No Liberadas',
      description: 'Pendientes de recibir',
      count: unreleasedOrders.length,
      icon: AlertCircle,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
    },
  ];

  const getFilteredOrders = () => {
    let orders = mockReceptionOrders;

    if (selectedFilter !== 'all') {
      orders = orders.filter(o => o.releaseStatus === selectedFilter);
    }

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      orders = orders.filter(order =>
        order.orderNumber.toLowerCase().includes(search) ||
        order.supplier.name.toLowerCase().includes(search)
      );
    }

    return orders;
  };

  const filteredOrders = getFilteredOrders();

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return `Hace ${Math.round(diffHours / 24)} días`;
  };

  const getCategoryStyle = (releaseStatus: string) => {
    const cat = categories.find(c => c.id === releaseStatus);
    return cat || categories[0];
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase': return 'Compra';
      case 'return': return 'Devolución';
      case 'transfer': return 'Transferencia';
      default: return type;
    }
  };

  // Manejar escaneo de código de barras de orden
  const handleOrderBarcodeScan = async (barcode: string) => {
    setShowScanner(false);

    // Extraer número de orden del código escaneado
    let orderNum = barcode;
    if (barcode.startsWith('SS:OC:')) {
      orderNum = barcode.substring(6);
    }

    // Buscar en mockReceptionOrders primero
    const receptionOrder = mockReceptionOrders.find(o =>
      o.orderNumber === orderNum ||
      o.orderNumber.includes(orderNum)
    );

    if (receptionOrder) {
      // Buscar la orden en el API para obtener datos completos
      const order = await mockApi.orders.getByNumber(receptionOrder.orderNumber);
      if (order) {
        // Navegar directamente al escaneo de productos
        navigate('/reception/scan', { state: { order, hasOrder: true } });
      }
    } else {
      // Intentar buscar en API
      const order = await mockApi.orders.getByNumber(orderNum);
      if (order) {
        navigate('/reception/scan', { state: { order, hasOrder: true } });
      } else {
        // Si no se encuentra, poner en el buscador
        setSearchQuery(orderNum);
      }
    }
  };

  const handleOrderClick = async (order: typeof mockReceptionOrders[0]) => {
    if (order.releaseStatus === 'released') {
      // Ir al resumen directamente
      navigate('/reception/confirmation', {
        state: {
          orderNumber: order.orderNumber,
          supplier: order.supplier.name,
          products: order.items.map(item => ({
            name: item.productName,
            sku: item.productSku,
            quantity: item.receivedQuantity,
            expectedQuantity: item.expectedQuantity,
            location: item.locationCode,
            hasDiscrepancy: item.hasDiscrepancy,
            problemNotified: item.problemNotified,
          })),
        },
      });
    } else {
      // Ir directo al escaneo de productos
      const apiOrder = await mockApi.orders.getByNumber(order.orderNumber);
      if (apiOrder) {
        navigate('/reception/scan', { state: { order: apiOrder, hasOrder: true } });
      } else {
        // Fallback: ir al inicio de recepción
        navigate('/reception/start', {
          state: {
            preselectedOrder: order.orderNumber,
          },
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Órdenes de Recepción</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Category Cards */}
      {selectedFilter === 'all' && (
        <div className="p-4 space-y-3">
          <p className="text-sm font-medium text-gray-500 mb-2">Selecciona una categoría</p>
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`w-full ${cat.lightColor} ${cat.borderColor} border rounded-xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform`}
              >
                <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold ${cat.textColor}`}>{cat.label}</h3>
                    <span className={`${cat.color} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
                      {cat.count}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{cat.description}</p>
                </div>
                <ChevronRight className={`w-5 h-5 ${cat.textColor}`} />
              </button>
            );
          })}

          {/* Total summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total de recepciones</span>
              <span className="font-bold text-gray-900">{mockReceptionOrders.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filtered View */}
      {selectedFilter !== 'all' && (
        <>
          {/* Category Header */}
          <div className={`${getCategoryStyle(selectedFilter).lightColor} border-b ${getCategoryStyle(selectedFilter).borderColor} px-4 py-3`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedFilter('all')}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div className={`w-10 h-10 ${getCategoryStyle(selectedFilter).color} rounded-xl flex items-center justify-center`}>
                {React.createElement(getCategoryStyle(selectedFilter).icon, { className: 'w-5 h-5 text-white' })}
              </div>
              <div>
                <h2 className={`font-bold ${getCategoryStyle(selectedFilter).textColor}`}>
                  {categories.find(c => c.id === selectedFilter)?.label}
                </h2>
                <p className="text-xs text-gray-500">
                  {categories.find(c => c.id === selectedFilter)?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por # orden, proveedor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {/* Botón de escaneo solo para no liberadas */}
              {selectedFilter === 'unreleased' && (
                <button
                  onClick={() => setShowScanner(true)}
                  className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center active:scale-95 transition-transform flex-shrink-0"
                  title="Escanear código de orden"
                >
                  <ScanBarcode className="w-6 h-6 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Orders List */}
          <div className="flex-1 p-4 overflow-y-auto">
            {filteredOrders.length === 0 ? (
              <EmptyState
                type="no_orders"
                onAction={() => setSearchQuery('')}
              />
            ) : (
              <div className="space-y-3">
                {filteredOrders.map(order => {
                  const catStyle = getCategoryStyle(order.releaseStatus);
                  const totalExpected = order.items.reduce((sum, item) => sum + item.expectedQuantity, 0);
                  const totalReceived = order.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
                  const hasDiscrepancies = order.items.some(item => item.hasDiscrepancy);

                  return (
                    <div
                      key={order.id}
                      className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 ${
                        order.priority === 'urgent'
                          ? 'border-red-500'
                          : order.releaseStatus === 'released'
                            ? 'border-green-500'
                            : 'border-orange-500'
                      }`}
                    >
                      <div className="p-4">
                        {/* Priority & Type Badges */}
                        <div className="flex items-center gap-2 mb-2">
                          {order.releaseStatus === 'released' ? (
                            <>
                              <div className="flex items-center gap-1 bg-green-100 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span className="text-xs font-bold text-green-600">COMPLETADA</span>
                              </div>
                              {hasDiscrepancies && (
                                <div className="flex items-center gap-1 bg-yellow-100 px-2 py-0.5 rounded-full">
                                  <span className="text-xs font-bold text-yellow-600">CON ALERTAS</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {order.priority === 'urgent' && (
                                <div className="flex items-center gap-1 bg-red-100 px-2 py-0.5 rounded-full">
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                  <span className="text-xs font-bold text-red-600">URGENTE</span>
                                </div>
                              )}
                              <div className={`flex items-center gap-1 ${catStyle.lightColor} px-2 py-0.5 rounded-full`}>
                                {React.createElement(catStyle.icon, { className: `w-3 h-3 ${catStyle.textColor}` })}
                                <span className={`text-xs font-medium ${catStyle.textColor}`}>
                                  {categories.find(c => c.id === order.releaseStatus)?.label}
                                </span>
                              </div>
                            </>
                          )}
                          <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full">
                            <Truck className="w-3 h-3 text-blue-600" />
                            <span className="text-xs font-medium text-blue-600">{getTypeLabel(order.type)}</span>
                          </div>
                        </div>

                        {/* Order Number */}
                        <h3 className="text-base font-bold text-gray-900 mb-1">
                          {order.orderNumber}
                        </h3>

                        {/* Supplier */}
                        <p className="text-sm text-gray-700 mb-3">{order.supplier.name}</p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                          <div className="flex items-center gap-1.5">
                            <Package className="w-4 h-4" />
                            <span>
                              {order.items.length} productos | {order.releaseStatus === 'released' ? `${totalReceived}/${totalExpected}` : totalExpected} unidades
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{getTimeAgo(order.createdAt)}</span>
                          </div>
                          {order.receivedBy && (
                            <div className="flex items-center gap-1.5">
                              <User className="w-4 h-4" />
                              <span>{order.receivedBy}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          {order.releaseStatus === 'released' ? (
                            // Recepciones completadas - solo ver resumen
                            <button
                              onClick={() => handleOrderClick(order)}
                              className="flex-1 py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform bg-green-100 text-green-700 border border-green-300 flex items-center justify-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              VER RESUMEN
                            </button>
                          ) : (
                            // Recepciones pendientes - iniciar recepción
                            <>
                              <button className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 active:scale-95 transition-transform">
                                Ver detalles
                              </button>
                              <button
                                onClick={() => handleOrderClick(order)}
                                className="flex-1 py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform bg-orange-500 text-white"
                              >
                                INICIAR RECEPCIÓN
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Bottom Navigation Spacer */}
      <div className="h-20" />

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <QRScannerWrapper
          onScan={handleOrderBarcodeScan}
          onClose={() => setShowScanner(false)}
          title="Escanear Orden de Compra"
          subtitle="Escanea el código de barras de la orden de recepción"
          expectedType="order"
          simulateValue="OC-2025-001234"
        />
      )}
    </div>
  );
};

export default ReceptionList;
