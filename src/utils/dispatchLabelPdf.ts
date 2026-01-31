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
  }[];
}

/**
 * Generates a dispatch label PDF matching the Mass Line format
 * Based on the client's existing label format
 */
export function generateDispatchLabelPdf(data: DispatchLabelData): void {
  // Create PDF - 4x6 inch label format (common for shipping labels)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [100, 150], // 100mm x 150mm label
  });

  const pageWidth = 100;
  const margin = 5;
  let y = 10;

  // ==================== HEADER ====================
  // Carton number (top left)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.cartonNumber} / ${data.totalCartons}`, margin, y);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('CARTON', margin, y + 4);

  // Logo / Company name (top center-right)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MASS', pageWidth - margin - 30, y);
  doc.text('LINE', pageWidth - margin - 15, y + 5);

  // Draw a diagonal line for the logo effect
  doc.setLineWidth(0.5);
  doc.line(pageWidth - margin - 35, y - 3, pageWidth - margin - 5, y + 8);

  y += 15;

  // Separator line
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // ==================== DISPATCH INFO ====================
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Despacho ${data.dispatchNumber}`, margin, y);

  // Date (right aligned)
  doc.setFont('helvetica', 'normal');
  doc.text(data.date, pageWidth - margin - 25, y);
  y += 8;

  // ==================== CLIENT INFO ====================
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Para:', margin, y);
  doc.setFont('helvetica', 'normal');

  // Client name (may need to wrap)
  const clientNameLines = doc.splitTextToSize(data.client.name, pageWidth - margin * 2 - 12);
  doc.text(clientNameLines, margin + 12, y);
  y += clientNameLines.length * 4 + 2;

  // Client code
  doc.setFontSize(8);
  doc.text(data.client.code, margin + 12, y);
  y += 6;

  // Address
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Dir.:', margin, y);
  doc.setFont('helvetica', 'normal');

  const addressLines = doc.splitTextToSize(data.client.address, pageWidth - margin * 2 - 12);
  doc.text(addressLines, margin + 12, y);
  y += addressLines.length * 4 + 5;

  // ==================== SEPARATOR ====================
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // ==================== PRODUCTS TABLE ====================
  // Table header
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Código', margin, y);
  doc.text('Descripción', margin + 25, y);
  doc.text('Cant.', pageWidth - margin - 10, y);
  y += 2;

  // Header underline
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  let totalQuantity = 0;
  data.items.forEach((item) => {
    // Check if we need a new page
    if (y > 130) {
      doc.addPage();
      y = 10;
    }

    // Code
    doc.text(item.code, margin, y);

    // Description (truncate if too long)
    const descMaxWidth = pageWidth - margin * 2 - 45;
    const descLines = doc.splitTextToSize(item.description, descMaxWidth);
    doc.text(descLines[0], margin + 25, y); // Only first line

    // Quantity (right aligned)
    doc.text(item.quantity.toString(), pageWidth - margin - 5, y, { align: 'right' });

    totalQuantity += item.quantity;
    y += 5;
  });

  // ==================== TOTAL ====================
  y += 2;
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Total:', pageWidth - margin - 25, y);
  doc.text(totalQuantity.toString(), pageWidth - margin - 5, y, { align: 'right' });

  // ==================== FOOTER ====================
  y = 145;
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('Generado por SmartStock WMS', pageWidth / 2, y, { align: 'center' });

  // Save the PDF
  const filename = `etiqueta-despacho-${data.dispatchNumber}-carton-${data.cartonNumber}.pdf`;
  doc.save(filename);
}

/**
 * Generates a dispatch label from a picking order
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
    }[];
  },
  cartonNumber: number = 1,
  totalCartons: number = 1
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
    items: order.items.map((item) => ({
      code: item.productSku,
      description: item.productName,
      quantity: item.requestedQuantity,
    })),
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