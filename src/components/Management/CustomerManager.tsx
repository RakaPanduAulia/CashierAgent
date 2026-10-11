import React, { useState, useEffect } from 'react';
import {
  Contact,
  Plus,
  Phone,
  Edit2,
  Trash2,
  ArrowLeft,
  Check,
  X,
  Search,
  MessageCircle,
  AlertTriangle
} from 'lucide-react';
import { db } from '../../db/database';
import type { Customer } from '../../types';
import { formatWhatsAppPhoneNumber } from '../../utils/whatsapp';

interface CustomerManagerProps {
  onBack: () => void;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({ onBack }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState<Customer | null>(null);

  const loadCustomers = async () => {
    const list = await db.customers.toArray();
    setCustomers(list);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setAddress('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setAddress(c.address || '');
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const now = new Date().toISOString();

    if (editingCustomer && editingCustomer.id) {
      await db.customers.update(editingCustomer.id, {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
        notes: notes.trim() || undefined
      });
    } else {
      await db.customers.add({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
        createdAt: now
      });
    }

    setIsModalOpen(false);
    loadCustomers();
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await db.customers.delete(id);
    setDeleteCandidate(null);
    loadCustomers();
  };

  const handleChatWhatsApp = (customerPhone: string) => {
    const clean = formatWhatsAppPhoneNumber(customerPhone);
    window.open(`https://wa.me/${clean}`, '_blank');
  };

  return (
    <div>
      {/* Kasir Pintar Header */}
      <div className="kp-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button type="button" className="kp-icon-btn" onClick={onBack}>
            <ArrowLeft size={24} />
          </button>
          <span className="kp-header-title">CUSTOMER</span>
        </div>
        <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
          {customers.length} Pelanggan
        </span>
      </div>

      <div style={{ padding: '12px 16px' }}>
        {/* Subbar Pencarian & Tambah Pelanggan */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <div className="kp-search-input-wrapper" style={{ flex: 1, margin: 0 }}>
            <Search size={20} color="var(--primary)" />
            <input
              type="text"
              className="kp-search-input"
              placeholder="Cari nama / no HP pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="kp-btn-primary"
            style={{ width: 'auto', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={handleOpenAdd}
          >
            <Plus size={20} />
            <span>Tambah</span>
          </button>
        </div>

        {/* Daftar Pelanggan */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
            <Contact size={48} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <h3>Belum ada data pelanggan</h3>
            <p style={{ marginTop: '4px' }}>Catat pelanggan toko untuk memudahkan pengiriman struk WA.</p>
          </div>
        ) : (
          <div className="kp-product-list">
            {filtered.map((item) => (
              <div key={item.id} className="kp-product-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Contact size={22} />
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1E293B' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} />
                      <span>{item.phone}</span>
                    </div>
                    {item.notes && (
                      <div style={{ fontSize: '0.75rem', color: '#8E9BAE', marginTop: '2px' }}>
                        {item.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleChatWhatsApp(item.phone)}
                    className="kp-icon-btn"
                    title="Chat WhatsApp"
                    style={{ color: '#15803D' }}
                  >
                    <MessageCircle size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="kp-icon-btn"
                    title="Ubah Data"
                  >
                    <Edit2 size={18} color="#475569" />
                  </button>

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

      {/* Modal Tambah/Edit Pelanggan */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ fontSize: '1.1rem' }}>
                {editingCustomer ? 'Ubah Pelanggan' : 'Tambah Pelanggan Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="kp-icon-btn"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="input-label">Nama Pelanggan:</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Contoh: Ibu Ani (Katering)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Nomor WhatsApp / HP:</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="Contoh: 0812-3456-7890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Alamat (Opsional):</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Contoh: Jl. Mawar No. 4"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Catatan Tambahan (Opsional):</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Contoh: Langganan cup puding"
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
                  Simpan Pelanggan
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} color="#DC2626" />
                <h3 className="modal-title" style={{ color: '#991B1B', fontSize: '1rem' }}>
                  Hapus Pelanggan?
                </h3>
              </div>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem' }}>
                Hapus pelanggan <b>"{deleteCandidate.name}"</b>?
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
