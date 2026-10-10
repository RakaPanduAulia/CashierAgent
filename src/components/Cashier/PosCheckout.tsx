import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  QrCode,
  Star,
  MoreVertical,
  Menu,
  ShoppingBag,
  X
} from 'lucide-react';
import { db } from '../../db/database';
import type { Product, Transaction } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatRupiah } from '../../utils/formatters';
import { QuantityFloatingModal } from './QuantityFloatingModal';
import { CartDrawer } from './CartDrawer';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { ProductFormModal } from '../Inventory/ProductFormModal';

export const PosCheckout: React.FC = () => {
  const { cart, addToCart, updateCartQty, cartTotal } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All item');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Long press modal state
  const [longPressProduct, setLongPressProduct] = useState<Product | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const loadProducts = async () => {
    const list = await db.products.toArray();
    setProducts(list);
  };

  useEffect(() => {
    loadProducts();
  }, [completedTransaction]);

  // Kategori
  const rawCategories = Array.from(new Set(products.map((p) => p.category)));
  const categories = ['All item', ...rawCategories];

  // Filter produk
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));
    const matchesCategory = selectedCategory === 'All item' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Long press event handlers
  const handleTouchStart = (product: Product) => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setLongPressProduct(product);
    }, 450); // 450ms trigger long press
  };

  const handleTouchEnd = (product: Product) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // Jika bukan long press, jalankan klik normal (tambah 1 ke keranjang)
    if (!isLongPressRef.current) {
      if (product.stock > 0) {
        addToCart(product, 1);
      }
    }
  };

  const handleTouchMove = () => {
    // Jika jari bergeser (scroll layar), batalkan long press
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleFloatingQtyConfirm = (newQty: number) => {
    if (!longPressProduct || !longPressProduct.id) return;
    updateCartQty(longPressProduct.id, newQty);
  };

  return (
    <div>
      {/* Kasir Pintar Header */}
      <div className="kp-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" className="kp-icon-btn">
            <Menu size={22} />
          </button>
          <span className="kp-header-title">NEW TRANSACTION</span>
        </div>

        <div className="kp-header-actions">
          <button type="button" className="kp-circle-badge-btn" title="Favorit">
            <Star size={18} fill="#FFFFFF" />
          </button>
          <button type="button" className="kp-icon-btn">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Subbar: Search, Add, Barcode, Category Filter */}
      <div className="kp-subbar">
        <div className="kp-subbar-icons">
          <button
            type="button"
            className="kp-icon-btn"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            title="Cari Produk"
          >
            <Search size={22} />
          </button>
          <button
            type="button"
            className="kp-icon-btn"
            onClick={() => setIsAddProductOpen(true)}
            title="Tambah Produk Baru"
          >
            <Plus size={24} />
          </button>
          <button type="button" className="kp-icon-btn" title="Barcode Scan">
            <QrCode size={22} />
          </button>
        </div>

        {/* Dropdown Kategori 'All item' */}
        <div style={{ position: 'relative' }}>
          <select
            className="kp-dropdown-pill"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Pencarian Cepat (Bisa Ditampilkan Saat Icon Search Diklik) */}
      {isSearchOpen && (
        <div className="kp-search-input-wrapper">
          <Search size={20} color="var(--primary)" />
          <input
            type="text"
            className="kp-search-input"
            placeholder="Cari nama barang atau barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {/* Keterangan Tip Ramah Lansia */}
      <div
        style={{
          padding: '6px 4px',
          fontSize: '0.78rem',
          color: '#64748B',
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9'
        }}
      >
        <span>💡 Ketuk untuk +1 • <b>Tekan lama</b> untuk ubah jumlah</span>
        <span>{filteredProducts.length} barang</span>
      </div>

      {/* Daftar Produk Ramping Gaya Kasir Pintar */}
      <div className="kp-product-list">
        {filteredProducts.map((product) => {
          const cartItem = cart.find((c) => c.product.id === product.id);
          const isOutOfStock = product.stock <= 0;

          // Ambil 2 huruf inisial produk
          const initials = product.name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0].toUpperCase())
            .join('');

          return (
            <div
              key={product.id}
              className="kp-product-item"
              onMouseDown={() => handleTouchStart(product)}
              onMouseUp={() => handleTouchEnd(product)}
              onMouseLeave={handleTouchMove}
              onTouchStart={() => handleTouchStart(product)}
              onTouchEnd={() => handleTouchEnd(product)}
              onTouchMove={handleTouchMove}
            >
              <div className="kp-product-left">
                {/* Kotak Inisial Produk (persis avatar 'KA' di screenshot Kasir Pintar) */}
                <div className="kp-avatar-box">{initials || 'PR'}</div>

                <div className="kp-product-details">
                  <div className="kp-product-name">{product.name}</div>
                  <div className="kp-product-price">
                    {formatRupiah(product.sellPrice)}
                  </div>
                  <div className="kp-product-stock-badge">
                    {isOutOfStock ? 'Habis' : `Stok: ${product.stock} ${product.unit}`}
                  </div>
                </div>
              </div>

              {/* Indikator Keranjang jika item sudah dipilih */}
              {cartItem && (
                <div className="kp-cart-counter-pill">{cartItem.qty}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Shopping Bag Button di Pojok Kanan Bawah (Screenshot 5 Style) */}
      {cart.length > 0 && (
        <button
          type="button"
          className="kp-floating-bag-btn"
          onClick={() => setIsCartOpen(true)}
          title="Buka Keranjang"
        >
          <ShoppingBag size={28} />
          <span className="kp-floating-bag-badge">{cartTotal.itemsCount}</span>
        </button>
      )}

      {/* Long Press Floating Quantity Modal */}
      {longPressProduct && (
        <QuantityFloatingModal
          product={longPressProduct}
          initialQty={cart.find((c) => c.product.id === longPressProduct.id)?.qty || 1}
          onClose={() => setLongPressProduct(null)}
          onConfirm={handleFloatingQtyConfirm}
        />
      )}

      {/* Slim Cart Drawer (Screenshot 4 Style) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToPayment={() => {
          setIsCartOpen(false);
          setIsPaymentOpen(true);
        }}
      />

      {/* Payment Checkout Modal */}
      {isPaymentOpen && (
        <PaymentModal
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={(trx) => {
            setIsPaymentOpen(false);
            setCompletedTransaction(trx);
            loadProducts();
          }}
        />
      )}

      {/* Success Transaction & Print Receipt Modal (Screenshot 1 & 3 Style) */}
      {completedTransaction && (
        <ReceiptModal
          transaction={completedTransaction}
          onClose={() => setCompletedTransaction(null)}
        />
      )}

      {/* Quick Add Product Modal */}
      {isAddProductOpen && (
        <ProductFormModal
          onClose={() => setIsAddProductOpen(false)}
          onSaved={() => {
            setIsAddProductOpen(false);
            loadProducts();
          }}
        />
      )}
    </div>
  );
};
