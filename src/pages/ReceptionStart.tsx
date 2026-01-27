import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, HelpCircle, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { mockApi } from '../services/mockApi';

const ReceptionStart: React.FC = () => {
  const navigate = useNavigate();
  const [hasOrder, setHasOrder] = useState(true);
  const [orderNumber, setOrderNumber] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [supplier, setSupplier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const reasons = [
    'Compra local sin OC',
    'Devolución de cliente',
    'Transferencia entre bodegas',
    'Ajuste de inventario',
  ];

  const recentSuppliers = [
    'AutoParts Supply Co.',
    'Mega Repuestos S.A.',
  ];

  const handleSearch = async () => {
    setError('');
    setIsLoading(true);

    try {
      const order = await mockApi.orders.getByNumber(orderNumber);
      if (order) {
        // Navigate to product scanning with order data
        navigate('/reception/scan', { state: { order } });
      } else {
        setError('Orden no encontrada. Verifique el número e intente nuevamente.');
      }
    } catch {
      setError('Error al buscar la orden. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (hasOrder && !orderNumber) {
      setError('Por favor ingrese el número de orden');
      return;
    }

    if (!hasOrder && !selectedReason) {
      setError('Por favor seleccione un motivo de recepción');
      return;
    }

    // Simulate QR scan for demo with correct order number
    if (orderNumber === 'OC-2025-001234') {
      handleSearch();
    } else {
      // Navigate to next step
      navigate('/reception/scan', {
        state: {
          hasOrder,
          orderNumber,
          reason: selectedReason,
          supplier,
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm px-5 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="touch-target flex items-center justify-center"
        >
          <ArrowLeft className="h-6 w-6 text-text-primary" />
        </button>
        <h1 className="text-h4 font-semibold text-text-primary">
          Nueva Recepción
        </h1>
        <button className="touch-target flex items-center justify-center">
          <HelpCircle className="h-6 w-6 text-text-secondary" />
        </button>
      </header>

      {/* Stepper */}
      <div className="bg-white px-5 py-4 border-b border-border-light">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex flex-col items-center gap-1">
            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
              1
            </div>
            <span className="text-xs text-primary font-medium">Inicio</span>
          </div>
          <div className="flex-1 h-1 bg-border-light mx-2" />
          <div className="flex flex-col items-center gap-1">
            <div className="h-10 w-10 rounded-full bg-border-light text-text-tertiary flex items-center justify-center font-semibold">
              2
            </div>
            <span className="text-xs text-text-tertiary">Recibo</span>
          </div>
          <div className="flex-1 h-1 bg-border-light mx-2" />
          <div className="flex flex-col items-center gap-1">
            <div className="h-10 w-10 rounded-full bg-border-light text-text-tertiary flex items-center justify-center font-semibold">
              3
            </div>
            <span className="text-xs text-text-tertiary">Ubicación</span>
          </div>
          <div className="flex-1 h-1 bg-border-light mx-2" />
          <div className="flex flex-col items-center gap-1">
            <div className="h-10 w-10 rounded-full bg-border-light text-text-tertiary flex items-center justify-center font-semibold">
              4
            </div>
            <span className="text-xs text-text-tertiary">Confirmar</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 space-y-6 pb-44">
        {/* Order Type Selection */}
        <div>
          <h4 className="text-h5 font-semibold text-text-primary mb-3">
            ¿Tiene orden de compra?
          </h4>
          <div className="flex gap-3">
            <Button
              variant={hasOrder ? 'primary' : 'secondary'}
              size="md"
              fullWidth
              onClick={() => setHasOrder(true)}
            >
              SÍ
            </Button>
            <Button
              variant={!hasOrder ? 'primary' : 'secondary'}
              size="md"
              fullWidth
              onClick={() => setHasOrder(false)}
            >
              NO
            </Button>
          </div>
        </div>

        {/* With Order */}
        {hasOrder && (
          <div className="space-y-4 animate-fade-in">
            <label className="text-sm font-medium text-text-secondary mb-1 block">
              Número de orden de compra
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Ej: OC-2025-001234"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                fullWidth
                disabled={isLoading}
              />
              <Button
                variant="primary"
                size="md"
                onClick={handleSearch}
                isLoading={isLoading}
                disabled={!orderNumber || isLoading}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>

            {error && (
              <Card variant="outlined" className="bg-error-bg border-error">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-error">{error}</p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Without Order */}
        {!hasOrder && (
          <div className="space-y-4 animate-fade-in">
            <Card className="bg-warning-bg border-2 border-warning-border">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning-dark mb-1">
                    Recepción sin orden previa
                  </p>
                  <p className="text-xs text-text-secondary">
                    Deberá identificar productos manualmente
                  </p>
                </div>
              </div>
            </Card>

            <div>
              <label className="text-sm font-medium text-text-secondary mb-2 block">
                Motivo de recepción *
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full h-14 px-4 rounded-input border border-border-medium bg-white text-base text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value="">Seleccione un motivo</option>
                {reasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Supplier (Optional) */}
        <div>
          <label className="text-sm font-medium text-text-secondary mb-2 block">
            Proveedor (Opcional)
          </label>
          <Input
            placeholder="Ingrese o seleccione proveedor"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            fullWidth
          />
          {recentSuppliers.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {recentSuppliers.map((s) => (
                <button
                  key={s}
                  onClick={() => setSupplier(s)}
                  className="px-3 py-1.5 bg-bg-tertiary text-text-secondary text-xs rounded-lg hover:bg-border-medium transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-light p-2 space-y-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleContinue}
          disabled={
            (hasOrder && !orderNumber) || (!hasOrder && !selectedReason)
          }
        >
          CONTINUAR
        </Button>
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={() => navigate('/dashboard')}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default ReceptionStart;
