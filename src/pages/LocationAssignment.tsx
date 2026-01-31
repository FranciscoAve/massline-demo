import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Stepper from '../components/navigation/Stepper';
import { LocationSuggestion } from '../components/location/LocationSuggestion';
import Button from '../components/ui/Button';
import { mockLocations } from '../data/mockData';

const MAX_CAPACITY_PER_LEVEL = 100;

interface ReceiptItem {
  id: string;
  sku: string;
  name: string;
  image: string;
  category: string;
  quantity: number;
}

interface ProductToLocate {
  id: string;
  sku: string;
  name: string;
  image: string;
  quantity: number;
  confirmed: boolean;
  assignedLocation?: string;
  level: string; // N1, N2, N3...
}

const LocationAssignment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as {
    receiptList?: ReceiptItem[];
    orderNumber?: string;
    supplier?: string;
  } | null;

  const receiptList = locationState?.receiptList || [];
  const orderNumber = locationState?.orderNumber || '';
  const supplier = locationState?.supplier || '';

  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  // Construir productos desde la lista de recibo, asignando un nivel a cada uno
  const [products, setProducts] = useState<ProductToLocate[]>(() =>
    receiptList.map((item, index) => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      confirmed: false,
      level: `N${index + 1}`,
    }))
  );

  const currentProduct = products[currentProductIndex];

  // Si no hay productos, redirigir a la lista de recibo
  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 mb-4">No hay productos para ubicar.</p>
        <Button onClick={() => navigate('/reception/scan')}>Volver a Lista de Recibo</Button>
      </div>
    );
  }

  // Ubicación base: misma zona/pasillo/estante, diferente nivel por producto
  // Formato: Z01-Pa-E2-N[nivel]
  const locationCode = `Z01-Pa-E2-${currentProduct.level}`;
  const utilizationPercent = Math.min((currentProduct.quantity / MAX_CAPACITY_PER_LEVEL) * 100, 100);
  const isFull = currentProduct.quantity >= MAX_CAPACITY_PER_LEVEL;

  // Alternativas solo cuando el nivel está lleno
  const alternativeLocations = mockLocations
    .filter(l => l.code !== locationCode && l.type === 'storage')
    .slice(0, 2);

  const handleConfirmLocation = () => {
    const updatedProducts = [...products];
    updatedProducts[currentProductIndex].confirmed = true;
    updatedProducts[currentProductIndex].assignedLocation = locationCode;
    setProducts(updatedProducts);

    setTimeout(() => {
      if (currentProductIndex < products.length - 1) {
        setCurrentProductIndex(currentProductIndex + 1);
      } else {
        // Pasar todos los productos confirmados a la página de confirmación
        navigate('/reception/confirmation', {
          state: {
            orderNumber,
            supplier,
            products: updatedProducts.map((p) => ({
              name: p.name,
              sku: p.sku,
              quantity: p.quantity,
              location: p.assignedLocation || locationCode,
            })),
          },
        });
      }
    }, 1500);
  };

  const handlePrevious = () => {
    if (currentProductIndex > 0) {
      setCurrentProductIndex(currentProductIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentProduct.confirmed && currentProductIndex < products.length - 1) {
      setCurrentProductIndex(currentProductIndex + 1);
    } else if (currentProduct.confirmed && currentProductIndex === products.length - 1) {
      navigate('/reception/confirmation', {
        state: {
          orderNumber,
          supplier,
          products: products.map((p) => ({
            name: p.name,
            sku: p.sku,
            quantity: p.quantity,
            location: p.assignedLocation || `Z01-Pa-E2-${p.level}`,
          })),
        },
      });
    }
  };

  const completedCount = products.filter(p => p.confirmed).length;

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
        <h1 className="text-lg font-bold text-gray-900">Ubicación de Productos</h1>
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
        currentStep={2}
      />

      {/* Content */}
      <div className="flex-1 p-4 pb-44 overflow-y-auto">
        {/* Product Counter */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">
            PRODUCTO {currentProductIndex + 1} de {products.length}
          </p>
        </div>

        {/* Current Product Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-start gap-3">
            <img
              src={currentProduct.image}
              alt={currentProduct.name}
              className="w-16 h-16 rounded-lg bg-gray-100 object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 mb-0.5">
                {currentProduct.name}
              </h3>
              <p className="text-sm text-gray-500 font-mono mb-2">{currentProduct.sku}</p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Cantidad:</span> {currentProduct.quantity} / {MAX_CAPACITY_PER_LEVEL} unidades
              </p>
            </div>
          </div>
        </div>

        {/* Location Suggestion */}
        <div className="mb-4">
          <LocationSuggestion
            locationCode={locationCode}
            zone="A"
            aisle="03"
            rack="E2"
            level={currentProduct.level}
            reason="Zona de alta rotación con espacio disponible"
            utilization={utilizationPercent}
            isConfirmed={currentProduct.confirmed}
            onConfirmPress={handleConfirmLocation}
            onMapPress={() => alert('Vista de mapa (próximamente)')}
          />
        </div>

        {/* Alternativas - solo cuando el nivel está al 100% */}
        {isFull && !currentProduct.confirmed && (
          <>
            <p className="text-sm text-red-500 font-medium mb-2">
              Nivel lleno - Ubicaciones alternativas:
            </p>
            <div className="space-y-1 mb-4">
              {alternativeLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="bg-white rounded-lg px-4 py-2 text-sm text-gray-600"
                >
                  {loc.code} ({Math.round((1 - loc.currentUtilization) * 100)}% disponible)
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 fixed bottom-0 left-0 right-0">
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="text-gray-600">
            {completedCount}/{products.length} productos ubicados
          </span>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handlePrevious}
            disabled={currentProductIndex === 0}
            variant="secondary"
            className="flex-1"
          >
            Anterior
          </Button>
          <Button
            onClick={handleNext}
            disabled={!currentProduct.confirmed}
            className="flex-1"
          >
            {currentProductIndex === products.length - 1 ? 'FINALIZAR' : 'SIGUIENTE'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationAssignment;
