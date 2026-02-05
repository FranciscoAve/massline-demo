import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, X, ZoomIn, ZoomOut, ChevronLeft, Move, Home } from 'lucide-react';
import { mockShelfInventory, type ShelfProduct } from '../data/mockData';

// Constantes de la bodega
const TOTAL_ROWS = 32;
const COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const LEVELS = [5, 4, 3, 2, 1]; // De arriba hacia abajo

// Configuración de zoom
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;

// Tipos
interface LocationData {
  row: number;
  column: string;
  level: number;
  products: ShelfProduct[];
}

interface ViewState {
  zoom: number;
  x: number;
  y: number;
}

// Procesar el inventario para obtener un mapa de ubicaciones ocupadas
const processInventory = (): Map<string, ShelfProduct[]> => {
  const locationMap = new Map<string, ShelfProduct[]>();

  Object.entries(mockShelfInventory).forEach(([locationCode, products]) => {
    locationMap.set(locationCode, products);
  });

  return locationMap;
};

// Obtener productos en una ubicación específica
const getProductsAtLocation = (
  inventory: Map<string, ShelfProduct[]>,
  row: number,
  column: string,
  level: number
): ShelfProduct[] => {
  const rowStr = row.toString().padStart(2, '0');
  const levelStr = level.toString().padStart(2, '0');
  const locationCode = `${rowStr}-${column}-${levelStr}`;

  return inventory.get(locationCode) || [];
};

// Verificar si una fila tiene productos
const rowHasProducts = (inventory: Map<string, ShelfProduct[]>, row: number): boolean => {
  const rowStr = row.toString().padStart(2, '0');

  for (const [locationCode] of inventory) {
    if (locationCode.startsWith(`${rowStr}-`)) {
      return true;
    }
  }
  return false;
};

// Contar productos en una fila
const countProductsInRow = (inventory: Map<string, ShelfProduct[]>, row: number): number => {
  const rowStr = row.toString().padStart(2, '0');
  let count = 0;

  for (const [locationCode, products] of inventory) {
    if (locationCode.startsWith(`${rowStr}-`)) {
      count += products.length;
    }
  }
  return count;
};

const WarehouseMap: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isZooming, setIsZooming] = useState(false);

  // Estado del mapa interactivo
  const [viewState, setViewState] = useState<ViewState>({ zoom: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPinchDist, setLastPinchDist] = useState<number | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapContentRef = useRef<HTMLDivElement>(null);

  // Procesar inventario
  const inventory = useMemo(() => processInventory(), []);

  // Calcular distancia entre dos puntos táctiles
  const getPinchDistance = (touches: React.TouchList): number => {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  };

  // Manejar zoom
  const handleZoom = useCallback((delta: number, centerX?: number, centerY?: number) => {
    setViewState(prev => {
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom + delta));

      // Si hay un punto central (para zoom hacia ese punto)
      if (centerX !== undefined && centerY !== undefined) {
        // Calcular el desplazamiento necesario para mantener el punto bajo el cursor
        const scale = newZoom / prev.zoom;
        const newX = centerX - (centerX - prev.x) * scale;
        const newY = centerY - (centerY - prev.y) * scale;

        return { zoom: newZoom, x: newX, y: newY };
      }

      return { ...prev, zoom: newZoom };
    });
  }, []);

  // Manejar wheel para zoom
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || selectedRow !== null) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;

      const rect = container.getBoundingClientRect();
      const centerX = e.clientX - rect.left - rect.width / 2;
      const centerY = e.clientY - rect.top - rect.height / 2;

      handleZoom(delta, centerX, centerY);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleZoom, selectedRow]);

  // Manejar touch para pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setLastPinchDist(getPinchDistance(e.touches));
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - viewState.x,
        y: e.touches[0].clientY - viewState.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastPinchDist !== null) {
      e.preventDefault();
      const currentDist = getPinchDistance(e.touches);
      const delta = (currentDist - lastPinchDist) * 0.01;
      handleZoom(delta);
      setLastPinchDist(currentDist);
    } else if (e.touches.length === 1 && isDragging) {
      setViewState(prev => ({
        ...prev,
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      }));
    }
  };

  const handleTouchEnd = () => {
    setLastPinchDist(null);
    setIsDragging(false);
  };

  // Manejar mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Solo click izquierdo
      setIsDragging(true);
      setDragStart({
        x: e.clientX - viewState.x,
        y: e.clientY - viewState.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setViewState(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Animar zoom hacia una fila específica
  const zoomToRow = (rowNum: number) => {
    setIsZooming(true);

    // Calcular posición de la fila (cada fila tiene ~40px de alto + gap)
    const rowHeight = 48; // altura de cada fila
    const targetY = -(rowNum - 16) * rowHeight; // centrar en la fila

    // Animar zoom
    setViewState({ zoom: 2.5, x: 0, y: targetY });

    // Después de la animación, mostrar el detalle de la fila
    setTimeout(() => {
      setSelectedRow(rowNum);
      setIsZooming(false);
      // Resetear view state para cuando vuelva
      setViewState({ zoom: 1, x: 0, y: 0 });
    }, 500);
  };

  // Reset view
  const resetView = () => {
    setViewState({ zoom: 1, x: 0, y: 0 });
  };

  // Vista general de la bodega (estilo mapa interactivo)
  const renderOverview = () => (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Controles de zoom */}
      <div className="absolute top-20 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => handleZoom(ZOOM_STEP)}
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center active:scale-95 transition-transform"
          disabled={viewState.zoom >= MAX_ZOOM}
        >
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={() => handleZoom(-ZOOM_STEP)}
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center active:scale-95 transition-transform"
          disabled={viewState.zoom <= MIN_ZOOM}
        >
          <ZoomOut className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={resetView}
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center active:scale-95 transition-transform"
        >
          <Home className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Info del zoom */}
      <div className="absolute top-20 left-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
        <p className="text-xs text-gray-600 font-medium">
          Zoom: {Math.round(viewState.zoom * 100)}%
        </p>
      </div>

      {/* Contenedor del mapa con scroll/zoom */}
      <div
        ref={mapContainerRef}
        className="flex-1 overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200 relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Contenido del mapa con transformaciones */}
        <div
          ref={mapContentRef}
          className={`absolute inset-0 flex items-center justify-center ${isZooming ? 'transition-transform duration-500 ease-out' : ''}`}
          style={{
            transform: `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.zoom})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Mapa de la bodega - Vista vertical */}
          <div className="flex flex-col items-center py-8">
            {/* Entrada */}
            <div className="mb-4 px-6 py-2 bg-green-500 text-white rounded-full text-sm font-bold shadow-lg">
              🚪 ENTRADA / SALIDA
            </div>

            {/* Pasillo central con filas a los lados */}
            <div className="relative">
              {/* Pasillo central (línea vertical) */}
              <div className="absolute left-1/2 top-0 bottom-0 w-8 bg-amber-100 border-x-2 border-amber-300 -translate-x-1/2 z-0" />

              {/* Filas */}
              <div className="relative z-10 flex flex-col gap-2 px-8">
                {Array.from({ length: TOTAL_ROWS }, (_, i) => i + 1).map((rowNum) => {
                  const hasProducts = rowHasProducts(inventory, rowNum);
                  const productCount = countProductsInRow(inventory, rowNum);

                  return (
                    <button
                      key={rowNum}
                      onClick={(e) => {
                        e.stopPropagation();
                        zoomToRow(rowNum);
                      }}
                      className={`
                        relative flex items-center justify-between px-4 py-3 rounded-lg
                        min-w-[200px] transition-all duration-200
                        ${hasProducts
                          ? 'bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:scale-105'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:scale-105'
                        }
                      `}
                    >
                      {/* Indicadores laterales (estantes) */}
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                        {COLUMNS.slice(0, 3).map((col) => (
                          <div
                            key={col}
                            className={`w-1.5 h-2 rounded-sm ${hasProducts ? 'bg-blue-300' : 'bg-gray-300'}`}
                          />
                        ))}
                      </div>
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                        {COLUMNS.slice(3).map((col) => (
                          <div
                            key={col}
                            className={`w-1.5 h-2 rounded-sm ${hasProducts ? 'bg-blue-300' : 'bg-gray-300'}`}
                          />
                        ))}
                      </div>

                      {/* Número de fila */}
                      <span className="text-lg font-bold">Fila {rowNum}</span>

                      {/* Contador de productos */}
                      {productCount > 0 ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                          <Package className="w-3 h-3" />
                          {productCount}
                        </span>
                      ) : (
                        <span className="text-sm opacity-60">Vacía</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fondo de bodega */}
            <div className="mt-4 px-6 py-2 bg-gray-500 text-white rounded-full text-sm font-bold shadow-lg">
              🏭 FONDO DE BODEGA
            </div>
          </div>
        </div>
      </div>
      {/* Instrucciones - Responsive */}
      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 sm:py-2 sm:px-3">
        <div className="flex items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-500">
          <span className="flex items-center gap-0.5 sm:gap-1">
            <Move className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>Arrastrar</span>
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-0.5 sm:gap-1">
            <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>Pinch/Scroll</span>
          </span>
        </div>
      </div>
    </div>
  );

  // Vista detallada de una fila
  const renderRowDetail = () => {
    if (selectedRow === null) return null;

    return (
      <div className="p-4 animate-fade-in">
        {/* Header con botón de regreso */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setSelectedRow(null)}
            className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Fila {selectedRow}</h2>
            <p className="text-sm text-gray-500">7 estantes · 5 niveles cada uno</p>
          </div>
        </div>

        {/* Visualización de estantes */}
        <div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto">
          <div className="min-w-[500px]">
            {/* Cabecera de columnas */}
            <div className="flex gap-2 mb-3">
              <div className="w-12" /> {/* Espacio para labels de nivel */}
              {COLUMNS.map((col) => (
                <div key={col} className="flex-1 text-center">
                  <span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                    {col}
                  </span>
                </div>
              ))}
            </div>

            {/* Niveles y celdas */}
            {LEVELS.map((level) => (
              <div key={level} className="flex gap-2 mb-2">
                {/* Label de nivel */}
                <div className="w-12 flex items-center justify-center">
                  <span className="text-xs text-gray-500 font-medium">Nv.{level}</span>
                </div>

                {/* Celdas de cada columna */}
                {COLUMNS.map((col) => {
                  const products = getProductsAtLocation(inventory, selectedRow, col, level);
                  const hasProduct = products.length > 0;

                  return (
                    <button
                      key={`${col}-${level}`}
                      onClick={() => {
                        if (hasProduct) {
                          setSelectedLocation({
                            row: selectedRow,
                            column: col,
                            level,
                            products,
                          });
                        }
                      }}
                      className={`
                        flex-1 h-14 rounded-lg border-2 transition-all relative
                        ${hasProduct
                          ? 'bg-blue-50 border-blue-400 hover:bg-blue-100 cursor-pointer'
                          : 'bg-gray-50 border-gray-200 cursor-default'
                        }
                      `}
                    >
                      {hasProduct && (
                        <>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                          </div>
                          <div className="absolute bottom-1 right-1 text-[10px] text-blue-600 font-medium">
                            {products.length}
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Base del estante */}
            <div className="flex gap-2 mt-1">
              <div className="w-12" />
              {COLUMNS.map((col) => (
                <div key={col} className="flex-1 h-2 bg-gray-300 rounded-b-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex items-center gap-4 mt-4 px-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full" />
            <span className="text-xs text-gray-600">Producto almacenado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <span className="text-xs text-gray-600">Espacio vacío</span>
          </div>
        </div>

        {/* Código de ubicación */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Formato de ubicación: <span className="font-mono font-bold">{selectedRow.toString().padStart(2, '0')}-[A-G]-[1-5]</span>
          </p>
        </div>
      </div>
    );
  };

  // Modal de información del producto
  const renderProductModal = () => {
    if (!selectedLocation) return null;

    const { row, column, level, products } = selectedLocation;
    const locationCode = `${row.toString().padStart(2, '0')}-${column}-${level.toString().padStart(2, '0')}`;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
        <div className="bg-white rounded-t-2xl w-full max-w-lg animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Ubicación {locationCode}</h3>
                <p className="text-xs text-gray-500">
                  Fila {row} · Estante {column} · Nivel {level}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Productos */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            <p className="text-sm text-gray-500 mb-3">
              {products.length} producto{products.length !== 1 ? 's' : ''} en esta ubicación
            </p>

            <div className="space-y-3">
              {products.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-14 h-14 bg-white rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/56?text=📦';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Package className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-blue-600 font-medium">
                        {product.availableQuantity} unidades
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => setSelectedLocation(null)}
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium active:scale-[0.98] transition-transform"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <button
            onClick={() => selectedRow !== null ? setSelectedRow(null) : navigate(-1)}
            className="w-10 h-10 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900">
              {selectedRow !== null ? `Fila ${selectedRow}` : 'Mapa de Bodega'}
            </h1>
            {selectedRow === null && (
              <p className="text-xs text-gray-500">32 filas · 7 estantes · 5 niveles</p>
            )}
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Contenido */}
      {selectedRow === null ? renderOverview() : renderRowDetail()}

      {/* Modal de producto */}
      {renderProductModal()}
      

    </div>
  );
};

export default WarehouseMap;
