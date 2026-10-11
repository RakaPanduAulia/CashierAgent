import React, { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { initializeDatabase, db } from './db/database';
import { BottomNav } from './components/Layout/BottomNav';
import { SidebarDrawer } from './components/Layout/SidebarDrawer';
import { PosCheckout } from './components/Cashier/PosCheckout';
import { ManagementHub } from './components/Management/ManagementHub';
import { FinancialDashboard } from './components/Reports/FinancialDashboard';
import { StoreSettings } from './components/Settings/StoreSettings';
import { AlertCircle, X } from 'lucide-react';
import type { Product } from './types';

const MainApp: React.FC = () => {
  const { activeTab, setActiveTab } = useStore();
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
      checkLowStock();
      setReady(true);
    };
    init();
  }, []);

  const checkLowStock = async () => {
    const list = await db.products.toArray();
    const low = list.filter((p) => p.stock <= p.minStock);
    setLowStockProducts(low);
  };

  useEffect(() => {
    if (ready) {
      checkLowStock();
    }
  }, [activeTab, ready]);

  if (!ready) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#f1f5f9',
          color: 'var(--primary)',
          gap: '16px'
        }}
      >
        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
          Memuat Kasir Toko Bahan Kue & Plastik...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Drawer yang bisa dibuka dari Hamburger Menu ☰ */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      <main className="main-content" style={{ padding: 0 }}>
        {activeTab === 'pos' && (
          <PosCheckout onOpenSidebar={() => setIsSidebarOpen(true)} />
        )}
        {activeTab === 'management' && (
          <ManagementHub onOpenSidebar={() => setIsSidebarOpen(true)} />
        )}
        {activeTab === 'reports' && <FinancialDashboard />}
        {activeTab === 'settings' && <StoreSettings />}
      </main>

      <BottomNav />

      {/* Modal Peringatan Stok Menipis */}
      {showLowStockModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header" style={{ background: '#fffbeb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={26} color="#b45309" />
                <h3 className="modal-title" style={{ color: '#92400e' }}>
                  Peringatan Stok Menipis ({lowStockProducts.length})
                </h3>
              </div>
              <button
                onClick={() => setShowLowStockModal(false)}
                className="btn btn-outline btn-icon-only"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '14px' }}>
                Barang berikut sudah mendekati atau mencapai batas minimum stok toko Anda. Segera lakukan
                kulakan / pembelian restock.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '10px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Batas minimum: {p.minStock} {p.unit}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontWeight: 900,
                          color: p.stock === 0 ? '#991b1b' : '#b45309',
                          fontSize: '1rem'
                        }}
                      >
                        {p.stock === 0 ? 'HABIS' : `Sisa ${p.stock} ${p.unit}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => {
                  setShowLowStockModal(false);
                  setActiveTab('management');
                }}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Buka Manajemen Produk & Stok
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
