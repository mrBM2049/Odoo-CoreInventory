import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { OperationStatus } from '../types/operations';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { apiGet, apiPost } from '../lib/api';
import { ArrowLeft, CheckCircle2, Printer, XCircle, Plus } from 'lucide-react';

interface OperationItem {
  id: number;
  product_id: number;
  quantity: number;
  source_location_id: number | null;
  destination_location_id: number | null;
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

export function ReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [receipt, setReceipt] = useState<Operation | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const numericId = id ? Number(id) : NaN;
    if (!id || Number.isNaN(numericId)) {
      setError('Invalid receipt ID');
      setLoading(false);
      return;
    }

    async function loadReceipt() {
      try {
        setLoading(true);
        const data = await apiGet<Operation>(`/api/v1/operations/${numericId}`);
        if (!cancelled) {
          setReceipt(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load receipt');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadReceipt();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="detail-section">
        <div className="skeleton-row skeleton" />
        <div className="skeleton-row skeleton" />
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="empty-state">
        <h3>Receipt not found</h3>
        <p>{error || 'The receipt you are looking for does not exist.'}</p>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => navigate('/operations/receipts')}>
          Back to Receipts
        </button>
      </div>
    );
  }

  const handleValidate = () => {
    if (!receipt) return;
    const numericId = Number(receipt.id);
    if (Number.isNaN(numericId)) return;

    (async () => {
      try {
        const updated = await apiPost<Operation>(`/api/v1/operations/${numericId}/validate`, {});
        setReceipt(updated);
        showToast(`Receipt #${updated.id} validated successfully! Stock updated.`, 'success');
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : 'Failed to validate receipt',
          'error',
        );
      }
    })();
  };

  const handleCancel = () => {
    if (!receipt) return;
    const numericId = Number(receipt.id);
    if (Number.isNaN(numericId)) return;

    (async () => {
      try {
        const updated = await apiPost<Operation>(`/api/v1/operations/${numericId}/cancel`, {});
        setReceipt(updated);
        showToast(`Receipt #${updated.id} has been cancelled`, 'error');
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : 'Failed to cancel receipt',
          'error',
        );
      }
    })();
  };

  const handleAddProduct = () => {
    showToast('Adding products to existing operations is not yet supported.', 'warning');
  };

  const canValidate = receipt.status === 'draft' || receipt.status === 'ready';
  const canCancel = receipt.status === 'draft' || receipt.status === 'ready';

  const statusSteps = ['Draft', 'Waiting / Ready', 'Done'];
  const currentStepIndex =
    receipt.status === 'draft'
      ? 0
      : receipt.status === 'waiting' || receipt.status === 'ready'
      ? 1
      : receipt.status === 'done'
      ? 2
      : -1;

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/operations/receipts')}>
        <ArrowLeft size={18} /> Back to Receipts
      </button>

      <div className="detail-header" style={{ marginTop: 16 }}>
        <h1>Receipt #{receipt.id}</h1>
        <Badge status={receipt.status} />

        <div className="status-flow" style={{ marginLeft: 16 }}>
          {statusSteps.map((step, i) => (
            <span
              key={step}
              className={`status-flow-step ${i === currentStepIndex ? 'active' : i < currentStepIndex ? 'completed' : ''}`}
            >
              {step}
            </span>
          ))}
        </div>

        <div className="detail-header-actions">
          {canValidate && (
            <button className="btn btn-primary btn-sm" onClick={handleValidate}>
              <CheckCircle2 size={16} /> Validate
            </button>
          )}
          <button className="btn btn-secondary btn-sm">
            <Printer size={16} /> Print
          </button>
          {canCancel && (
            <button className="btn btn-danger btn-sm" onClick={handleCancel}>
              <XCircle size={16} /> Cancel
            </button>
          )}
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-grid">
          <div className="detail-field">
            <span className="detail-field-label">Scheduled Date</span>
            <span className="detail-field-value">
              {receipt.created_at ? new Date(receipt.created_at).toLocaleDateString() : '-'}
            </span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Source Location</span>
            <span className="detail-field-value">
              {receipt.items[0]?.destination_location_id != null
                ? `Location #${receipt.items[0].destination_location_id}`
                : '-'}
            </span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Receive From</span>
            <span className="detail-field-value">Vendor / external</span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Responsible</span>
            <span className="detail-field-value">Warehouse team</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3>Products</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((p, i) => (
              <tr key={i} style={{ cursor: 'default' }}>
                <td style={{ fontWeight: 500 }}>{p.product?.name ?? `#${p.product_id}`}</td>
                <td style={{ fontWeight: 600 }}>{p.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(receipt.status === 'draft' || receipt.status === 'ready') && (
          <button className="add-row-btn" onClick={handleAddProduct}>
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      <div className="detail-footer">Receipt operation #{receipt.id}</div>
    </div>
  );
}
