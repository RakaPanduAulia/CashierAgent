import React, { useState, useEffect } from 'react';
import { LayoutGrid, Plus, Edit2, Trash2, ArrowLeft, Check, X, AlertTriangle } from 'lucide-react';
import { db } from '../../db/database';
import type { ProductCategory, Product } from '../../types';

interface CategoryManagerProps {
  onBack: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ onBack }) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<ProductCategory | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState<ProductCategory | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    const [catList, prodList] = await Promise.all([
      db.categories.toArray(),
      db.products.toArray()
    ]);
    setCategories(catList);
    setProducts(prodList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const exists = categories.some(
      (c) => c.name.toLowerCase() === newCatName.trim().toLowerCase()
    );
    if (exists) {
      setErrorMsg('Kategori ini sudah ada!');
      return;
    }

    await db.categories.add({
      name: newCatName.trim(),
      createdAt: new Date().toISOString()
    });

    setNewCatName('');
    setErrorMsg('');
    loadData();
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editingCat.id || !editName.trim()) return;

    // Update nama kategori di database kategori
    await db.categories.update(editingCat.id, {
      name: editName.trim()
    });

    // Update produk yang menggunakan kategori lama
    const productsInCat = products.filter((p) => p.category === editingCat.name);
    for (const p of productsInCat) {
      if (p.id) {
        await db.products.update(p.id, { category: editName.trim() });
      }
    }

    setEditingCat(null);
    setEditName('');
    loadData();
  };

  const handleDeleteCategory = async (id?: number) => {
    if (!id || !deleteCandidate) return;
    await db.categories.delete(id);
    setDeleteCandidate(null);
    loadData();
  };

  return (
    <div>
      {/* Header Kasir Pintar dengan tombol kembali */}
      <div className="kp-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button type="button" className="kp-icon-btn" onClick={onBack}>
            <ArrowLeft size={24} />
          </button>
          <span className="kp-header-title">PRODUCT CATEGORY</span>
        </div>
        <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
          {categories.length} Kategori
        </span>
      </div>

      <div style={{ padding: '12px 16px' }}>
        {/* Form Tambah Kategori Baru */}
        <form onSubmit={handleAddCategory} style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Ketik nama kategori baru..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              style={{ flex: 1, minHeight: '44px' }}
            />
            <button
              type="submit"
              className="kp-btn-primary"
              style={{ width: 'auto', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={20} />
              <span>Tambah</span>
            </button>
          </div>
          {errorMsg && (
            <div style={{ fontSize: '0.8rem', color: '#DC2626', marginTop: '4px', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}
        </form>

        {/* Daftar Kategori */}
        <div className="kp-product-list">
          {categories.map((cat) => {
            const productCount = products.filter((p) => p.category === cat.name).length;

            return (
              <div key={cat.id} className="kp-product-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <LayoutGrid size={22} />
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1E293B' }}>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {productCount} produk terkait
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCat(cat);
                      setEditName(cat.name);
                    }}
                    className="kp-icon-btn"
                    title="Ubah Nama"
                  >
                    <Edit2 size={18} color="#475569" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteCandidate(cat)}
                    className="kp-icon-btn"
                    title="Hapus Kategori"
                  >
                    <Trash2 size={18} color="#DC2626" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Edit Nama Kategori */}
      {editingCat && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '380px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ fontSize: '1.1rem' }}>Ubah Kategori</h3>
              <button
                type="button"
                onClick={() => setEditingCat(null)}
                className="kp-icon-btn"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateCategory}>
              <div className="modal-body">
                <label className="input-label">Nama Kategori:</label>
                <input
                  type="text"
                  className="input-field"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="btn btn-outline"
                >
                  Batal
                </button>
                <button type="submit" className="kp-btn-primary" style={{ width: 'auto' }}>
                  <Check size={18} style={{ display: 'inline', marginRight: '4px' }} />
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteCandidate && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '360px' }}>
            <div className="modal-header" style={{ background: '#FEF2F2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} color="#DC2626" />
                <h3 className="modal-title" style={{ color: '#991B1B', fontSize: '1rem' }}>
                  Hapus Kategori?
                </h3>
              </div>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem' }}>
                Hapus kategori <b>"{deleteCandidate.name}"</b>?
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
                onClick={() => handleDeleteCategory(deleteCandidate.id)}
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
