import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../data/mockData';
import { ArrowLeftRight, Truck, Clock, AlertTriangle } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const stats = getDashboardStats();
  const displayName = user?.user_metadata?.full_name || user?.email || 'User';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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
              <span className="kpi-stat-value">{stats.receiptsByStatus.toReceive}</span>
            </div>
            <div className="kpi-stat">
              <span className="kpi-stat-label">Waiting</span>
              <span className="kpi-stat-value" style={{ color: 'var(--text-muted)' }}>{stats.receiptsByStatus.waiting}</span>
            </div>
            <div className="kpi-stat">
              <span className="kpi-stat-label">Late</span>
              <span className="kpi-stat-value" style={{ color: stats.receiptsByStatus.late > 0 ? 'var(--error)' : 'var(--text-muted)' }}>
                {stats.receiptsByStatus.late}
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
              <span className="kpi-stat-value">{stats.deliveriesByStatus.toDeliver}</span>
            </div>
            <div className="kpi-stat">
              <span className="kpi-stat-label">Waiting</span>
              <span className="kpi-stat-value" style={{ color: 'var(--text-muted)' }}>{stats.deliveriesByStatus.waiting}</span>
            </div>
            <div className="kpi-stat">
              <span className="kpi-stat-label">Late</span>
              <span className="kpi-stat-value" style={{ color: stats.deliveriesByStatus.late > 0 ? 'var(--error)' : 'var(--text-muted)' }}>
                {stats.deliveriesByStatus.late}
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
              <span className="kpi-stat-value">{stats.receiptsByStatus.total}</span>
            </div>
            <div className="kpi-stat">
              <span className="kpi-stat-label">Total deliveries</span>
              <span className="kpi-stat-value">{stats.deliveriesByStatus.total}</span>
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
              <span className="kpi-stat-value" style={{ color: 'var(--warning)' }}>3</span>
            </div>
            <div className="kpi-stat">
              <span className="kpi-stat-label">Out of stock</span>
              <span className="kpi-stat-value" style={{ color: 'var(--error)' }}>1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary note */}
      <div style={{ padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
        Lots: schedule date = {today} · Waiting: waiting for checks
      </div>
    </div>
  );
}
