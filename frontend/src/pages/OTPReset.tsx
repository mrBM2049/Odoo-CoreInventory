import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AuthLayout } from '../components/AuthLayout';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export function OTPReset() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setError(error.message);
    } else {
      setStep('otp');
      setSuccess('OTP sent to your email! Please check your inbox.');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

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

    setStep('password');
    setSuccess('OTP verified! Set your new password.');
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess('Password has been successfully reset! You can now log in.');
      setStep('email');
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  const titles = {
    email: 'Reset Password',
    otp: 'Enter OTP',
    password: 'Set New Password',
  };

  const subtitles = {
    email: 'Enter your email to receive an OTP',
    otp: 'Check your email for the OTP code',
    password: 'Enter and confirm your new password',
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <Link to="/login" className="link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24, fontSize: '0.85rem' }}>
          <ArrowLeft size={16} />
          Back to Login
        </Link>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['email', 'otp', 'password'].map((s, i) => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= ['email', 'otp', 'password'].indexOf(step) ? 'var(--primary)' : 'var(--border)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        <h2>{titles[step]}</h2>
        <p>{subtitles[step]}</p>

        {error && <div className="alert-error">{error}</div>}
        {success && <div className="success-message"><CheckCircle2 size={18} /> {success}</div>}

        {step === 'email' && (
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
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <label>OTP Code</label>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.2rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleUpdatePassword}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
