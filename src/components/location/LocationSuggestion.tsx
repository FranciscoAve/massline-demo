import React from 'react';
import { Navigation, Map, CheckCircle, MapPin } from 'lucide-react';

interface LocationSuggestionProps {
  locationCode: string;
  zone: string;
  aisle: string;
  rack: string;
  level: string;
  reason: string;
  utilization: number;
  isConfirmed?: boolean;
  onConfirmPress: () => void;
  onMapPress?: () => void;
}

export const LocationSuggestion: React.FC<LocationSuggestionProps> = ({
  locationCode,
  zone,
  aisle,
  rack,
  level,
  reason,
  utilization,
  isConfirmed = false,
  onConfirmPress,
  onMapPress,
}) => {
  if (isConfirmed) {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 flex flex-col items-center">
        <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
        <p className="text-sm font-bold text-green-600 mb-1">
          UBICACIÓN CONFIRMADA
        </p>
        <p className="text-xl font-bold text-gray-900 font-mono mb-1">
          {locationCode}
        </p>
        <p className="text-xs text-gray-500">Almacenado exitosamente</p>
      </div>
    );
  }

  const availableSpace = 100 - utilization;

  return (
    <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center mb-3">
        <Navigation className="w-5 h-5 text-blue-500" />
        <span className="text-xs font-bold text-blue-600 ml-1.5">
          UBICACIÓN ASIGNADA
        </span>
      </div>

      {/* Location Info */}
      <div className="bg-white rounded-lg p-3 mb-3">
        <p className="text-sm font-semibold text-gray-700">
          ZONA {zone} - PASILLO {aisle}
        </p>
        <p className="text-sm font-semibold text-gray-700 mt-0.5">
          ESTANTE {rack} - NIVEL {level}
        </p>

        <div className="bg-gray-100 rounded-lg py-3 mt-3 flex items-center justify-center">
          <p className="text-2xl font-bold font-mono text-gray-900">
            {locationCode}
          </p>
        </div>

        <p className="text-xs text-gray-500 italic mt-2">{reason}</p>

        {/* Utilization Bar */}
        <div className="flex items-center mt-3 gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">
            Espacio disponible:
          </span>
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${availableSpace}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-green-600 whitespace-nowrap">
            {availableSpace}%
          </span>
        </div>
      </div>

      {/* Actions */}
      {onMapPress && (
        <button
          onClick={onMapPress}
          className="flex items-center justify-center gap-2 mb-3 w-full py-2 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Map className="w-4.5 h-4.5 text-blue-500" />
          <span className="text-sm text-blue-600">Ver en mapa</span>
        </button>
      )}

      <button
        onClick={onConfirmPress}
        className="w-full bg-blue-500 text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold active:scale-[0.98] transition-transform shadow-md"
      >
        <MapPin className="w-6 h-6" />
        <span>CONFIRMAR UBICACIÓN</span>
      </button>
    </div>
  );
};
