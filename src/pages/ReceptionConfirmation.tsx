import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, ChevronDown, Mail, Printer, AlertTriangle, Bell, Share2, X, MessageCircle } from 'lucide-react';
import Stepper from '../components/navigation/Stepper';
import Button from '../components/ui/Button';

interface ConfirmedProduct {
  name: string;
  sku: string;
  quantity: number;
  expectedQuantity?: number;
  location: string;
  hasDiscrepancy?: boolean;
  problemNotified?: boolean;
}

const ReceptionConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as {
    orderNumber?: string;
    supplier?: string;
    products?: ConfirmedProduct[];
  } | null;

  const [showProductsTable, setShowProductsTable] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const [printStarted, setPrintStarted] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const confirmedProducts = locationState?.products || [];
  const totalProducts = confirmedProducts.length;
  const totalUnits = confirmedProducts.reduce((sum, p) => sum + p.quantity, 0);
  const totalExpected = confirmedProducts.reduce((sum, p) => sum + (p.expectedQuantity || p.quantity), 0);

  // Productos con discrepancias
  const productsWithDiscrepancy = confirmedProducts.filter(p => p.hasDiscrepancy);
  const hasDiscrepancies = productsWithDiscrepancy.length > 0;

  const receptionData = {
    orderNumber: locationState?.orderNumber || 'Sin orden',
    supplier: locationState?.supplier || 'No especificado',
    date: new Date().toLocaleString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    operator: 'Operador actual',
    products: confirmedProducts,
    totalProducts,
    totalUnits,
    totalExpected,
  };

  // Opciones de compartir
  const shareOptions = [
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500', textColor: 'text-green-600' },
    { id: 'gmail', name: 'Gmail', icon: Mail, color: 'bg-red-500', textColor: 'text-red-600' },
    { id: 'outlook', name: 'Outlook', icon: Mail, color: 'bg-blue-500', textColor: 'text-blue-600' },
    { id: 'other', name: 'Otro', icon: Share2, color: 'bg-gray-500', textColor: 'text-gray-600' },
  ];

  // Manejar selección de opción de compartir
  const handleShareOption = (optionId: string) => {
    setShowShareOptions(false);
    setEmailSent(true);

    const optionName = shareOptions.find(o => o.id === optionId)?.name || optionId;

    setTimeout(() => {
      alert(`Resumen enviado por ${optionName}.\n\nOrden: ${receptionData.orderNumber}\nProductos: ${totalProducts}\nUnidades: ${totalUnits}${hasDiscrepancies ? `\n\nALERTA: ${productsWithDiscrepancy.length} productos con cantidad incompleta` : ''}`);
    }, 500);
  };

  // Simular impresión
  const handlePrint = () => {
    setPrintStarted(true);
    // Simular apertura de diálogo de impresión
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 text-center sticky top-0 z-10">
          <h1 className="text-lg font-bold text-gray-900">Resumen de Recepción</h1>
        </div>

        {/* Stepper - Actualizado a 3 pasos */}
        <Stepper
          steps={[
            { label: 'Inicio' },
            { label: 'Recibo' },
            { label: 'Confirmar' },
          ]}
          currentStep={2}
        />

        {/* Content */}
        <div className="flex-1 p-4 pb-32 overflow-y-auto">
        {/* Success Animation */}
        <div className="flex flex-col items-center py-8 mb-6">
          <div className={`w-20 h-20 ${hasDiscrepancies ? 'bg-yellow-100' : 'bg-green-100'} rounded-full flex items-center justify-center mb-4 animate-bounce`}>
            {hasDiscrepancies ? (
              <AlertTriangle className="w-12 h-12 text-yellow-500" strokeWidth={3} />
            ) : (
              <CheckCircle2 className="w-12 h-12 text-green-500" strokeWidth={3} />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {hasDiscrepancies ? '⚠️ RECEPCIÓN CON ALERTAS' : '✓ RECEPCIÓN COMPLETA'}
          </h2>
          <p className="text-gray-600">Orden {receptionData.orderNumber} procesada</p>
          {hasDiscrepancies && (
            <p className="text-yellow-600 text-sm mt-2">
              {productsWithDiscrepancy.length} producto(s) con cantidad incompleta
            </p>
          )}
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Proveedor:</p>
              <p className="font-semibold text-gray-900">{receptionData.supplier}</p>
            </div>
            <div>
              <p className="text-gray-500">Fecha:</p>
              <p className="font-semibold text-gray-900">{receptionData.date}</p>
            </div>
            <div>
              <p className="text-gray-500">Operador:</p>
              <p className="font-semibold text-gray-900">{receptionData.operator}</p>
            </div>
            <div>
              <p className="text-gray-500">Total unidades:</p>
              <p className="font-semibold text-gray-900">
                {receptionData.totalUnits}
                {receptionData.totalExpected > receptionData.totalUnits && (
                  <span className="text-yellow-600 text-xs ml-1">
                    (de {receptionData.totalExpected} esperadas)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Alerta de discrepancias */}
        {hasDiscrepancies && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-yellow-800 mb-2">Productos con cantidad incompleta</h3>
                <div className="space-y-2">
                  {productsWithDiscrepancy.map((product, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-yellow-100 rounded-lg px-3 py-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-600 font-mono">{product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-800 font-bold">
                          {product.quantity} / {product.expectedQuantity}
                        </p>
                        {product.problemNotified && (
                          <span className="inline-flex items-center gap-1 text-xs text-orange-600">
                            <Bell className="w-3 h-3" />
                            Notificado
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Table (Collapsible) */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <button
            onClick={() => setShowProductsTable(!showProductsTable)}
            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 border-b border-gray-200"
          >
            <span className="text-sm font-semibold text-gray-700">
              {receptionData.totalProducts} productos recibidos ({receptionData.totalUnits}{' '}
              und)
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform ${
                showProductsTable ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showProductsTable && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                      Producto
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">
                      Recibido
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">
                      Ubic.
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {receptionData.products.map((product, index) => {
                    const hasIssue = product.hasDiscrepancy;
                    return (
                      <tr key={index} className={`border-b border-gray-100 last:border-none ${hasIssue ? 'bg-yellow-50' : ''}`}>
                        <td className="px-4 py-3">
                          <p className="text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{product.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-semibold ${hasIssue ? 'text-yellow-600' : 'text-gray-900'}`}>
                            {product.quantity}
                            {product.expectedQuantity && product.expectedQuantity !== product.quantity && (
                              <span className="text-gray-400 text-xs ml-1">/{product.expectedQuantity}</span>
                            )}
                          </span>
                          {hasIssue && product.problemNotified && (
                            <Bell className="w-3 h-3 text-orange-500 inline ml-1" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-blue-600 text-xs">
                          {product.location}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>


        {/* Actions */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => !emailSent && setShowShareOptions(true)}
            disabled={emailSent}
            className={`flex-1 py-3 border rounded-xl flex items-center justify-center gap-2 font-medium active:scale-95 transition-transform ${
              emailSent
                ? 'border-green-300 bg-green-50 text-green-700'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            {emailSent ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Enviado</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                <span>Enviar</span>
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className={`flex-1 py-3 border rounded-xl flex items-center justify-center gap-2 font-medium active:scale-95 transition-transform ${
              printStarted
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            <Printer className="w-5 h-5" />
            <span>{printStarted ? 'Imprimiendo...' : 'Imprimir'}</span>
          </button>
        </div>
      </div>

      {/* Modal de opciones de compartir */}
      {showShareOptions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Compartir resumen</h3>
              <button
                onClick={() => setShowShareOptions(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Selecciona cómo deseas enviar el resumen de la recepción
            </p>

            <div className="grid grid-cols-4 gap-3 mb-4">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleShareOption(option.id)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 active:scale-95 transition-transform"
                  >
                    <div className={`w-12 h-12 ${option.color} rounded-full flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{option.name}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowShareOptions(false)}
              className="w-full py-3 border border-gray-300 rounded-xl text-gray-700 font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 fixed bottom-0 left-0 right-0">
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => navigate('/reception/start')}>
            NUEVA RECEPCIÓN
          </Button>
          <Button className="flex-1" onClick={() => navigate('/dashboard')}>
            IR AL HOME
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReceptionConfirmation;