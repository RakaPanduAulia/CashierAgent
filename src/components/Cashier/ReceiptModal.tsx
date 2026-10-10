import React, { useState } from 'react';
import {
  Check,
  Printer,
  Settings,
  Eye,
  Share2,
  Download,
  ArrowLeft,
  X
} from 'lucide-react';
import type { Transaction } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { generateReceiptPdf } from '../../utils/pdfGenerator';
import { shareReceiptToWhatsApp } from '../../utils/whatsapp';

interface ReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const { storeProfile } = useStore();
  const [viewMode, setViewMode] = useState<'SUCCESS' | 'RECEIPT'>('SUCCESS');
  const [phone, setPhone] = useState(transaction.customerPhone || '');
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  const handlePrintPdf = () => {
    generateReceiptPdf(transaction, storeProfile, { download: true });
  };

  const handleShareWhatsApp = (targetPhone?: string) => {
    shareReceiptToWhatsApp(transaction, storeProfile, targetPhone || phone);
  };

  // Tampilan 1: "Good Job! Transaction success!" (Persis Screenshot 1)
  if (viewMode === 'SUCCESS') {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '440px', background: '#FFFFFF', padding: '16px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={24} />
            </button>
          </div>

          <div className="kp-success-screen">
            {/* Lingkaran Hijau Centang */}
            <div className="kp-success-circle">
              <Check size={52} strokeWidth={3.5} />
            </div>

            <h2 className="kp-success-title">Good Job!</h2>
            <p className="kp-success-subtitle">Transaction success!</p>

            {/* Baris Kembalian */}
            <div className="kp-change-row">
              <span style={{ color: '#4B5563' }}>Change</span>
              <span style={{ fontWeight: 800, color: '#1E293B' }}>
                {formatRupiah(transaction.change)}
              </span>
            </div>

            {/* Tumpukan Tombol Kasir Pintar (Screenshot 1 Style) */}
            <div className="kp-btn-stack">
              {/* Tombol 1: New Transaction */}
              <button type="button" className="kp-btn-primary" onClick={onClose}>
                New Transaction
              </button>

              {/* Tombol 2: Print Receipt */}
              <button
                type="button"
                className="kp-btn-outline"
                onClick={handlePrintPdf}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Printer size={26} color="var(--primary)" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800 }}>Print Receipt</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Cetak / Unduh File PDF
                    </div>
                  </div>
                </div>
                <Settings size={22} color="var(--primary)" />
              </button>

              {/* Tombol 3: See Receipt */}
              <button
                type="button"
                className="kp-btn-outline"
                onClick={() => setViewMode('RECEIPT')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Eye size={24} color="var(--primary)" />
                  <span style={{ fontWeight: 800 }}>See Receipt</span>
                </div>
              </button>

              {/* Tombol 4: Share WhatsApp (Pengganti Send Email) */}
              <button
                type="button"
                className="kp-btn-outline"
                onClick={() => {
                  if (transaction.customerPhone) {
                    handleShareWhatsApp(transaction.customerPhone);
                  } else {
                    setShowPhoneInput(!showPhoneInput);
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Share2 size={22} color="var(--primary)" />
                  <span style={{ fontWeight: 800 }}>Share to WhatsApp</span>
                </div>
                <span
                  style={{
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                >
                  WA
                </span>
              </button>

              {/* Form Input No WA jika belum ada */}
              {showPhoneInput && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="Nomor WA (contoh: 08123..)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ flex: 1, minHeight: '44px', padding: '8px' }}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="kp-btn-primary"
                    style={{ width: 'auto', padding: '8px 14px' }}
                    onClick={() => handleShareWhatsApp(phone)}
                  >
                    Kirim
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan 2: "Print Receipt" dengan Kertas Gerigi Thermal (Persis Screenshot 3)
  return (
    <div className="modal-overlay" style={{ alignItems: 'flex-start', overflowY: 'auto' }}>
      <div className="kp-receipt-wrapper">
        {/* Top bar Screenshot 3 */}
        <div className="kp-receipt-topbar">
          <button
            type="button"
            className="kp-icon-btn"
            onClick={() => setViewMode('SUCCESS')}
            style={{ color: '#1e293b' }}
          >
            <ArrowLeft size={24} />
          </button>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>Print</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="kp-icon-btn"
              onClick={handlePrintPdf}
              title="Unduh PDF"
            >
              <Download size={24} color="#1e293b" />
            </button>
            <button
              type="button"
              className="kp-icon-btn"
              onClick={() => handleShareWhatsApp()}
              title="Share WhatsApp"
            >
              <Share2 size={24} color="#1e293b" />
            </button>
          </div>
        </div>

        {/* Kertas Struk Gerigi Thermal (Jagged Edge Tear Effect) */}
        <div className="kp-receipt-paper">
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.15rem' }}>{storeProfile.name}</div>
            <div style={{ fontSize: '0.82rem', color: '#475569' }}>{storeProfile.address}</div>
            <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '6px' }}>
              {transaction.invoiceNumber}
            </div>
          </div>

          <div className="kp-receipt-dashed" />

          <div style={{ fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div>{formatDateTime(transaction.date)}</div>
              <div>No. {transaction.invoiceNumber.slice(-4)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>{transaction.customerName || 'Pelanggan'}</div>
            </div>
          </div>

          <div className="kp-receipt-dashed" />

          {/* Daftar Barang Belanja */}
          <div style={{ fontSize: '0.85rem' }}>
            {transaction.items.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '8px' }}>
                <div style={{ fontWeight: 'bold' }}>{item.productName}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                  <span>
                    {item.qty} x {formatRupiah(item.sellPrice).replace('Rp ', '')}
                  </span>
                  <span style={{ fontWeight: 600 }}>{formatRupiah(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="kp-receipt-dashed" />

          {/* Total, Charges, Changes (Screenshot 3 Style) */}
          <div style={{ fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Total</span>
              <span style={{ fontWeight: 700 }}>{formatRupiah(transaction.grandTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Charges</span>
              <span>{formatRupiah(transaction.amountPaid)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Changes</span>
              <span>{formatRupiah(transaction.change)}</span>
            </div>
          </div>

          <div className="kp-receipt-dashed" />

          {/* Footer Struk */}
          <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748B', marginTop: '12px' }}>
            <div>{storeProfile.footerMessage}</div>
            <div style={{ marginTop: '10px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.04em' }}>
              ★ KASIR PINTAR LOCAL ★
            </div>
          </div>
        </div>

        {/* Tombol Selesai */}
        <div style={{ marginTop: '20px', width: '100%', maxWidth: '380px' }}>
          <button type="button" className="kp-btn-primary" onClick={onClose}>
            Kembali ke Kasir
          </button>
        </div>
      </div>
    </div>
  );
};
