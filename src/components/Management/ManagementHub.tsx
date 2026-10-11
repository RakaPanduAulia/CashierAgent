import React, { useState } from 'react';
import { Menu, Package, LayoutGrid, Contact } from 'lucide-react';
import type { ManagementView } from '../../types';
import { ProductList } from '../Inventory/ProductList';
import { CategoryManager } from './CategoryManager';
import { CustomerManager } from './CustomerManager';

interface ManagementHubProps {
  onOpenSidebar: () => void;
}

export const ManagementHub: React.FC<ManagementHubProps> = ({ onOpenSidebar }) => {
  const [currentView, setCurrentView] = useState<ManagementView>('menu');

  // Sub-views
  if (currentView === 'products') {
    return <ProductList onBack={() => setCurrentView('menu')} />;
  }

  if (currentView === 'categories') {
    return <CategoryManager onBack={() => setCurrentView('menu')} />;
  }

  if (currentView === 'customers') {
    return <CustomerManager onBack={() => setCurrentView('menu')} />;
  }

  // Tampilan Utama Management (Persis Screenshot 2)
  return (
    <div>
      {/* Kasir Pintar Header dengan Icon Menu Hamburger ☰ (Persis Screenshot 2) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '14px 16px',
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0'
        }}
      >
        <button
          type="button"
          onClick={onOpenSidebar}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            marginRight: '16px',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Buka Menu"
        >
          <Menu size={26} strokeWidth={2.4} color="#0A6E51" />
        </button>
        <h1
          style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--primary)',
            letterSpacing: '0.01em'
          }}
        >
          Management
        </h1>
      </div>

      <div style={{ padding: '0' }}>
        {/* 3 Menu Utama Sesuai Permintaan User (Persis Screenshot 2) */}
        <div>
          {/* 1. Product or Service */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '20px 20px',
              borderBottom: '1px solid #F1F5F9',
              cursor: 'pointer',
              gap: '18px',
              backgroundColor: '#FFFFFF',
              transition: 'background-color 0.15s ease'
            }}
            onClick={() => setCurrentView('products')}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0
              }}
            >
              <Package size={26} strokeWidth={1.9} color="#0A6E51" />
            </div>

            <span
              style={{
                fontWeight: 700,
                fontSize: '1.08rem',
                color: '#1E293B',
                letterSpacing: '-0.01em'
              }}
            >
              Product or Service
            </span>
          </div>

          {/* 2. Product Category */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '20px 20px',
              borderBottom: '1px solid #F1F5F9',
              cursor: 'pointer',
              gap: '18px',
              backgroundColor: '#FFFFFF',
              transition: 'background-color 0.15s ease'
            }}
            onClick={() => setCurrentView('categories')}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0
              }}
            >
              <LayoutGrid size={26} strokeWidth={1.9} color="#0A6E51" />
            </div>

            <span
              style={{
                fontWeight: 700,
                fontSize: '1.08rem',
                color: '#1E293B',
                letterSpacing: '-0.01em'
              }}
            >
              Product Category
            </span>
          </div>

          {/* 3. Customer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '20px 20px',
              borderBottom: '1px solid #F1F5F9',
              cursor: 'pointer',
              gap: '18px',
              backgroundColor: '#FFFFFF',
              transition: 'background-color 0.15s ease'
            }}
            onClick={() => setCurrentView('customers')}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0
              }}
            >
              <Contact size={26} strokeWidth={1.9} color="#0A6E51" />
            </div>

            <span
              style={{
                fontWeight: 700,
                fontSize: '1.08rem',
                color: '#1E293B',
                letterSpacing: '-0.01em'
              }}
            >
              Customer
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
