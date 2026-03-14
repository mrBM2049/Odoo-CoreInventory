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

export function DeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [delivery, setDelivery] = useState<Operation | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const numericId = id ? Number(id) : NaN;
    if (!id || Number.isNaN(numericId)) {
      setError('Invalid delivery ID');
      setLoading(false);
      return;
    }

    async function loadDelivery() {
      try {
        setLoading(true);
        const data = await apiGet<Operation>(`/api/v1/operations/${numericId}`);
        if (!cancelled) {
          setDelivery(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load delivery');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDelivery();
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

  if (error || !delivery) {
    return (
      <div className="empty-state">
        <h3>Delivery not found</h3>
        <p>{error || 'The delivery order you are looking for does not exist.'}</p>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => navigate('/operations/deliveries')}>
          Back to Deliveries
        </button>
      </div>
    );
  }

  const handleValidate = () => {
    if (!delivery) return;
    const numericId = Number(delivery.id);
    if (Number.isNaN(numericId)) return;

    (async () => {
      try {
        const updated = await apiPost<Operation>(`/api/v1/operations/${numericId}/validate`, {});
        setDelivery(updated);
        showToast(`Delivery #${updated.id} delivered successfully! Stock updated.`, 'success');
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : 'Failed to validate delivery',
          'error',
        );
      }
    })();
  };

  const handleCancel = () => {
    if (!delivery) return;
    const numericId = Number(delivery.id);
    if (Number.isNaN(numericId)) return;

    (async () => {
      try {
        const updated = await apiPost<Operation>(`/api/v1/operations/${numericId}/cancel`, {});
        setDelivery(updated);
        showToast(`Delivery #${updated.id} has been cancelled`, 'error');
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : 'Failed to cancel delivery',
          'error',
        );
      }
    })();
  };

  const handleAddProduct = () => {
    showToast('Adding products to existing operations is not yet supported.', 'warning');
  };

  const canValidate = delivery.status !== 'done' && delivery.status !== 'cancelled';
  const canCancel = delivery.status !== 'done' && delivery.status !== 'cancelled';

  const statusSteps = ['Draft', 'Waiting', 'Ready', 'Done'];
  const stepMap: Record<string, number> = { draft: 0, waiting: 1, ready: 2, done: 3 };
  const currentStepIndex = stepMap[delivery.status] ?? -1;

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/operations/deliveries')}>
        <ArrowLeft size={18} /> Back to Deliveries
      </button>

      <div className="detail-header" style={{ marginTop: 16 }}>
        <h1>Delivery #{delivery.id}</h1>
        <Badge status={delivery.status} />

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
              {delivery.created_at ? new Date(delivery.created_at).toLocaleDateString() : '-'}
            </span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Delivery Type</span>
            <span className="detail-field-value">
              {delivery.type === 'delivery' ? 'Standard Delivery' : delivery.type}
            </span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Source Location</span>
            <span className="detail-field-value">
              {delivery.items[0]?.source_location_id != null
                ? `Location #${delivery.items[0].source_location_id}`
                : '-'}
            </span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Responsible</span>
            <span className="detail-field-value">Warehouse team</span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Deliver To</span>
            <span className="detail-field-value">Customer</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3>Products</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Demand Qty</th>
            </tr>
          </thead>
          <tbody>
            {delivery.items.map((p, i) => (
              <tr key={i} style={{ cursor: 'default' }}>
                <td style={{ fontWeight: 500 }}>{p.product?.name ?? `#${p.product_id}`}</td>
                <td>{p.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {canValidate && (
          <button className="add-row-btn" onClick={handleAddProduct}>
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      <div className="detail-footer">
        Draft: Initial stage waiting for the sale of stock product to be in Ready. Ready: for delivery. Done: Delivered.
      </div>
    </div>
  );
}
