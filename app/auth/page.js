'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Loader2, Phone } from 'lucide-react';
import { useStore } from '../../lib/store';
import api from '../../lib/api';
const BRAND = require('../../lib/brand');

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, setUser } = useStore();
  const [step, setStep] = useState('phone'); // phone | otp | success
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(Array(BRAND.auth.otpLength).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const otpRefs = useRef([]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) router.push('/');
  }, [isAuthenticated]);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  // Auto-verify when all digits entered
  useEffect(() => {
    if (step !== 'otp') return;
    if (!otp.every(d => d)) return;
    const code = otp.join('');
    if (code.length !== BRAND.auth.otpLength) return;
    handleVerify(code);
  }, [otp, step]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (phone.length < 10) return setError('Enter a valid 10-digit phone number');
    setLoading(true);
    setError('');
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
    const res = await api.requestOtp(formatted);
    setLoading(false);
    if (res.success) {
      setStep('otp');
      setTimer(res.retry_after || 30);
    } else {
      setError(res.message || 'Failed to send OTP');
    }
  };

  const handleVerify = async (code) => {
    setLoading(true);
    setError('');
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
    const res = await api.verifyOtp(formatted, code);
    setLoading(false);
    if (res.success) {
      api.setTokens(res.data.access_token, res.data.refresh_token);
      const userData = res.data.user;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setStep('success');
      const isAdmin = userData.role === 'admin' || userData.role === 'super_admin';
      setTimeout(() => {
        router.push(isAdmin ? '/admin' : '/');
      }, 1500);
    } else {
      setError(res.message || 'Invalid OTP');
      setOtp(Array(BRAND.auth.otpLength).fill(''));
      otpRefs.current[0]?.focus();
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < BRAND.auth.otpLength - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="glass rounded-2xl p-6 brand-glow animate-slide-up">

          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center">
                <span className="text-[var(--text)] font-heading font-bold text-lg">{BRAND.name.charAt(0)}</span>
              </div>
            </Link>
            <h1 className="font-heading font-bold text-xl text-[var(--text)]">
              {step === 'otp' ? 'Verify OTP' : step === 'success' ? 'Welcome!' : `Welcome to ${BRAND.name}`}
            </h1>
            {step === 'phone' && (
              <p className="text-[var(--muted)] text-sm mt-1">{BRAND.tagline}</p>
            )}
          </div>

          {/* Phone Step */}
          {step === 'phone' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--muted)] mb-1.5">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    className="input pl-12"
                    maxLength={10}
                    autoFocus
                  />
                </div>
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={phone.length < 10 || loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Send OTP
              </button>

              <p className="text-[var(--muted)] text-[11px] text-center">
                By continuing, you agree to {BRAND.name}&apos;s{' '}
                <Link href="/docs/terms-and-conditions" className="text-brand-primary-light hover:underline">Terms</Link>
                {' '}&amp;{' '}
                <Link href="/docs/privacy-policy" className="text-brand-primary-light hover:underline">Privacy Policy</Link>
              </p>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-[var(--muted)] text-sm">
                  Enter the {BRAND.auth.otpLength}-digit code sent to
                </p>
                <p className="text-[var(--text)] font-medium">+91 {phone}</p>
              </div>

              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-12 text-center text-lg font-bold input focus:border-brand-primary"
                    maxLength={1}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              {loading && (
                <div className="flex justify-center">
                  <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
                </div>
              )}

              <div className="flex flex-col items-center gap-2">
                {timer > 0 ? (
                  <p className="text-[var(--muted)] text-sm">Resend in {timer}s</p>
                ) : (
                  <button
                    onClick={(e) => { setOtp(Array(BRAND.auth.otpLength).fill('')); handleRequestOtp(e); }}
                    className="text-brand-primary-light text-sm hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
                <button
                  onClick={() => { setStep('phone'); setOtp(Array(BRAND.auth.otpLength).fill('')); setError(''); }}
                  className="text-[var(--muted)] text-sm hover:text-[var(--text)] transition-colors"
                >
                  Change Number
                </button>
              </div>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-brand-success mx-auto mb-3" />
              <h3 className="font-heading font-bold text-lg text-[var(--text)]">You&apos;re in!</h3>
              <p className="text-[var(--muted)] text-sm">Redirecting you to {BRAND.name}...</p>
            </div>
          )}
        </div>

        {/* Bottom link */}
        <p className="text-center text-[var(--muted)] text-xs mt-4">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">← Back to {BRAND.name}</Link>
        </p>
      </div>
    </div>
  );
}
