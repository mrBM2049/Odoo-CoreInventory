import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OperationStatus } from '../types/operations';
import { Badge } from '../components/ui/Badge';
import { apiGet } from '../lib/api';
import { Search, Plus } from 'lucide-react';

const statusFilters: (OperationStatus | 'all')[] = ['all', 'draft', 'waiting', 'ready', 'done', 'cancelled'];

interface OperationItem {
  id: number;
  product_id: number;
  quantity: number;
  product?: {
    name: string;
  } | null;
}

interface Operation {
  id: number;
  type: string;
  status: OperationStatus;
  created_at?: string;
  items: OperationItem[];
}

export function Receipts() {
  const navigate = useNavigate();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OperationStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReceipts() {
      try {
        setLoading(true);
        const data = await apiGet<Operation[]>('/api/v1/operations?type=receipt');
        if (!cancelled) {
          setOperations(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load receipts');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadReceipts();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return operations.filter((r) => {
      const products = r.items.map((i) => i.product?.name ?? '').join(', ');
      const matchesSearch = search === '' ||
        String(r.id).toLowerCase().includes(search.toLowerCase()) ||
        products.toLowerCase().includes(search.toLowerCase());
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
          <button className="btn btn-primary btn-sm" type="button" disabled>
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
              <th>Receipt ID</th>
              <th>Created At</th>
              <th>Products</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ padding: 48 }}>
                  <div className="skeleton-row skeleton" />
                  <div className="skeleton-row skeleton" />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 48, color: 'var(--error)' }}>
                  {error}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                  No receipts found
                </td>
              </tr>
            ) : (
              filtered.map((receipt) => (
                <tr key={receipt.id} onClick={() => navigate(`/operations/receipts/${receipt.id}`)}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>#{receipt.id}</td>
                  <td>{receipt.created_at ? new Date(receipt.created_at).toLocaleString() : '-'}</td>
                  <td>{receipt.items.map((p) => p.product?.name ?? `#${p.product_id}`).join(', ')}</td>
                  <td>
                    <Badge status={receipt.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="table-footer">
          <span>{filtered.length} receipt{filtered.length !== 1 ? 's' : ''}</span>
          <span>Backend receipts (type = receipt)</span>
        </div>
      </div>
    </div>
  );
}
