'use client';
import { useState, useEffect } from 'react';
import { Plus, X, Star, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../../lib/api';
const BRAND = require('../../../lib/brand');

export default function AdminBrandsPage() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', slug: '', category_id: '', logo_url: '', description: '', is_featured: false });
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchBrands = async () => {
        setLoading(true);
        const res = await api.adminGetBrands();
        if (res.success) setBrands(res.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchBrands();
        api.getCategories().then(res => { if (res.success) setCategories(res.data); });
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.name || !form.slug || !form.category_id) return;
        setSaving(true);
        const res = await api.adminCreateBrand(form);
        setSaving(false);
        if (res.success) {
            setForm({ name: '', slug: '', category_id: '', logo_url: '', description: '', is_featured: false });
            setShowForm(false);
            fetchBrands();
        }
    };

    const handleToggleFeatured = async (brand) => {
        setActionLoading(brand._id + '_feat');
        await api.adminUpdateBrand(brand._id, { is_featured: !brand.is_featured });
        setActionLoading(null);
        fetchBrands();
    };

    const handleToggleActive = async (brand) => {
        setActionLoading(brand._id + '_act');
        await api.adminUpdateBrand(brand._id, { is_active: brand.is_active === false ? true : false });
        setActionLoading(null);
        fetchBrands();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-heading font-bold text-2xl text-white">Brand Management</h1>
                    <p className="text-gray-500 text-sm mt-1">{brands.length} brands</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2">
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? 'Cancel' : 'Add Brand'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="card p-5 mb-6 hover:transform-none animate-slide-up">
                    <h3 className="font-heading font-semibold text-white mb-4">New Brand</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Name *</label>
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                                placeholder="Netflix" className="input py-2.5" required />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Slug *</label>
                            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                placeholder="netflix" className="input py-2.5" required />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Category *</label>
                            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input py-2.5" required>
                                <option value="">Select category</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Logo URL</label>
                            <input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                                placeholder="/images/brands/logo.png" className="input py-2.5" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-gray-400 text-xs font-medium mb-1 block">Description</label>
                            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Stream movies & TV shows" className="input py-2.5" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                            className="w-4 h-4 rounded" id="featured" />
                        <label htmlFor="featured" className="text-gray-400 text-sm">Featured brand</label>
                    </div>
                    <button type="submit" disabled={saving} className="btn-primary mt-4 px-6 py-2.5 text-sm">
                        {saving ? 'Creating...' : 'Create Brand'}
                    </button>
                </form>
            )}

            <div className="card overflow-hidden hover:transform-none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-dark-border">
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Brand</th>
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Category</th>
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Plans</th>
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Featured</th>
                                <th className="text-left text-gray-500 text-xs font-medium uppercase py-3 px-4">Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}><td colSpan={5} className="py-3 px-4"><div className="skeleton h-8 rounded-lg" /></td></tr>
                                ))
                            ) : brands.map(brand => (
                                <tr key={brand._id} className="border-b border-dark-border/50 hover:bg-white/2 transition-all">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                                                {brand.logo_url ? (
                                                    <img src={brand.logo_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-gray-500 text-xs font-bold">{brand.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <span className="text-white text-sm font-medium">{brand.name}</span>
                                                <p className="text-gray-600 text-xs">{brand.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-400 text-sm">{brand.category_id?.name || '—'}</td>
                                    <td className="py-3 px-4 text-white text-sm">{brand.plan_count}</td>
                                    <td className="py-3 px-4">
                                        <button onClick={() => handleToggleFeatured(brand)} disabled={actionLoading === brand._id + '_feat'}>
                                            {brand.is_featured ? <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> : <Star className="w-5 h-5 text-gray-600" />}
                                        </button>
                                    </td>
                                    <td className="py-3 px-4">
                                        <button onClick={() => handleToggleActive(brand)} disabled={actionLoading === brand._id + '_act'}>
                                            {brand.is_active !== false ? <ToggleRight className="w-6 h-6 text-green-400" /> : <ToggleLeft className="w-6 h-6 text-gray-600" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
