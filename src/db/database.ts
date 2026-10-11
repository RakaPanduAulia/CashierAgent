import Dexie, { type Table } from 'dexie';
import type {
  Product,
  ProductCategory,
  Customer,
  StockMovement,
  Transaction,
  Expense,
  StoreProfile
} from '../types';

export class CashierDatabase extends Dexie {
  products!: Table<Product, number>;
  categories!: Table<ProductCategory, number>;
  customers!: Table<Customer, number>;
  stockMovements!: Table<StockMovement, number>;
  transactions!: Table<Transaction, number>;
  expenses!: Table<Expense, number>;

  constructor() {
    super('CashierAgentDB');
    this.version(2).stores({
      products: '++id, name, category, barcode, stock, minStock, createdAt',
      categories: '++id, name, createdAt',
      customers: '++id, name, phone, createdAt',
      stockMovements: '++id, productId, type, date',
      transactions: '++id, invoiceNumber, date, paymentMethod, grandTotal',
      expenses: '++id, category, date, amount'
    });
  }
}

export const db = new CashierDatabase();

export const DEFAULT_STORE_PROFILE: StoreProfile = {
  name: 'Toko Berkah Bahan Kue & Plastik',
  tagline: 'Lengkap, Murah, Berkualitas & Terpercaya',
  ownerName: 'Raka Pandu Aulia',
  address: 'Jl. Pasar Baru No. 88, Pertokoan Sentra Makmur',
  phone: '0812-3456-7890',
  footerMessage: 'Terima kasih telah berbelanja! Barang yang sudah dibeli tidak dapat ditukar.',
  fontSizeMode: 'large'
};

const DEFAULT_CATEGORIES: string[] = [
  'Bahan Kue & Tepung',
  'Margarin & Cokelat',
  'Ragi & Pengembang',
  'Keju & Topping',
  'Plastik & Mika',
  'Cup & Dus Kue'
];

const SEED_PRODUCTS: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Tepung Terigu Segitiga Biru 1 Kg',
    category: 'Bahan Kue & Tepung',
    unit: 'kg',
    buyPrice: 11000,
    sellPrice: 13500,
    stock: 45,
    minStock: 10,
    barcode: '8991001001',
    notes: 'Kemasan pabrik asli'
  },
  {
    name: 'Tepung Cakra Kembar Emas 1 Kg',
    category: 'Bahan Kue & Tepung',
    unit: 'kg',
    buyPrice: 13000,
    sellPrice: 15500,
    stock: 30,
    minStock: 8,
    barcode: '8991001002'
  },
  {
    name: 'Tepung Maizena Maizenaku 200 gr',
    category: 'Bahan Kue & Tepung',
    unit: 'pcs',
    buyPrice: 5500,
    sellPrice: 7000,
    stock: 40,
    minStock: 10,
    barcode: '8991001003'
  },
  {
    name: 'Gula Pasir Gulaku Manis 1 Kg',
    category: 'Bahan Kue & Tepung',
    unit: 'kg',
    buyPrice: 16000,
    sellPrice: 18000,
    stock: 60,
    minStock: 15,
    barcode: '8991001004'
  },
  {
    name: 'Margarin Blue Band Serbaguna 200 gr',
    category: 'Margarin & Cokelat',
    unit: 'pcs',
    buyPrice: 8500,
    sellPrice: 10500,
    stock: 50,
    minStock: 10,
    barcode: '8991002001'
  },
  {
    name: 'Cokelat Batang Colatta Dark Compound 1 Kg',
    category: 'Margarin & Cokelat',
    unit: 'pcs',
    buyPrice: 45000,
    sellPrice: 53000,
    stock: 16,
    minStock: 4,
    barcode: '8991002003'
  },
  {
    name: 'Ragi Instan Fermipan 11 gr',
    category: 'Ragi & Pengembang',
    unit: 'sachet',
    buyPrice: 4500,
    sellPrice: 6000,
    stock: 75,
    minStock: 15,
    barcode: '8991003001'
  },
  {
    name: 'Keju Cheddar Prochiz Gold 160 gr',
    category: 'Keju & Topping',
    unit: 'pcs',
    buyPrice: 11500,
    sellPrice: 14000,
    stock: 28,
    minStock: 6,
    barcode: '8991004001'
  },
  {
    name: 'Mika Bento 4 Sekat Hitam + Tutup isi 50',
    category: 'Plastik & Mika',
    unit: 'pack',
    buyPrice: 38000,
    sellPrice: 46000,
    stock: 24,
    minStock: 5,
    barcode: '8992001001'
  },
  {
    name: 'Kantong Kresek Bening Uk. 15 isi 50',
    category: 'Plastik & Mika',
    unit: 'pack',
    buyPrice: 6000,
    sellPrice: 8500,
    stock: 60,
    minStock: 15,
    barcode: '8992002001'
  },
  {
    name: 'Cup Puding 100 ml + Tutup isi 25',
    category: 'Cup & Dus Kue',
    unit: 'pack',
    buyPrice: 12000,
    sellPrice: 16000,
    stock: 40,
    minStock: 10,
    barcode: '8993001001'
  },
  {
    name: 'Dus Donat R10 Kraft Cokelat isi 20',
    category: 'Cup & Dus Kue',
    unit: 'pack',
    buyPrice: 28000,
    sellPrice: 35000,
    stock: 20,
    minStock: 5,
    barcode: '8993002001'
  }
];

export async function initializeDatabase() {
  const count = await db.products.count();
  const now = new Date().toISOString();

  // Inisialisasi Kategori
  const catCount = await db.categories.count();
  if (catCount === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      await db.categories.add({
        name: cat,
        createdAt: now
      });
    }
  }

  // Inisialisasi Pelanggan
  const custCount = await db.customers.count();
  if (custCount === 0) {
    await db.customers.bulkAdd([
      {
        name: 'Ibu Rina (Toko Kue Rina)',
        phone: '0812-3456-7891',
        address: 'Jl. Melati No. 12',
        notes: 'Pelanggan rutin tepung & mika bento',
        createdAt: now
      },
      {
        name: 'Ibu Ani (Katering Berkah)',
        phone: '0813-8888-9999',
        address: 'Komplek Permata Blok B2',
        notes: 'Langganan cup puding & dus donat',
        createdAt: now
      },
      {
        name: 'Mas Doni (Donat Lumer)',
        phone: '0857-1234-5678',
        address: 'Pasar Lama Kios No. 5',
        notes: 'Pembelian terigu cakra & ragi',
        createdAt: now
      }
    ]);
  }

  // Inisialisasi Produk & Mutasi Awal
  if (count === 0) {
    for (const item of SEED_PRODUCTS) {
      const productId = await db.products.add({
        ...item,
        createdAt: now,
        updatedAt: now
      });

      await db.stockMovements.add({
        productId: productId as number,
        productName: item.name,
        type: 'IN',
        qty: item.stock,
        previousStock: 0,
        newStock: item.stock,
        pricePerUnit: item.buyPrice,
        totalCost: item.stock * item.buyPrice,
        reason: 'Stok awal / Modal toko',
        date: now
      });
    }

    await db.expenses.add({
      category: 'Listrik & Air',
      title: 'Token Listrik Toko Bulan Ini',
      amount: 150000,
      date: new Date(Date.now() - 24 * 3600 * 1000 * 3).toISOString(),
      notes: 'Pembelian token PLN 150rb'
    });
  }
}

export function getStoredProfile(): StoreProfile {
  const saved = localStorage.getItem('store_profile');
  if (saved) {
    try {
      return { ...DEFAULT_STORE_PROFILE, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_STORE_PROFILE;
    }
  }
  return DEFAULT_STORE_PROFILE;
}

export function saveStoredProfile(profile: StoreProfile) {
  localStorage.setItem('store_profile', JSON.stringify(profile));
}
