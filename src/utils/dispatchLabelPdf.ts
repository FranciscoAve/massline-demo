import { jsPDF } from 'jspdf';

export interface DispatchLabelData {
  dispatchNumber: string;
  date: string;
  cartonNumber: number;
  totalCartons: number;
  client: {
    name: string;
    code: string;
    address: string;
  };
  items: {
    code: string;
    description: string;
    quantity: number;
    replacement?: {
      code: string;
      description: string;
      quantity: number;
    };
  }[];
}

/**
 * Replacement info type
 */
export interface ReplacementInfo {
  sku: string;
  name: string;
  qty: number;
}

/**
 * Carton data for multi-page PDF
 */
export interface CartonData {
  cartonNumber: number;
  items: {
    productSku: string;
    productName: string;
    quantity: number;
  }[];
}

const PAGE_WIDTH = 100;
const PAGE_HEIGHT = 150;
const MARGIN = 5;

/**
 * Adds a label page to an existing PDF document
 */
function addLabelPageToDoc(doc: jsPDF, data: DispatchLabelData, isFirstPage: boolean = false): void {
  if (!isFirstPage) {
    doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  }

  let y = 10;

  // ==================== HEADER ====================
  // Carton number (top left)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.cartonNumber} / ${data.totalCartons}`, MARGIN, y);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('CARTON', MARGIN, y + 4);

  // Logo / Company name (top center-right)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MASS', PAGE_WIDTH - MARGIN - 30, y);
  doc.text('LINE', PAGE_WIDTH - MARGIN - 15, y + 5);

  // Draw a diagonal line for the logo effect
  doc.setLineWidth(0.5);
  doc.line(PAGE_WIDTH - MARGIN - 35, y - 3, PAGE_WIDTH - MARGIN - 5, y + 8);

  y += 15;

  // Separator line
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 5;

  // ==================== DISPATCH INFO ====================
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Despacho ${data.dispatchNumber}`, MARGIN, y);

  // Date (right aligned)
  doc.setFont('helvetica', 'normal');
  doc.text(data.date, PAGE_WIDTH - MARGIN - 25, y);
  y += 8;

  // ==================== CLIENT INFO ====================
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Para:', MARGIN, y);
  doc.setFont('helvetica', 'normal');

  // Client name (may need to wrap)
  const clientNameLines = doc.splitTextToSize(data.client.name, PAGE_WIDTH - MARGIN * 2 - 12);
  doc.text(clientNameLines, MARGIN + 12, y);
  y += clientNameLines.length * 4 + 2;

  // Client code
  doc.setFontSize(8);
  doc.text(data.client.code, MARGIN + 12, y);
  y += 6;

  // Address
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Dir.:', MARGIN, y);
  doc.setFont('helvetica', 'normal');

  const addressLines = doc.splitTextToSize(data.client.address, PAGE_WIDTH - MARGIN * 2 - 12);
  doc.text(addressLines, MARGIN + 12, y);
  y += addressLines.length * 4 + 5;

  // ==================== SEPARATOR ====================
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 5;

  // ==================== PRODUCTS TABLE ====================
  // Table header
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Código', MARGIN, y);
  doc.text('Descripción', MARGIN + 25, y);
  doc.text('Cant.', PAGE_WIDTH - MARGIN - 10, y);
  y += 2;

  // Header underline
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 4;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  let totalQuantity = 0;
  const descMaxWidth = PAGE_WIDTH - MARGIN * 2 - 45;

  data.items.forEach((item) => {
    // Code
    doc.text(item.code, MARGIN, y);

    // Description (truncate if too long)
    const descLines = doc.splitTextToSize(item.description, descMaxWidth);
    doc.text(descLines[0], MARGIN + 25, y); // Only first line

    // Quantity (right aligned)
    doc.text(item.quantity.toString(), PAGE_WIDTH - MARGIN - 5, y, { align: 'right' });

    totalQuantity += item.quantity;
    y += 5;

    // If there's a replacement, show it indented below
    if (item.replacement && item.replacement.quantity > 0) {
      doc.setFontSize(6);
      doc.setTextColor(0, 100, 180); // Blue color for replacement

      // Replacement indicator
      doc.text('↳ REEMPLAZO:', MARGIN + 2, y);
      doc.text(item.replacement.code, MARGIN + 25, y);
      doc.text(item.replacement.quantity.toString(), PAGE_WIDTH - MARGIN - 5, y, { align: 'right' });
      y += 4;

      // Replacement description
      const replDescLines = doc.splitTextToSize(item.replacement.description, descMaxWidth - 5);
      doc.text(replDescLines[0], MARGIN + 25, y);

      totalQuantity += item.replacement.quantity;
      y += 5;

      // Reset color
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(7);
    }
  });

  // ==================== TOTAL ====================
  y += 2;
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Total:', PAGE_WIDTH - MARGIN - 25, y);
  doc.text(totalQuantity.toString(), PAGE_WIDTH - MARGIN - 5, y, { align: 'right' });

  // ==================== FOOTER ====================
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('Generado por SmartStock WMS', PAGE_WIDTH / 2, 145, { align: 'center' });
}

/**
 * Generates a dispatch label PDF matching the Mass Line format
 * Based on the client's existing label format
 */
export function generateDispatchLabelPdf(data: DispatchLabelData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [PAGE_WIDTH, PAGE_HEIGHT],
  });

  addLabelPageToDoc(doc, data, true);

  // Save the PDF
  const filename = `etiqueta-despacho-${data.dispatchNumber}-carton-${data.cartonNumber}.pdf`;
  doc.save(filename);
}

/**
 * Generates a single PDF with multiple pages (one per carton)
 */
export function generateMultiCartonPdf(
  order: {
    orderNumber: string;
    destination: {
      name: string;
      address?: string;
    };
  },
  cartons: CartonData[],
  replacementsUsed?: Record<string, ReplacementInfo>
): void {
  if (cartons.length === 0) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [PAGE_WIDTH, PAGE_HEIGHT],
  });

  const totalCartons = cartons.length;
  const date = new Date().toLocaleDateString('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const clientCode = generateClientCode(order.destination.name);

  cartons.forEach((carton, index) => {
    const labelData: DispatchLabelData = {
      dispatchNumber: order.orderNumber,
      date,
      cartonNumber: carton.cartonNumber,
      totalCartons,
      client: {
        name: order.destination.name,
        code: clientCode,
        address: order.destination.address || 'Sin dirección especificada',
      },
      items: carton.items.map((item) => {
        const replacement = replacementsUsed?.[item.productSku];
        const originalQty = replacement
          ? item.quantity - replacement.qty
          : item.quantity;

        return {
          code: item.productSku,
          description: item.productName,
          quantity: originalQty > 0 ? originalQty : item.quantity,
          replacement: replacement ? {
            code: replacement.sku,
            description: replacement.name,
            quantity: replacement.qty,
          } : undefined,
        };
      }),
    };

    addLabelPageToDoc(doc, labelData, index === 0);
  });

  // Save the PDF with all pages
  const filename = `etiquetas-despacho-${order.orderNumber}.pdf`;
  doc.save(filename);
}

/**
 * Generates a dispatch label from a picking order (single carton)
 */
export function generateLabelFromOrder(
  order: {
    orderNumber: string;
    destination: {
      name: string;
      address?: string;
    };
    items: {
      productSku: string;
      productName: string;
      requestedQuantity: number;
      pickedQuantity?: number;
    }[];
  },
  cartonNumber: number = 1,
  totalCartons: number = 1,
  replacementsUsed?: Record<string, ReplacementInfo>
): void {
  const labelData: DispatchLabelData = {
    dispatchNumber: order.orderNumber,
    date: new Date().toLocaleDateString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
    cartonNumber,
    totalCartons,
    client: {
      name: order.destination.name,
      code: generateClientCode(order.destination.name),
      address: order.destination.address || 'Sin dirección especificada',
    },
    items: order.items.map((item) => {
      const replacement = replacementsUsed?.[item.productSku];
      const originalQty = replacement
        ? (item.pickedQuantity || item.requestedQuantity) - replacement.qty
        : item.pickedQuantity || item.requestedQuantity;

      return {
        code: item.productSku,
        description: item.productName,
        quantity: originalQty,
        replacement: replacement ? {
          code: replacement.sku,
          description: replacement.name,
          quantity: replacement.qty,
        } : undefined,
      };
    }),
  };

  generateDispatchLabelPdf(labelData);
}

/**
 * Generates a mock client code from the name
 * In production, this would come from the ERP/database
 */
function generateClientCode(name: string): string {
  const hash = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `${hash}X00X${Math.floor(Math.random() * 99999)
    .toString()
    .padStart(5, '0')}`;
}
