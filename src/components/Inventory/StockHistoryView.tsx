import React, { useState, useEffect } from 'react';
import { History, ArrowDownCircle, ArrowUpCircle, ShoppingCart, X } from 'lucide-react';
import { db } from '../../db/database';
import type { StockMovement } from '../../types';
import { formatDateTime, formatRupiah } from '../../utils/formatters';

interface StockHistoryViewProps {
  onClose: () => void;
}

export const StockHistoryView: React.FC<StockHistoryViewProps> = ({ onClose }) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const loadMovements = async () => {
    setLoading(true);
    const list = await db.stockMovements.orderBy('date').reverse().limit(100).toArray();
    setMovements(list);
    setLoading(false);
  };

  useEffect(() => {
    loadMovements();
  }, []);

  const filtered = movements.filter((m) => {
    if (filterType === 'ALL') return true;
    return m.type === filterType;
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px', height: '90vh' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={26} color="#1e40af" />
            <div>
              <h2 className="modal-title">Riwayat Keluar & Masuk Stok</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Catatan mutasi stok barang toko
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-outline btn-icon-only">
            <X size={22} />
          </button>
        </div>

        {/* Filter Tab */}
        <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {[
              { id: 'ALL', label: 'Semua Mutasi' },
              { id: 'IN', label: 'Masuk Stok (+)' },
              { id: 'OUT', label: 'Keluar Stok (-)' },
              { id: 'SALE', label: 'Terjual Kasir' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`btn btn-sm ${filterType === f.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterType(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-body" style={{ padding: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>Memuat riwayat stok...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <History size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <h3>Belum ada riwayat mutasi stok</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filtered.map((m) => {
                const isIN = m.type === 'IN';
                const isOUT = m.type === 'OUT';

                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '12px',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: isIN ? '#dcfce7' : isOUT ? '#fee2e2' : '#eff6ff',
                          color: isIN ? '#15803d' : isOUT ? '#b91c1c' : '#1d4ed8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {isIN ? (
                          <ArrowDownCircle size={22} />
                        ) : isOUT ? (
                          <ArrowUpCircle size={22} />
                        ) : (
                          <ShoppingCart size={22} />
                        )}
                      </div>

                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                          {m.productName}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {formatDateTime(m.date)} • <i>{m.reason}</i>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                          Stok: {m.previousStock} → <b>{m.newStock}</b>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 900,
                          color: isIN ? '#15803d' : '#b91c1c'
                        }}
                      >
                        {isIN ? `+${m.qty}` : `-${m.qty}`}
                      </div>
                      {m.totalCost > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Nilai: {formatRupiah(m.totalCost)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-outline" style={{ width: '100%' }}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
