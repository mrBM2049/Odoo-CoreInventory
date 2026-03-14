import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockDeliveries, mockProducts, type Delivery, type OperationProduct } from '../data/mockData';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { ArrowLeft, CheckCircle2, Printer, XCircle, Plus } from 'lucide-react';

export function DeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const original = mockDeliveries.find(d => d.id === id);
  const [delivery, setDelivery] = useState<Delivery | undefined>(
    original ? { ...original, products: original.products.map(p => ({ ...p })) } : undefined
  );

  if (!delivery) {
    return (
      <div className="empty-state">
        <h3>Delivery not found</h3>
        <p>The delivery order you are looking for does not exist.</p>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => navigate('/operations/deliveries')}>
          Back to Deliveries
        </button>
      </div>
    );
  }

  const handleValidate = () => {
    // Check for insufficient stock
    const insufficientProducts = delivery.products.filter(dp => {
      const product = mockProducts.find(p => p.id === dp.productId);
      return product && product.onHand < dp.quantity;
    });

    if (insufficientProducts.length > 0) {
      insufficientProducts.forEach(p => {
        showToast(`Insufficient stock for ${p.productName}`, 'warning');
      });
    }

    if (delivery.status === 'draft') {
      setDelivery({ ...delivery, status: 'waiting' });
      showToast(`${delivery.reference} moved to Waiting`);
    } else if (delivery.status === 'waiting') {
      setDelivery({ ...delivery, status: 'ready' });
      showToast(`${delivery.reference} is now Ready for delivery`);
    } else if (delivery.status === 'ready') {
      const updatedProducts = delivery.products.map(p => ({ ...p, doneQty: p.quantity }));
      setDelivery({ ...delivery, status: 'done', products: updatedProducts });
      showToast(`${delivery.reference} delivered successfully! Stock updated.`, 'success');
    }
  };

  const handleCancel = () => {
    if (delivery.status !== 'done') {
      setDelivery({ ...delivery, status: 'cancelled' });
      showToast(`${delivery.reference} has been cancelled`, 'error');
    }
  };

  const handleAddProduct = () => {
    const newProduct: OperationProduct = {
      productId: `new_${Date.now()}`,
      productName: 'New Product',
      sku: '',
      quantity: 0,
      doneQty: 0,
    };
    setDelivery({ ...delivery, products: [...delivery.products, newProduct] });
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
        <h1>{delivery.reference}</h1>
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
            <span className="detail-field-value">{new Date(delivery.scheduledDate).toLocaleDateString()}</span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Delivery Type</span>
            <span className="detail-field-value">{delivery.deliveryType}</span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Source Location</span>
            <span className="detail-field-value">{delivery.sourceLocation}</span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Responsible</span>
            <span className="detail-field-value">{delivery.responsible}</span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Deliver To</span>
            <span className="detail-field-value">{delivery.to}</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3>Products</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Demand Qty</th>
              <th>Done Qty</th>
            </tr>
          </thead>
          <tbody>
            {delivery.products.map((p, i) => (
              <tr key={i} style={{ cursor: 'default' }}>
                <td style={{ fontWeight: 500 }}>{p.productName}</td>
                <td style={{ color: 'var(--text-muted)' }}>{p.sku}</td>
                <td>{p.quantity}</td>
                <td style={{ fontWeight: 600, color: p.doneQty === p.quantity ? 'var(--success)' : 'var(--text-main)' }}>
                  {p.doneQty ?? 0}
                </td>
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
