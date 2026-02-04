import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Package, Clock, User, CheckCircle, AlertCircle, Wrench, ChevronRight, Eye, ScanBarcode } from 'lucide-react';
import { mockOrders } from '../data/mockData';
import { useWorkshopOrdersStore } from '../stores/workshopOrdersStore';
import EmptyState from '../components/ui/EmptyState';
import { QRScannerWrapper } from '../components/scanner/QRScannerWrapper';

type ReleaseFilter = 'all' | 'released' | 'unreleased' | 'internal';

const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<ReleaseFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  // Obtener órdenes del taller desde el store
  const { orders: workshopOrders } = useWorkshopOrdersStore();

  // Combinar mockOrders con órdenes del taller
  const allOrders = useMemo(() => {
    return [...mockOrders, ...workshopOrders];
  }, [workshopOrders]);

  // Contadores por categoría
  const releasedOrders = allOrders.filter(o => o.releaseStatus === 'released');
  const unreleasedOrders = allOrders.filter(o => o.releaseStatus === 'unreleased');
  const internalOrders = allOrders.filter(o => o.releaseStatus === 'internal');

  const categories = [
    {
      id: 'released' as const,
      label: 'Liberadas',
      description: 'Órdenes completadas',
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
      description: 'Pendientes de confirmar',
      count: unreleasedOrders.length,
      icon: AlertCircle,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
    },
    {
      id: 'internal' as const,
      label: 'Internas',
      description: 'Taller de ensamblaje',
      count: internalOrders.length,
      icon: Wrench,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
    },
  ];

  const getFilteredOrders = () => {
    let orders = allOrders;

    if (selectedFilter !== 'all') {
      orders = orders.filter(o => o.releaseStatus === selectedFilter);
    }

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      orders = orders.filter(order =>
        order.orderNumber.toLowerCase().includes(search) ||
        order.destination.name.toLowerCase().includes(search)
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

  // Manejar escaneo de código de barras de orden
  const handleOrderBarcodeScan = (barcode: string) => {
    setShowScanner(false);

    // Extraer número de orden del código escaneado
    let orderNum = barcode;
    if (barcode.startsWith('SS:DP:')) {
      orderNum = barcode.substring(6);
    } else if (barcode.startsWith('SS:INT:')) {
      orderNum = barcode.substring(7);
    }

    // Buscar la orden
    const order = allOrders.find(o =>
      o.orderNumber === orderNum ||
      o.orderNumber.includes(orderNum)
    );

    if (order) {
      // Navegar directamente al proceso de picking
      navigate(`/dispatch/picking/${order.id}`);
    } else {
      // Si no se encuentra, poner en el buscador
      setSearchQuery(orderNum);
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
          <h1 className="text-lg font-bold text-gray-900">Órdenes de Despacho</h1>
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
              <span className="text-gray-500">Total de órdenes</span>
              <span className="font-bold text-gray-900">{allOrders.length}</span>
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
                  placeholder="Buscar por # orden, tienda..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {/* Botón de escaneo solo para no liberadas e internas */}
              {(selectedFilter === 'unreleased' || selectedFilter === 'internal') && (
                <button
                  onClick={() => setShowScanner(true)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center active:scale-95 transition-transform flex-shrink-0 ${
                    selectedFilter === 'internal' ? 'bg-purple-500' : 'bg-orange-500'
                  }`}
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
                  return (
                    <div
                      key={order.id}
                      className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 ${
                        order.priority === 'urgent'
                          ? 'border-red-500'
                          : order.releaseStatus === 'released'
                            ? 'border-green-500'
                            : order.releaseStatus === 'internal'
                              ? 'border-purple-500'
                              : 'border-orange-500'
                      }`}
                    >
                      <div className="p-4">
                        {/* Priority & Type Badges */}
                        <div className="flex items-center gap-2 mb-2">
                          {order.releaseStatus === 'released' ? (
                            <div className="flex items-center gap-1 bg-green-100 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span className="text-xs font-bold text-green-600">COMPLETADA</span>
                            </div>
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
                        </div>

                        {/* Order Number */}
                        <h3 className="text-base font-bold text-gray-900 mb-1">
                          ORDEN {order.orderNumber}
                        </h3>

                        {/* Destination */}
                        <p className="text-sm text-gray-700 mb-3">{order.destination.name}</p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                          <div className="flex items-center gap-1.5">
                            <Package className="w-4 h-4" />
                            <span>
                              {order.items.length} productos | {order.items.reduce((sum, item) => sum + item.requestedQuantity, 0)} unidades
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{getTimeAgo(order.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            <span>{order.assignedTo || 'Sin asignar'}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          {order.releaseStatus === 'released' ? (
                            // Órdenes completadas - solo ver resumen
                            <button
                              onClick={() => navigate(`/dispatch/confirmation/${order.id}`)}
                              className="flex-1 py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform bg-green-100 text-green-700 border border-green-300 flex items-center justify-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              VER RESUMEN
                            </button>
                          ) : (
                            // Órdenes pendientes - acciones normales
                            <>
                              <button className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 active:scale-95 transition-transform">
                                Ver detalles
                              </button>
                              <button
                                onClick={() => navigate(`/dispatch/picking/${order.id}`)}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform ${
                                  order.releaseStatus === 'internal'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-orange-500 text-white'
                                }`}
                              >
                                {order.releaseStatus === 'internal' ? 'PREPARAR' : 'INICIAR PICKING'}
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
          title="Escanear Orden"
          subtitle="Escanea el código de barras de la orden de despacho"
          expectedType="order"
          simulateValue={selectedFilter === 'internal' ? 'INT-2025-0023' : 'DP-2025-0145'}
        />
      )}
    </div>
  );
};

export default OrderList;
