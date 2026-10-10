import React, { createContext, useContext, useState, useEffect } from 'react';
import type { StoreProfile, NavigationTab, CartItem, Product } from '../types';
import { getStoredProfile, saveStoredProfile } from '../db/database';

interface StoreContextType {
  storeProfile: StoreProfile;
  updateStoreProfile: (profile: Partial<StoreProfile>) => void;
  fontSizeMode: 'normal' | 'large' | 'extralarge';
  setFontSizeMode: (mode: 'normal' | 'large' | 'extralarge') => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQty: (productId: number, qty: number) => void;
  clearCart: () => void;
  cartTotal: {
    itemsCount: number;
    subtotal: number;
    grandTotal: number;
    totalCost: number;
  };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storeProfile, setProfile] = useState<StoreProfile>(() => getStoredProfile());
  const [activeTab, setActiveTab] = useState<NavigationTab>('pos');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Simpan profile jika ada perubahan
  const updateStoreProfile = (newVals: Partial<StoreProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...newVals };
      saveStoredProfile(updated);
      return updated;
    });
  };

  const setFontSizeMode = (mode: 'normal' | 'large' | 'extralarge') => {
    updateStoreProfile({ fontSizeMode: mode });
  };

  // Terapkan class font-size ke root document agar seluruh teks di app berubah proporsional
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-normal', 'font-large', 'font-extralarge');
    root.classList.add(`font-${storeProfile.fontSizeMode || 'large'}`);
  }, [storeProfile.fontSizeMode]);

  // Keranjang belanja
  const addToCart = (product: Product, addQty: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].qty + addQty;
        // Batasi dengan stok produk
        const cappedQty = Math.min(newQty, product.stock);
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: cappedQty,
          subtotal: cappedQty * (product.sellPrice - (updated[existingIndex].discount || 0))
        };
        return updated;
      } else {
        const initialQty = Math.min(addQty, product.stock);
        return [
          ...prev,
          {
            product,
            qty: initialQty,
            discount: 0,
            subtotal: initialQty * product.sellPrice
          }
        ];
      }
    });
  };

  const updateCartQty = (productId: number, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) => {
        if (item.product.id === productId) {
          const validQty = Math.min(qty, item.product.stock);
          return {
            ...item,
            qty: validQty,
            subtotal: validQty * (item.product.sellPrice - (item.discount || 0))
          };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (acc, item) => {
      acc.itemsCount += item.qty;
      acc.subtotal += item.qty * item.product.sellPrice;
      acc.grandTotal += item.subtotal;
      acc.totalCost += item.qty * item.product.buyPrice;
      return acc;
    },
    { itemsCount: 0, subtotal: 0, grandTotal: 0, totalCost: 0 }
  );

  return (
    <StoreContext.Provider
      value={{
        storeProfile,
        updateStoreProfile,
        fontSizeMode: storeProfile.fontSizeMode || 'large',
        setFontSizeMode,
        activeTab,
        setActiveTab,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        cartTotal
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
