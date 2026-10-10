import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  TrendingUp,
  Download,
  Receipt,
  Eye
} from 'lucide-react';
import { db } from '../../db/database';
import type { Transaction, Expense, Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { generateFinancialReportPdf } from '../../utils/pdfGenerator';
import { ReceiptModal } from '../Cashier/ReceiptModal';

type PeriodType = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL';
type ChartTabType = 'TRANSACTIONS' | 'REVENUE' | 'PROFIT';

export const FinancialDashboard: React.FC = () => {
  const { storeProfile } = useStore();
  const [period, setPeriod] = useState<PeriodType>('TODAY');
  const [chartTab, setChartTab] = useState<ChartTabType>('TRANSACTIONS');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [allTrx, allExp, allProd] = await Promise.all([
      db.transactions.orderBy('date').reverse().toArray(),
      db.expenses.orderBy('date').reverse().toArray(),
      db.products.toArray()
    ]);
    setTransactions(allTrx);
    setExpenses(allExp);
    setProducts(allProd);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const filteredTransactions = transactions.filter((t) => {
    const tTime = new Date(t.date).getTime();
    if (period === 'TODAY') return tTime >= startOfDay;
    if (period === 'WEEK') return tTime >= startOfWeek;
    if (period === 'MONTH') return tTime >= startOfMonth;
    return true;
  });

  const filteredExpenses = expenses.filter((e) => {
    const eTime = new Date(e.date).getTime();
    if (period === 'TODAY') return eTime >= startOfDay;
    if (period === 'WEEK') return eTime >= startOfWeek;
    if (period === 'MONTH') return eTime >= startOfMonth;
    return true;
  });

  // Metrik Finansial
  const totalRevenue = filteredTransactions.reduce((acc, t) => acc + t.grandTotal, 0);
  const totalCostOfGoods = filteredTransactions.reduce((acc, t) => acc + t.totalCost, 0);
  const grossProfit = totalRevenue - totalCostOfGoods;
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;
  const totalCount = filteredTransactions.length;

  const totalInventoryCost = products.reduce((acc, p) => acc + p.stock * p.buyPrice, 0);
  const totalInventoryRetail = products.reduce((acc, p) => acc + p.stock * p.sellPrice, 0);

  const getPeriodLabel = () => {
    if (period === 'TODAY') return 'Today';
    if (period === 'WEEK') return 'This Week';
    if (period === 'MONTH') return 'This Month';
    return 'All Time';
  };

  const getTodayFormatted = () => {
    return now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleExportPdf = () => {
    generateFinancialReportPdf(
      {
        periodTitle: getPeriodLabel(),
        totalRevenue,
        totalCostOfGoods,
        grossProfit,
        totalExpenses,
        netProfit,
        totalInventoryCost,
        totalInventoryRetail,
        transactionCount: totalCount,
        transactions: filteredTransactions,
        expenses: filteredExpenses
      },
      storeProfile
    );
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Memuat laporan...</div>;
  }

  return (
    <div>
      {/* Kasir Pintar Report Header (Screenshot 2 Style) */}
      <div className="kp-report-header">
        <span>Sales Summary Report</span>
      </div>

      {/* Dropdown Tanggal Pill: [ Today ▼ ] */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="kp-date-picker-pill" style={{ flex: 1, maxWidth: '240px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodType)}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 700,
                color: 'var(--primary)',
                fontSize: '0.95rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="TODAY">Today</option>
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
              <option value="ALL">All Time</option>
            </select>
          </div>
          <ChevronDown size={18} />
        </div>

        <button
          type="button"
          onClick={handleExportPdf}
          className="kp-icon-btn"
          title="Unduh PDF Laporan"
          style={{ marginBottom: '16px', border: '1.5px solid var(--primary-border)' }}
        >
          <Download size={20} />
        </button>
      </div>

      {/* Judul Laporan */}
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E293B' }}>
          Daily Report
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic' }}>
          {getTodayFormatted()}
        </p>
      </div>

      {/* 3 KARTU METRIK RAMPING KASIR PINTAR (SCREENSHOT 2 STYLE) */}
      {/* 1. Total Transaction */}
      <div className="kp-metric-card">
        <div className="kp-metric-icon-box">
          <TrendingUp size={24} />
        </div>
        <div className="kp-metric-content">
          <div>
            <div className="kp-metric-number">{totalCount}</div>
            <div className="kp-metric-label">Total Transaction</div>
          </div>
          <div className="kp-metric-badge">
            <div>+∞%</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>vs yesterday</div>
          </div>
        </div>
      </div>

      {/* 2. Profit/Loss */}
      <div className="kp-metric-card">
        <div className="kp-metric-icon-box">
          <TrendingUp size={24} />
        </div>
        <div className="kp-metric-content">
          <div>
            <div className="kp-metric-number">{formatRupiah(grossProfit)}</div>
            <div className="kp-metric-label">Profit/Loss</div>
          </div>
          <div className="kp-metric-badge">
            <div>+∞%</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>vs yesterday</div>
          </div>
        </div>
      </div>

      {/* 3. Revenue */}
      <div className="kp-metric-card">
        <div className="kp-metric-icon-box">
          <TrendingUp size={24} />
        </div>
        <div className="kp-metric-content">
          <div>
            <div className="kp-metric-number">{formatRupiah(totalRevenue)}</div>
            <div className="kp-metric-label">Revenue</div>
          </div>
          <div className="kp-metric-badge">
            <div>+∞%</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>vs yesterday</div>
          </div>
        </div>
      </div>

      {/* Modal Stok Fisik & Biaya Toko Ringkas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          margin: '12px 0 20px 0'
        }}
      >
        <div
          style={{
            background: '#F8FAFC',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0'
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>
            MODAL STOK TOKO
          </span>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
            {formatRupiah(totalInventoryCost)}
          </div>
        </div>

        <div
          style={{
            background: '#F8FAFC',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0'
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>
            LABA BERSIH (NET)
          </span>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
            {formatRupiah(netProfit)}
          </div>
        </div>
      </div>

      {/* Transaction Report per Hour (Persis Screenshot 2 Bawah) */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B' }}>
          Transaction Report per Hour
        </h4>
        <p style={{ fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic', marginBottom: '8px' }}>
          {getTodayFormatted()}
        </p>

        {/* 3 Tab: Total Transaction, Revenue, Profit/Loss */}
        <div className="kp-report-tabs">
          <button
            type="button"
            className={`kp-report-tab-btn ${chartTab === 'TRANSACTIONS' ? 'active' : ''}`}
            onClick={() => setChartTab('TRANSACTIONS')}
          >
            Total Transaction
          </button>
          <button
            type="button"
            className={`kp-report-tab-btn ${chartTab === 'REVENUE' ? 'active' : ''}`}
            onClick={() => setChartTab('REVENUE')}
          >
            Revenue
          </button>
          <button
            type="button"
            className={`kp-report-tab-btn ${chartTab === 'PROFIT' ? 'active' : ''}`}
            onClick={() => setChartTab('PROFIT')}
          >
            Profit/Loss
          </button>
        </div>

        {/* Grafik Simpel Visual (Screenshot 2 Area Chart Style) */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '24px 16px',
            position: 'relative',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            overflow: 'hidden'
          }}
        >
          {/* Garis Horizontal */}
          <div
            style={{
              position: 'absolute',
              top: '35px',
              left: '16px',
              right: '16px',
              borderTop: '1px solid #E5E7EB'
            }}
          />

          {/* Area Kuning/Hijau Gradasi */}
          <svg
            viewBox="0 0 300 120"
            style={{ width: '100%', height: '110px' }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <polygon
              points="0,120 0,110 250,20 250,120"
              fill="url(#chartGrad)"
            />
            <polyline
              points="0,110 250,20"
              fill="none"
              stroke="#EAB308"
              strokeWidth="2.5"
            />
            {/* Titik Point Nilai */}
            <circle cx="0" cy="110" r="4.5" fill="#EAB308" />
            <circle cx="250" cy="20" r="4.5" fill="#EAB308" />
          </svg>

          {/* Label Angka Point */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: '#64748B',
              fontWeight: 700,
              marginTop: '4px'
            }}
          >
            <span>0.00</span>
            <span style={{ color: '#0F172A', fontWeight: 800 }}>
              {chartTab === 'TRANSACTIONS'
                ? `${totalCount}.00`
                : chartTab === 'REVENUE'
                ? formatRupiah(totalRevenue)
                : formatRupiah(grossProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Riwayat Transaksi Singkat */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Receipt size={20} color="var(--primary)" />
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>
            Riwayat Nota Penjualan ({filteredTransactions.length})
          </h4>
        </div>

        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
            Belum ada transaksi di periode ini.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredTransactions.slice(0, 10).map((trx) => (
              <div
                key={trx.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  background: '#FFFFFF'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>
                    {trx.invoiceNumber}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {formatDateTime(trx.date)} • {trx.totalItems} item
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                      {formatRupiah(trx.grandTotal)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedReceipt(trx)}
                    className="kp-icon-btn"
                    title="Lihat Struk"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Preview Struk */}
      {selectedReceipt && (
        <ReceiptModal
          transaction={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
