import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { AppLayout } from './components/layout/AppLayout';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { OTPReset } from './pages/OTPReset';
import { Dashboard } from './pages/Dashboard';
import { Receipts } from './pages/Receipts';
import { ReceiptDetail } from './pages/ReceiptDetail';
import { Deliveries } from './pages/Deliveries';
import { DeliveryDetail } from './pages/DeliveryDetail';
import { MoveHistory } from './pages/MoveHistory';
import { Products } from './pages/Products';
import { Warehouses } from './pages/Warehouses';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Auth routes */}
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<OTPReset />} />

            {/* Protected routes with AppLayout */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/operations/receipts" element={<Receipts />} />
              <Route path="/operations/receipts/:id" element={<ReceiptDetail />} />
              <Route path="/operations/deliveries" element={<Deliveries />} />
              <Route path="/operations/deliveries/:id" element={<DeliveryDetail />} />
              <Route path="/operations/move-history" element={<MoveHistory />} />
              <Route path="/products" element={<Products />} />
              <Route path="/settings/warehouses" element={<Warehouses />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
