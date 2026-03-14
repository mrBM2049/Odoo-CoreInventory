import { useEffect, useState } from 'react';
import { useToast } from '../components/ui/Toast';
import { apiDelete, apiGet, apiPost } from '../lib/api';
import { Warehouse as WarehouseIcon, MapPin, Plus, Save, Trash2 } from 'lucide-react';

interface ApiWarehouse {
  id: number;
  name: string;
  address?: string | null;
}

interface ApiLocation {
  id: number;
  warehouse_id: number;
  name: string;
  description?: string | null;
}

interface UiWarehouse {
  id: number;
  name: string;
  shortCode: string;
  address: string;
}

interface UiLocation {
  id: number;
  name: string;
  shortCode: string;
  warehouseId: number;
}

export function Warehouses() {
  const { showToast } = useToast();
  const [warehouses, setWarehouses] = useState<UiWarehouse[]>([]);
  const [locations, setLocations] = useState<UiLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Warehouse form
  const [whName, setWhName] = useState('');
  const [whCode, setWhCode] = useState('');
  const [whAddress, setWhAddress] = useState('');

  // Location form
  const [locName, setLocName] = useState('');
  const [locCode, setLocCode] = useState('');
  const [locWarehouseId, setLocWarehouseId] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const deriveShortCode = (name: string) =>
      name
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 4);

    async function loadData() {
      try {
        setLoading(true);
        const [whRes, locRes] = await Promise.all([
          apiGet<ApiWarehouse[]>('/api/v1/warehouses'),
          apiGet<ApiLocation[]>('/api/v1/locations'),
        ]);

        if (cancelled) return;

        const mappedWarehouses: UiWarehouse[] = whRes.map((w) => ({
          id: w.id,
          name: w.name,
          shortCode: deriveShortCode(w.name),
          address: w.address ?? '',
        }));

        const mappedLocations: UiLocation[] = locRes.map((l) => ({
          id: l.id,
          name: l.name,
          shortCode: l.description ?? deriveShortCode(l.name),
          warehouseId: l.warehouse_id,
        }));

        setWarehouses(mappedWarehouses);
        setLocations(mappedLocations);
        setLocWarehouseId(mappedWarehouses[0]?.id.toString() ?? '');
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load warehouses',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveWarehouse = () => {
    if (!whName.trim() || !whCode.trim()) {
      showToast('Please fill in warehouse name and short code', 'error');
      return;
    }
    (async () => {
      try {
        const created = await apiPost<ApiWarehouse>('/api/v1/warehouses', {
          name: whName.trim(),
          address: whAddress.trim(),
        });
        const newWh: UiWarehouse = {
          id: created.id,
          name: created.name,
          shortCode: whCode.trim().toUpperCase(),
          address: created.address ?? '',
        };
        setWarehouses((prev) => [...prev, newWh]);
        setWhName('');
        setWhCode('');
        setWhAddress('');
        if (!locWarehouseId) {
          setLocWarehouseId(String(newWh.id));
        }
        showToast(`Warehouse "${newWh.name}" created successfully!`);
      } catch (err) {
        showToast(
          err instanceof Error
            ? err.message
            : 'Failed to create warehouse',
          'error',
        );
      }
    })();
  };

  const handleSaveLocation = () => {
    if (!locName.trim() || !locCode.trim() || !locWarehouseId) {
      showToast('Please fill in all location fields', 'error');
      return;
    }
    const warehouseIdNum = Number(locWarehouseId);
    if (Number.isNaN(warehouseIdNum)) {
      showToast('Invalid warehouse selected', 'error');
      return;
    }

    (async () => {
      try {
        const created = await apiPost<ApiLocation>('/api/v1/locations', {
          warehouse_id: warehouseIdNum,
          name: locName.trim(),
          description: locCode.trim(),
        });
        const newLoc: UiLocation = {
          id: created.id,
          name: created.name,
          shortCode: created.description ?? locCode.trim(),
          warehouseId: created.warehouse_id,
        };
        setLocations((prev) => [...prev, newLoc]);
        setLocName('');
        setLocCode('');
        showToast(`Location "${newLoc.name}" created successfully!`);
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : 'Failed to create location',
          'error',
        );
      }
    })();
  };

  const handleDeleteWarehouse = (id: number) => {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) return;

    (async () => {
      try {
        await apiDelete(`/api/v1/warehouses/${numericId}`);
        setWarehouses((prev) => prev.filter((w) => w.id !== numericId));
        setLocations((prev) => prev.filter((l) => l.warehouseId !== numericId));
        showToast('Warehouse deleted', 'warning');
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : 'Failed to delete warehouse',
          'error',
        );
      }
    })();
  };

  const handleDeleteLocation = (id: number) => {
    const numericId = Number(id);
    if (Number.isNaN(numericId)) return;

    (async () => {
      try {
        await apiDelete(`/api/v1/locations/${numericId}`);
        setLocations((prev) => prev.filter((l) => l.id !== numericId));
        showToast('Location deleted', 'warning');
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : 'Failed to delete location',
          'error',
        );
      }
    })();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Settings — Warehouses & Locations</h1>
      </div>

      {loading && (
        <div className="detail-section" style={{ marginBottom: 16 }}>
          <div className="skeleton-row skeleton" />
          <div className="skeleton-row skeleton" />
        </div>
      )}

      {!loading && error && (
        <div
          className="detail-section"
          style={{ marginBottom: 16, color: 'var(--error)' }}
        >
          {error}
        </div>
      )}

      {/* Warehouse Section */}
      <div className="settings-section">
        <h2><WarehouseIcon size={20} /> Warehouses</h2>

        <div style={{ display: 'grid', gap: 16, maxWidth: 600 }}>
          <div className="form-group">
            <label>Warehouse Name</label>
            <input
              type="text"
              placeholder="e.g. Main Warehouse"
              value={whName}
              onChange={e => setWhName(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Short Code</label>
              <input
                type="text"
                placeholder="e.g. WH"
                value={whCode}
                onChange={e => setWhCode(e.target.value)}
              />
            </div>
            <div />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              placeholder="Full address..."
              value={whAddress}
              onChange={e => setWhAddress(e.target.value)}
            />
          </div>
          <div>
            <button className="btn btn-primary btn-sm" onClick={handleSaveWarehouse}>
              <Plus size={16} /> Add Warehouse
            </button>
          </div>
        </div>

        {/* Existing warehouses */}
        {warehouses.length > 0 && (
          <div className="location-list" style={{ marginTop: 24 }}>
            {warehouses.map(wh => (
              <div key={wh.id} className="location-item">
                <div>
                  <div className="location-item-name">{wh.name}</div>
                  <div className="location-item-code">{wh.shortCode} — {wh.address || 'No address'}</div>
                </div>
                <button className="btn-ghost" onClick={() => handleDeleteWarehouse(wh.id)} title="Delete">
                  <Trash2 size={16} style={{ color: 'var(--error)' }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Locations Section */}
      <div className="settings-section">
        <h2><MapPin size={20} /> Locations</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20, marginTop: -12 }}>
          This holds the multiple locations of warehouses, rooms, racks, etc.
        </p>

        <div style={{ display: 'grid', gap: 16, maxWidth: 600 }}>
          <div className="form-group">
            <label>Location Name</label>
            <input
              type="text"
              placeholder="e.g. Rack A - Ground Floor"
              value={locName}
              onChange={e => setLocName(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Short Code</label>
              <input
                type="text"
                placeholder="e.g. WH/RACK-A"
                value={locCode}
                onChange={e => setLocCode(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Warehouse</label>
              <select value={locWarehouseId} onChange={e => setLocWarehouseId(e.target.value)}>
                {warehouses.map(wh => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <button className="btn btn-primary btn-sm" onClick={handleSaveLocation}>
              <Save size={16} /> Add Location
            </button>
          </div>
        </div>

        {/* Existing locations grouped by warehouse */}
        {warehouses.map(wh => {
          const whLocations = locations.filter(l => l.warehouseId === wh.id);
          if (whLocations.length === 0) return null;
          return (
            <div key={wh.id} style={{ marginTop: 24 }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 8 }}>{wh.name}</h4>
              <div className="location-list">
                {whLocations.map(loc => (
                  <div key={loc.id} className="location-item">
                    <div>
                      <div className="location-item-name">{loc.name}</div>
                      <div className="location-item-code">{loc.shortCode}</div>
                    </div>
                    <button className="btn-ghost" onClick={() => handleDeleteLocation(loc.id)} title="Delete">
                      <Trash2 size={16} style={{ color: 'var(--error)' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
