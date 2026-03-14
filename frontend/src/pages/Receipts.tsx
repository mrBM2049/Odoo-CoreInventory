import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockReceipts, type OperationStatus } from '../data/mockData';
import { Badge } from '../components/ui/Badge';
import { Search, Plus } from 'lucide-react';

const statusFilters: (OperationStatus | 'all')[] = ['all', 'draft', 'waiting', 'ready', 'done', 'cancelled'];

export function Receipts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OperationStatus | 'all'>('all');

  const filtered = useMemo(() => {
    return mockReceipts.filter(r => {
      const matchesSearch = search === '' ||
        r.reference.toLowerCase().includes(search.toLowerCase()) ||
        r.from.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <div>
      <div className="page-header">
        <h1>Receipts</h1>
        <div className="page-header-actions">
          <div className="search-bar">
            <Search size={16} className="search-bar-icon" />
            <input
              placeholder="Search by reference & contacts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/operations/receipts/new')}>
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
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>No receipts found</td></tr>
            ) : (
              filtered.map(receipt => (
                <tr key={receipt.id} onClick={() => navigate(`/operations/receipts/${receipt.id}`)}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{receipt.reference}</td>
                  <td>{receipt.from}</td>
                  <td>{receipt.to}</td>
                  <td>{receipt.products.map(p => p.productName).join(', ')}</td>
                  <td>{new Date(receipt.scheduledDate).toLocaleDateString()}</td>
                  <td><Badge status={receipt.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="table-footer">
          <span>{filtered.length} receipt{filtered.length !== 1 ? 's' : ''}</span>
          <span>Summary of conditions</span>
        </div>
      </div>
    </div>
  );
}
