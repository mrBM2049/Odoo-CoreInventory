import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Package, LayoutDashboard, ClipboardList, Truck, ArrowLeftRight,
  History, Box, Settings, LogOut, ChevronDown, ChevronRight, User
} from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [opsOpen, setOpsOpen] = useState(
    location.pathname.startsWith('/operations')
  );

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';
  const email = user?.email || '';

  const isOpsActive = location.pathname.startsWith('/operations');

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Package size={28} />
        <span>CoreInventory</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <button
          className={`sidebar-link ${isOpsActive && !opsOpen ? 'active' : ''}`}
          onClick={() => setOpsOpen(!opsOpen)}
          type="button"
        >
          <ClipboardList size={20} />
          <span style={{ flex: 1 }}>Operations</span>
          {opsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {opsOpen && (
          <>
            <NavLink to="/operations/receipts" className={({ isActive }) => `sidebar-link sidebar-sub-link ${isActive ? 'active' : ''}`}>
              <ArrowLeftRight size={16} />
              <span>Receipts</span>
            </NavLink>
            <NavLink to="/operations/deliveries" className={({ isActive }) => `sidebar-link sidebar-sub-link ${isActive ? 'active' : ''}`}>
              <Truck size={16} />
              <span>Delivery</span>
            </NavLink>
            <NavLink to="/operations/move-history" className={({ isActive }) => `sidebar-link sidebar-sub-link ${isActive ? 'active' : ''}`}>
              <History size={16} />
              <span>Move History</span>
            </NavLink>
          </>
        )}

        <NavLink to="/products" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Box size={20} />
          <span>Products</span>
        </NavLink>

        <NavLink to="/settings/warehouses" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">{displayName}</div>
            <div className="sidebar-profile-email">{email}</div>
          </div>
        </div>

        <button className="sidebar-link" onClick={() => navigate('/profile')} type="button">
          <User size={18} />
          <span>My Profile</span>
        </button>

        <button className="sidebar-link" onClick={handleLogout} type="button" style={{ color: 'var(--error)' }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
