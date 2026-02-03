import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PackageOpen,
  PackageCheck,
  Search,
  AlertCircle,
  Bell,
  QrCode,
  Clock,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import Spinner from '../components/ui/Spinner';
import SyncStatus from '../components/ui/SyncStatus';
import { useAuthStore } from '../stores/authStore';
import { useOfflineSync } from '../hooks';
import { mockApi } from '../services/mockApi';
import {
  formatRelativeTime,
  getUserInitials,
  getColorFromString,
} from '../lib/utils';
import type { DashboardStats, Task } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isOnline, pendingCount, isSyncing, syncNow } = useOfflineSync();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, tasksData] = await Promise.all([
          mockApi.dashboard.getStats(),
          mockApi.dashboard.getTasks(user?.id || ''),
        ]);
        setStats(statsData);
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const actionCards = [
    {
      id: 'reception',
      title: 'RECEPCIÓN',
      icon: PackageOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      route: '/reception/list',
    },
    {
      id: 'dispatch',
      title: 'DESPACHO',
      icon: PackageCheck,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      route: '/dispatch/orders',
    },
    {
      id: 'query',
      title: 'CONSULTAR',
      icon: Search,
      color: 'text-info',
      bgColor: 'bg-info/10',
      route: '/query',
    },
    {
      id: 'report',
      title: 'REPORTAR',
      icon: AlertCircle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      route: '/report',
    },
  ];

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'URGENTE';
      case 'high':
        return 'ALTA';
      case 'normal':
        return 'NORMAL';
      default:
        return priority.toUpperCase();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" text="Cargando dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary pb-20">
      {/* Sync Status Bar - solo muestra si hay algo relevante */}
      <SyncStatus
        isOnline={isOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        onSyncClick={syncNow}
        variant="bar"
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm px-5 py-4 flex items-center justify-between">
        <Logo variant="massline" size="sm" />
        <div className="flex items-center gap-3">
          {/* Sync Status Badge */}
          <SyncStatus
            isOnline={isOnline}
            pendingCount={pendingCount}
            isSyncing={isSyncing}
            onSyncClick={syncNow}
            variant="badge"
          />
          <button className="relative touch-target flex items-center justify-center">
            <Bell className="h-6 w-6 text-text-secondary" />
            {stats && stats.lowStockAlerts > 0 && (
              <span className="absolute -top-1 -right-1 bg-error text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {stats.lowStockAlerts}
              </span>
            )}
          </button>
          <button
            onClick={logout}
            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            style={{ backgroundColor: getColorFromString(user?.name || '') }}
          >
            {getUserInitials(user?.name || '')}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-5 space-y-6">
        {/* Welcome Section */}
        <Card variant="elevated" className="animate-fade-in">
          <h2 className="text-h3 font-bold text-text-primary mb-2">
            ¡Hola, {user?.name?.split(' ')[0]}!
          </h2>
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
            <Clock className="h-4 w-4" />
            <span>
              {currentTime.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          {stats && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <PackageCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">
                    {stats.pendingOrders}
                  </p>
                  <p className="text-xs text-text-secondary">
                    órdenes pendientes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-success/10 rounded-lg">
                  <PackageOpen className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">
                    {stats.productsReceivedToday}
                  </p>
                  <p className="text-xs text-text-secondary">
                    productos recibidos hoy
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Action Cards */}
        <div>
          <h3 className="text-h5 font-semibold text-text-primary mb-4">
            Acciones Principales
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {actionCards.map((card, index) => (
              <Card
                key={card.id}
                variant="default"
                padding="lg"
                className="cursor-pointer hover:shadow-lg transition-all active:scale-95 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(card.route)}
              >
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <div className={`p-4 rounded-2xl ${card.bgColor}`}>
                    <card.icon className={`h-12 w-12 ${card.color}`} />
                  </div>
                  <p className="text-base font-bold text-text-primary">
                    {card.title}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Pending Tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h5 font-semibold text-text-primary">
              Tareas Asignadas
            </h3>
            {tasks.length > 0 && (
              <Badge variant="primary">{tasks.length}</Badge>
            )}
          </div>

          {tasks.length === 0 ? (
            <Card className="text-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-success/10 rounded-full">
                  <PackageCheck className="h-8 w-8 text-success" />
                </div>
                <p className="text-text-secondary">
                  No tienes tareas pendientes
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        task.type === 'reception'
                          ? 'bg-primary/10'
                          : 'bg-secondary/10'
                      }`}
                    >
                      {task.type === 'reception' ? (
                        <PackageOpen className="h-5 w-5 text-primary" />
                      ) : (
                        <PackageCheck className="h-5 w-5 text-secondary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-text-primary">
                          {task.title}
                        </h4>
                        <Badge
                          variant={getPriorityBadgeVariant(task.priority)}
                          size="sm"
                        >
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-secondary mb-2">
                        {task.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-tertiary">
                          {formatRelativeTime(task.createdAt)}
                        </span>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (task.type === 'dispatch' && task.orderId) {
                              // Navegar directamente al picking de esta orden
                              navigate(`/dispatch/picking/${task.orderId}`);
                            } else if (task.type === 'reception') {
                              // Navegar a recepción con la orden pre-cargada
                              navigate('/reception/start', {
                                state: { orderNumber: task.orderNumber },
                              });
                            } else {
                              // Fallback a lista general
                              navigate(task.type === 'dispatch' ? '/dispatch/orders' : '/reception/start');
                            }
                          }}
                        >
                          Iniciar
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-light px-2 py-2 z-50">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 px-3 py-2 text-primary">
            <div className="h-1 w-8 bg-primary rounded-full mb-1" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 px-3 py-2 text-text-tertiary"
            onClick={() => navigate('/tasks')}
          >
            <PackageCheck className="h-6 w-6" />
            <span className="text-xs">Tareas</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-3 py-2 text-text-tertiary">
            <QrCode className="h-6 w-6" />
            <span className="text-xs">Escanear</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 px-3 py-2 text-text-tertiary"
            onClick={() => navigate('/query')}
          >
            <Search className="h-6 w-6" />
            <span className="text-xs">Consultas</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 px-3 py-2 text-text-tertiary"
            onClick={logout}
          >
            <AlertCircle className="h-6 w-6" />
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
