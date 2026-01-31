import React from 'react';
import { X, Camera, QrCode, AlertCircle } from 'lucide-react';

interface MockQRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  expectedType?: 'product' | 'location' | 'order';
}

const mockCodes = {
  product: [
    { label: 'Filtro de Aceite XYZ', code: 'SS:P:REP-12345' },
    { label: 'Pastilla de Freno', code: 'SS:P:REP-98765' },
    { label: 'Bujía NGK', code: 'SS:P:REP-55555' },
    { label: 'Amortiguador Delantero', code: 'SS:P:REP-11111' },
    { label: 'Cadena de Transmisión', code: 'SS:P:REP-22222' },
  ],
  location: [
    // Zona 01 - Pasillo a
    { label: 'Z01-Pa-E1-N1', code: 'SS:L:Z01-Pa-E1-N1' },
    { label: 'Z01-Pa-E1-N2', code: 'SS:L:Z01-Pa-E1-N2' },
    { label: 'Z01-Pa-E2-N1', code: 'SS:L:Z01-Pa-E2-N1' },
    { label: 'Z01-Pa-E2-N2', code: 'SS:L:Z01-Pa-E2-N2' },
    // Zona 01 - Pasillo b
    { label: 'Z01-Pb-E1-N1', code: 'SS:L:Z01-Pb-E1-N1' },
    { label: 'Z01-Pb-E1-N2', code: 'SS:L:Z01-Pb-E1-N2' },
    // Zona 02
    { label: 'Z02-Pa-E1-N1', code: 'SS:L:Z02-Pa-E1-N1' },
    { label: 'Z02-Pa-E1-N2', code: 'SS:L:Z02-Pa-E1-N2' },
    { label: 'Z02-Pb-E3-N2', code: 'SS:L:Z02-Pb-E3-N2' },
    { label: 'Z02-Pc-E2-N1', code: 'SS:L:Z02-Pc-E2-N1' },
    // Zona 03
    { label: 'Z03-Pa-E1-N1', code: 'SS:L:Z03-Pa-E1-N1' },
  ],
  order: [
    { label: 'Orden DP-2025-0145', code: 'SS:D:DP-2025-0145' },
    { label: 'Orden DP-2025-0146', code: 'SS:D:DP-2025-0146' },
    { label: 'Orden DP-2025-0147', code: 'SS:D:DP-2025-0147' },
  ],
};

export const MockQRScanner: React.FC<MockQRScannerProps> = ({
  onScan,
  onClose,
  expectedType,
}) => {
  const codes = expectedType
    ? mockCodes[expectedType]
    : [...mockCodes.product, ...mockCodes.location, ...mockCodes.order];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4 bg-black/80">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <X className="w-7 h-7" />
        </button>
        <h1 className="text-lg font-bold text-white">Simular Escaneo QR</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Camera Placeholder */}
      <div className="h-64 bg-gray-800 m-4 rounded-xl flex flex-col items-center justify-center">
        <Camera className="w-16 h-16 text-gray-500 mb-2" />
        <p className="text-gray-400 text-base">Vista de cámara</p>
        <p className="text-gray-500 text-xs mt-1">
          Selecciona un código abajo para simular
        </p>
      </div>

      {/* Codes List */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        <p className="text-gray-400 text-sm mb-3">Códigos de prueba:</p>

        {codes.map((mock, index) => (
          <button
            key={index}
            onClick={() => {
              setTimeout(() => onScan(mock.code), 300);
            }}
            className="w-full bg-gray-800 rounded-xl p-4 mb-2 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="text-left">
              <p className="text-white text-sm font-semibold">{mock.label}</p>
              <p className="text-gray-500 text-xs font-mono mt-0.5">{mock.code}</p>
            </div>
            <QrCode className="w-6 h-6 text-blue-500" />
          </button>
        ))}

        {/* Invalid Code Option */}
        <button
          onClick={() => onScan('INVALID-QR-CODE')}
          className="w-full bg-gray-800 border border-red-500 rounded-xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform mt-4"
        >
          <div className="text-left">
            <p className="text-white text-sm font-semibold">Código Inválido</p>
            <p className="text-gray-500 text-xs font-mono mt-0.5">
              INVALID-QR-CODE
            </p>
          </div>
          <AlertCircle className="w-6 h-6 text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default MockQRScanner;
