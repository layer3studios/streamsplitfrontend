'use client';
import { useState } from 'react';
import { X, Banknote, Smartphone } from 'lucide-react';
import { Divider } from '../ui/Layout';
import { formatCurrency } from '../../lib/utils';
import api from '../../lib/api';

/**
 * WithdrawModal — shared for wallet & earnings withdrawals.
 * Props: isOpen, onClose, source ('wallet'|'earnings'), maxAmount, minAmount, onSuccess
 */
export default function WithdrawModal({ isOpen, onClose, source = 'earnings', maxAmount = 0, minAmount = 100, onSuccess }) {
    const [method, setMethod] = useState('upi');
    const [amount, setAmount] = useState('');
    const [upiId, setUpiId] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const amt = parseFloat(amount) || 0;
    const valid = amt >= minAmount && amt <= maxAmount &&
        (method === 'upi' ? upiId.includes('@') : (accountNumber.length >= 8 && ifsc.length >= 11));

    const handleSubmit = async () => {
        if (!valid) return;
        setLoading(true);
        setError('');

        const payout_details = method === 'upi'
            ? { upi_id: upiId.trim() }
            : { account_number: accountNumber.trim(), ifsc_code: ifsc.trim().toUpperCase(), account_holder: bankName.trim() };

        const res = await api.requestWithdrawal({ source, amount: amt, payout_method: method, payout_details });
        setLoading(false);

        if (res.success) {
            setSuccess(true);
            onSuccess?.();
        } else {
            setError(res.message || 'Failed to submit withdrawal request');
        }
    };

    const reset = () => {
        setAmount(''); setUpiId(''); setBankName(''); setAccountNumber(''); setIfsc('');
        setError(''); setSuccess(false); setMethod('upi');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={reset}>
            <div className="paper-card p-0 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 pb-0">
                    <div>
                        <p className="text-meta">WITHDRAW</p>
                        <p className="text-xs text-[var(--muted)] mt-1">
                            From {source === 'wallet' ? 'Wallet' : 'Earnings'} · Available: {formatCurrency(maxAmount)}
                        </p>
                    </div>
                    <button onClick={reset} className="p-1.5 rounded hover:bg-[var(--surface)]"><X className="w-4 h-4" /></button>
                </div>

                <div className="p-5 space-y-4">
                    {success ? (
                        <div className="text-center py-6">
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                                <Banknote className="w-6 h-6 text-[var(--success)]" />
                            </div>
                            <p className="text-sm font-medium text-[var(--text)]">Withdrawal Requested!</p>
                            <p className="text-xs text-[var(--muted)] mt-1">
                                {formatCurrency(amt)} will be sent to your {method === 'upi' ? 'UPI' : 'bank account'}
                            </p>
                            <p className="text-[10px] text-[var(--muted)] mt-3">Usually processed within 24-48 hours</p>
                            <button onClick={reset} className="btn-primary text-xs mt-4 w-full">Done</button>
                        </div>
                    ) : (
                        <>
                            {/* Method toggle */}
                            <div className="flex border border-[var(--border)] rounded overflow-hidden">
                                <button
                                    onClick={() => setMethod('upi')}
                                    className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${method === 'upi' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)] hover:bg-[var(--surface)]'}`}
                                >
                                    <Smartphone className="w-3.5 h-3.5" /> UPI
                                </button>
                                <button
                                    onClick={() => setMethod('bank')}
                                    className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${method === 'bank' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)] hover:bg-[var(--surface)]'}`}
                                >
                                    <Banknote className="w-3.5 h-3.5" /> Bank Transfer
                                </button>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Amount</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-[var(--muted)]">₹</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder={`Min ${minAmount}`}
                                        className="input flex-1"
                                        min={minAmount}
                                        max={maxAmount}
                                    />
                                    <button onClick={() => setAmount(String(maxAmount))} className="text-[10px] text-[var(--accent)] hover:underline shrink-0">MAX</button>
                                </div>
                                {amt > 0 && amt < minAmount && <p className="text-[10px] text-[var(--danger)] mt-1">Minimum {formatCurrency(minAmount)}</p>}
                                {amt > maxAmount && <p className="text-[10px] text-[var(--danger)] mt-1">Exceeds available balance</p>}
                            </div>

                            <Divider />

                            {/* Payout details */}
                            {method === 'upi' ? (
                                <div>
                                    <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider">UPI ID</label>
                                    <input
                                        type="text"
                                        value={upiId}
                                        onChange={e => setUpiId(e.target.value)}
                                        placeholder="name@paytm"
                                        className="input w-full mt-1"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Account Holder Name</label>
                                        <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Full name" className="input w-full mt-1" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Account Number</label>
                                        <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="1234567890" className="input w-full mt-1" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider">IFSC Code</label>
                                        <input type="text" value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} placeholder="SBIN0001234" className="input w-full mt-1" maxLength={11} />
                                    </div>
                                </div>
                            )}

                            {error && <p className="text-xs text-[var(--danger)] bg-red-50 rounded p-2">{error}</p>}

                            <button onClick={handleSubmit} disabled={!valid || loading} className="btn-primary text-xs w-full">
                                {loading ? 'Submitting…' : `Withdraw ${amt > 0 ? formatCurrency(amt) : ''}`}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
