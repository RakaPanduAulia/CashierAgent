import React, { useState } from 'react';
import {
  Store,
  Type,
  Download,
  Upload,
  RefreshCcw,
  Check,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { db, initializeDatabase, DEFAULT_STORE_PROFILE } from '../../db/database';

export const StoreSettings: React.FC = () => {
  const { storeProfile, updateStoreProfile, fontSizeMode, setFontSizeMode } = useStore();

  const [name, setName] = useState(storeProfile.name);
  const [tagline, setTagline] = useState(storeProfile.tagline);
  const [address, setAddress] = useState(storeProfile.address);
  const [phone, setPhone] = useState(storeProfile.phone);
  const [footerMessage, setFooterMessage] = useState(storeProfile.footerMessage);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreProfile({
      name: name.trim(),
      tagline: tagline.trim(),
      address: address.trim(),
      phone: phone.trim(),
      footerMessage: footerMessage.trim()
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportBackup = async () => {
    try {
      const [products, stockMovements, transactions, expenses] = await Promise.all([
        db.products.toArray(),
        db.stockMovements.toArray(),
        db.transactions.toArray(),
        db.expenses.toArray()
      ]);

      const backupData = {
        version: 1,
        storeProfile,
        exportedAt: new Date().toISOString(),
        products,
        stockMovements,
        transactions,
        expenses
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `Backup_Kasir_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setStatusMsg('File cadangan (backup) berhasil diunduh ke HP/perangkat Anda!');
    } catch (err) {
      console.error(err);
      setStatusMsg('Gagal membuat file cadangan.');
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.products && Array.isArray(json.products)) {
          await db.transaction('rw', db.products, db.stockMovements, db.transactions, db.expenses, async () => {
            await db.products.clear();
            await db.stockMovements.clear();
            await db.transactions.clear();
            await db.expenses.clear();

            await db.products.bulkAdd(json.products);
            if (json.stockMovements) await db.stockMovements.bulkAdd(json.stockMovements);
            if (json.transactions) await db.transactions.bulkAdd(json.transactions);
            if (json.expenses) await db.expenses.bulkAdd(json.expenses);
          });

          if (json.storeProfile) {
            updateStoreProfile(json.storeProfile);
          }

          setStatusMsg('Data toko berhasil dipulihkan dari file cadangan!');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setStatusMsg('Format file cadangan tidak valid.');
        }
      } catch (err) {
        console.error(err);
        setStatusMsg('Terjadi kesalahan saat membaca file cadangan.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemoData = async () => {
    if (window.confirm('Reset data akan mengganti data dengan contoh produk Toko Bahan Kue & Plastik. Lanjutkan?')) {
      await db.products.clear();
      await db.stockMovements.clear();
      await db.transactions.clear();
      await db.expenses.clear();
      await initializeDatabase();
      updateStoreProfile(DEFAULT_STORE_PROFILE);
      setStatusMsg('Data berhasil direset ke contoh data Toko Bahan Kue & Plastik.');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div>
      {/* Kasir Pintar Header */}
      <div className="kp-header">
        <span className="kp-header-title">PENGATURAN TOKO</span>
        <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
          Profil & Data
        </span>
      </div>

      <div style={{ padding: '12px 16px' }}>
        {statusMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Check size={18} />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Pengaturan Ukuran Huruf */}
        <div className="card" style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Type size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Ukuran Huruf Layar</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '12px' }}>
            Sesuaikan ukuran huruf agar mudah dan nyaman dibaca:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              className={`kp-btn-outline ${fontSizeMode === 'normal' ? 'active' : ''}`}
              style={{
                justifyContent: 'center',
                padding: '8px',
                fontSize: '0.85rem',
                backgroundColor: fontSizeMode === 'normal' ? 'var(--primary)' : '#FFFFFF',
                color: fontSizeMode === 'normal' ? '#FFFFFF' : 'var(--text-primary)'
              }}
              onClick={() => setFontSizeMode('normal')}
            >
              Normal
            </button>
            <button
              type="button"
              className={`kp-btn-outline ${fontSizeMode === 'large' ? 'active' : ''}`}
              style={{
                justifyContent: 'center',
                padding: '8px',
                fontSize: '0.85rem',
                backgroundColor: fontSizeMode === 'large' ? 'var(--primary)' : '#FFFFFF',
                color: fontSizeMode === 'large' ? '#FFFFFF' : 'var(--text-primary)'
              }}
              onClick={() => setFontSizeMode('large')}
            >
              Besar (A+)
            </button>
            <button
              type="button"
              className={`kp-btn-outline ${fontSizeMode === 'extralarge' ? 'active' : ''}`}
              style={{
                justifyContent: 'center',
                padding: '8px',
                fontSize: '0.85rem',
                backgroundColor: fontSizeMode === 'extralarge' ? 'var(--primary)' : '#FFFFFF',
                color: fontSizeMode === 'extralarge' ? '#FFFFFF' : 'var(--text-primary)'
              }}
              onClick={() => setFontSizeMode('extralarge')}
            >
              Sangat Besar
            </button>
          </div>
        </div>

        {/* Profil Toko */}
        <div className="card" style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Store size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Identitas Toko & Struk</h3>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="input-group">
              <label className="input-label">Nama Toko:</label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Slogan / Keterangan Toko:</label>
              <input
                type="text"
                className="input-field"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Alamat Toko:</label>
              <input
                type="text"
                className="input-field"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Nomor WhatsApp Toko:</label>
              <input
                type="text"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Pesan Kaki Struk (Footer Nota):</label>
              <textarea
                className="textarea-field"
                rows={2}
                value={footerMessage}
                onChange={(e) => setFooterMessage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="kp-btn-primary"
              style={{ width: '100%', marginTop: '4px' }}
            >
              <Check size={18} style={{ display: 'inline', marginRight: '4px' }} />
              {saveSuccess ? 'Berhasil Disimpan!' : 'Simpan Profil Toko'}
            </button>
          </form>
        </div>

        {/* Cadangan Data Offline */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldCheck size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Cadangan Data Offline</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '14px' }}>
            Data tersimpan 100% lokal di HP/perangkat. Cadangkan file secara berkala agar aman:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={handleExportBackup}
              className="kp-btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Download size={18} />
              <span>Download File Cadangan (Backup)</span>
            </button>

            <label
              className="kp-btn-outline"
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Upload size={18} />
              <span>Pulihkan Data dari File Cadangan</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                style={{ display: 'none' }}
              />
            </label>

            <button
              type="button"
              onClick={handleResetDemoData}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#B45309',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginTop: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <RefreshCcw size={14} />
              <span>Reset ke Contoh Toko Bahan Kue & Plastik</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
