'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Shield, Ban, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../../lib/api';

const ROLES = ['', 'user', 'admin', 'super_admin'];
const STATUSES = ['', 'active', 'blocked'];

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [actionLoading, setActionLoading] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        const params = { page };
        if (search) params.search = search;
        if (roleFilter) params.role = roleFilter;
        if (statusFilter) params.status = statusFilter;
        const res = await api.adminGetUsers(params);
        if (res.success) { setUsers(res.data); setPagination(res.pagination || {}); }
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, [page, roleFilter, statusFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
        setActionLoading(userId);
        await api.adminUpdateUser(userId, { status: newStatus });
        setActionLoading(null);
        fetchUsers();
    };

    const handleChangeRole = async (userId, newRole) => {
        setActionLoading(userId);
        await api.adminUpdateUser(userId, { role: newRole });
        setActionLoading(null);
        fetchUsers();
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="font-heading font-bold text-2xl text-[var(--text)]">User Management</h1>
                <p className="text-[var(--muted)] text-sm mt-1">{pagination.total || 0} total users</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
                <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or phone..."
                        className="input pl-10 py-2.5"
                    />
                </form>
                <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="input py-2.5 w-auto">
                    <option value="">All Roles</option>
                    {ROLES.filter(Boolean).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input py-2.5 w-auto">
                    <option value="">All Status</option>
                    {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="card overflow-hidden hover:transform-none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border)]">
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase tracking-wider py-3 px-4">User</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase tracking-wider py-3 px-4">Phone</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase tracking-wider py-3 px-4">Role</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase tracking-wider py-3 px-4">Status</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase tracking-wider py-3 px-4">Wallet</th>
                                <th className="text-left text-[var(--muted)] text-xs font-medium uppercase tracking-wider py-3 px-4">Joined</th>
                                <th className="text-right text-[var(--muted)] text-xs font-medium uppercase tracking-wider py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}><td colSpan={7} className="py-3 px-4"><div className="skeleton h-8 rounded-lg" /></td></tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-[var(--muted)]">No users found</td></tr>
                            ) : users.map(user => (
                                <tr key={user._id} className="border-b border-[var(--border)]/50 hover:bg-white/2 transition-all">
                                    <td className="py-3 px-4">
                                        <Link href={`/admin/users/${user._id}`} className="flex items-center gap-2.5 group">
                                            <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                                                <span className="text-brand-primary-light text-xs font-bold">{(user.name || 'U').charAt(0)}</span>
                                            </div>
                                            <span className="text-[var(--text)] text-sm font-medium group-hover:text-brand-primary-light transition-colors">
                                                {user.name || 'Unnamed'}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="py-3 px-4 text-[var(--muted)] text-sm">{user.phone}</td>
                                    <td className="py-3 px-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleChangeRole(user._id, e.target.value)}
                                            disabled={actionLoading === user._id}
                                            className="bg-transparent border border-[var(--border)] rounded-lg px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-brand-primary"
                                        >
                                            <option value="user" className="bg-dark-bg">user</option>
                                            <option value="admin" className="bg-dark-bg">admin</option>
                                            <option value="super_admin" className="bg-dark-bg">super_admin</option>
                                        </select>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${user.status === 'active' ? 'text-green-400 bg-green-400/10' :
                                                user.status === 'blocked' ? 'text-red-400 bg-red-400/10' :
                                                    'text-[var(--muted)] bg-gray-400/10'
                                            }`}>{user.status}</span>
                                    </td>
                                    <td className="py-3 px-4 text-[var(--text)] text-sm font-medium">₹{user.wallet_balance || 0}</td>
                                    <td className="py-3 px-4 text-[var(--muted)] text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 text-right">
                                        <button
                                            onClick={() => handleToggleStatus(user._id, user.status)}
                                            disabled={actionLoading === user._id}
                                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${user.status === 'active'
                                                    ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
                                                    : 'text-green-400 bg-green-500/10 hover:bg-green-500/20'
                                                }`}
                                        >
                                            {user.status === 'active' ? 'Suspend' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
                        <span className="text-[var(--muted)] text-xs">Page {pagination.page} of {pagination.pages}</span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--text)] hover:bg-white/5 disabled:opacity-30"
                            ><ChevronLeft className="w-4 h-4" /></button>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page >= pagination.pages}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--text)] hover:bg-white/5 disabled:opacity-30"
                            ><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
