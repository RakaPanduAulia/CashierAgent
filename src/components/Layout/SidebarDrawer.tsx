import React from 'react';
import { User, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import type { NavigationTab } from '../../types';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  const { storeProfile, activeTab } = useStore();

  if (!isOpen) return null;

  const handleSelectTab = (tab: NavigationTab) => {
    onNavigate(tab);
    onClose();
  };

  return (
    <div className="kp-sidebar-overlay" onClick={onClose}>
      <div className="kp-sidebar-drawer" onClick={(e) => e.stopPropagation()}>
        {/* User Profile Header (Persis Screenshot 1) */}
        <div className="kp-sidebar-profile">
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <User size={34} color="#0A6E51" />
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingLeft: '4px' }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: '1.15rem',
                color: '#1E293B',
                lineHeight: 1.2
              }}
            >
              {storeProfile.ownerName || 'Raka Pandu Aulia'}
            </div>
            <div
              style={{
                fontSize: '0.9rem',
                color: '#64748B',
                fontWeight: 500,
                marginTop: '3px'
              }}
            >
              Owner
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '6px'
            }}
            title="Tutup Menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Banner Upgrade to Kasir Pintar PRO (Persis Screenshot 1) */}
        <div
          style={{
            backgroundColor: '#EDF5F2',
            padding: '16px 20px',
            margin: '0',
            borderBottom: '1px solid #E2E8F0'
          }}
        >
          <div
            style={{
              fontWeight: 800,
              color: 'var(--primary)',
              fontSize: '1rem',
              lineHeight: 1.3
            }}
          >
            Upgrade to Kasir Pintar<br />PRO
          </div>
        </div>

        {/* 2 MENU UTAMA SESUAI PERMINTAAN USER (Persis Screenshot 1) */}
        <div
          style={{
            flex: 1,
            padding: '12px 0',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* 1. Management */}
          <button
            type="button"
            onClick={() => handleSelectTab('management')}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: activeTab === 'management' ? '#F0FDF4' : 'transparent',
              color: activeTab === 'management' ? 'var(--primary)' : '#1E293B',
              fontWeight: 700,
              fontSize: '1.1rem',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'block',
              width: '100%',
              transition: 'background-color 0.15s ease'
            }}
          >
            Management
          </button>

          {/* 2. Sales Transaction */}
          <button
            type="button"
            onClick={() => handleSelectTab('pos')}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: activeTab === 'pos' ? '#F0FDF4' : 'transparent',
              color: activeTab === 'pos' ? 'var(--primary)' : '#1E293B',
              fontWeight: 700,
              fontSize: '1.1rem',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'block',
              width: '100%',
              transition: 'background-color 0.15s ease'
            }}
          >
            Sales Transaction
          </button>
        </div>

        {/* Footer Ramping Mode Offline */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #F1F5F9',
            fontSize: '0.8rem',
            color: '#94A3B8',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span>Kasir Pintar Offline</span>
          <span>v1.0 Local DB</span>
        </div>
      </div>
    </div>
  );
};

