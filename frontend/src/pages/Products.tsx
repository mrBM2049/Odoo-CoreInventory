import { useState } from 'react';
import { mockProducts, type Product } from '../data/mockData';
import { useToast } from '../components/ui/Toast';
import { Plus, Search } from 'lucide-react';

export function Products() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>(mockProducts.map(p => ({ ...p })));
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const filtered = products.filter(p =>
    search === '' ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditValue(String(product.onHand));
  };

  const saveEdit = (productId: string) => {
    const newQty = parseInt(editValue, 10);
    if (isNaN(newQty) || newQty < 0) {
      showToast('Please enter a valid quantity', 'error');
      setEditingId(null);
      return;
    }

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const diff = newQty - p.onHand;
        if (diff !== 0) {
          showToast(
            `Stock adjusted: ${p.name} ${diff > 0 ? '+' : ''}${diff} units. Ledger entry created.`,
            diff > 0 ? 'success' : 'warning'
          );
        }
        return { ...p, onHand: newQty, freeToUse: Math.max(0, newQty - (p.onHand - p.freeToUse)) };
      }
      return p;
    }));
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, productId: string) => {
    if (e.key === 'Enter') saveEdit(productId);
    if (e.key === 'Escape') setEditingId(null);
  };

  const LOW_STOCK_THRESHOLD = 5;

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <div className="page-header-actions">
          <div className="search-bar">
            <Search size={16} className="search-bar-icon" />
            <input
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm">
            <Plus size={16} /> Create Product
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table products-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Per Unit Cost</th>
              <th>On Hand</th>
              <th>Free to Use</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>No products found</td></tr>
            ) : (
              filtered.map(product => {
                const isLow = product.onHand > 0 && product.onHand <= LOW_STOCK_THRESHOLD;
                const isOut = product.onHand === 0;
                return (
                  <tr key={product.id} className={isOut ? 'low-stock' : isLow ? 'low-stock' : ''} style={{ cursor: 'default' }}>
                    <td style={{ fontWeight: 600 }}>{product.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.85rem' }}>{product.sku}</td>
                    <td>{product.category}</td>
                    <td>${product.perUnitCost.toFixed(2)}</td>
                    <td>
                      {editingId === product.id ? (
                        <input
                          className="editable-input"
                          type="number"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => handleKeyDown(e, product.id)}
                          onBlur={() => saveEdit(product.id)}
                          autoFocus
                          min={0}
                        />
                      ) : (
                        <span
                          className="editable-cell"
                          onClick={() => startEdit(product)}
                          title="Click to edit stock"
                          style={{
                            color: isOut ? 'var(--error)' : isLow ? 'var(--warning)' : 'var(--text-main)',
                            fontWeight: 600,
                          }}
                        >
                          {product.onHand}
                        </span>
                      )}
                    </td>
                    <td>{product.freeToUse}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="table-footer">
          <span>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
          <span style={{ fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--warning)' }}>●</span> Low stock &nbsp;
            <span style={{ color: 'var(--error)' }}>●</span> Out of stock
          </span>
        </div>
      </div>
    </div>
  );
}
