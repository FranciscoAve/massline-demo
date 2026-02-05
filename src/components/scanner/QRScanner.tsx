import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, FlashlightOff, Flashlight, SwitchCamera } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  expectedType?: 'product' | 'location' | 'order';
  simulateValue?: string; // Código específico para simular (ej: la ubicación actual)
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onClose,
  title = 'Escanear Código QR',
  subtitle = 'Apunta la cámara al código QR',
  expectedType,
  simulateValue,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    const scannerId = 'qr-reader';

    // Create scanner instance
    const scanner = new Html5Qrcode(scannerId, { verbose: false });
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode },
          {
            fps: 10,
            qrbox: undefined, // Sin marco interno - usamos nuestro propio overlay
            aspectRatio: 1,
            disableFlip: false,
          },
          (decodedText) => {
            // Prevent multiple scans
            if (hasScannedRef.current) return;
            hasScannedRef.current = true;

            // Vibrate for feedback (if supported)
            if (navigator.vibrate) {
              navigator.vibrate(200);
            }

            // Stop scanner and return result
            scanner.stop().then(() => {
              onScan(decodedText);
            }).catch(console.error);
          },
          () => {
            // Ignore scan failures (no QR in frame)
          }
        );

        // Check if flash is available
        const capabilities = scanner.getRunningTrackCapabilities();
        if (capabilities && 'torch' in capabilities) {
          setHasFlash(true);
        }
      } catch (err) {
        console.error('Error starting scanner:', err);
        setError(
          'No se pudo acceder a la cámara. Verifica los permisos del navegador.'
        );
      }
    };

    startScanner();

    // Cleanup on unmount
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [facingMode, onScan]);

  const toggleFlash = async () => {
    if (!scannerRef.current?.isScanning) return;

    try {
      await scannerRef.current.applyVideoConstraints({
        // @ts-expect-error - torch is not in standard types but is supported
        advanced: [{ torch: !isFlashOn }],
      });
      setIsFlashOn(!isFlashOn);
    } catch (err) {
      console.error('Error toggling flash:', err);
    }
  };

  const switchCamera = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    hasScannedRef.current = false;
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Simular escaneo para desarrollo
  const simulateScan = async () => {
    if (hasScannedRef.current) return;
    hasScannedRef.current = true;

    // Usar simulateValue si está disponible, sino generar según tipo
    let mockCode = simulateValue || 'MOCK-CODE';
    if (!simulateValue) {
      if (expectedType === 'product') {
        mockCode = 'RE-R250-H10313'; // Direccional Delantera LH - SKU real
      } else if (expectedType === 'location') {
        mockCode = '05-B-00'; // Ubicación real
      } else if (expectedType === 'order') {
        mockCode = 'OC-2025-001234';
      }
    }

    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop().catch(console.error);
    }
    onScan(mockCode);
  };

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
        <div className="text-center">
          <h1 className="text-lg font-bold text-white">{title}</h1>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Scanner Area */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-6">
              <Camera className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-red-400 text-base mb-4">{error}</p>
              <button
                onClick={onClose}
                className="bg-primary text-white px-6 py-3 rounded-lg font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <div className="relative h-full">
            {/* QR Reader Container - toma todo el espacio */}
            <div
              id="qr-reader"
              className="absolute inset-0"
            />

            {/* Scanning Frame Overlay - centrado sobre el video */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
              <div className="w-64 h-64 border-2 border-white/30 rounded-2xl relative">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />

                {/* Scanning line animation */}
                <div className="absolute left-2 right-2 h-0.5 bg-primary animate-pulse top-1/2" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {!error && (
        <div className="flex flex-col items-center gap-4 pb-12 pt-4 bg-black/80">
          {/* Botón de simular - solo desarrollo */}
          <button
            onClick={simulateScan}
            className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl active:scale-95 transition-transform"
          >
            SIMULAR ESCANEO
          </button>

          <div className="flex justify-center gap-8">
            {hasFlash && (
              <button
                onClick={toggleFlash}
                className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center active:scale-95 transition-transform"
              >
                {isFlashOn ? (
                  <Flashlight className="w-6 h-6 text-yellow-400" />
                ) : (
                  <FlashlightOff className="w-6 h-6 text-white" />
                )}
              </button>
            )}
            <button
              onClick={switchCamera}
              className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center active:scale-95 transition-transform"
            >
              <SwitchCamera className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;