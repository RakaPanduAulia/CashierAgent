import React, { useState } from 'react';
import { X, Check, Banknote, QrCode, CreditCard, Tag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { db } from '../../db/database';
import type { Transaction, TransactionItem } from '../../types';
import { formatRupiah, generateInvoiceNumber } from '../../utils/formatters';

interface PaymentModalProps {
  onClose: () => void;
  onSuccess: (trx: Transaction) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, onSuccess }) => {
  const { cart, cartTotal, clearCart } = useStore();
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'TRANSFER'>('CASH');
  const [amountPaid, setAmountPaid] = useState<number>(cartTotal.grandTotal);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const grandTotal = Math.max(0, cartTotal.grandTotal - discount);
  const change = Math.max(0, amountPaid - grandTotal);
  const isShort = paymentMethod === 'CASH' && amountPaid < grandTotal;

  // Tombol pecahan uang cepat
  const quickNominals = [
    { label: 'Uang Pas', value: grandTotal, isPas: true },
    { label: 'Rp 20.000', value: 20000 },
    { label: 'Rp 50.000', value: 50000 },
    { label: 'Rp 100.000', value: 100000 },
    { label: 'Rp 200.000', value: 200000 },
    { label: 'Rp 500.000', value: 500000 }
  ];

  const handleSelectNominal = (val: number) => {
    setAmountPaid(val);
    setErrorMsg('');
  };

  const handleCompleteTransaction = async () => {
    if (isShort) {
      setErrorMsg(`Uang pembayaran kurang ${formatRupiah(grandTotal - amountPaid)}!`);
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const invoiceNumber = generateInvoiceNumber();

      const transactionItems: TransactionItem[] = cart.map((item) => {
        const itemDisc = item.discount || 0;
        const subtotal = item.qty * (item.product.sellPrice - itemDisc);
        const costSubtotal = item.qty * item.product.buyPrice;
        return {
          productId: item.product.id as number,
          productName: item.product.name,
          unit: item.product.unit,
          qty: item.qty,
          buyPrice: item.product.buyPrice,
          sellPrice: item.product.sellPrice,
          discount: itemDisc,
          subtotal,
          costSubtotal,
          profitSubtotal: subtotal - costSubtotal
        };
      });

      const totalCost = transactionItems.reduce((acc, it) => acc + it.costSubtotal, 0);
      const grossProfit = grandTotal - totalCost;

      const newTransaction: Transaction = {
        invoiceNumber,
        date: now,
        items: transactionItems,
        totalItems: cartTotal.itemsCount,
        subtotal: cartTotal.subtotal,
        discount,
        grandTotal,
        totalCost,
        grossProfit,
        paymentMethod,
        amountPaid: paymentMethod === 'CASH' ? amountPaid : grandTotal,
        change: paymentMethod === 'CASH' ? change : 0,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined
      };

      // Simpan ke database IndexedDB
      const trxId = await db.transactions.add(newTransaction);
      newTransaction.id = trxId as number;

      // Kurangi stok barang & catat riwayat stok keluar (SALE)
      for (const item of cart) {
        if (item.product.id) {
          const currentProduct = await db.products.get(item.product.id);
          if (currentProduct) {
            const previousStock = currentProduct.stock;
            const newStock = Math.max(0, previousStock - item.qty);

            await db.products.update(item.product.id, {
              stock: newStock,
              updatedAt: now
            });

            await db.stockMovements.add({
              productId: item.product.id,
              productName: item.product.name,
              type: 'SALE',
              qty: item.qty,
              previousStock,
              newStock,
              pricePerUnit: currentProduct.buyPrice,
              totalCost: item.qty * currentProduct.buyPrice,
              reason: `Penjualan Kasir (${invoiceNumber})`,
              date: now
            });
          }
        }
      }

      clearCart();
      onSuccess(newTransaction);
    } catch (err) {
      console.error('Gagal menyimpan transaksi:', err);
      setErrorMsg('Terjadi kesalahan saat memproses pembayaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Pembayaran Kasir</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Pilih metode bayar & masukkan uang diterima
            </p>
          </div>
          <button onClick={onClose} className="btn btn-outline btn-icon-only">
            <X size={22} />
          </button>
        </div>

        <div className="modal-body">
          {/* Total Tagihan (Huruf Besar Jelas) */}
          <div
            style={{
              background: '#eff6ff',
              border: '2px solid #bfdbfe',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
              marginBottom: '18px'
            }}
          >
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
              Total Tagihan Belanja
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1e3a8a', lineHeight: 1.2, marginTop: '4px' }}>
              {formatRupiah(grandTotal)}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
              {cartTotal.itemsCount} Barang Belanjaan
            </div>
          </div>

          {/* Diskon Toko Opsional */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              background: '#f8fafc',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>
              <Tag size={18} color="#b45309" />
              <span>Potongan / Diskon (Rp):</span>
            </div>
            <input
              type="number"
              className="input-field"
              style={{ width: '140px', minHeight: '40px', padding: '6px 10px', textAlign: 'right', fontWeight: 800 }}
              placeholder="0"
              value={discount || ''}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
            />
          </div>

          {/* Metode Pembayaran */}
          <div className="input-group">
            <label className="input-label">Metode Pembayaran:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <button
                type="button"
                className={`btn ${paymentMethod === 'CASH' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flexDirection: 'column', gap: '4px', padding: '12px 6px' }}
                onClick={() => {
                  setPaymentMethod('CASH');
                  setAmountPaid(grandTotal);
                }}
              >
                <Banknote size={24} />
                <span>TUNAI</span>
              </button>
              <button
                type="button"
                className={`btn ${paymentMethod === 'QRIS' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flexDirection: 'column', gap: '4px', padding: '12px 6px' }}
                onClick={() => {
                  setPaymentMethod('QRIS');
                  setAmountPaid(grandTotal);
                }}
              >
                <QrCode size={24} />
                <span>QRIS</span>
              </button>
              <button
                type="button"
                className={`btn ${paymentMethod === 'TRANSFER' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flexDirection: 'column', gap: '4px', padding: '12px 6px' }}
                onClick={() => {
                  setPaymentMethod('TRANSFER');
                  setAmountPaid(grandTotal);
                }}
              >
                <CreditCard size={24} />
                <span>TRANSFER</span>
              </button>
            </div>
          </div>

          {/* Jika TUNAI: Pilihan Uang Cepat & Kembalian */}
          {paymentMethod === 'CASH' && (
            <div>
              <div className="input-group">
                <label className="input-label">Uang Tunai Diterima:</label>
                <input
                  type="number"
                  className="input-field"
                  style={{ fontSize: '1.4rem', fontWeight: 'bold' }}
                  value={amountPaid || ''}
                  onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                  placeholder="0"
                  autoFocus
                />
              </div>

              {/* Tombol Pecahan Cepat */}
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Pilihan Cepat Nominal:
              </div>
              <div className="nominal-grid">
                {quickNominals.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`nominal-btn ${item.isPas ? 'pas' : ''}`}
                    onClick={() => handleSelectNominal(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Tampilan Kembalian Besar */}
              <div
                style={{
                  background: isShort ? '#fef2f2' : '#f0fdf4',
                  border: `2px solid ${isShort ? '#fecaca' : '#bbf7d0'}`,
                  borderRadius: '14px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: isShort ? '#991b1b' : '#166534',
                      textTransform: 'uppercase'
                    }}
                  >
                    {isShort ? 'Uang Pembayaran Kurang' : 'Uang Kembalian'}
                  </div>
                  <div
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: 900,
                      color: isShort ? '#b91c1c' : '#15803d'
                    }}
                  >
                    {isShort ? formatRupiah(grandTotal - amountPaid) : formatRupiah(change)}
                  </div>
                </div>
                {!isShort && (
                  <div
                    style={{
                      background: '#15803d',
                      color: 'white',
                      padding: '8px 14px',
                      borderRadius: '999px',
                      fontWeight: 800,
                      fontSize: '0.9rem'
                    }}
                  >
                    LUNAS
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Pelanggan Opsional (Untuk kirim WhatsApp) */}
          <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '14px', marginTop: '14px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
              Info Pelanggan (Opsional - untuk WhatsApp):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nama Pembeli (Cth: Bu Ani)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="No. WhatsApp (Cth: 0812..)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="alert alert-danger" style={{ marginTop: '12px' }}>
              {errorMsg}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-outline" disabled={isSubmitting}>
            Batal
          </button>
          <button
            type="button"
            onClick={handleCompleteTransaction}
            className="btn btn-success btn-lg"
            disabled={isSubmitting || isShort}
            style={{ flex: 1 }}
          >
            <Check size={26} />
            {isSubmitting ? 'Memproses...' : 'Selesaikan Pembayaran'}
          </button>
        </div>
      </div>
    </div>
  );
};
