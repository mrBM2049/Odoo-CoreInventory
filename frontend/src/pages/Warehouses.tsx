import { useState } from 'react';
import { mockWarehouses, mockLocations, type Warehouse, type Location } from '../data/mockData';
import { useToast } from '../components/ui/Toast';
import { Warehouse as WarehouseIcon, MapPin, Plus, Save, Trash2 } from 'lucide-react';

export function Warehouses() {
  const { showToast } = useToast();
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses.map(w => ({ ...w })));
  const [locations, setLocations] = useState<Location[]>(mockLocations.map(l => ({ ...l })));

  // Warehouse form
  const [whName, setWhName] = useState('');
  const [whCode, setWhCode] = useState('');
  const [whAddress, setWhAddress] = useState('');

  // Location form
  const [locName, setLocName] = useState('');
  const [locCode, setLocCode] = useState('');
  const [locWarehouseId, setLocWarehouseId] = useState(warehouses[0]?.id || '');

  const handleSaveWarehouse = () => {
    if (!whName.trim() || !whCode.trim()) {
      showToast('Please fill in warehouse name and short code', 'error');
      return;
    }
    const newWh: Warehouse = {
      id: `wh_${Date.now()}`,
      name: whName.trim(),
      shortCode: whCode.trim().toUpperCase(),
      address: whAddress.trim(),
    };
    setWarehouses(prev => [...prev, newWh]);
    setWhName('');
    setWhCode('');
    setWhAddress('');
    showToast(`Warehouse "${newWh.name}" created successfully!`);
  };

  const handleSaveLocation = () => {
    if (!locName.trim() || !locCode.trim() || !locWarehouseId) {
      showToast('Please fill in all location fields', 'error');
      return;
    }
    const newLoc: Location = {
      id: `loc_${Date.now()}`,
      name: locName.trim(),
      shortCode: locCode.trim(),
      warehouseId: locWarehouseId,
    };
    setLocations(prev => [...prev, newLoc]);
    setLocName('');
    setLocCode('');
    showToast(`Location "${newLoc.name}" created successfully!`);
  };

  const handleDeleteWarehouse = (id: string) => {
    setWarehouses(prev => prev.filter(w => w.id !== id));
    setLocations(prev => prev.filter(l => l.warehouseId !== id));
    showToast('Warehouse deleted', 'warning');
  };

  const handleDeleteLocation = (id: string) => {
    setLocations(prev => prev.filter(l => l.id !== id));
    showToast('Location deleted', 'warning');
  };

  return (
    <div>
      <div className="page-header">
        <h1>Settings — Warehouses & Locations</h1>
      </div>

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
