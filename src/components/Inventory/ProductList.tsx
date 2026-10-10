import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  ArrowDownUp,
  History,
  Search,
  Edit2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { db } from '../../db/database';
import type { Product } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { ProductFormModal } from './ProductFormModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { StockHistoryView } from './StockHistoryView';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [adjustmentTargetProduct, setAdjustmentTargetProduct] = useState<Product | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);

  const loadProducts = async () => {
    const list = await db.products.toArray();
    setProducts(list);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Statistik inventori
  const totalItemsCount = products.length;
  const totalInventoryCapital = products.reduce((acc, p) => acc + p.stock * p.buyPrice, 0);
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  const handleDeleteProduct = async (id?: number) => {
    if (!id) return;
    await db.products.delete(id);
    setDeleteCandidate(null);
    loadProducts();
  };

  return (
    <div>
      {/* Kartu Ringkasan Stok & Modal Toko */}
      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-label">Total Jenis Barang</div>
          <div className="stat-value">{totalItemsCount} Macam</div>
          <div className="stat-subtext">Produk terdaftar di toko</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-label">Total Nilai Modal Stok</div>
          <div className="stat-value">{formatRupiah(totalInventoryCapital)}</div>
          <div className="stat-subtext">Modal barang fisik di gudang & toko</div>
        </div>

        <div className={`stat-card ${lowStockProducts.length > 0 ? 'amber' : 'green'}`}>
          <div className="stat-label">Stok Menipis / Habis</div>
          <div className="stat-value" style={{ color: lowStockProducts.length > 0 ? '#b45309' : '#15803d' }}>
            {lowStockProducts.length} Produk
          </div>
          <div className="stat-subtext">
            {lowStockProducts.length > 0 ? 'Perlu kulakan / restock segera' : 'Semua stok aman'}
          </div>
        </div>
      </div>

      {/* Tombol Aksi Utama */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
          className="btn btn-primary btn-lg"
        >
          <Plus size={24} />
          <span>Tambah Barang</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAdjustmentTargetProduct(null);
            setIsAdjustmentOpen(true);
          }}
          className="btn btn-success btn-lg"
        >
          <ArrowDownUp size={24} />
          <span>Masuk / Keluar Stok</span>
        </button>

        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="btn btn-outline btn-lg"
        >
          <History size={24} />
          <span>Riwayat Mutasi Stok</span>
        </button>
      </div>

      {/* Pencarian & Filter Kategori */}
      <div className="search-bar-wrapper">
        <Search className="search-bar-icon" size={26} />
        <input
          type="text"
          className="search-bar-input"
          placeholder="Cari nama barang atau barcode..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="category-scroll">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Daftar Produk */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <Package size={56} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <h3>Tidak ada barang yang cocok</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((item) => {
            const isLow = item.stock <= item.minStock;
            const profit = item.sellPrice - item.buyPrice;
            const itemCapital = item.stock * item.buyPrice;

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderLeft: isLow ? '6px solid #f59e0b' : '6px solid #10b981'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  <div>
                    <span className="product-badge-category">{item.category}</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                      {item.name}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Satuan: <b>{item.unit}</b> {item.barcode ? `• Barcode: ${item.barcode}` : ''}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      className={`stock-pill ${
                        item.stock === 0 ? 'empty' : isLow ? 'low' : 'normal'
                      }`}
                      style={{ fontSize: '0.95rem', padding: '6px 14px' }}
                    >
                      {item.stock === 0
                        ? 'Stok Habis'
                        : isLow
                        ? `Menipis: ${item.stock} ${item.unit}`
                        : `Stok: ${item.stock} ${item.unit}`}
                    </span>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                      Nilai Modal: <b>{formatRupiah(itemCapital)}</b>
                    </div>
                  </div>
                </div>

                {/* Baris Harga & Laba */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '8px',
                    background: '#f8fafc',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                      MODAL (BELI)
                    </span>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#475569' }}>
                      {formatRupiah(item.buyPrice)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                      HARGA JUAL
                    </span>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e40af' }}>
                      {formatRupiah(item.sellPrice)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                      KEUNTUNGAN / ITEM
                    </span>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#15803d' }}>
                      +{formatRupiah(profit)}
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi per Barang */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentTargetProduct(item);
                      setIsAdjustmentOpen(true);
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: '#3b82f6', color: '#1d4ed8' }}
                  >
                    <ArrowDownUp size={18} />
                    <span>Kelola Stok</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(item);
                      setIsFormOpen(true);
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    <Edit2 size={18} />
                    <span>Ubah</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteCandidate(item)}
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: '#fca5a5', color: '#dc2626' }}
                  >
                    <Trash2 size={18} />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah/Edit Produk */}
      {isFormOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => {
            setIsFormOpen(false);
            loadProducts();
          }}
        />
      )}

      {/* Modal Masuk/Keluar Stok */}
      {isAdjustmentOpen && (
        <StockAdjustmentModal
          products={products}
          initialProduct={adjustmentTargetProduct}
          onClose={() => setIsAdjustmentOpen(false)}
          onSuccess={() => {
            setIsAdjustmentOpen(false);
            loadProducts();
          }}
        />
      )}

      {/* Modal Riwayat Stok */}
      {isHistoryOpen && <StockHistoryView onClose={() => setIsHistoryOpen(false)} />}

      {/* Dialog Konfirmasi Hapus Ramah Lansia */}
      {deleteCandidate && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header" style={{ background: '#fef2f2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={26} color="#dc2626" />
                <h3 className="modal-title" style={{ color: '#991b1b' }}>
                  Hapus Barang Ini?
                </h3>
              </div>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
                Apakah Anda yakin ingin menghapus barang <b>"{deleteCandidate.name}"</b>?
              </p>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>
                Barang yang dihapus tidak akan muncul lagi di kasir.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="btn btn-outline"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProduct(deleteCandidate.id)}
                className="btn btn-danger"
              >
                Ya, Hapus Barang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
