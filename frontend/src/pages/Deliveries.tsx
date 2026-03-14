import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDeliveries, type OperationStatus } from '../data/mockData';
import { Badge } from '../components/ui/Badge';
import { Search, Plus } from 'lucide-react';

const statusFilters: (OperationStatus | 'all')[] = ['all', 'draft', 'waiting', 'ready', 'done', 'cancelled'];

export function Deliveries() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OperationStatus | 'all'>('all');

  const filtered = useMemo(() => {
    return mockDeliveries.filter(d => {
      const matchesSearch = search === '' ||
        d.reference.toLowerCase().includes(search.toLowerCase()) ||
        d.to.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <div>
      <div className="page-header">
        <h1>Delivery</h1>
        <div className="page-header-actions">
          <div className="search-bar">
            <Search size={16} className="search-bar-icon" />
            <input
              placeholder="Search by reference & contacts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/operations/deliveries/new')}>
            <Plus size={16} /> New
          </button>
        </div>
      </div>

      <div className="status-tabs">
        {statusFilters.map(s => (
          <button
            key={s}
            className={`status-tab ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>From</th>
              <th>To</th>
              <th>Product</th>
              <th>Scheduled Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>No deliveries found</td></tr>
            ) : (
              filtered.map(delivery => (
                <tr key={delivery.id} onClick={() => navigate(`/operations/deliveries/${delivery.id}`)}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{delivery.reference}</td>
                  <td>{delivery.from}</td>
                  <td>{delivery.to}</td>
                  <td>{delivery.products.map(p => p.productName).join(', ')}</td>
                  <td>{new Date(delivery.scheduledDate).toLocaleDateString()}</td>
                  <td><Badge status={delivery.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="table-footer">
          <span>{filtered.length} deliver{filtered.length !== 1 ? 'ies' : 'y'}</span>
          <span>Populated of delivery orders</span>
        </div>
      </div>
    </div>
  );
}
