import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Trash2, X, Check } from 'lucide-react';
import { db } from '../../db/database';
import type { Expense } from '../../types';
import { formatRupiah, formatDateShort } from '../../utils/formatters';

const EXPENSE_CATEGORIES = [
  'Operasional Kasir (Plastik Kresek/Isi Staples)',
  'Listrik & Air Toko',
  'Sewa Toko & Kebersihan',
  'Gaji Karyawan',
  'Bensin / Transport Kulakan',
  'Perbaikan / Maintenance',
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
      {/* Ringkasan Biaya Pengeluaran */}
      <div className="stat-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card amber">
          <div className="stat-label">Pengeluaran Bulan Ini</div>
          <div className="stat-value" style={{ color: '#b45309' }}>
            {formatRupiah(totalThisMonth)}
          </div>
          <div className="stat-subtext">Biaya operasional toko berjalan</div>
        </div>

        <div className="stat-card blue">
          <div className="stat-label">Total Catatan Biaya</div>
          <div className="stat-value">{expenses.length} Transaksi</div>
          <div className="stat-subtext">Histori pengeluaran tersimpan</div>
        </div>
      </div>

      {/* Tombol Tambah Pengeluaran */}
      <div style={{ marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', maxWidth: '340px' }}
        >
          <Plus size={24} />
          <span>Catat Biaya Pengeluaran</span>
        </button>
      </div>

      {/* Daftar Pengeluaran */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
          Riwayat Pengeluaran Operasional
        </h3>

        {expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
            <Wallet size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>Belum ada pengeluaran yang dicatat.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {expenses.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  background: '#ffffff'
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#64748b',
                      background: '#f1f5f9',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    {item.category}
                  </span>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', marginTop: '4px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {formatDateShort(item.date)} {item.notes ? `• ${item.notes}` : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#b91c1c' }}>
                    -{formatRupiah(item.amount)}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteCandidate(item)}
                    className="btn btn-outline btn-icon-only"
                    style={{ width: '40px', height: '40px', borderColor: '#fecaca', color: '#dc2626' }}
                  >
                    <Trash2 size={18} />
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
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Catat Pengeluaran Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-outline btn-icon-only">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleAddExpense}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="input-label">Keperluan Pengeluaran:</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Contoh: Beli Kantong Kresek Kasir 5 Pack"
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
                  <label className="input-label">Jumlah Biaya (Rp):</label>
                  <input
                    type="number"
                    className="input-field"
                    style={{ fontSize: '1.3rem', fontWeight: 800 }}
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
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary btn-lg" style={{ minWidth: '150px' }}>
                  <Check size={22} />
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
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header" style={{ background: '#fef2f2' }}>
              <h3 className="modal-title" style={{ color: '#991b1b' }}>
                Hapus Catatan Pengeluaran?
              </h3>
            </div>
            <div className="modal-body">
              <p>Apakah Anda yakin ingin menghapus catatan <b>"{deleteCandidate.title}"</b>?</p>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setDeleteCandidate(null)} className="btn btn-outline">
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
