import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const NAV = [
    { to: '/admin',             label: '📊 Pregled'    },
    { to: '/admin/ads',         label: '🚗 Oglasi'     },
    { to: '/admin/users',       label: '👥 Korisnici'  },
    { to: '/admin/reports',     label: '🚩 Prijave'    },
    { to: '/admin/makes',       label: '🏭 Marke'      },
    { to: '/admin/models',      label: '🔧 Modeli'     },
    { to: '/admin/categories',  label: '📂 Kategorije' },
    { to: '/admin/cities',      label: '📍 Gradovi'    },
    { to: '/admin/packages',    label: '📦 Paketi'     },
];

export default function AdminPanel() {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            <aside className="w-56 bg-[#12142D] flex-shrink-0 min-h-screen">
                <div className="p-5 border-b border-[#1B2B5A]">
                    <div className="bg-[#FF0026] px-2 py-0.5 rounded-lg inline-block">
                        <span className="text-white font-black text-sm">VOZIME</span>
                    </div>
                    <p className="text-[#6674A3] text-xs mt-1">Admin panel</p>
                </div>
                <nav className="p-3 space-y-1">
                    {NAV.map(item => (
                        <NavLink key={item.to} to={item.to} end={item.to === '/admin'}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition ${
                                    isActive
                                        ? 'bg-[#FF0026] text-white font-semibold'
                                        : 'text-[#6674A3] hover:text-white hover:bg-[#1B2B5A]'
                                }`
                            }>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <main className="flex-1 p-6 overflow-auto">
                <Routes>
                    <Route index          element={<AdminOverview />} />
                    <Route path="ads"        element={<AdminAds />} />
                    <Route path="users"      element={<AdminUsers />} />
                    <Route path="reports"    element={<AdminReports />} />
                    <Route path="makes"      element={<AdminMakes />} />
                    <Route path="models"     element={<AdminModels />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="cities"     element={<AdminCities />} />
                    <Route path="packages"   element={<AdminPackages />} />
                </Routes>
            </main>
        </div>
    );
}

// ═══════════════════════════════════════
// PREGLED
// ═══════════════════════════════════════

function AdminOverview() {
    const { data: stats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => axios.get('/admin/stats').then(r => r.data)
    });

    const cards = [
        { label: 'Ukupno oglasa',  value: stats?.total_ads,     color: 'blue'   },
        { label: 'Na čekanju',     value: stats?.pending_ads,   color: 'yellow' },
        { label: 'Korisnika',      value: stats?.total_users,   color: 'green'  },
        { label: 'Prijava',        value: stats?.pending_reports, color: 'red'  },
    ];

    return (
        <div>
            <h1 className="text-xl font-black text-[#12142D] mb-6">Pregled sistema</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map(c => (
                    <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="text-2xl font-black text-[#12142D]">{c.value ?? '—'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
                    </div>
                ))}
            </div>
            <PendingAds />
        </div>
    );
}

function PendingAds() {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['pending-ads'],
        queryFn: () => axios.get('/admin/ads?status=pending&per_page=10').then(r => r.data)
    });

    const setStatus = useMutation({
        mutationFn: ({ id, status }) => axios.put(`/admin/ads/${id}/status`, { status }),
        onSuccess: (_, { status }) => {
            toast.success(status === 'active' ? 'Oglas odobren!' : 'Oglas odbijen.');
            qc.invalidateQueries({ queryKey: ['pending-ads'] });
            qc.invalidateQueries({ queryKey: ['admin-stats'] });
        }
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-black text-[#12142D]">Oglasi na čekanju</h2>
                <span className="bg-[#FFEA00] text-[#12142D] text-xs font-bold px-2 py-0.5 rounded-full">
                    {data?.total ?? 0}
                </span>
            </div>
            {isLoading && <div className="p-8 text-center text-gray-400">Učitavanje...</div>}
            {data?.data?.map(ad => (
                <div key={ad.id} className="flex items-center gap-4 px-5 py-3 border-b last:border-0 hover:bg-gray-50">
                    <img
                        src={ad.primary_image ? `http://localhost:8000/storage/${ad.primary_image.path}` : '/placeholder-car.jpg'}
                        className="w-14 h-10 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                        alt=""
                    />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#12142D] truncate">{ad.title}</p>
                        <p className="text-xs text-gray-400">{ad.user?.name} · {ad.city?.name} · {Number(ad.price).toLocaleString()} €</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => setStatus.mutate({ id: ad.id, status: 'active' })}
                            className="text-xs px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition">
                            ✓ Odobri
                        </button>
                        <button onClick={() => setStatus.mutate({ id: ad.id, status: 'rejected' })}
                            className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#FF0026] rounded-lg font-semibold transition">
                            ✕ Odbij
                        </button>
                        <a href={`/ads/${ad.slug}`} target="_blank" rel="noreferrer"
                            className="text-xs px-3 py-1.5 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg transition">
                            👁
                        </a>
                    </div>
                </div>
            ))}
            {!isLoading && !data?.data?.length && (
                <div className="p-8 text-center text-gray-400">
                    <div className="text-3xl mb-2">✅</div>
                    Nema oglasa na čekanju
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════
// OGLASI
// ═══════════════════════════════════════

function AdminAds() {
    const qc = useQueryClient();
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-ads', status, page],
        queryFn: () => axios.get(`/admin/ads?status=${status}&page=${page}&per_page=15`).then(r => r.data)
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => axios.put(`/admin/ads/${id}/status`, { status }),
        onSuccess: () => { toast.success('Status ažuriran.'); qc.invalidateQueries({ queryKey: ['admin-ads'] }); }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/admin/ads/${id}`),
        onSuccess: () => { toast.success('Oglas obrisan.'); qc.invalidateQueries({ queryKey: ['admin-ads'] }); }
    });

    const statusColors = {
        active: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700',
        rejected: 'bg-red-100 text-red-600', sold: 'bg-blue-100 text-blue-700',
        inactive: 'bg-gray-100 text-gray-500', expired: 'bg-orange-100 text-orange-600',
    };

    const statusLabels = {
        active: 'Aktivan', pending: 'Na čekanju', rejected: 'Odbijen',
        sold: 'Prodat', inactive: 'Neaktivan', expired: 'Istekao',
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-xl font-black text-[#12142D]">Upravljanje oglasima</h1>
                <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF0026]">
                    <option value="">Svi statusi</option>
                    {Object.entries(statusLabels).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Oglas</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Korisnik</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Cijena</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Akcije</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Učitavanje...</td></tr>}
                        {data?.data?.map(ad => (
                            <tr key={ad.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={ad.primary_image ? `http://localhost:8000/storage/${ad.primary_image.path}` : '/placeholder-car.jpg'}
                                            className="w-10 h-8 object-cover rounded-lg bg-gray-100"
                                            alt=""
                                        />
                                        <div>
                                            <p className="font-semibold text-[#12142D] truncate max-w-xs">{ad.title}</p>
                                            <p className="text-xs text-gray-400">{ad.year} · {ad.city?.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{ad.user?.name}</td>
                                <td className="px-4 py-3 font-bold text-[#FF0026]">{Number(ad.price).toLocaleString()} €</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[ad.status]}`}>
                                        {statusLabels[ad.status] ?? ad.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-1.5 flex-wrap">
                                        {ad.status !== 'active' && (
                                            <button onClick={() => statusMutation.mutate({ id: ad.id, status: 'active' })}
                                                className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition">
                                                Odobri
                                            </button>
                                        )}
                                        {ad.status === 'active' && (
                                            <button onClick={() => statusMutation.mutate({ id: ad.id, status: 'inactive' })}
                                                className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition">
                                                Deaktiviraj
                                            </button>
                                        )}
                                        {ad.status !== 'rejected' && (
                                            <button onClick={() => statusMutation.mutate({ id: ad.id, status: 'rejected' })}
                                                className="text-xs px-2 py-1 bg-red-50 text-[#FF0026] rounded-lg hover:bg-red-100 transition">
                                                Odbij
                                            </button>
                                        )}
                                        <a href={`/ads/${ad.slug}`} target="_blank" rel="noreferrer"
                                            className="text-xs px-2 py-1 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg transition">
                                            👁
                                        </a>
                                        <button onClick={() => window.confirm('Obrisati oglas?') && deleteMutation.mutate(ad.id)}
                                            className="text-xs px-2 py-1 bg-red-50 text-[#FF0026] rounded-lg hover:bg-red-100 transition">
                                            🗑
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data?.last_page > 1 && (
                    <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:border-[#FF0026] transition">←</button>
                        <span className="px-3 py-1.5 text-xs text-gray-500">{page} / {data.last_page}</span>
                        <button disabled={page >= data.last_page} onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:border-[#FF0026] transition">→</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════
// KORISNICI
// ═══════════════════════════════════════

function AdminUsers() {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => axios.get('/admin/users').then(r => r.data)
    });

    const toggleMutation = useMutation({
        mutationFn: (id) => axios.put(`/admin/users/${id}/toggle-active`),
        onSuccess: () => { toast.success('Status korisnika promijenjen.'); qc.invalidateQueries({ queryKey: ['admin-users'] }); }
    });

    const roleMutation = useMutation({
        mutationFn: ({ id, role }) => axios.put(`/admin/users/${id}/role`, { role }),
        onSuccess: () => { toast.success('Uloga ažurirana.'); qc.invalidateQueries({ queryKey: ['admin-users'] }); }
    });

    return (
        <div>
            <h1 className="text-xl font-black text-[#12142D] mb-5">Upravljanje korisnicima</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Korisnik</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Uloga</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Akcije</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && <tr><td colSpan={4} className="text-center py-8 text-gray-400">Učitavanje...</td></tr>}
                        {data?.data?.map(user => (
                            <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#1B2B5A] flex items-center justify-center text-white text-xs font-bold">
                                            {user.name?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#12142D]">{user.name}</p>
                                            <p className="text-xs text-gray-400">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        value={user.role}
                                        onChange={e => roleMutation.mutate({ id: user.id, role: e.target.value })}
                                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF0026]"
                                    >
                                        {['user', 'dealer', 'moderator', 'admin'].map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                        {user.is_active ? 'Aktivan' : 'Blokiran'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => toggleMutation.mutate(user.id)}
                                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                                            user.is_active ? 'bg-red-50 text-[#FF0026] hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}>
                                        {user.is_active ? 'Blokiraj' : 'Aktiviraj'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════
// PRIJAVE
// ═══════════════════════════════════════

function AdminReports() {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['admin-reports'],
        queryFn: () => axios.get('/admin/reports').then(r => r.data)
    });

    const resolveMutation = useMutation({
        mutationFn: (id) => axios.put(`/admin/reports/${id}/resolve`),
        onSuccess: () => { toast.success('Prijava riješena.'); qc.invalidateQueries({ queryKey: ['admin-reports'] }); }
    });

    return (
        <div>
            <h1 className="text-xl font-black text-[#12142D] mb-5">Prijave korisnika</h1>
            <div className="space-y-3">
                {isLoading && <p className="text-gray-400 text-center py-8">Učitavanje...</p>}
                {data?.data?.map(report => (
                    <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-start gap-4">
                        <div className="text-2xl">🚩</div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-[#12142D]">{report.ad?.title}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                    {report.status === 'pending' ? 'Na čekanju' : 'Riješeno'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">
                                Razlog: <strong className="capitalize">{report.reason}</strong> · Prijavio: {report.user?.name}
                            </p>
                            {report.description && (
                                <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2">{report.description}</p>
                            )}
                        </div>
                        {report.status === 'pending' && (
                            <button onClick={() => resolveMutation.mutate(report.id)}
                                className="text-xs px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition flex-shrink-0">
                                Riješi
                            </button>
                        )}
                    </div>
                ))}
                {!isLoading && !data?.data?.length && (
                    <div className="bg-white rounded-2xl p-10 text-center">
                        <div className="text-4xl mb-2">✅</div>
                        <p className="text-gray-400">Nema aktivnih prijava</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════
// MARKE
// ═══════════════════════════════════════

function AdminMakes() {
    const qc = useQueryClient();
    const [form, setForm] = useState({ name: '', country: '' });
    const [editing, setEditing] = useState(null);

    const { data: makes, isLoading } = useQuery({
        queryKey: ['admin-makes'],
        queryFn: () => axios.get('/admin/makes').then(r => r.data)
    });

    const saveMutation = useMutation({
        mutationFn: (data) => editing
            ? axios.put(`/admin/makes/${editing.id}`, data)
            : axios.post('/admin/makes', data),
        onSuccess: () => {
            toast.success(editing ? 'Marka ažurirana.' : 'Marka dodana.');
            qc.invalidateQueries({ queryKey: ['admin-makes'] });
            setForm({ name: '', country: '' });
            setEditing(null);
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/admin/makes/${id}`),
        onSuccess: () => { toast.success('Marka obrisana.'); qc.invalidateQueries({ queryKey: ['admin-makes'] }); }
    });

    const startEdit = (make) => { setEditing(make); setForm({ name: make.name, country: make.country ?? '' }); };
    const cancelEdit = () => { setEditing(null); setForm({ name: '', country: '' }); };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Forma */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-black text-[#12142D] mb-4">{editing ? 'Uredi marku' : 'Dodaj marku'}</h2>
                <div className="space-y-3">
                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Naziv marke (npr. BMW)"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
                    <input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                        placeholder="Zemlja (npr. Germany)"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
                    <div className="flex gap-2">
                        <button onClick={() => saveMutation.mutate(form)} disabled={!form.name || saveMutation.isPending}
                            className="flex-1 bg-[#FF0026] hover:bg-red-700 text-white font-bold py-2 rounded-xl text-sm transition disabled:opacity-50">
                            {saveMutation.isPending ? 'Čuvanje...' : editing ? 'Sačuvaj' : 'Dodaj'}
                        </button>
                        {editing && (
                            <button onClick={cancelEdit} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition">
                                Otkaži
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Lista */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-black text-[#12142D]">Sve marke ({makes?.length ?? 0})</h2>
                </div>
                <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                    {isLoading && <p className="text-center py-8 text-gray-400">Učitavanje...</p>}
                    {makes?.map(make => (
                        <div key={make.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                            <div>
                                <p className="font-semibold text-sm text-[#12142D]">{make.name}</p>
                                <p className="text-xs text-gray-400">{make.country ?? '—'}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => startEdit(make)}
                                    className="text-xs px-2 py-1 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition">✏️</button>
                                <button onClick={() => window.confirm('Obrisati marku?') && deleteMutation.mutate(make.id)}
                                    className="text-xs px-2 py-1 bg-red-50 text-[#FF0026] rounded-lg hover:bg-red-100 transition">🗑</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════
// GRADOVI
// ═══════════════════════════════════════

function AdminCities() {
    const qc = useQueryClient();
    const [form, setForm] = useState({ name: '', region: '', latitude: '', longitude: '' });
    const [editing, setEditing] = useState(null);

    const { data: cities, isLoading } = useQuery({
        queryKey: ['admin-cities'],
        queryFn: () => axios.get('/admin/cities').then(r => r.data)
    });

    const saveMutation = useMutation({
        mutationFn: (data) => editing
            ? axios.put(`/admin/cities/${editing.id}`, data)
            : axios.post('/admin/cities', data),
        onSuccess: () => {
            toast.success(editing ? 'Grad ažuriran.' : 'Grad dodan.');
            qc.invalidateQueries({ queryKey: ['admin-cities'] });
            setForm({ name: '', region: '', latitude: '', longitude: '' });
            setEditing(null);
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/admin/cities/${id}`),
        onSuccess: () => { toast.success('Grad obrisan.'); qc.invalidateQueries({ queryKey: ['admin-cities'] }); }
    });

    const startEdit = (city) => {
        setEditing(city);
        setForm({ name: city.name, region: city.region ?? '', latitude: city.latitude ?? '', longitude: city.longitude ?? '' });
    };
    const cancelEdit = () => { setEditing(null); setForm({ name: '', region: '', latitude: '', longitude: '' }); };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-black text-[#12142D] mb-4">{editing ? 'Uredi grad' : 'Dodaj grad'}</h2>
                <div className="space-y-3">
                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Naziv grada"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
                    <input value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))}
                        placeholder="Region (npr. Primorje)"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
                    <input value={form.latitude} onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))}
                        placeholder="Latitude (npr. 42.4415)"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
                    <input value={form.longitude} onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))}
                        placeholder="Longitude (npr. 19.2636)"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
                    <div className="flex gap-2">
                        <button onClick={() => saveMutation.mutate(form)} disabled={!form.name || saveMutation.isPending}
                            className="flex-1 bg-[#FF0026] hover:bg-red-700 text-white font-bold py-2 rounded-xl text-sm transition disabled:opacity-50">
                            {saveMutation.isPending ? 'Čuvanje...' : editing ? 'Sačuvaj' : 'Dodaj'}
                        </button>
                        {editing && (
                            <button onClick={cancelEdit} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition">
                                Otkaži
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-black text-[#12142D]">Svi gradovi ({cities?.length ?? 0})</h2>
                </div>
                <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                    {isLoading && <p className="text-center py-8 text-gray-400">Učitavanje...</p>}
                    {cities?.map(city => (
                        <div key={city.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                            <div>
                                <p className="font-semibold text-sm text-[#12142D]">{city.name}</p>
                                <p className="text-xs text-gray-400">{city.region ?? '—'} · {city.latitude}, {city.longitude}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => startEdit(city)}
                                    className="text-xs px-2 py-1 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition">✏️</button>
                                <button onClick={() => window.confirm('Obrisati grad?') && deleteMutation.mutate(city.id)}
                                    className="text-xs px-2 py-1 bg-red-50 text-[#FF0026] rounded-lg hover:bg-red-100 transition">🗑</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════
// MODELI
// ═══════════════════════════════════════

function AdminModels() {
    const qc = useQueryClient();
    const [selectedMakeId, setSelectedMakeId] = useState('');
    const [form, setForm] = useState({ name: '', year_from: '', year_to: '' });
    const [editing, setEditing] = useState(null);

    const { data: makes } = useQuery({
        queryKey: ['admin-makes'],
        queryFn: () => axios.get('/admin/makes').then(r => r.data),
    });

    const { data: models, isLoading } = useQuery({
        queryKey: ['admin-models', selectedMakeId],
        queryFn: () => axios.get(`/admin/models?make_id=${selectedMakeId}`).then(r => r.data),
        enabled: !!selectedMakeId,
    });

    const saveMutation = useMutation({
        mutationFn: (data) => editing
            ? axios.put(`/admin/models/${editing.id}`, data)
            : axios.post('/admin/models', { ...data, make_id: selectedMakeId }),
        onSuccess: () => {
            toast.success(editing ? 'Model ažuriran.' : 'Model dodan.');
            qc.invalidateQueries({ queryKey: ['admin-models', selectedMakeId] });
            setForm({ name: '', year_from: '', year_to: '' });
            setEditing(null);
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/admin/models/${id}`),
        onSuccess: () => {
            toast.success('Model obrisan.');
            qc.invalidateQueries({ queryKey: ['admin-models', selectedMakeId] });
        },
    });

    const startEdit = (model) => {
        setEditing(model);
        setForm({ name: model.name, year_from: model.year_from ?? '', year_to: model.year_to ?? '' });
    };
    const cancelEdit = () => { setEditing(null); setForm({ name: '', year_from: '', year_to: '' }); };

    return (
        <div>
            <h1 className="text-xl font-black text-[#12142D] mb-5">Upravljanje modelima</h1>

            {/* Odabir marke */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
                <label className="block text-sm font-bold text-gray-600 mb-2">Odaberi marku</label>
                <select
                    value={selectedMakeId}
                    onChange={e => { setSelectedMakeId(e.target.value); setEditing(null); setForm({ name: '', year_from: '', year_to: '' }); }}
                    className="w-full max-w-xs border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF0026]"
                >
                    <option value="">— Odaberi marku —</option>
                    {makes?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
            </div>

            {selectedMakeId && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Forma */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <h2 className="font-black text-[#12142D] mb-4">
                            {editing ? 'Uredi model' : `Dodaj model`}
                        </h2>
                        <div className="space-y-3">
                            <input
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="Naziv modela (npr. Golf)"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={form.year_from}
                                    onChange={e => setForm(p => ({ ...p, year_from: e.target.value }))}
                                    placeholder="Godina od"
                                    className="w-1/2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]"
                                />
                                <input
                                    type="number"
                                    value={form.year_to}
                                    onChange={e => setForm(p => ({ ...p, year_to: e.target.value }))}
                                    placeholder="Godina do"
                                    className="w-1/2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => saveMutation.mutate(form)}
                                    disabled={!form.name || saveMutation.isPending}
                                    className="flex-1 bg-[#FF0026] hover:bg-red-700 text-white font-bold py-2 rounded-xl text-sm transition disabled:opacity-50"
                                >
                                    {saveMutation.isPending ? 'Čuvanje...' : editing ? 'Sačuvaj' : 'Dodaj'}
                                </button>
                                {editing && (
                                    <button onClick={cancelEdit} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition">
                                        Otkaži
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Lista modela */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h2 className="font-black text-[#12142D]">
                                Modeli ({models?.length ?? 0})
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                            {isLoading && <p className="text-center py-8 text-gray-400">Učitavanje...</p>}
                            {!isLoading && !models?.length && (
                                <p className="text-center py-8 text-gray-400">Nema modela za ovu marku.</p>
                            )}
                            {models?.map(model => (
                                <div key={model.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                                    <div>
                                        <p className="font-semibold text-sm text-[#12142D]">{model.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {model.year_from && model.year_to
                                                ? `${model.year_from} – ${model.year_to}`
                                                : model.year_from
                                                ? `od ${model.year_from}`
                                                : '—'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => startEdit(model)}
                                            className="text-xs px-2 py-1 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition">✏️</button>
                                        <button onClick={() => window.confirm('Obrisati model?') && deleteMutation.mutate(model.id)}
                                            className="text-xs px-2 py-1 bg-red-50 text-[#FF0026] rounded-lg hover:bg-red-100 transition">🗑</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════
// KATEGORIJE
// ═══════════════════════════════════════

function AdminCategories() {
    const qc = useQueryClient();
    const [form, setForm] = useState({ name: '', icon: '', order: '' });
    const [editing, setEditing] = useState(null);

    const { data: categories, isLoading } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: () => axios.get('/categories').then(r => r.data),
    });

    const saveMutation = useMutation({
        mutationFn: (data) => editing
            ? axios.put(`/admin/categories/${editing.id}`, data)
            : axios.post('/admin/categories', data),
        onSuccess: () => {
            toast.success(editing ? 'Kategorija ažurirana.' : 'Kategorija dodana.');
            qc.invalidateQueries({ queryKey: ['admin-categories'] });
            setForm({ name: '', icon: '', order: '' });
            setEditing(null);
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/admin/categories/${id}`),
        onSuccess: () => {
            toast.success('Kategorija obrisana.');
            qc.invalidateQueries({ queryKey: ['admin-categories'] });
        },
    });

    const toggleActiveMutation = useMutation({
        mutationFn: (id) => axios.put(`/admin/categories/${id}/toggle`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }),
    });

    const startEdit = (cat) => {
        setEditing(cat);
        setForm({ name: cat.name, icon: cat.icon ?? '', order: cat.order ?? '' });
    };
    const cancelEdit = () => { setEditing(null); setForm({ name: '', icon: '', order: '' }); };

    const cats = categories?.data ?? [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Forma */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-black text-[#12142D] mb-4">{editing ? 'Uredi kategoriju' : 'Dodaj kategoriju'}</h2>
                <div className="space-y-3">
                    <input
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Naziv kategorije"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]"
                    />
                    <input
                        value={form.icon}
                        onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                        placeholder="Ikona (npr. car, truck, boat)"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]"
                    />
                    <input
                        type="number"
                        value={form.order}
                        onChange={e => setForm(p => ({ ...p, order: e.target.value }))}
                        placeholder="Redosljed prikaza (1, 2, 3...)"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => saveMutation.mutate(form)}
                            disabled={!form.name || saveMutation.isPending}
                            className="flex-1 bg-[#FF0026] hover:bg-red-700 text-white font-bold py-2 rounded-xl text-sm transition disabled:opacity-50"
                        >
                            {saveMutation.isPending ? 'Čuvanje...' : editing ? 'Sačuvaj' : 'Dodaj'}
                        </button>
                        {editing && (
                            <button onClick={cancelEdit} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition">
                                Otkaži
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Lista */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-black text-[#12142D]">Sve kategorije ({cats.length})</h2>
                </div>
                <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                    {isLoading && <p className="text-center py-8 text-gray-400">Učitavanje...</p>}
                    {cats.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <span className="text-gray-400 text-xs font-mono w-5 text-center">{cat.order}</span>
                                <div>
                                    <p className="font-semibold text-sm text-[#12142D]">{cat.name}</p>
                                    <p className="text-xs text-gray-400">{cat.icon ?? '—'}</p>
                                </div>
                                {!cat.is_active && (
                                    <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded">Neaktivna</span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleActiveMutation.mutate(cat.id)}
                                    className={`text-xs px-2 py-1 rounded-lg transition font-medium ${
                                        cat.is_active
                                            ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                                    }`}
                                >
                                    {cat.is_active ? 'Deaktiviraj' : 'Aktiviraj'}
                                </button>
                                <button onClick={() => startEdit(cat)}
                                    className="text-xs px-2 py-1 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition">✏️</button>
                                <button onClick={() => window.confirm('Obrisati kategoriju?') && deleteMutation.mutate(cat.id)}
                                    className="text-xs px-2 py-1 bg-red-50 text-[#FF0026] rounded-lg hover:bg-red-100 transition">🗑</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════
// PAKETI
// ═══════════════════════════════════════

function AdminPackages() {
    const qc = useQueryClient();
    const [form, setForm] = useState({ name: '', price: '', duration_days: '', max_images: '', featured: false, description: '' });
    const [editing, setEditing] = useState(null);

    const { data: packages, isLoading } = useQuery({
        queryKey: ['admin-packages'],
        queryFn: () => axios.get('/admin/packages').then(r => r.data)
    });

    const saveMutation = useMutation({
        mutationFn: (data) => editing
            ? axios.put(`/admin/packages/${editing.id}`, data)
            : axios.post('/admin/packages', data),
        onSuccess: () => {
            toast.success(editing ? 'Paket ažuriran.' : 'Paket dodan.');
            qc.invalidateQueries({ queryKey: ['admin-packages'] });
            setForm({ name: '', price: '', duration_days: '', max_images: '', featured: false, description: '' });
            setEditing(null);
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/admin/packages/${id}`),
        onSuccess: () => { toast.success('Paket obrisan.'); qc.invalidateQueries({ queryKey: ['admin-packages'] }); }
    });

    const startEdit = (pkg) => {
        setEditing(pkg);
        setForm({ name: pkg.name, price: pkg.price, duration_days: pkg.duration_days, max_images: pkg.max_images, featured: pkg.featured, description: pkg.description ?? '' });
    };
    const cancelEdit = () => { setEditing(null); setForm({ name: '', price: '', duration_days: '', max_images: '', featured: false, description: '' }); };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-black text-[#12142D] mb-4">{editing ? 'Uredi paket' : 'Dodaj paket'}</h2>
                <div className="space-y-3">
                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Naziv paketa"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
                    <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                        placeholder="Cijena (EUR)"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
                    <input type="number" value={form.duration_days} onChange={e => setForm(p => ({ ...p, duration_days: e.target.value }))}
                        placeholder="Trajanje (dana)"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
                    <input type="number" value={form.max_images} onChange={e => setForm(p => ({ ...p, max_images: e.target.value }))}
                        placeholder="Max slika"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
                    <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Opis paketa"
                        rows={2}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] resize-none" />
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))}
                            className="rounded" />
                        Istaknuti oglas
                    </label>
                    <div className="flex gap-2">
                        <button onClick={() => saveMutation.mutate(form)} disabled={!form.name || !form.price || saveMutation.isPending}
                            className="flex-1 bg-[#FF0026] hover:bg-red-700 text-white font-bold py-2 rounded-xl text-sm transition disabled:opacity-50">
                            {saveMutation.isPending ? 'Čuvanje...' : editing ? 'Sačuvaj' : 'Dodaj'}
                        </button>
                        {editing && (
                            <button onClick={cancelEdit} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition">
                                Otkaži
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-black text-[#12142D]">Svi paketi</h2>
                </div>
                <div className="divide-y divide-gray-50">
                    {isLoading && <p className="text-center py-8 text-gray-400">Učitavanje...</p>}
                    {packages?.map(pkg => (
                        <div key={pkg.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-sm text-[#12142D]">{pkg.name}</p>
                                    {pkg.featured && <span className="text-xs bg-[#FFEA00] text-[#12142D] px-1.5 py-0.5 rounded font-bold">FEATURED</span>}
                                    {!pkg.is_active && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Neaktivan</span>}
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {pkg.price} € · {pkg.duration_days} dana · max {pkg.max_images} slika
                                </p>
                                {pkg.description && <p className="text-xs text-gray-500 mt-0.5">{pkg.description}</p>}
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <button onClick={() => startEdit(pkg)}
                                    className="text-xs px-2 py-1 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition">✏️</button>
                                <button onClick={() => window.confirm('Obrisati paket?') && deleteMutation.mutate(pkg.id)}
                                    className="text-xs px-2 py-1 bg-red-50 text-[#FF0026] rounded-lg hover:bg-red-100 transition">🗑</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}