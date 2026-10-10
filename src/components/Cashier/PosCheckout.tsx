import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
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
  const { storeProfile, cart, addToCart, updateCartQty, cartTotal } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All item');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Long press modal state & Pointer Events tracker (anti double-tap bug)
  const [longPressProduct, setLongPressProduct] = useState<Product | null>(null);
  const pointerDownTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const loadProducts = async () => {
    const list = await db.products.toArray();
    setProducts(list);
  };

  useEffect(() => {
    loadProducts();
  }, [completedTransaction]);

  const rawCategories = Array.from(new Set(products.map((p) => p.category)));
  const categories = ['All item', ...rawCategories];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));
    const matchesCategory = selectedCategory === 'All item' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pointer event handlers: unified for touch and mouse, preventing Android double-trigger!
  const handlePointerDown = (e: React.PointerEvent, product: Product) => {
    // Only primary touch/click
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    isLongPressRef.current = false;
    pointerDownTimeRef.current = Date.now();

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setLongPressProduct(product);
    }, 450); // 450ms triggers floating quantity modal
  };

  const handlePointerUp = (product: Product) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }

    const duration = Date.now() - pointerDownTimeRef.current;
    // Tap biasa (< 450ms) -> masukkan tepat 1 barang ke keranjang
    if (duration < 450 && product.stock > 0) {
      addToCart(product, 1);
    }
  };

  const handlePointerCancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    isLongPressRef.current = false;
  };

  const handleFloatingQtyConfirm = (newQty: number) => {
    if (!longPressProduct || !longPressProduct.id) return;
    updateCartQty(longPressProduct.id, newQty);
  };

  return (
    <div>
      {/* Kasir Pintar Header Ramping (Tanpa sidebar, rating, atau titik 3) */}
      <div className="kp-header">
        <span className="kp-header-title">NEW TRANSACTION</span>
        <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
          {storeProfile.name}
        </span>
      </div>

      {/* Subbar: Search, Add, Category Filter (Tanpa scan QR code) */}
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
        </div>

        {/* Dropdown Kategori 'All item' */}
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

      {/* Input Pencarian Cepat */}
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

      {/* Hint Teks Ramping */}
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
              onPointerDown={(e) => handlePointerDown(e, product)}
              onPointerUp={() => handlePointerUp(product)}
              onPointerCancel={handlePointerCancel}
            >
              <div className="kp-product-left">
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

              {/* Indikator Keranjang */}
              {cartItem && (
                <div className="kp-cart-counter-pill">{cartItem.qty}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Shopping Bag Button di Pojok Kanan Bawah */}
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

      {/* Slim Cart Drawer */}
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

      {/* Success Transaction & Print Receipt Modal */}
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
