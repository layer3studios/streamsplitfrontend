'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, ArrowDownRight, AlertCircle } from 'lucide-react';
import api from '../../../lib/api';
const BRAND = require('../../../lib/brand');

const STATUS_COLORS = {
    requested: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    approved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    processing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    paid: 'bg-green-500/10 text-green-400 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function AdminWithdrawalsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [processing, setProcessing] = useState(null);
    const [rejectId, setRejectId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const load = async () => {
        setLoading(true);
        const res = await api.adminGetWithdrawals(filter);
        if (res.success) setRequests(res.data);
        setLoading(false);
    };

    useEffect(() => { load(); }, [filter]);

    const handleApprove = async (id) => {
        setProcessing(id);
        const res = await api.adminApproveWithdrawal(id);
        setProcessing(null);
        if (res.success) load();
    };

    const handleReject = async (id) => {
        setProcessing(id);
        const res = await api.adminRejectWithdrawal(id, rejectReason);
        setProcessing(null);
        setRejectId(null);
        setRejectReason('');
        if (res.success) load();
    };

    const statuses = ['', 'requested', 'approved', 'processing', 'paid', 'rejected'];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Withdrawal Requests</h1>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {statuses.map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${filter === s ? 'border-brand-primary bg-brand-primary/10 text-brand-primary-light' : 'border-[var(--border)] text-gray-500 hover:border-gray-500'}`}>
                        {s || 'All'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="skeleton h-40 rounded-2xl" />
            ) : requests.length === 0 ? (
                <div className="card p-8 text-center text-[var(--muted)]">
                    <ArrowDownRight className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No withdrawal requests{filter ? ` with status "${filter}"` : ''}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {requests.map(wr => (
                        <div key={wr._id} className="card p-4 hover:transform-none">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_COLORS[wr.status]}`}>
                                        {wr.status}
                                    </span>
                                    <span className="text-[var(--text)] font-heading font-bold text-lg">{BRAND.currency.symbol}{wr.amount}</span>
                                </div>
                                <span className="text-[var(--muted)] text-xs">{new Date(wr.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div className="text-sm text-[var(--muted)] space-y-0.5">
                                <p>Owner: <span className="text-[var(--text)]">{wr.owner_id?.name || 'Unknown'}</span> • {wr.owner_id?.phone}</p>
                                <p>Method: <span className="text-[var(--text)]">{wr.payout_method?.toUpperCase()}</span> • {wr.payout_details?.upi_id || 'Bank'}</p>
                                {wr.razorpay_payout_id && <p className="text-[var(--muted)]">Payout ID: {wr.razorpay_payout_id}</p>}
                                {wr.reject_reason && <p className="text-red-400">Rejected: {wr.reject_reason}</p>}
                            </div>

                            {wr.status === 'requested' && (
                                <div className="flex gap-2 mt-3">
                                    <button onClick={() => handleApprove(wr._id)} disabled={processing === wr._id}
                                        className="flex-1 py-2 text-xs rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 flex items-center justify-center gap-1 disabled:opacity-50">
                                        {processing === wr._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Approve & Payout
                                    </button>
                                    {rejectId === wr._id ? (
                                        <div className="flex-1 flex gap-1">
                                            <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                                                placeholder="Reason..." className="input py-1 text-xs flex-1" />
                                            <button onClick={() => handleReject(wr._id)} className="px-2 py-1 text-xs rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                                                Confirm
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setRejectId(wr._id)}
                                            className="flex-1 py-2 text-xs rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 flex items-center justify-center gap-1">
                                            <XCircle className="w-3 h-3" /> Reject
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
