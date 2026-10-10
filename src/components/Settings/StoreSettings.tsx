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

  // Backup seluruh data database lokal ke file JSON
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

      setStatusMsg('File cadangan (backup) berhasil diunduh ke perangkat Anda!');
    } catch (err) {
      console.error(err);
      setStatusMsg('Gagal membuat file cadangan.');
    }
  };

  // Pulihkan data dari file JSON
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.products && Array.isArray(json.products)) {
          // Bersihkan dan masukkan ulang
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

  // Reset database ke data contoh demo awal
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
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
          Pengaturan Toko & Tampilan
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Ubah identitas toko untuk struk belanja, ukuran tulisan, dan cadangan data
        </p>
      </div>

      {statusMsg && (
        <div className="alert alert-success" style={{ marginBottom: '18px' }}>
          <Check size={20} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Pengaturan Ukuran Teks (Senior-Friendly Accessibility) */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Type size={24} color="#1e40af" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Ukuran Huruf Layar (Mode Lansia)</h3>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '16px' }}>
          Pilih ukuran huruf yang paling nyaman untuk mata Anda saat membaca layar kasir:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          <button
            type="button"
            className={`btn ${fontSizeMode === 'normal' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFontSizeMode('normal')}
          >
            Huruf Normal
          </button>
          <button
            type="button"
            className={`btn ${fontSizeMode === 'large' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFontSizeMode('large')}
          >
            Huruf Besar (A+)
          </button>
          <button
            type="button"
            className={`btn ${fontSizeMode === 'extralarge' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFontSizeMode('extralarge')}
          >
            Sangat Besar (A++)
          </button>
        </div>
      </div>

      {/* Profil Toko & Struk Belanja */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Store size={24} color="#1e40af" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Informasi Toko (Tampil di Struk)</h3>
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
              placeholder="Contoh: Lengkap, Murah & Berkualitas"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Alamat Toko:</label>
            <input
              type="text"
              className="input-field"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Pasar Baru No. 88"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Nomor WhatsApp / Telepon Toko:</label>
            <input
              type="text"
              className="input-field"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0812-3456-7890"
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
              placeholder="Pesan terima kasih di bagian bawah struk"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', maxWidth: '300px' }}
          >
            <Check size={22} />
            {saveSuccess ? 'Berhasil Disimpan!' : 'Simpan Profil Toko'}
          </button>
        </form>
      </div>

      {/* Keamanan & Cadangan Data Lokal (100% Offline) */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <ShieldCheck size={24} color="#15803d" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            Pencadangan Data Lokal (Offline Database)
          </h3>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '16px' }}>
          Semua catatan toko tersimpan secara lokal dan aman di dalam perangkat Anda. Anda dapat
          mengunduh file cadangan secara berkala agar catatan toko tidak hilang saat ganti perangkat.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
          <button type="button" onClick={handleExportBackup} className="btn btn-success btn-lg">
            <Download size={22} />
            <span>Cadangkan Data (Download Backup)</span>
          </button>

          <label className="btn btn-outline btn-lg" style={{ cursor: 'pointer' }}>
            <Upload size={22} />
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
            className="btn btn-outline btn-sm"
            style={{ color: '#b45309', borderColor: '#fde68a', marginTop: '10px' }}
          >
            <RefreshCcw size={18} />
            <span>Reset ke Contoh Toko Bahan Kue & Plastik</span>
          </button>
        </div>
      </div>
    </div>
  );
};
