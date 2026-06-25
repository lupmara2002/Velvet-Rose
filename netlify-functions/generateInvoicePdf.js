const PDFDocument = require('pdfkit');
const path = require('path');

const FONT_REGULAR = path.join(__dirname, 'functions', 'fonts', 'Roboto-Regular.ttf');
const FONT_BOLD    = path.join(__dirname, 'functions', 'fonts', 'Roboto-Bold.ttf');

const BRAND      = '#8C5E6B';
const DARK       = '#2D2A2E';
const GREY       = '#6B6369';
const LIGHT_BG   = '#FBF8F6';
const LINE_COLOR = '#E8DDD9';

function docToBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

function hr(doc, y, width) {
  doc
    .strokeColor(LINE_COLOR)
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(50 + width, y)
    .stroke();
}

async function generateInvoicePdf(order, receiptLines) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const bufferPromise = docToBuffer(doc);

  doc.registerFont('Roboto', FONT_REGULAR);
  doc.registerFont('Roboto-Bold', FONT_BOLD);

  const pageWidth = doc.page.width - 100; 

  doc
    .fillColor(BRAND)
    .fontSize(22)
    .font('Roboto-Bold')
    .text('Velvet Rose', 50, 50);

  doc
    .fillColor(GREY)
    .fontSize(9)
    .font('Roboto')
    .text('maracosmetics12@gmail.com', 50, 76)
    .text('https://mara-cosmetics.netlify.app', 50, 88);

  doc
    .fillColor(BRAND)
    .fontSize(28)
    .font('Roboto-Bold')
    .text('INVOICE', 350, 50, { width: pageWidth - 300, align: 'right' });

  const metaTop = 120;

  doc.fillColor(DARK).fontSize(10).font('Roboto-Bold');
  doc.text('Invoice No:', 50, metaTop);
  doc.font('Roboto').fillColor(GREY);
  doc.text(`#${order._id}`, 130, metaTop);

  doc.font('Roboto-Bold').fillColor(DARK);
  doc.text('Date:', 50, metaTop + 16);
  doc.font('Roboto').fillColor(GREY);
  doc.text(new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB'), 130, metaTop + 16);

  doc.font('Roboto-Bold').fillColor(DARK);
  doc.text('Status:', 50, metaTop + 32);
  doc.font('Roboto').fillColor(GREY);
  doc.text('Paid', 130, metaTop + 32);

  const addr = order.shippingAddress || {};
  doc.font('Roboto-Bold').fontSize(10).fillColor(DARK);
  doc.text('Ship To:', 350, metaTop);
  doc.font('Roboto').fillColor(GREY);
  doc.text(addr.fullName || '', 350, metaTop + 16);
  doc.text(addr.addressLine1 || '', 350, metaTop + 28);
  doc.text(`${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}`, 350, metaTop + 40);
  doc.text(addr.country || '', 350, metaTop + 52);

  const tableTop = metaTop + 80;

  const col = {
    num:   50,
    name:  80,
    qty:   340,
    price: 400,
    total: 470,
  };

  doc
    .rect(50, tableTop, pageWidth, 22)
    .fill(BRAND);

  doc.fillColor('#fff').fontSize(9).font('Roboto-Bold');
  doc.text('#',        col.num  + 6, tableTop + 6, { width: 25 });
  doc.text('Product',  col.name + 4, tableTop + 6, { width: 250 });
  doc.text('Qty',      col.qty  + 4, tableTop + 6, { width: 50 });
  doc.text('Price',    col.price+ 4, tableTop + 6, { width: 60 });
  doc.text('Total',    col.total+ 4, tableTop + 6, { width: 70 });

  let y = tableTop + 26;
  const lines = receiptLines || (order.products || []).map((item) => ({
    product: item.product,
    quantity: item.quantity,
    isFree: false,
  }));

  lines.forEach((line, i) => {
    if (i % 2 === 0) {
      doc.rect(50, y - 2, pageWidth, 20).fill(LIGHT_BG);
    }

    const name  = (line.product && line.product.name) || 'Product';
    const price = line.isFree ? 0 : ((line.product && line.product.price) || 0);
    const qty   = line.quantity || 1;
    const lineTotal = price * qty;

    doc.fillColor(line.isFree ? BRAND : DARK).fontSize(9).font(line.isFree ? 'Roboto-Bold' : 'Roboto');
    doc.text(String(i + 1),                                col.num  + 6, y + 2, { width: 25 });
    doc.text(name,                                         col.name + 4, y + 2, { width: 250 });
    doc.text(String(qty),                                  col.qty  + 4, y + 2, { width: 50 });
    doc.text(line.isFree ? 'FREE' : `${price.toFixed(2)} lei`,  col.price + 4, y + 2, { width: 60 });
    doc.text(line.isFree ? '0.00 lei' : `${lineTotal.toFixed(2)} lei`, col.total + 4, y + 2, { width: 70 });

    y += 22;
  });

  y += 6;
  hr(doc, y, pageWidth);
  y += 12;

  const subtotal = lines.reduce((sum, line) => {
    const price = line.isFree ? 0 : ((line.product && line.product.price) || 0);
    return sum + price * (line.quantity || 1);
  }, 0);

  doc.font('Roboto').fontSize(10).fillColor(GREY);
  doc.text('Subtotal:', col.price - 20, y, { width: 80, align: 'right' });
  doc.text(`${subtotal.toFixed(2)} lei`, col.total + 4, y, { width: 80 });

  y += 18;

  doc.text('Shipping:', col.price - 20, y, { width: 80, align: 'right' });
  doc.text('Free', col.total + 4, y, { width: 80 });

  y += 22;
  hr(doc, y, pageWidth);
  y += 10;

  doc.font('Roboto-Bold').fontSize(13).fillColor(BRAND);
  doc.text('Total:', col.price - 20, y, { width: 80, align: 'right' });
  doc.text(`${order.totalAmount.toFixed(2)} lei`, col.total + 4, y, { width: 100 });

  y += 50;
  hr(doc, y, pageWidth);
  y += 14;
  doc.font('Roboto').fontSize(8).fillColor(GREY);
  doc.text(
    'Thank you for shopping with Velvet Rose! If you have any questions about your order, please contact us at maracosmetics12@gmail.com.',
    50, y,
    { width: pageWidth, align: 'center' }
  );

  doc.end();
  return bufferPromise;
}

module.exports = generateInvoicePdf;
