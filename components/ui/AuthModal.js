'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowRight, CheckCircle, Loader2, Copy, Beaker } from 'lucide-react';
import { useStore } from '../../lib/store';
import api from '../../lib/api';
const BRAND = require('../../lib/brand');

const TEST_ACCOUNTS = [
  { name: 'Admin', phone: '9999999999', role: 'super_admin' },
  { name: 'Test A', phone: '9900000001', role: 'user' },
  { name: 'Test B', phone: '9900000002', role: 'user' },
  { name: 'Test C', phone: '9900000003', role: 'user' },
  { name: 'Test D', phone: '9900000004', role: 'user' },
  { name: 'Test E', phone: '9900000005', role: 'user' },
];

export default function AuthModal() {
  const router = useRouter();
  const { showAuthModal, setShowAuthModal, setUser } = useStore();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [devOtp, setDevOtp] = useState(null);
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const [copied, setCopied] = useState(false);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  // Auto-verify when all OTP digits entered
  useEffect(() => {
    if (!showAuthModal || step !== 'otp') return;
    if (!otp.every(d => d)) return;
    const code = otp.join('');
    if (code.length !== BRAND.auth.otpLength) return;

    (async () => {
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
          setShowAuthModal(false);
          resetState();
          if (isAdmin) router.push('/admin');
        }, 1500);
      } else {
        setError(res.message || 'Invalid OTP');
      }
    })();
  }, [otp, step, showAuthModal]);

  if (!showAuthModal) return null;

  const resetState = () => {
    setStep('phone');
    setPhone('');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setDevOtp(null);
    setShowTestAccounts(false);
  };

  const close = () => {
    setShowAuthModal(false);
    resetState();
  };

  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    if (phone.length < 10) return setError('Enter a valid phone number');
    setLoading(true);
    setError('');
    setDevOtp(null);
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
    const res = await api.requestOtp(formatted);
    setLoading(false);
    if (res.success) {
      setStep('otp');
      setTimer(res.retry_after || 30);
      // DEV: auto-fill OTP if dev_otp returned
      if (res.dev_otp) {
        setDevOtp(res.dev_otp);
        const digits = res.dev_otp.split('');
        setOtp(digits);
      }
    } else {
      setError(res.message || 'Failed to send OTP');
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const copyOtp = () => {
    if (devOtp) {
      navigator.clipboard.writeText(devOtp);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const selectTestAccount = (acct) => {
    setPhone(acct.phone);
    setShowTestAccounts(false);
    setError('');
  };

  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={close} />

      <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm p-8 animate-slide-up shadow-xl"
        style={{ boxShadow: 'var(--shadowSoft)' }}>

        <button onClick={close}
          className="absolute top-4 right-4 p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-all">
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--bg)] border border-[var(--border)] mb-4">
            <span className="font-serif text-2xl text-[var(--text)]">{BRAND.name.charAt(0)}</span>
          </div>
          <h2 className="font-serif text-2xl text-[var(--text)]">Welcome to {BRAND.name}</h2>
          <p className="text-caption mt-2">{BRAND.tagline}</p>
        </div>

        {/* ─── Phone Step ─── */}
        {step === 'phone' && (
          <form onSubmit={handleRequestOtp} className="space-y-3">
            <div>
              <label className="block text-meta mb-2">Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm">+91</span>
                <input type="tel" value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit number" className="input pl-14" maxLength={10} autoFocus />
              </div>
            </div>

            {error && <p className="text-[var(--danger)] text-xs">{error}</p>}

            <button type="submit" disabled={phone.length < 10 || loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Send OTP
            </button>

            <p className="text-meta text-center mt-4">
              By continuing, you agree to {BRAND.name}&apos;s Terms & Privacy Policy
            </p>

            {/* ─── DEV: Test Accounts Panel ─── */}
            {isDev && (
              <div className="pt-4 mt-2 border-t border-[var(--border)]">
                <button type="button" onClick={() => setShowTestAccounts(!showTestAccounts)}
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 hover:text-amber-800 transition-colors">
                  <Beaker className="w-3.5 h-3.5" />
                  {showTestAccounts ? 'Hide' : 'Show'} Test Accounts
                </button>

                {showTestAccounts && (
                  <div className="mt-4 space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
                    {TEST_ACCOUNTS.map(acct => (
                      <button key={acct.phone} type="button" onClick={() => selectTestAccount(acct)}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--border2)] transition-all text-left">
                        <div>
                          <span className="text-[var(--text)] text-sm font-medium">{acct.name}</span>
                          <span className="text-[var(--muted)] text-xs ml-3">+91 {acct.phone}</span>
                        </div>
                        <span className="badge text-[9px]">
                          {acct.role === 'super_admin' ? 'Admin' : 'User'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>
        )}

        {/* ─── OTP Step ─── */}
        {step === 'otp' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-caption mb-1">Enter the {BRAND.auth.otpLength}-digit code sent to</p>
              <p className="font-serif font-medium text-[var(--text)]">+91 {phone}</p>
            </div>

            {/* DEV OTP Banner */}
            {devOtp && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between"
                style={{ background: 'rgba(245, 158, 11, 0.06)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                <div className="flex items-center gap-3">
                  <Beaker className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-amber-800 text-[10px] font-bold uppercase tracking-wider mb-0.5">DEV OTP</p>
                    <p className="text-amber-900 font-mono font-bold text-lg tracking-[0.3em]">{devOtp}</p>
                  </div>
                </div>
                <button onClick={copyOtp}
                  className="text-amber-600 hover:text-amber-800 transition-colors p-2 rounded-lg hover:bg-amber-100">
                  {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            )}

            <div className="flex justify-center gap-2">
              {otp.map((digit, i) => (
                <input key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text" inputMode="numeric" value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-11 h-13 text-center text-xl font-serif font-bold input rounded-xl"
                  maxLength={1} autoFocus={i === 0} />
              ))}
            </div>

            {error && <p className="text-[var(--danger)] text-xs text-center">{error}</p>}

            {loading && (
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
              </div>
            )}

            <div className="text-center pt-2">
              {timer > 0 ? (
                <p className="text-caption">Resend in {timer}s</p>
              ) : (
                <button onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setDevOtp(null); }}
                  className="text-sm font-medium text-[var(--text)] hover:underline">
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─── Success ─── */}
        {step === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="w-14 h-14 text-[var(--success)] mx-auto mb-5" />
            <h3 className="font-serif text-2xl text-[var(--text)] mb-2">Welcome!</h3>
            <p className="text-caption">You&apos;re now signed in to {BRAND.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
