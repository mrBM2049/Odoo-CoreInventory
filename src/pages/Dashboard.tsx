import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, LayoutDashboard, Package, Users, Settings } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check active session on mount
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login'); // Protected route logic
      } else {
        setUser(session.user);
      }
    };
    
    checkUser();

    // Set up a listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-page)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading session...</p>
      </div>
    );
  }

  // Display name correctly depending heavily on the OAuth provider or normal Sign Up
  const displayName = user.user_metadata?.full_name || user.email;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
      {/* Sidebar Layout */}
      <aside style={{ width: '280px', backgroundColor: 'var(--bg-card)', borderRight: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)', marginBottom: '40px', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
          <Package size={32} />
          Inventory
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', textAlign: 'left' }}>
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: 'transparent', color: 'var(--text-muted)', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
            <Package size={20} />
            Products
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: 'transparent', color: 'var(--text-muted)', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
            <Users size={20} />
            Customers
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: 'transparent', color: 'var(--text-muted)', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
            <Settings size={20} />
            Settings
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', textAlign: 'left', marginTop: 'auto', transition: 'all 0.2s' }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main Content Pane */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)', marginBottom: '8px' }}>Dashboard Overview</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Welcome back, {displayName}!</p>
          </div>
          
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
             {displayName?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Dashboard Financial Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Profit</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>$9,458.78</p>
            <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem' }}>+35% vs Last Month</span>
          </div>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory Costs</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>$48,988.78</p>
            <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem' }}>+12% vs Last Month</span>
          </div>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Expenses</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>$8,980.09</p>
            <span style={{ color: 'var(--error)', fontWeight: 600, fontSize: '0.875rem' }}>-5% vs Last Month</span>
          </div>
        </div>
      </main>
    </div>
  );
}
