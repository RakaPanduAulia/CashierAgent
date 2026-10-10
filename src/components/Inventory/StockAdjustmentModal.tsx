import React, { useState } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, Check } from 'lucide-react';
import type { Product } from '../../types';
import { db } from '../../db/database';
import { formatRupiah } from '../../utils/formatters';

interface StockAdjustmentModalProps {
  products: Product[];
  initialProduct?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  products,
  initialProduct,
  onClose,
  onSuccess
}) => {
  const [selectedProductId, setSelectedProductId] = useState<number>(
    initialProduct?.id || products[0]?.id || 0
  );
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [qty, setQty] = useState<number>(1);
  const [costPrice, setCostPrice] = useState<number>(initialProduct?.buyPrice || 0);
  const [reason, setReason] = useState<string>('Kulakan dari Supplier');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentProduct = products.find((p) => p.id === selectedProductId);

  const handleProductChange = (id: number) => {
    setSelectedProductId(id);
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setCostPrice(prod.buyPrice);
    }
  };

  const handleTypeChange = (type: 'IN' | 'OUT') => {
    setMovementType(type);
    if (type === 'IN') {
      setReason('Kulakan dari Supplier');
    } else {
      setReason('Barang Rusak / Cacat Kemasan');
    }
  };

  const previousStock = currentProduct?.stock || 0;
  const newStock =
    movementType === 'IN'
      ? previousStock + (Number(qty) || 0)
      : Math.max(0, previousStock - (Number(qty) || 0));

  const totalCost = (Number(qty) || 0) * (Number(costPrice) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !currentProduct.id) {
      setErrorMsg('Pilih barang terlebih dahulu!');
      return;
    }
    if (qty <= 0) {
      setErrorMsg('Jumlah stok harus lebih dari 0!');
      return;
    }
    if (movementType === 'OUT' && qty > previousStock) {
      setErrorMsg(`Jumlah stok keluar melebihi stok yang ada (${previousStock} ${currentProduct.unit})!`);
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();

      // Update stok barang di tabel produk (dan perbarui harga modal jika restock baru)
      const updatePayload: Partial<Product> = {
        stock: newStock,
        updatedAt: now
      };

      if (movementType === 'IN' && costPrice > 0) {
        updatePayload.buyPrice = costPrice;
      }

      await db.products.update(currentProduct.id, updatePayload);

      // Catat kartu riwayat stok
      await db.stockMovements.add({
        productId: currentProduct.id,
        productName: currentProduct.name,
        type: movementType,
        qty: Number(qty),
        previousStock,
        newStock,
        pricePerUnit: costPrice || currentProduct.buyPrice,
        totalCost,
        reason: reason.trim() || (movementType === 'IN' ? 'Stok Masuk' : 'Stok Keluar'),
        date: now
      });

      onSuccess();
    } catch (err) {
      console.error('Gagal memperbarui stok:', err);
      setErrorMsg('Terjadi kesalahan saat memproses stok.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Catat Keluar / Masuk Stok</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Pencatatan kulakan masuk atau pengurangan stok toko
            </p>
          </div>
          <button onClick={onClose} className="btn btn-outline btn-icon-only">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Tab Pilihan Jenis: Masuk vs Keluar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
              <button
                type="button"
                className={`btn ${movementType === 'IN' ? 'btn-success' : 'btn-outline'}`}
                style={{ minHeight: '56px', fontSize: '1rem', fontWeight: 800 }}
                onClick={() => handleTypeChange('IN')}
              >
                <ArrowDownCircle size={24} />
                <span>MASUK STOK (Kulakan)</span>
              </button>

              <button
                type="button"
                className={`btn ${movementType === 'OUT' ? 'btn-danger' : 'btn-outline'}`}
                style={{ minHeight: '56px', fontSize: '1rem', fontWeight: 800 }}
                onClick={() => handleTypeChange('OUT')}
              >
                <ArrowUpCircle size={24} />
                <span>KELUAR STOK (Rusak/Hilang)</span>
              </button>
            </div>

            {/* Pilihan Barang */}
            <div className="input-group">
              <label className="input-label">Pilih Barang:</label>
              <select
                className="select-field"
                value={selectedProductId}
                onChange={(e) => handleProductChange(Number(e.target.value))}
                style={{ fontWeight: 600 }}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stok: {p.stock} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Info Stok Saat Ini */}
            {currentProduct && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                    STOK SAAT INI:
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    {previousStock} {currentProduct.unit}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                    ESTIMASI STOK BARU:
                  </span>
                  <div
                    style={{
                      fontSize: '1.3rem',
                      fontWeight: 900,
                      color: movementType === 'IN' ? '#15803d' : '#b91c1c'
                    }}
                  >
                    {newStock} {currentProduct.unit}
                  </div>
                </div>
              </div>
            )}

            {/* Input Jumlah Qty */}
            <div className="input-group">
              <label className="input-label">
                Jumlah Barang {movementType === 'IN' ? 'Masuk (+)' : 'Keluar (-)'}:
              </label>
              <input
                type="number"
                className="input-field"
                style={{ fontSize: '1.4rem', fontWeight: 800 }}
                value={qty || ''}
                onChange={(e) => setQty(Number(e.target.value) || 0)}
                placeholder="0"
                min="1"
                required
              />
            </div>

            {/* Jika Masuk Stok: Harga Beli / Modal */}
            {movementType === 'IN' && (
              <div className="input-group">
                <label className="input-label">Harga Modal Beli / Satuan (Rp):</label>
                <input
                  type="number"
                  className="input-field"
                  value={costPrice || ''}
                  onChange={(e) => setCostPrice(Number(e.target.value) || 0)}
                  placeholder="Rp 0"
                />
                <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  Total uang modal masuk: <b>{formatRupiah(totalCost)}</b>
                </span>
              </div>
            )}

            {/* Alasan / Catatan */}
            <div className="input-group">
              <label className="input-label">Alasan / Catatan:</label>
              {movementType === 'OUT' ? (
                <select
                  className="select-field"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="Barang Rusak / Cacat Kemasan">Barang Rusak / Cacat Kemasan</option>
                  <option value="Bocor / Tumpah di Toko">Bocor / Tumpah di Toko</option>
                  <option value="Kadaluarsa / Expired">Kadaluarsa / Expired</option>
                  <option value="Dipakai Sendiri / Keperluan Toko">Dipakai Sendiri / Keperluan Toko</option>
                  <option value="Retur ke Supplier">Retur ke Supplier</option>
                  <option value="Penyesuaian Fisik (Opname)">Penyesuaian Fisik (Opname)</option>
                </select>
              ) : (
                <input
                  type="text"
                  className="input-field"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Contoh: Kulakan Toko Grosir Jaya / Supplier Plastik"
                />
              )}
            </div>

            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={isSubmitting}>
              Batal
            </button>
            <button
              type="submit"
              className={`btn ${movementType === 'IN' ? 'btn-success' : 'btn-danger'} btn-lg`}
              disabled={isSubmitting}
              style={{ flex: 1 }}
            >
              <Check size={24} />
              {isSubmitting
                ? 'Menyimpan...'
                : movementType === 'IN'
                ? 'Simpan Masuk Stok'
                : 'Simpan Keluar Stok'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
