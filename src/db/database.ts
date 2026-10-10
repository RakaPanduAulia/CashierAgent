import Dexie, { type Table } from 'dexie';
import type { Product, StockMovement, Transaction, Expense, StoreProfile } from '../types';

export class CashierDatabase extends Dexie {
  products!: Table<Product, number>;
  stockMovements!: Table<StockMovement, number>;
  transactions!: Table<Transaction, number>;
  expenses!: Table<Expense, number>;

  constructor() {
    super('CashierAgentDB');
    this.version(1).stores({
      products: '++id, name, category, barcode, stock, minStock, createdAt',
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
  address: 'Jl. Pasar Baru No. 88, Pertokoan Sentra Makmur',
  phone: '0812-3456-7890',
  footerMessage: 'Terima kasih telah berbelanja! Barang yang sudah dibeli tidak dapat ditukar kecuali ada perjanjian.',
  fontSizeMode: 'large' // Default 'large' untuk kenyamanan mata lansia
};

const SEED_PRODUCTS: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Kategori: Bahan Kue & Tepung
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
    barcode: '8991001002',
    notes: 'Protein tinggi untuk roti dan donat'
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
    name: 'Gula Halus Claris 500 gr',
    category: 'Bahan Kue & Tepung',
    unit: 'pack',
    buyPrice: 9500,
    sellPrice: 12000,
    stock: 25,
    minStock: 5,
    barcode: '8991001005'
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
    name: 'Mentega Wijsman Butter 200 gr Kaleng',
    category: 'Margarin & Cokelat',
    unit: 'kaleng',
    buyPrice: 42000,
    sellPrice: 49000,
    stock: 12,
    minStock: 3,
    barcode: '8991002002',
    notes: 'Mentega butter premium aromatik'
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
    name: 'Cokelat Bubuk Tulip Bordeaux 250 gr',
    category: 'Margarin & Cokelat',
    unit: 'pack',
    buyPrice: 28000,
    sellPrice: 34000,
    stock: 20,
    minStock: 5,
    barcode: '8991002004'
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
    name: 'Baking Powder Koepoe Koepoe 45 gr',
    category: 'Ragi & Pengembang',
    unit: 'botol',
    buyPrice: 4000,
    sellPrice: 5500,
    stock: 35,
    minStock: 8,
    barcode: '8991003002'
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
    name: 'Choco Chips Cokelat Kemasan 250 gr',
    category: 'Keju & Topping',
    unit: 'pack',
    buyPrice: 12000,
    sellPrice: 15500,
    stock: 22,
    minStock: 5,
    barcode: '8991004002'
  },

  // Kategori: Kemasan Plastik & Mika
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
    name: 'Mika 7C Kecil Kue Basah isi 100',
    category: 'Plastik & Mika',
    unit: 'pack',
    buyPrice: 14000,
    sellPrice: 18000,
    stock: 35,
    minStock: 8,
    barcode: '8992001002'
  },
  {
    name: 'Mika 1A Jumbo isi 50',
    category: 'Plastik & Mika',
    unit: 'pack',
    buyPrice: 24000,
    sellPrice: 30000,
    stock: 18,
    minStock: 4,
    barcode: '8992001003'
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
    name: 'Kantong Kresek Bening Uk. 24 isi 50',
    category: 'Plastik & Mika',
    unit: 'pack',
    buyPrice: 11000,
    sellPrice: 14500,
    stock: 45,
    minStock: 10,
    barcode: '8992002002'
  },
  {
    name: 'Plastik Klip Bening 10x15 cm isi 100',
    category: 'Plastik & Mika',
    unit: 'pack',
    buyPrice: 9000,
    sellPrice: 12000,
    stock: 30,
    minStock: 5,
    barcode: '8992002003'
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
    name: 'Cup Minuman Dingin 16 oz isi 50',
    category: 'Cup & Dus Kue',
    unit: 'pack',
    buyPrice: 17000,
    sellPrice: 22000,
    stock: 25,
    minStock: 5,
    barcode: '8993001002'
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
  },
  {
    name: 'Kertas Roti Baking Paper Roll 5 Meter',
    category: 'Cup & Dus Kue',
    unit: 'roll',
    buyPrice: 12000,
    sellPrice: 16000,
    stock: 18,
    minStock: 4,
    barcode: '8993003001'
  }
];

export async function initializeDatabase() {
  const count = await db.products.count();
  if (count === 0) {
    const now = new Date().toISOString();
    for (const item of SEED_PRODUCTS) {
      const productId = await db.products.add({
        ...item,
        createdAt: now,
        updatedAt: now
      });

      // Tambahkan riwayat stok awal
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

    // Tambah sample pengeluaran toko awal agar laporan finansial sudah ada contoh nyata
    await db.expenses.add({
      category: 'Listrik & Air',
      title: 'Token Listrik Toko Bulan Ini',
      amount: 150000,
      date: new Date(Date.now() - 24 * 3600 * 1000 * 3).toISOString(),
      notes: 'Pembelian token PLN 150rb'
    });

    await db.expenses.add({
      category: 'Operasional',
      title: 'Beli Kantong Kresek Belanja Kasir',
      amount: 45000,
      date: new Date(Date.now() - 24 * 3600 * 1000 * 1).toISOString(),
      notes: 'Kresek besar 5 pack untuk kasir'
    });
  }
}

export function getStoredProfile(): StoreProfile {
  const saved = localStorage.getItem('store_profile');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_STORE_PROFILE;
    }
  }
  return DEFAULT_STORE_PROFILE;
}

export function saveStoredProfile(profile: StoreProfile) {
  localStorage.setItem('store_profile', JSON.stringify(profile));
}
