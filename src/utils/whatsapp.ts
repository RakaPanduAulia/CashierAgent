import type { Transaction, StoreProfile } from '../types';
import { formatRupiah, formatDateTime } from './formatters';

export function formatWhatsAppPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function buildWhatsAppReceiptText(trx: Transaction, store: StoreProfile): string {
  const line = '------------------------------------------';
  const header = `🧾 *STRUK BELANJA TOKO*
🏪 *${store.name.toUpperCase()}*
${store.tagline ? `_${store.tagline}_\n` : ''}📍 ${store.address}
📞 WA: ${store.phone}
${line}
*No. Nota* : \`${trx.invoiceNumber}\`
*Tanggal*  : ${formatDateTime(trx.date)}
${trx.customerName ? `*Pembeli*   : ${trx.customerName}\n` : ''}${line}
*DETAIL BELANJAAN:*
`;

  const itemsText = trx.items
    .map((item, idx) => {
      const discountText = item.discount > 0 ? ` (Disc: -${formatRupiah(item.discount)})` : '';
      return `${idx + 1}. *${item.productName}*\n   ${item.qty} ${item.unit} x ${formatRupiah(item.sellPrice)}${discountText} = *${formatRupiah(item.subtotal)}*`;
    })
    .join('\n');

  const paymentMethodLabel = trx.paymentMethod === 'CASH' ? 'Tunai' : trx.paymentMethod === 'QRIS' ? 'QRIS' : 'Transfer Bank';

  const footer = `
${line}
*Total Barang :* ${trx.totalItems} item
*Subtotal     :* ${formatRupiah(trx.subtotal)}
${trx.discount > 0 ? `*Diskon Toko :* -${formatRupiah(trx.discount)}\n` : ''}*TOTAL BAYAR  :* *${formatRupiah(trx.grandTotal)}*
*Metode Bayar :* ${paymentMethodLabel}
*Diterima     :* ${formatRupiah(trx.amountPaid)}
*Kembalian    :* *${formatRupiah(trx.change)}*
${line}
_${store.footerMessage}_
`;

  return header + itemsText + footer;
}

export function shareReceiptToWhatsApp(trx: Transaction, store: StoreProfile, targetPhone?: string) {
  const message = buildWhatsAppReceiptText(trx, store);
  const encoded = encodeURIComponent(message);

  const phone = targetPhone || trx.customerPhone || '';
  const cleanPhone = formatWhatsAppPhoneNumber(phone);

  let url = '';
  if (cleanPhone && cleanPhone.length >= 9) {
    url = `https://wa.me/${cleanPhone}?text=${encoded}`;
  } else {
    // Jika tidak ada nomor, buka WhatsApp dengan pemilih kontak langsung
    url = `https://api.whatsapp.com/send?text=${encoded}`;
  }

  // Coba Web Share API dulu jika di mobile phone dan nomor tidak ditentukan
  if (!phone && navigator.share) {
    navigator
      .share({
        title: `Struk Belanja ${trx.invoiceNumber}`,
        text: message
      })
      .catch(() => {
        window.open(url, '_blank');
      });
  } else {
    window.open(url, '_blank');
  }
}
