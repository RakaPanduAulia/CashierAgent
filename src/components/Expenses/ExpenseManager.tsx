import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Trash2, X, Check, TrendingDown } from 'lucide-react';
import { db } from '../../db/database';
import type { Expense } from '../../types';
import { formatRupiah, formatDateShort } from '../../utils/formatters';

const EXPENSE_CATEGORIES = [
  'Operasional Kasir (Plastik/Isi Staples)',
  'Listrik & Air Toko',
  'Sewa Toko & Kebersihan',
  'Gaji Karyawan',
  'Bensin / Transport Kulakan',
  'Lain-lain'
];

export const ExpenseManager: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState<Expense | null>(null);

  const loadExpenses = async () => {
    const list = await db.expenses.orderBy('date').reverse().toArray();
    setExpenses(list);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const totalThisMonth = expenses
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc, e) => acc + e.amount, 0);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    await db.expenses.add({
      title: title.trim(),
      category,
      amount,
      date: new Date().toISOString(),
      notes: notes.trim() || undefined
    });

    setTitle('');
    setAmount(0);
    setNotes('');
    setIsModalOpen(false);
    loadExpenses();
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await db.expenses.delete(id);
    setDeleteCandidate(null);
    loadExpenses();
  };

  return (
    <div>
      {/* Kasir Pintar Header */}
      <div className="kp-header">
        <span className="kp-header-title">BIAYA OPERASIONAL</span>
        <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
          {expenses.length} Catatan
        </span>
      </div>

      <div style={{ padding: '12px 16px' }}>
      {/* Metric Card Kasir Pintar (Screenshot 2 Style) */}
      <div style={{ margin: '14px 0 10px 0' }}>
        <div className="kp-metric-card">
          <div className="kp-metric-icon-box" style={{ backgroundColor: '#D97706' }}>
            <TrendingDown size={24} />
          </div>
          <div className="kp-metric-content">
            <div>
              <div className="kp-metric-number" style={{ color: '#B45309' }}>
                {formatRupiah(totalThisMonth)}
              </div>
              <div className="kp-metric-label">Pengeluaran Bulan Ini</div>
            </div>
            <div className="kp-metric-badge">
              <div>Toko</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Operasional</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tombol Tambah Pengeluaran */}
      <div style={{ marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="kp-btn-primary"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Plus size={20} />
          <span>+ Catat Biaya Pengeluaran Baru</span>
        </button>
      </div>

      {/* Daftar Pengeluaran Ramping */}
      {expenses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
          <Wallet size={48} style={{ opacity: 0.3, marginBottom: '8px' }} />
          <h3>Belum ada catatan biaya</h3>
          <p style={{ marginTop: '4px' }}>Catat pengeluaran seperti listrik, sewa, plastik kresek, dll.</p>
        </div>
      ) : (
        <div className="kp-product-list">
          {expenses.map((item) => (
            <div key={item.id} className="kp-product-item">
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    background: 'var(--primary-light)',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}
                >
                  {item.category}
                </span>
                <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1E293B', marginTop: '3px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  {formatDateShort(item.date)} {item.notes ? `• ${item.notes}` : ''}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#DC2626' }}>
                  -{formatRupiah(item.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => setDeleteCandidate(item)}
                  className="kp-icon-btn"
                  title="Hapus"
                >
                  <Trash2 size={18} color="#DC2626" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Modal Tambah Pengeluaran */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Catat Pengeluaran Baru</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="kp-icon-btn"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddExpense}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="input-label">Keperluan Pengeluaran:</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Contoh: Beli Kantong Kresek Kasir"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Kategori Biaya:</label>
                  <select
                    className="select-field"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Nominal Biaya (Rp):</label>
                  <input
                    type="number"
                    className="input-field"
                    style={{ fontSize: '1.2rem', fontWeight: 800 }}
                    placeholder="Rp 0"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Catatan Tambahan (Opsional):</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Contoh: Toko Grosir Plastik Sentosa"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                >
                  Batal
                </button>
                <button type="submit" className="kp-btn-primary" style={{ width: 'auto' }}>
                  <Check size={18} style={{ display: 'inline', marginRight: '4px' }} />
                  Simpan Biaya
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Konfirmasi Hapus */}
      {deleteCandidate && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '360px' }}>
            <div className="modal-header" style={{ background: '#FEF2F2' }}>
              <h3 className="modal-title" style={{ color: '#991B1B', fontSize: '1.1rem' }}>
                Hapus Catatan Biaya?
              </h3>
            </div>
            <div className="modal-body">
              <p>Hapus catatan <b>"{deleteCandidate.title}"</b>?</p>
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
                onClick={() => handleDelete(deleteCandidate.id)}
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
