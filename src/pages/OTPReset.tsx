import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AuthLayout } from '../components/AuthLayout';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export function OTPReset() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Request OTP for password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      setError(error.message);
    } else {
      setStep('verify');
      setSuccess('OTP sent to your email! Please check your inbox.');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Verify OTP first to get session
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery'
    });
    
    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }
    
    // If successful, update the password using the user's newly verified session
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess('Password has been successfully reset! You can now log in.');
      setStep('request'); // allow them to reset again or go back to login via top navigation
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <Link to="/login" className="link flex-between" style={{ display: 'inline-flex', marginBottom: '24px', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} style={{ marginRight: '6px' }} />
          Back to Login
        </Link>
        
        <h2>{step === 'request' ? 'Reset Password' : 'Enter OTP'}</h2>
        <p>{step === 'request' ? 'Enter your email to receive an OTP' : 'Check your email for the OTP and enter a new password'}</p>

        {error && <div className="alert-error">{error}</div>}
        {success && <div className="success-message"><CheckCircle2 size={18} /> {success}</div>}

        {step === 'request' ? (
          <form onSubmit={handleRequestOTP}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <label>OTP Code</label>
              <input 
                type="text" 
                placeholder="123456" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
