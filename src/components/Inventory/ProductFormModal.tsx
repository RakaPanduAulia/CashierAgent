import React, { useState } from 'react';
import { X, Check, PackagePlus } from 'lucide-react';
import type { Product } from '../../types';
import { db } from '../../db/database';
import { formatRupiah } from '../../utils/formatters';

interface ProductFormModalProps {
  product?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

const PRESET_CATEGORIES = [
  'Bahan Kue & Tepung',
  'Margarin & Cokelat',
  'Ragi & Pengembang',
  'Keju & Topping',
  'Plastik & Mika',
  'Cup & Dus Kue',
  'Lain-lain'
];

const PRESET_UNITS = ['pcs', 'kg', 'gram', 'pack', 'roll', 'dus', 'bal', 'kaleng', 'botol', 'sachet'];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose, onSaved }) => {
  const isEditing = !!product;

  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || 'Bahan Kue & Tepung');
  const [unit, setUnit] = useState(product?.unit || 'pcs');
  const [buyPrice, setBuyPrice] = useState<number>(product?.buyPrice || 0);
  const [sellPrice, setSellPrice] = useState<number>(product?.sellPrice || 0);
  const [stock, setStock] = useState<number>(product?.stock || 0);
  const [minStock, setMinStock] = useState<number>(product?.minStock || 5);
  const [barcode, setBarcode] = useState(product?.barcode || '');
  const [notes, setNotes] = useState(product?.notes || '');
  const [errorMsg, setErrorMsg] = useState('');

  // Perhitungan margin laba
  const profitPerItem = sellPrice - buyPrice;
  const marginPercentage = buyPrice > 0 ? ((profitPerItem / buyPrice) * 100).toFixed(1) : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama barang tidak boleh kosong!');
      return;
    }
    if (sellPrice <= 0) {
      setErrorMsg('Harga jual harus lebih dari Rp 0!');
      return;
    }

    try {
      const now = new Date().toISOString();

      if (isEditing && product?.id) {
        await db.products.update(product.id, {
          name: name.trim(),
          category,
          unit,
          buyPrice,
          sellPrice,
          stock,
          minStock,
          barcode: barcode.trim() || undefined,
          notes: notes.trim() || undefined,
          updatedAt: now
        });
      } else {
        const newId = await db.products.add({
          name: name.trim(),
          category,
          unit,
          buyPrice,
          sellPrice,
          stock,
          minStock,
          barcode: barcode.trim() || undefined,
          notes: notes.trim() || undefined,
          createdAt: now,
          updatedAt: now
        });

        // Catat riwayat stok awal
        if (stock > 0) {
          await db.stockMovements.add({
            productId: newId as number,
            productName: name.trim(),
            type: 'IN',
            qty: stock,
            previousStock: 0,
            newStock: stock,
            pricePerUnit: buyPrice,
            totalCost: stock * buyPrice,
            reason: 'Stok awal produk baru',
            date: now
          });
        }
      }

      onSaved();
    } catch (err) {
      console.error('Gagal menyimpan barang:', err);
      setErrorMsg('Terjadi kesalahan saat menyimpan barang.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PackagePlus size={26} color="#1e40af" />
            <h2 className="modal-title">
              {isEditing ? 'Ubah Data Barang' : 'Tambah Barang Baru'}
            </h2>
          </div>
          <button onClick={onClose} className="btn btn-outline btn-icon-only">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Nama Produk */}
            <div className="input-group">
              <label className="input-label">Nama Barang / Produk:</label>
              <input
                type="text"
                className="input-field"
                placeholder="Contoh: Tepung Segitiga Biru 1 Kg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Kategori & Satuan */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">Kategori:</label>
                <select
                  className="select-field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Satuan:</label>
                <select
                  className="select-field"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  {PRESET_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Harga Beli (Modal) & Harga Jual */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">Harga Modal (Beli):</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Rp 0"
                  value={buyPrice || ''}
                  onChange={(e) => setBuyPrice(Number(e.target.value) || 0)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Harga Jual Kasir:</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Rp 0"
                  value={sellPrice || ''}
                  onChange={(e) => setSellPrice(Number(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            {/* Indikator Laba & Margin per Barang */}
            <div
              style={{
                background: profitPerItem >= 0 ? '#f0fdf4' : '#fef2f2',
                border: `2px solid ${profitPerItem >= 0 ? '#bbf7d0' : '#fecaca'}`,
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                  ESTIMASI KEUNTUNGAN / ITEM:
                </span>
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: profitPerItem >= 0 ? '#15803d' : '#b91c1c'
                  }}
                >
                  {formatRupiah(profitPerItem)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                  MARGIN:
                </span>
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: profitPerItem >= 0 ? '#15803d' : '#b91c1c'
                  }}
                >
                  +{marginPercentage}%
                </div>
              </div>
            </div>

            {/* Stok & Batas Minimum */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">
                  {isEditing ? 'Stok Saat Ini:' : 'Jumlah Stok Awal:'}
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value) || 0)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Peringatan Stok Tipis:</label>
                <input
                  type="number"
                  className="input-field"
                  value={minStock}
                  onChange={(e) => setMinStock(Number(e.target.value) || 0)}
                  placeholder="5"
                />
              </div>
            </div>

            {/* Barcode & Catatan */}
            <div className="input-group">
              <label className="input-label">Kode Barcode / SKU (Opsional):</label>
              <input
                type="text"
                className="input-field"
                placeholder="Scan atau ketik kode barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Catatan Tambahan (Opsional):</label>
              <input
                type="text"
                className="input-field"
                placeholder="Contoh: Kemasan pabrik / Grosir"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Batal
            </button>
            <button type="submit" className="btn btn-primary btn-lg" style={{ minWidth: '160px' }}>
              <Check size={22} />
              Simpan Barang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
