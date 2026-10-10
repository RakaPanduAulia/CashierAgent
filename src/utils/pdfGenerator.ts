import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Transaction, StoreProfile, Expense } from '../types';
import { formatRupiah, formatDateTime, formatDateShort } from './formatters';

export function generateReceiptPdf(trx: Transaction, store: StoreProfile, options?: { download?: boolean }): jsPDF {
  // Hitung perkiraan tinggi struk (lebar standar thermal 80mm)
  const baseHeight = 110;
  const itemsHeight = trx.items.length * 10;
  const totalHeight = Math.max(140, baseHeight + itemsHeight);

  const doc = new jsPDF({
    unit: 'mm',
    format: [80, totalHeight],
    orientation: 'portrait'
  });

  const pageWidth = 80;
  let y = 8;

  // Nama Toko
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(store.name, pageWidth / 2, y, { align: 'center' });
  y += 5;

  if (store.tagline) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text(store.tagline, pageWidth / 2, y, { align: 'center' });
    y += 4;
  }

  // Alamat & Telp
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const splitAddress = doc.splitTextToSize(store.address, 70);
  doc.text(splitAddress, pageWidth / 2, y, { align: 'center' });
  y += splitAddress.length * 3.5;

  doc.text(`WA / Telp: ${store.phone}`, pageWidth / 2, y, { align: 'center' });
  y += 4;

  // Garis putus-putus
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, 75, y);
  y += 4;

  // Info Transaksi
  doc.setFontSize(8);
  doc.text(`No. Struk: ${trx.invoiceNumber}`, 5, y);
  y += 3.5;
  doc.text(`Tgl : ${formatDateTime(trx.date)}`, 5, y);
  y += 3.5;

  if (trx.customerName) {
    doc.text(`Pelanggan: ${trx.customerName}`, 5, y);
    y += 3.5;
  }

  doc.line(5, y, 75, y);
  y += 3.5;

  // Header Item
  doc.setFont('helvetica', 'bold');
  doc.text('Item', 5, y);
  doc.text('Qty x Harga', 45, y, { align: 'center' });
  doc.text('Total', 75, y, { align: 'right' });
  y += 3;

  doc.setFont('helvetica', 'normal');

  // Daftar Item
  for (const item of trx.items) {
    const itemName = item.productName.length > 20 ? item.productName.substring(0, 20) + '..' : item.productName;
    doc.text(itemName, 5, y);
    y += 3.5;

    const qtyPrice = `${item.qty} ${item.unit} x ${formatRupiah(item.sellPrice)}`;
    doc.text(qtyPrice, 10, y);
    doc.text(formatRupiah(item.subtotal), 75, y, { align: 'right' });
    y += 4;
  }

  // Garis Pemisah
  doc.line(5, y, 75, y);
  y += 4;

  // Ringkasan Pembayaran
  doc.setFontSize(8.5);
  doc.text(`Total Barang:`, 5, y);
  doc.text(`${trx.totalItems} item`, 75, y, { align: 'right' });
  y += 4;

  doc.text(`Subtotal:`, 5, y);
  doc.text(formatRupiah(trx.subtotal), 75, y, { align: 'right' });
  y += 4;

  if (trx.discount > 0) {
    doc.text(`Diskon:`, 5, y);
    doc.text(`-${formatRupiah(trx.discount)}`, 75, y, { align: 'right' });
    y += 4;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`TOTAL:`, 5, y);
  doc.text(formatRupiah(trx.grandTotal), 75, y, { align: 'right' });
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const payLabel = trx.paymentMethod === 'CASH' ? 'Tunai' : trx.paymentMethod === 'QRIS' ? 'QRIS' : 'Transfer';
  doc.text(`Bayar (${payLabel}):`, 5, y);
  doc.text(formatRupiah(trx.amountPaid), 75, y, { align: 'right' });
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.text(`Kembalian:`, 5, y);
  doc.text(formatRupiah(trx.change), 75, y, { align: 'right' });
  y += 5;

  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, 75, y);
  y += 5;

  // Pesan Penutup
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  const splitFooter = doc.splitTextToSize(store.footerMessage, 70);
  doc.text(splitFooter, pageWidth / 2, y, { align: 'center' });

  if (options?.download) {
    doc.save(`Struk-${trx.invoiceNumber}.pdf`);
  }

  return doc;
}

export interface FinancialStats {
  periodTitle: string;
  totalRevenue: number;
  totalCostOfGoods: number; // HPP
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  totalInventoryCost: number; // Modal barang tersisa di toko
  totalInventoryRetail: number;
  transactionCount: number;
  transactions: Transaction[];
  expenses: Expense[];
}

export function generateFinancialReportPdf(stats: FinancialStats, store: StoreProfile) {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'
  });

  // Header Toko
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 58, 138); // Deep Navy
  doc.text(store.name, 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`${store.address} | WA: ${store.phone}`, 14, 24);

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(14, 28, 196, 28);

  // Judul Laporan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text(`LAPORAN KEUANGAN & LABA RUGI TOKO`, 14, 36);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Periode: ${stats.periodTitle} | Dicetak pada: ${formatDateTime(new Date().toISOString())}`, 14, 42);

  // Kartu Ringkasan Finansial
  let y = 50;

  // Box 1: Omzet
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(14, y, 56, 22, 2, 2, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text('TOTAL PENJUALAN (OMZET)', 17, y + 6);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(3, 105, 161);
  doc.text(formatRupiah(stats.totalRevenue), 17, y + 15);

  // Box 2: Modal Terjual (HPP)
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(74, y, 56, 22, 2, 2, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('MODAL BARANG TERJUAL (HPP)', 77, y + 6);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text(formatRupiah(stats.totalCostOfGoods), 77, y + 15);

  // Box 3: Keuntungan Kotor
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(134, y, 62, 22, 2, 2, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('LABA KOTOR (PENJUALAN - HPP)', 137, y + 6);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61);
  doc.text(formatRupiah(stats.grossProfit), 137, y + 15);

  y += 26;

  // Box 4: Biaya Operasional
  doc.setFillColor(254, 249, 195);
  doc.roundedRect(14, y, 56, 22, 2, 2, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('BIAYA OPERASIONAL TOKO', 17, y + 6);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(161, 98, 7);
  doc.text(formatRupiah(stats.totalExpenses), 17, y + 15);

  // Box 5: Laba Bersih
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(74, y, 56, 22, 2, 2, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('KEUNTUNGAN BERSIH (NET)', 77, y + 6);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(formatRupiah(stats.netProfit), 77, y + 15);

  // Box 6: Modal Tersisa di Toko
  doc.setFillColor(245, 243, 255);
  doc.roundedRect(134, y, 62, 22, 2, 2, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('NILAI MODAL STOK DI TOKO', 137, y + 6);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(109, 40, 217);
  doc.text(formatRupiah(stats.totalInventoryCost), 137, y + 15);

  y += 30;

  // Tabel Transaksi Terakhir
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(`Rincian Transaksi Penjualan (${stats.transactionCount} Transaksi)`, 14, y);
  y += 4;

  const trxTableData = stats.transactions.slice(0, 15).map((t) => [
    t.invoiceNumber,
    formatDateShort(t.date),
    `${t.totalItems} item`,
    t.paymentMethod,
    formatRupiah(t.grandTotal),
    formatRupiah(t.totalCost),
    formatRupiah(t.grossProfit)
  ]);

  autoTable(doc, {
    startY: y,
    head: [['No. Struk', 'Tanggal', 'Item', 'Metode', 'Total Penjualan', 'Modal (HPP)', 'Laba Kotor']],
    body: trxTableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 }
  });

  doc.save(`Laporan-Keuangan-${stats.periodTitle.replace(/\s+/g, '_')}.pdf`);
}
