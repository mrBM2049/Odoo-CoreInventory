import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../lib/api';
import { ArrowLeftRight, Truck, Clock, AlertTriangle } from 'lucide-react';

interface DashboardKPIs {
  total_products: number;
  low_stock_items: number;
  out_of_stock_items: number;
  pending_receipts: number;
  pending_deliveries: number;
  receipts_to_receive: number;
  deliveries_to_deliver: number;
  late_receipts: number;
  late_deliveries: number;
  total_receipts: number;
  total_deliveries: number;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const displayName = user?.user_metadata?.full_name || user?.email || 'User';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    let cancelled = false;

    async function loadKpis() {
      try {
        setLoading(true);
        const data = await apiGet<DashboardKPIs>('/api/v1/dashboard/kpis');
        if (!cancelled) {
          setKpis(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load dashboard data',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadKpis();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: '0.95rem' }}>
            Welcome back, {displayName} · {today}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="sidebar-avatar" style={{ width: 40, height: 40, fontSize: '1.1rem' }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        {/* Receipt KPI */}
        <div className="kpi-card" onClick={() => navigate('/operations/receipts')}>
          <div className="kpi-card-header">
            <span className="kpi-card-title">Receipts</span>
            <div className="kpi-card-icon">
              <ArrowLeftRight size={20} />
            </div>
          </div>
          <div className="kpi-card-stats">
            <div className="kpi-stat">
              <span className="kpi-stat-label">To receive</span>
              <span className="kpi-stat-value">
                {kpis?.receipts_to_receive ?? 0}
              </span>
            </div>
            <div className="kpi-stat">
              <span className="kpi-stat-label">Waiting</span>
              <span
                className="kpi-stat-value"
                style={{ color: 'var(--text-muted)' }}
              >
                {kpis?.pending_receipts ?? 0}
              </span>
            </div>
            <div className="kpi-stat">
              <span className="kpi-stat-label">Late</span>
              <span
                className="kpi-stat-value"
                style={{
                  color:
                    (kpis?.late_receipts ?? 0) > 0
                      ? 'var(--error)'
                      : 'var(--text-muted)',
                }}
              >
                {kpis?.late_receipts ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery KPI */}
        <div className="kpi-card" onClick={() => navigate('/operations/deliveries')}>
          <div className="kpi-card-header">
            <span className="kpi-card-title">Delivery</span>
            <div className="kpi-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
              <Truck size={20} />
            </div>
          </div>
          <div className="kpi-card-stats">
            <div className="kpi-stat">
              <span className="kpi-stat-label">To deliver</span>
              <span className="kpi-stat-value">
                {kpis?.deliveries_to_deliver ?? 0}
              </span>
            </div>
            <div className="kpi-stat">
              <span className="kpi-stat-label">Waiting</span>
              <span
                className="kpi-stat-value"
                style={{ color: 'var(--text-muted)' }}
              >
                {kpis?.pending_deliveries ?? 0}
              </span>
            </div>
            <div className="kpi-stat">
              <span className="kpi-stat-label">Late</span>
              <span
                className="kpi-stat-value"
                style={{
                  color:
                    (kpis?.late_deliveries ?? 0) > 0
                      ? 'var(--error)'
                      : 'var(--text-muted)',
                }}
              >
                {kpis?.late_deliveries ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Operations KPI */}
        <div className="kpi-card" onClick={() => navigate('/operations/move-history')}>
          <div className="kpi-card-header">
            <span className="kpi-card-title">Operations Today</span>
            <div className="kpi-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-card-stats">
            <div className="kpi-stat">
              <span className="kpi-stat-label">Total receipts</span>
              <span className="kpi-stat-value">
                {kpis?.total_receipts ?? 0}
              </span>
            </div>
            <div className="kpi-stat">
              <span className="kpi-stat-label">Total deliveries</span>
              <span className="kpi-stat-value">
                {kpis?.total_deliveries ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Alerts</span>
            <div className="kpi-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="kpi-card-stats">
            <div className="kpi-stat">
              <span className="kpi-stat-label">Low stock items</span>
              <span
                className="kpi-stat-value"
                style={{ color: 'var(--warning)' }}
              >
                {kpis?.low_stock_items ?? 0}
              </span>
            </div>
            <div className="kpi-stat">
              <span className="kpi-stat-label">Out of stock</span>
              <span
                className="kpi-stat-value"
                style={{ color: 'var(--error)' }}
              >
                {kpis?.out_of_stock_items ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary note */}
      <div style={{ padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
        {loading && !error && 'Loading live KPIs from backend...'}
        {!loading && error && `Failed to load KPIs: ${error}`}
        {!loading && !error && (
          <>
            Lots: schedule date = {today} · Waiting: pending operations across
            warehouses
          </>
        )}
      </div>
    </div>
  );
}
