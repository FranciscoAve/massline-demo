import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Clock, LogOut, Wrench, ChevronRight, Trash2, X, AlertTriangle } from 'lucide-react';
import Logo from '../components/ui/Logo';
import Badge from '../components/ui/Badge';
import { useAuthStore } from '../stores/authStore';
import { useWorkshopOrdersStore } from '../stores/workshopOrdersStore';
import { formatRelativeTime } from '../lib/utils';
import BottomNav from '../components/layout/BottomNav';

const WorkshopDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { orders, deleteOrder } = useWorkshopOrdersStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteOrder = (orderId: string) => {
    deleteOrder(orderId);
    setOrderToDelete(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-EC', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  // Ordenar órdenes por fecha (más recientes primero)
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'in_progress':
        return <Badge variant="info">En proceso</Badge>;
      case 'dispatched':
        return <Badge variant="success">Despachado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 pb-24 space-y-4">
        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Hola, {user?.name || 'Taller'}</h1>
              <p className="text-purple-100 text-sm capitalize">{formatDate(currentTime)}</p>
            </div>
          </div>
          <p className="text-purple-100 text-sm">
            Solicita productos del almacén para tu línea de ensamblaje
          </p>
        </div>

        {/* Main Action Button */}
        <button
          onClick={() => navigate('/workshop/create-order')}
          className="w-full bg-white rounded-2xl p-6 shadow-sm border-2 border-purple-200 hover:border-purple-400 transition-all active:scale-[0.98] group"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Plus className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <h2 className="text-lg font-bold text-gray-900">CREAR ORDEN INTERNA</h2>
              <p className="text-sm text-gray-500">Solicitar productos del almacén</p>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors" />
          </div>
        </button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-500">Órdenes creadas</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-500">Pendientes</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {orders.filter((o) => o.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Orders History */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Mis órdenes</h3>
          </div>

          {sortedOrders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No has creado órdenes aún</p>
              <p className="text-gray-400 text-xs mt-1">
                Toca el botón de arriba para crear tu primera orden
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sortedOrders.map((order) => (
                <div key={order.id} className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 font-mono text-sm">
                      {order.orderNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.status)}
                      {order.status === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrderToDelete(order.id);
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          title="Eliminar orden"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {order.items.length} productos ·{' '}
                      {order.items.reduce((sum, item) => sum + item.requestedQuantity, 0)} unidades
                    </span>
                    <span className="text-gray-400 text-xs">
                      {formatRelativeTime(new Date(order.createdAt))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Eliminar orden</h3>
              </div>
              <button
                onClick={() => setOrderToDelete(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-2">
              ¿Estás seguro de que deseas eliminar esta orden?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Orden: <span className="font-mono font-semibold">
                {orders.find(o => o.id === orderToDelete)?.orderNumber}
              </span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteOrder(orderToDelete)}
                className="flex-1 py-2.5 px-4 bg-red-600 rounded-xl text-white font-medium hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopDashboard;
