import { useState, useMemo } from 'react';
import { mockMoveHistory, type OperationStatus } from '../data/mockData';
import { Badge } from '../components/ui/Badge';
import { Search } from 'lucide-react';

const statusFilters: (OperationStatus | 'all')[] = ['all', 'draft', 'waiting', 'ready', 'done', 'cancelled'];

export function MoveHistory() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OperationStatus | 'all'>('all');

  const filtered = useMemo(() => {
    return mockMoveHistory.filter(m => {
      const matchesSearch = search === '' ||
        m.reference.toLowerCase().includes(search.toLowerCase()) ||
        m.productName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <div>
      <div className="page-header">
        <h1>Move History</h1>
        <div className="page-header-actions">
          <div className="search-bar">
            <Search size={16} className="search-bar-icon" />
            <input
              placeholder="Search by reference & product..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
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
              <th>Date</th>
              <th>Reference</th>
              <th>From</th>
              <th>To</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>No move records found</td></tr>
            ) : (
              filtered.map(move => (
                <tr key={move.id} style={{ cursor: 'default' }}>
                  <td>{new Date(move.date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{move.reference}</td>
                  <td>{move.from}</td>
                  <td>{move.to}</td>
                  <td>{move.productName}</td>
                  <td>
                    <span style={{
                      fontWeight: 600,
                      color: move.type === 'in' ? 'var(--success)' : move.type === 'out' ? 'var(--error)' : 'var(--text-main)',
                    }}>
                      {move.type === 'in' ? '+' : move.type === 'out' ? '-' : ''}{Math.abs(move.quantity)}
                    </span>
                  </td>
                  <td><Badge status={move.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="table-footer">
          <span>{filtered.length} move{filtered.length !== 1 ? 's' : ''}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>●</span> In &nbsp;
            <span style={{ color: 'var(--error)', fontWeight: 600 }}>●</span> Out
          </span>
        </div>
      </div>
    </div>
  );
}
