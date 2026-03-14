import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockReceipts, type Receipt, type OperationProduct } from '../data/mockData';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { ArrowLeft, CheckCircle2, Printer, XCircle, Plus } from 'lucide-react';

export function ReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const original = mockReceipts.find(r => r.id === id);
  const [receipt, setReceipt] = useState<Receipt | undefined>(original ? { ...original, products: original.products.map(p => ({ ...p })) } : undefined);

  if (!receipt) {
    return (
      <div className="empty-state">
        <h3>Receipt not found</h3>
        <p>The receipt you are looking for does not exist.</p>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => navigate('/operations/receipts')}>
          Back to Receipts
        </button>
      </div>
    );
  }

  const handleValidate = () => {
    if (receipt.status === 'draft') {
      setReceipt({ ...receipt, status: 'ready' });
      showToast(`${receipt.reference} moved to Ready`);
    } else if (receipt.status === 'ready') {
      setReceipt({ ...receipt, status: 'done' });
      showToast(`${receipt.reference} validated successfully! Stock updated.`, 'success');
      // Check for out-of-stock warnings
      receipt.products.forEach(p => {
        if (p.quantity <= 0) {
          showToast(`Warning: ${p.productName} is out of stock`, 'warning');
        }
      });
    }
  };

  const handleCancel = () => {
    if (receipt.status === 'draft' || receipt.status === 'ready') {
      setReceipt({ ...receipt, status: 'cancelled' });
      showToast(`${receipt.reference} has been cancelled`, 'error');
    }
  };

  const handleAddProduct = () => {
    const newProduct: OperationProduct = {
      productId: `new_${Date.now()}`,
      productName: 'New Product',
      sku: '',
      quantity: 0,
    };
    setReceipt({ ...receipt, products: [...receipt.products, newProduct] });
  };

  const canValidate = receipt.status === 'draft' || receipt.status === 'ready';
  const canCancel = receipt.status === 'draft' || receipt.status === 'ready';

  const statusSteps = ['Draft', 'Ready', 'Done'];
  const currentStepIndex = receipt.status === 'draft' ? 0 : receipt.status === 'ready' ? 1 : receipt.status === 'done' ? 2 : -1;

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/operations/receipts')}>
        <ArrowLeft size={18} /> Back to Receipts
      </button>

      <div className="detail-header" style={{ marginTop: 16 }}>
        <h1>{receipt.reference}</h1>
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
            <span className="detail-field-value">{new Date(receipt.scheduledDate).toLocaleDateString()}</span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Source Location</span>
            <span className="detail-field-value">{receipt.sourceLocation}</span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Receive From</span>
            <span className="detail-field-value">{receipt.from}</span>
          </div>
          <div className="detail-field">
            <span className="detail-field-label">Responsible</span>
            <span className="detail-field-value">{receipt.responsible}</span>
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
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {receipt.products.map((p, i) => (
              <tr key={i} style={{ cursor: 'default' }}>
                <td style={{ fontWeight: 500 }}>{p.productName}</td>
                <td style={{ color: 'var(--text-muted)' }}>{p.sku}</td>
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

      <div className="detail-footer">
        Jobs: {receipt.responsible}
      </div>
    </div>
  );
}
