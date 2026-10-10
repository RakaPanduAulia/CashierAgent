import React from 'react';
import { Store, Bell } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface HeaderProps {
  lowStockCount?: number;
  onOpenLowStock?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ lowStockCount = 0, onOpenLowStock }) => {
  const { storeProfile, fontSizeMode, setFontSizeMode } = useStore();

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo-icon">
          <Store size={26} color="#ffffff" />
        </div>
        <div className="header-title-box">
          <h1>{storeProfile.name}</h1>
          <p>{storeProfile.tagline || 'Kasir & Pengelolaan Stok'}</p>
        </div>
      </div>

      <div className="header-actions">
        {lowStockCount > 0 && (
          <button
            onClick={onOpenLowStock}
            className="btn btn-warning btn-sm"
            style={{ padding: '6px 12px', minHeight: '40px', gap: '6px' }}
            title={`${lowStockCount} barang stok menipis`}
          >
            <Bell size={18} />
            <span style={{ fontWeight: 800 }}>{lowStockCount} Tipis</span>
          </button>
        )}

        {/* Senior-Friendly Quick Font Size Controller */}
        <div className="font-size-toggle" title="Ubah Ukuran Tulisan">
          <button
            type="button"
            className={`font-size-btn ${fontSizeMode === 'normal' ? 'active' : ''}`}
            onClick={() => setFontSizeMode('normal')}
            title="Ukuran Tulisan Standar"
          >
            A
          </button>
          <button
            type="button"
            className={`font-size-btn ${fontSizeMode === 'large' ? 'active' : ''}`}
            onClick={() => setFontSizeMode('large')}
            title="Ukuran Tulisan Besar"
          >
            A+
          </button>
          <button
            type="button"
            className={`font-size-btn ${fontSizeMode === 'extralarge' ? 'active' : ''}`}
            onClick={() => setFontSizeMode('extralarge')}
            title="Ukuran Tulisan Sangat Besar"
          >
            A++
          </button>
        </div>
      </div>
    </header>
  );
};
