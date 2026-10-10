import React, { useState } from 'react';
import { X, Check, Plus, Minus, Trash2 } from 'lucide-react';
import type { Product } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface QuantityFloatingModalProps {
  product: Product;
  initialQty?: number;
  onClose: () => void;
  onConfirm: (qty: number) => void;
}

export const QuantityFloatingModal: React.FC<QuantityFloatingModalProps> = ({
  product,
  initialQty = 1,
  onClose,
  onConfirm
}) => {
  const [qty, setQty] = useState<number>(initialQty > 0 ? initialQty : 1);

  // Inisial 2 huruf untuk avatar
  const initials = product.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');

  const maxStock = product.stock;
  const subtotal = qty * product.sellPrice;

  const handleDecrease = () => {
    setQty((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQty((prev) => Math.min(maxStock, prev + 1));
  };

  const handleAddQuick = (amount: number) => {
    setQty((prev) => Math.min(maxStock, prev + amount));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="kp-qty-modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>
            ATUR JUMLAH BARANG
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Info Produk */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', textAlign: 'left' }}>
          <div className="kp-avatar-box">{initials || 'PR'}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>
              {product.name}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              {formatRupiah(product.sellPrice)} / {product.unit} • Stok: {product.stock}
            </div>
          </div>
        </div>

        {/* Stepper Jumlah (+ / -) */}
        <div className="kp-qty-stepper">
          <button type="button" className="kp-qty-btn" onClick={handleDecrease}>
            <Minus size={22} />
          </button>

          <input
            type="number"
            className="kp-qty-input"
            value={qty || ''}
            onChange={(e) => {
              const val = Number(e.target.value) || 0;
              setQty(Math.min(maxStock, Math.max(0, val)));
            }}
            min="1"
            max={maxStock}
            autoFocus
          />

          <button
            type="button"
            className="kp-qty-btn"
            onClick={handleIncrease}
            disabled={qty >= maxStock}
          >
            <Plus size={22} />
          </button>
        </div>

        {/* Tombol Cepat Tambah Jumlah */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '16px' }}>
          {[1, 5, 10, 20].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleAddQuick(num)}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                background: '#f8fafc',
                padding: '4px 10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              +{num}
            </button>
          ))}
          {maxStock > 0 && (
            <button
              type="button"
              onClick={() => setQty(maxStock)}
              style={{
                border: '1px solid var(--primary-border)',
                borderRadius: '6px',
                background: 'var(--primary-light)',
                padding: '4px 8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--primary)',
                cursor: 'pointer'
              }}
            >
              Semua
            </button>
          )}
        </div>

        {/* Total Harga */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            background: '#f1f5f9',
            borderRadius: '8px',
            marginBottom: '16px'
          }}
        >
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total:</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>
            {formatRupiah(subtotal)}
          </span>
        </div>

        {/* Tombol Aksi */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {initialQty > 0 && (
            <button
              type="button"
              onClick={() => {
                onConfirm(0);
                onClose();
              }}
              style={{
                border: '1px solid #fecaca',
                borderRadius: '8px',
                background: '#fef2f2',
                color: '#dc2626',
                padding: '0 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Hapus dari keranjang"
            >
              <Trash2 size={20} />
            </button>
          )}

          <button
            type="button"
            className="kp-btn-primary"
            style={{ flex: 1, padding: '12px' }}
            onClick={() => {
              onConfirm(qty);
              onClose();
            }}
          >
            <Check size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            Simpan Jumlah
          </button>
        </div>
      </div>
    </div>
  );
};
