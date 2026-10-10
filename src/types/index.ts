export interface Product {
  id?: number;
  name: string;
  category: string;
  unit: string; // 'kg', 'gram', 'pcs', 'pack', 'roll', 'dus', 'bal', 'lusin'
  buyPrice: number; // Harga Modal / Beli
  sellPrice: number; // Harga Jual Kasir
  stock: number; // Stok saat ini
  minStock: number; // Peringatan stok tipis jika <= minStock
  barcode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'SALE';

export interface StockMovement {
  id?: number;
  productId: number;
  productName: string;
  type: StockMovementType;
  qty: number;
  previousStock: number;
  newStock: number;
  pricePerUnit: number; // Harga beli/modal saat restock atau HPP
  totalCost: number; // qty * pricePerUnit
  reason: string; // contoh: "Kulakan Grosir", "Rusak / Bocor", "Expired", "Penjualan Kasir"
  date: string;
}

export interface CartItem {
  product: Product;
  qty: number;
  discount: number; // diskon per item (Rp)
  subtotal: number;
}

export interface TransactionItem {
  productId: number;
  productName: string;
  unit: string;
  qty: number;
  buyPrice: number; // Modal barang saat transaksi
  sellPrice: number; // Harga jual
  discount: number;
  subtotal: number;
  costSubtotal: number; // qty * buyPrice
  profitSubtotal: number; // subtotal - costSubtotal
}

export interface Transaction {
  id?: number;
  invoiceNumber: string;
  date: string;
  items: TransactionItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  grandTotal: number;
  totalCost: number; // Total HPP / Modal
  grossProfit: number; // grandTotal - totalCost
  paymentMethod: 'CASH' | 'QRIS' | 'TRANSFER';
  amountPaid: number;
  change: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface Expense {
  id?: number;
  category: string;
  title: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface StoreProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  footerMessage: string;
  fontSizeMode: 'normal' | 'large' | 'extralarge';
}

export type NavigationTab = 'pos' | 'inventory' | 'reports' | 'expenses' | 'settings';
