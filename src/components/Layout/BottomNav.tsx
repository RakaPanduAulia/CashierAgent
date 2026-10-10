import React from 'react';
import { ShoppingCart, Package, TrendingUp, Wallet, Settings } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import type { NavigationTab } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, cart } = useStore();

  const tabs: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'pos',
      label: 'Transaksi',
      icon: <ShoppingCart size={22} />,
      badge: cart.length > 0 ? cart.reduce((a, b) => a + b.qty, 0) : undefined
    },
    {
      id: 'inventory',
      label: 'Barang',
      icon: <Package size={22} />
    },
    {
      id: 'reports',
      label: 'Laporan',
      icon: <TrendingUp size={22} />
    },
    {
      id: 'expenses',
      label: 'Biaya',
      icon: <Wallet size={22} />
    },
    {
      id: 'settings',
      label: 'Setting',
      icon: <Settings size={22} />
    }
  ];

  return (
    <nav className="kp-bottom-nav" aria-label="Navigasi Utama">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`kp-nav-btn ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={isActive}
          >
            <div style={{ position: 'relative' }}>
              {tab.icon}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: -10,
                    background: '#EF4444',
                    color: 'white',
                    borderRadius: '999px',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '0 5px',
                    minWidth: '16px',
                    textAlign: 'center'
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="kp-nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
