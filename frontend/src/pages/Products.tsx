import { useEffect, useState } from 'react';
import { useToast } from '../components/ui/Toast';
import { apiGet, apiPut } from '../lib/api';
import { Plus, Search } from 'lucide-react';

interface ApiCategory {
  id: number;
  name: string;
  description?: string | null;
}

interface ApiProduct {
  id: number;
  name: string;
  sku: string;
  category_id?: number | null;
  unit_of_measure?: string | null;
  category?: ApiCategory | null;
}

interface ApiInventory {
  id: number;
  product_id: number;
  location_id: number;
  quantity: number;
}

interface ProductRow {
  id: number;
  name: string;
  sku: string;
  category: string;
  uom: string;
  onHand: number;
  freeToUse: number;
  primaryInventoryId?: number;
}

export function Products() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        const [products, inventory] = await Promise.all([
          apiGet<ApiProduct[]>('/api/v1/products'),
          apiGet<ApiInventory[]>('/api/v1/inventory'),
        ]);

        if (cancelled) return;

        const inventoryByProduct = new Map<
          number,
          { totalQty: number; primaryInventoryId?: number }
        >();

        for (const inv of inventory) {
          const entry =
            inventoryByProduct.get(inv.product_id) ?? {
              totalQty: 0,
              primaryInventoryId: inv.id,
            };
          entry.totalQty += inv.quantity;
          if (!entry.primaryInventoryId) {
            entry.primaryInventoryId = inv.id;
          }
          inventoryByProduct.set(inv.product_id, entry);
        }

        const mapped: ProductRow[] = products.map((p) => {
          const invInfo = inventoryByProduct.get(p.id) ?? {
            totalQty: 0,
            primaryInventoryId: undefined,
          };
          return {
            id: p.id,
            name: p.name,
            sku: p.sku,
            category: p.category?.name ?? '',
            uom: p.unit_of_measure ?? '',
            onHand: invInfo.totalQty,
            freeToUse: invInfo.totalQty,
            primaryInventoryId: invInfo.primaryInventoryId,
          };
        });

        setRows(mapped);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load products',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = rows.filter(p =>
    search === '' ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (product: ProductRow) => {
    setEditingId(String(product.id));
    setEditValue(String(product.onHand));
  };

  const saveEdit = async (productId: string) => {
    const newQty = parseInt(editValue, 10);
    if (isNaN(newQty) || newQty < 0) {
      showToast('Please enter a valid quantity', 'error');
      setEditingId(null);
      return;
    }

    const target = rows.find((p) => String(p.id) === productId);
    if (!target) {
      setEditingId(null);
      return;
    }

    if (!target.primaryInventoryId) {
      showToast(
        'No inventory record found for this product. Create stock via operations first.',
        'error',
      );
      setEditingId(null);
      return;
    }

    try {
      const diff = newQty - target.onHand;
      await apiPut<ApiInventory>(
        `/api/v1/inventory/${target.primaryInventoryId}`,
        { quantity: newQty },
      );

      if (diff !== 0) {
        showToast(
          `Stock adjusted: ${target.name} ${diff > 0 ? '+' : ''}${diff} units. Ledger entry created.`,
          diff > 0 ? 'success' : 'warning',
        );
      }

      setRows((prev) =>
        prev.map((p) =>
          p.id === target.id
            ? {
                ...p,
                onHand: newQty,
                freeToUse: newQty,
              }
            : p,
        ),
      );
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : 'Failed to update inventory quantity',
        'error',
      );
    } finally {
      setEditingId(null);
    }
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
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: 48 }}>
                  <div className="skeleton-row skeleton" />
                  <div className="skeleton-row skeleton" />
                  <div className="skeleton-row skeleton" />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: 'center',
                    padding: 48,
                    color: 'var(--error)',
                  }}
                >
                  {error}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: 'center',
                    padding: 48,
                    color: 'var(--text-muted)',
                  }}
                >
                  No products found
                </td>
              </tr>
            ) : (
              filtered.map((product) => {
                const isLow =
                  product.onHand > 0 &&
                  product.onHand <= LOW_STOCK_THRESHOLD;
                const isOut = product.onHand === 0;
                const rowId = String(product.id);

                return (
                  <tr
                    key={product.id}
                    className={isOut ? 'low-stock' : isLow ? 'low-stock' : ''}
                    style={{ cursor: 'default' }}
                  >
                    <td style={{ fontWeight: 600 }}>{product.name}</td>
                    <td
                      style={{
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                      }}
                    >
                      {product.sku}
                    </td>
                    <td>{product.category}</td>
                    <td>{product.uom || '-'}</td>
                    <td>
                      {editingId === rowId ? (
                        <input
                          className="editable-input"
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowId)}
                          onBlur={() => saveEdit(rowId)}
                          autoFocus
                          min={0}
                        />
                      ) : (
                        <span
                          className="editable-cell"
                          onClick={() => startEdit(product)}
                          title={
                            product.primaryInventoryId
                              ? 'Click to edit stock'
                              : 'Stock adjustments require an existing inventory record'
                          }
                          style={{
                            color: isOut
                              ? 'var(--error)'
                              : isLow
                              ? 'var(--warning)'
                              : 'var(--text-main)',
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
          <span>
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </span>
          <span style={{ fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--warning)' }}>●</span> Low stock &nbsp;
            <span style={{ color: 'var(--error)' }}>●</span> Out of stock
          </span>
        </div>
      </div>
    </div>
  );
}
