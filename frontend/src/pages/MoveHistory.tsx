import { useEffect, useMemo, useState } from 'react';
import type { OperationStatus } from '../types/operations';
import { Badge } from '../components/ui/Badge';
import { apiGet } from '../lib/api';
import { Search } from 'lucide-react';

const statusFilters: (OperationStatus | 'all')[] = ['all', 'draft', 'waiting', 'ready', 'done', 'cancelled'];

interface LedgerEntry {
  id: number;
  product_id: number;
  location_id: number | null;
  operation_id: number | null;
  quantity_change: number;
  created_at?: string;
  product?: {
    name: string;
  } | null;
  location?: {
    name: string;
  } | null;
}

interface OperationSummary {
  id: number;
  type: string;
  status: OperationStatus;
}

export function MoveHistory() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [operations, setOperations] = useState<Map<number, OperationSummary>>(new Map());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OperationStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        setLoading(true);
        const [ledger, ops] = await Promise.all([
          apiGet<LedgerEntry[]>('/api/v1/stock-ledger'),
          apiGet<OperationSummary[]>('/api/v1/operations'),
        ]);
        if (cancelled) return;

        const opMap = new Map<number, OperationSummary>();
        for (const op of ops) {
          opMap.set(op.id, op);
        }

        setEntries(ledger);
        setOperations(opMap);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load move history');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return entries.filter((m) => {
      const op = m.operation_id ? operations.get(m.operation_id) : undefined;
      const reference = m.operation_id ? `OP-${m.operation_id}` : '';
      const productName = m.product?.name ?? '';
      const matchesSearch = search === '' ||
        reference.toLowerCase().includes(search.toLowerCase()) ||
        productName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || (op?.status ?? 'done') === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [entries, operations, search, statusFilter]);

  const getType = (entry: LedgerEntry): 'in' | 'out' | 'adjustment' => {
    if (entry.quantity_change > 0) return 'in';
    if (entry.quantity_change < 0) return 'out';
    return 'adjustment';
  };

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
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: 48 }}>
                  <div className="skeleton-row skeleton" />
                  <div className="skeleton-row skeleton" />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--error)' }}>
                  {error}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                  No move records found
                </td>
              </tr>
            ) : (
              filtered.map((move) => {
                const op = move.operation_id ? operations.get(move.operation_id) : undefined;
                const type = getType(move);
                const status = op?.status ?? 'done';
                const quantityAbs = Math.abs(move.quantity_change);

                return (
                  <tr key={move.id} style={{ cursor: 'default' }}>
                    <td>{move.created_at ? new Date(move.created_at).toLocaleDateString() : '-'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {move.operation_id ? `OP-${move.operation_id}` : '-'}
                    </td>
                    <td>{type === 'out' ? move.location?.name ?? '-' : '-'}</td>
                    <td>{type === 'in' ? move.location?.name ?? '-' : '-'}</td>
                    <td>{move.product?.name ?? `#${move.product_id}`}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 600,
                          color:
                            type === 'in'
                              ? 'var(--success)'
                              : type === 'out'
                              ? 'var(--error)'
                              : 'var(--text-main)',
                        }}
                      >
                        {type === 'in' ? '+' : type === 'out' ? '-' : ''}
                        {quantityAbs}
                      </span>
                    </td>
                    <td>
                      <Badge status={status} />
                    </td>
                  </tr>
                );
              })
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
