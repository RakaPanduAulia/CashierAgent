import React, { useState, useEffect } from 'react';
import {
  Plus,
  ArrowDownUp,
  History,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  X
} from 'lucide-react';
import { db } from '../../db/database';
import type { Product } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { ProductFormModal } from './ProductFormModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { StockHistoryView } from './StockHistoryView';

interface ProductListProps {
  onBack?: () => void;
}

export const ProductList: React.FC<ProductListProps> = ({ onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All item');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [adjustmentTargetProduct, setAdjustmentTargetProduct] = useState<Product | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);

  const [dbCategoryNames, setDbCategoryNames] = useState<string[]>([]);

  const loadProducts = async () => {
    const [list, cats] = await Promise.all([
      db.products.toArray(),
      db.categories.toArray()
    ]);
    setProducts(list);
    setDbCategoryNames(cats.map((c) => c.name));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const rawCategories = Array.from(new Set([...dbCategoryNames, ...products.map((p) => p.category)]));
  const categories = ['All item', ...rawCategories];

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));
    const matchesCategory = selectedCategory === 'All item' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      {/* Kasir Pintar Style Header */}
      <div className="kp-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onBack && (
            <button type="button" className="kp-icon-btn" onClick={onBack}>
              <ArrowLeft size={24} />
            </button>
          )}
          <span className="kp-header-title">PRODUCT OR SERVICE</span>
        </div>
        <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
          {products.length} Barang
        </span>
      </div>

      {/* Subbar: Search, Add, Restock, Category Filter */}
      <div className="kp-subbar">
        <div className="kp-subbar-icons">
          <button
            type="button"
            className="kp-icon-btn"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            title="Cari Produk"
          >
            <Search size={22} />
          </button>
          <button
            type="button"
            className="kp-icon-btn"
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            title="Tambah Barang Baru"
          >
            <Plus size={24} />
          </button>
          <button
            type="button"
            className="kp-icon-btn"
            onClick={() => {
              setAdjustmentTargetProduct(null);
              setIsAdjustmentOpen(true);
            }}
            title="Masuk / Keluar Stok"
          >
            <ArrowDownUp size={20} />
          </button>
          <button
            type="button"
            className="kp-icon-btn"
            onClick={() => setIsHistoryOpen(true)}
            title="Riwayat Stok"
          >
            <History size={20} />
          </button>
        </div>

        {/* Dropdown Kategori 'All item' */}
        <select
          className="kp-dropdown-pill"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Input Pencarian Cepat */}
      {isSearchOpen && (
        <div className="kp-search-input-wrapper" style={{ margin: '10px 0' }}>
          <Search size={20} color="var(--primary)" />
          <input
            type="text"
            className="kp-search-input"
            placeholder="Cari nama barang atau barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {/* Ringkasan Nilai Modal Ramping Kasir Pintar */}
      <div style={{ padding: '0 16px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          margin: '12px 0 10px 0'
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '10px 12px'
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>
            MODAL STOK TOKO
          </span>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
            {formatRupiah(totalInventoryCapital)}
          </div>
        </div>

        <div
          style={{
            background: lowStockProducts.length > 0 ? '#FFFBEB' : '#FFFFFF',
            border: `1px solid ${lowStockProducts.length > 0 ? '#FDE68A' : '#E2E8F0'}`,
            borderRadius: '8px',
            padding: '10px 12px'
          }}
        >
          <span
            style={{
              fontSize: '0.72rem',
              color: lowStockProducts.length > 0 ? '#B45309' : '#64748B',
              fontWeight: 700
            }}
          >
            STOK MENIPIS
          </span>
          <div
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: lowStockProducts.length > 0 ? '#B45309' : '#10B981',
              marginTop: '2px'
            }}
          >
            {lowStockProducts.length} Produk
          </div>
        </div>
      </div>

      {/* Tombol Aksi Cepat Tambah & Kelola Stok */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        <button
          type="button"
          className="kp-btn-primary"
          style={{ padding: '10px', fontSize: '0.88rem' }}
          onClick={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
        >
          <Plus size={18} />
          <span>+ Tambah Barang</span>
        </button>

        <button
          type="button"
          className="kp-btn-outline"
          style={{ padding: '10px', fontSize: '0.88rem', justifyContent: 'center' }}
          onClick={() => {
            setAdjustmentTargetProduct(null);
            setIsAdjustmentOpen(true);
          }}
        >
          <ArrowDownUp size={18} />
          <span>Masuk / Keluar Stok</span>
        </button>
      </div>

      {/* Daftar Produk Ramping Gaya Kasir Pintar */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
          <h3>Barang tidak ditemukan</h3>
          <p style={{ marginTop: '6px' }}>Coba ubah kata kunci atau pilih All item.</p>
        </div>
      ) : (
        <div className="kp-product-list">
          {filtered.map((item) => {
            const isLow = item.stock <= item.minStock;
            const profit = item.sellPrice - item.buyPrice;

            const initials = item.name
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((w) => w[0].toUpperCase())
              .join('');

            return (
              <div
                key={item.id}
                className="kp-product-item"
                style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="kp-product-left">
                    <div className="kp-avatar-box">{initials || 'PR'}</div>
                    <div className="kp-product-details">
                      <div className="kp-product-name">{item.name}</div>
                      <div className="kp-product-price">
                        Jual: <b style={{ color: 'var(--primary)' }}>{formatRupiah(item.sellPrice)}</b> • Modal:{' '}
                        {formatRupiah(item.buyPrice)}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`stock-pill ${
                      item.stock === 0 ? 'empty' : isLow ? 'low' : 'normal'
                    }`}
                    style={{ fontSize: '0.78rem', padding: '3px 8px' }}
                  >
                    {item.stock === 0 ? 'Habis' : `Sisa ${item.stock} ${item.unit}`}
                  </span>
                </div>

                {/* Baris Laba & Tombol Tindakan */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '6px',
                    borderTop: '1px dashed #edf2f7'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: '#15803D', fontWeight: 700 }}>
                    Laba: +{formatRupiah(profit)} / {item.unit}
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setAdjustmentTargetProduct(item);
                        setIsAdjustmentOpen(true);
                      }}
                      className="kp-icon-btn"
                      title="Masuk / Keluar Stok"
                    >
                      <ArrowDownUp size={18} color="var(--primary)" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(item);
                        setIsFormOpen(true);
                      }}
                      className="kp-icon-btn"
                      title="Ubah Data"
                    >
                      <Edit2 size={18} color="#475569" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteCandidate(item)}
                      className="kp-icon-btn"
                      title="Hapus Barang"
                    >
                      <Trash2 size={18} color="#DC2626" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

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

      {/* Konfirmasi Hapus */}
      {deleteCandidate && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '380px' }}>
            <div className="modal-header" style={{ background: '#FEF2F2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={22} color="#DC2626" />
                <h3 className="modal-title" style={{ color: '#991B1B', fontSize: '1.1rem' }}>
                  Hapus Barang?
                </h3>
              </div>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.95rem' }}>
                Yakin ingin menghapus <b>"{deleteCandidate.name}"</b>?
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
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
