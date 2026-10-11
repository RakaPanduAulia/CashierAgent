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

export interface ProductCategory {
  id?: number;
  name: string;
  createdAt: string;
}

export interface Customer {
  id?: number;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt: string;
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
  pricePerUnit: number;
  totalCost: number;
  reason: string;
  date: string;
}

export interface CartItem {
  product: Product;
  qty: number;
  discount: number;
  subtotal: number;
}

export interface TransactionItem {
  productId: number;
  productName: string;
  unit: string;
  qty: number;
  buyPrice: number;
  sellPrice: number;
  discount: number;
  subtotal: number;
  costSubtotal: number;
  profitSubtotal: number;
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
  totalCost: number;
  grossProfit: number;
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
  ownerName: string;
  address: string;
  phone: string;
  footerMessage: string;
  fontSizeMode: 'normal' | 'large' | 'extralarge';
}

export type NavigationTab = 'pos' | 'management' | 'reports' | 'settings';
export type ManagementView = 'menu' | 'products' | 'categories' | 'customers';
