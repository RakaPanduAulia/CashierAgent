import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatRupiah } from '../../utils/formatters';
import type { Product } from '../../types';
import { QuantityFloatingModal } from './QuantityFloatingModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToPayment: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onProceedToPayment }) => {
  const { cart, updateCartQty, cartTotal } = useStore();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px', height: '92vh' }}>
        {/* Kasir Pintar Cart Header (Screenshot 4 Style) */}
        <div className="kp-cart-header">
          <button
            type="button"
            className="kp-icon-btn"
            onClick={onClose}
            title="Kembali"
          >
            <ArrowLeft size={24} color="var(--primary)" />
          </button>

          <div className="kp-cart-total-badge">
            {formatRupiah(cartTotal.grandTotal).toUpperCase()}
          </div>

          <button
            type="button"
            className="kp-cart-check-btn"
            onClick={onProceedToPayment}
            disabled={cart.length === 0}
            title="Lanjut Pembayaran"
          >
            <Check size={26} strokeWidth={3} />
          </button>
        </div>

        {/* Sub-bar: Add Cost / Rincian */}
        <div
          style={{
            padding: '10px 16px',
            borderBottom: '1px solid #edf2f7',
            color: 'var(--primary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span>Daftar Pesanan ({cartTotal.itemsCount} item)</span>
          <span style={{ color: '#64748B', fontWeight: 600 }}>Ketuk [qty] untuk edit</span>
        </div>

        {/* Items List */}
        <div className="modal-body" style={{ padding: '0 16px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 16px', color: '#94a3b8' }}>
              <h3>Keranjang Kosong</h3>
              <p style={{ marginTop: '8px' }}>Pilih produk dari etalase kasir.</p>
            </div>
          ) : (
            cart.map((item) => {
              const initials = item.product.name
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0].toUpperCase())
                .join('');

              return (
                <div key={item.product.id} className="kp-cart-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div className="kp-avatar-box">{initials || 'PR'}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>
                        {item.product.name}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                        {item.qty} x {formatRupiah(item.product.sellPrice)} ={' '}
                        <b style={{ color: 'var(--primary)' }}>{formatRupiah(item.subtotal)}</b>
                      </div>
                    </div>
                  </div>

                  {/* Quantity border box [ 1 ] (Screenshot 4 style) */}
                  <button
                    type="button"
                    className="kp-cart-qty-box"
                    onClick={() => setEditingProduct(item.product)}
                    title="Ubah Jumlah"
                  >
                    {item.qty}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Bar: Tombol Hijau Lanjut Bayar */}
        {cart.length > 0 && (
          <div className="modal-footer" style={{ padding: '12px 16px' }}>
            <button
              type="button"
              className="kp-btn-primary"
              onClick={onProceedToPayment}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Check size={22} />
              <span>BAYAR SEKARANG ({formatRupiah(cartTotal.grandTotal)})</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Quantity Editor jika tombol qty diklik */}
      {editingProduct && (
        <QuantityFloatingModal
          product={editingProduct}
          initialQty={cart.find((c) => c.product.id === editingProduct.id)?.qty || 1}
          onClose={() => setEditingProduct(null)}
          onConfirm={(newQty) => {
            if (editingProduct.id) {
              updateCartQty(editingProduct.id, newQty);
            }
          }}
        />
      )}
    </div>
  );
};
