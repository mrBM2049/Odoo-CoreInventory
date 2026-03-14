import type { ReactNode } from 'react';
import { Package } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-container">
      <div className="auth-brand">
        <h1>
          <Package size={44} />
          CoreInventory
        </h1>
        <p>The organized system for storing and tracking products, ensuring efficiency and reducing waste.</p>
      </div>
      <div className="auth-form-wrapper">
        {children}
      </div>
    </div>
  );
}
