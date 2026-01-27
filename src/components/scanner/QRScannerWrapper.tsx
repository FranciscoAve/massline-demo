import React from 'react';
import { QRScanner } from './QRScanner';
import { MockQRScanner } from './MockQRScanner';

// Set to true to use mock scanner during development
// Set to false to use real camera scanner
const USE_MOCK_SCANNER = import.meta.env.DEV && false; // Change to true for mock

interface QRScannerWrapperProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  expectedType?: 'product' | 'location' | 'order';
  simulateValue?: string;
}

/**
 * QRScannerWrapper - Unified QR Scanner component
 *
 * Automatically switches between:
 * - Real camera scanner (production & testing)
 * - Mock scanner (development without camera)
 *
 * Usage:
 * ```tsx
 * <QRScannerWrapper
 *   onScan={(code) => console.log('Scanned:', code)}
 *   onClose={() => setShowScanner(false)}
 *   title="Escanear Producto"
 *   expectedType="product"
 * />
 * ```
 *
 * QR Code Format (recommended):
 * - Products: "SS:P:SKU-12345" or just "SKU-12345"
 * - Locations: "SS:L:A-01-E1-N1" or just "A-01-E1-N1"
 * - Orders: "SS:O:OC-2025-001234" or just "OC-2025-001234"
 *
 * The scanner returns the raw string - your app decides what to do with it.
 */
export const QRScannerWrapper: React.FC<QRScannerWrapperProps> = ({
  onScan,
  onClose,
  title,
  subtitle,
  expectedType,
  simulateValue,
}) => {
  if (USE_MOCK_SCANNER) {
    return (
      <MockQRScanner
        onScan={onScan}
        onClose={onClose}
        expectedType={expectedType}
      />
    );
  }

  return (
    <QRScanner
      onScan={onScan}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      expectedType={expectedType}
      simulateValue={simulateValue}
    />
  );
};

export default QRScannerWrapper;