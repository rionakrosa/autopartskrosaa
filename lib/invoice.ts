import jsPDF from 'jspdf';

interface OrderItem {
  product: {
    name: string;
    sku?: string;
    id: number;
    details?: string;
  };
  quantity: number;
  priceAtTime: number;
}

interface Customer {
  name: string;
  email: string;
  phone: string;
}

interface Order {
  orderNumber: string;
  customer: Customer;
  shippingAddress: string;
  items: OrderItem[];
  total: number;
  createdAt: Date;
}

export async function generateInvoicePDF(order: Order): Promise<Buffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Brand colors matching website
  const brandRed = [200, 35, 44] as const; // #c8232c
  const brandBlue = [15, 78, 168] as const; // #0f4ea8
  const lightGray = [245, 245, 245] as const;
  const darkText = [33, 33, 33] as const;

  // === HEADER SECTION ===
  // Red header bar
  doc.setFillColor(...brandRed);
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Company name in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AUTO PARTS KROSA', 15, 22);

  // Invoice label in top right
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('FATURË TATIMORE', pageWidth - 15, 22, { align: 'right' });

  // === INVOICE INFO SECTION ===
  doc.setTextColor(...darkText);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Numri i Faturës:', 15, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(order.orderNumber, 60, 50);

  doc.setFont('helvetica', 'bold');
  doc.text('Data:', 15, 58);
  doc.setFont('helvetica', 'normal');
  doc.text(order.createdAt.toLocaleDateString('sq-AL'), 60, 58);

  // === CUSTOMER INFORMATION SECTION ===
  doc.setFillColor(...lightGray);
  doc.rect(15, 70, pageWidth - 30, 32, 'F');
  
  doc.setTextColor(...brandBlue);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIONI I KLIENTIT', 15, 78);

  doc.setTextColor(...darkText);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${order.customer.name}`, 15, 88);
  doc.text(`Email: ${order.customer.email}`, 15, 95);
  doc.text(`Telefoni: ${order.customer.phone} | Adresa: ${order.shippingAddress}`, 15, 102);

  // === ORDER ITEMS SECTION ===
  doc.setTextColor(...brandBlue);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ARTIKUJT E POROSITUR', 15, 115);

  // Table headers
  const startY = 122;
  doc.setFillColor(...brandBlue);
  doc.rect(15, startY - 5, pageWidth - 30, 7, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Produkti', 20, startY);
  doc.text('Sasia', 110, startY);
  doc.text('Çmimi', 140, startY);
  doc.text('Totali', 170, startY);

  // Table rows
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'normal');
  let yPosition = startY + 8;
  let rowIndex = 0;

  order.items.forEach((item) => {
    const details = item.product.details ? JSON.parse(item.product.details) : [];
    const productName = item.product.name;
    const sku = item.product.sku || item.product.id.toString();
    const quantity = item.quantity;
    const price = item.priceAtTime;
    const total = quantity * price;

    // Alternating row background
    if (rowIndex % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, yPosition - 4, pageWidth - 30, 12, 'F');
    }

    // Product info
    doc.setFontSize(9);
    doc.text(`${productName} (${sku})`, 20, yPosition);
    
    // Details if any
    if (details.length > 0) {
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(`Detaje: ${details.join(', ')}`, 20, yPosition + 4);
      doc.setTextColor(...darkText);
    }

    // Quantity, Price, Total
    doc.setFontSize(9);
    doc.text(quantity.toString(), 110, yPosition);
    doc.text(`€${price.toFixed(2)}`, 140, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(`€${total.toFixed(2)}`, 170, yPosition);
    doc.setFont('helvetica', 'normal');

    yPosition += 12;
    rowIndex++;
  });

  // === TOTALS SECTION ===
  yPosition += 5;
  
  const tvshRate = 0.18;
  const subtotal = order.total / (1 + tvshRate);
  const tvshAmount = order.total - subtotal;

  // Subtotal
  doc.setFontSize(9);
  doc.text('Nëntotali:', pageWidth - 70, yPosition);
  doc.setFont('helvetica', 'bold');
  doc.text(`€${subtotal.toFixed(2)}`, pageWidth - 15, yPosition, { align: 'right' });

  // TVSH
  doc.setFont('helvetica', 'normal');
  doc.text('TVSH (18%):', pageWidth - 70, yPosition + 6);
  doc.setFont('helvetica', 'bold');
  doc.text(`€${tvshAmount.toFixed(2)}`, pageWidth - 15, yPosition + 6, { align: 'right' });

  // Total box
  doc.setFillColor(...brandRed);
  doc.rect(pageWidth - 85, yPosition + 10, 70, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTALI:', pageWidth - 80, yPosition + 18);
  doc.text(`€${order.total.toFixed(2)}`, pageWidth - 15, yPosition + 18, { align: 'right' });

  // === FOOTER SECTION ===
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Faleminderit që zgjodhët Auto Parts Krosa!', pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text('Për çdo pyetje, na kontaktoni në contact@autopartskrosa.com', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Return PDF as buffer
  return Buffer.from(doc.output('arraybuffer'));
}