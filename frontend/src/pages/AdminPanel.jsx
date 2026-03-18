import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';

export default function AdminPanel() {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-56 bg-[#12142D] flex-shrink-0 min-h-screen">
                <div className="p-5 border-b border-[#1B2B5A]">
                    <div className="bg-[#FF0026] px-2 py-0.5 rounded-lg inline-block">
                        <span className="text-white font-black text-sm">VOZIME</span>
                    </div>
                    <p className="text-[#6674A3] text-xs mt-1">Admin panel</p>
                </div>
                <nav className="p-3 space-y-1">
                    {[
                        { to: '/admin',          label: '📊 Pregled',    },
                        { to: '/admin/ads',      label: '🚗 Oglasi',     },
                        { to: '/admin/users',    label: '👥 Korisnici',  },
                        { to: '/admin/reports',  label: '🚩 Prijave',    },
                        { to: '/admin/packages', label: '📦 Paketi',     },
                    ].map(item => (
                        <Link key={item.to} to={item.to}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-[#6674A3] hover:text-white hover:bg-[#1B2B5A] transition">
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Sadržaj */}
            <main className="flex-1 p-6">
                <Routes>
                    <Route index          element={<AdminOverview />} />
                    <Route path="ads"     element={<AdminAds />} />
                    <Route path="users"   element={<AdminUsers />} />
                    <Route path="reports" element={<AdminReports />} />
                </Routes>
            </main>
        </div>
    );
}

function AdminOverview() {
    const { data: stats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => axios.get('/admin/stats').then(r => r.data)
    });

    const cards = [
        { label: 'Ukupno oglasa',    value: stats?.total_ads,     icon: '🚗', color: 'blue'   },
        { label: 'Na čekanju',       value: stats?.pending_ads,   icon: '⏳', color: 'yellow' },
        { label: 'Korisnika',        value: stats?.total_users,   icon: '👥', color: 'green'  },
        { label: 'Prijava danas',    value: stats?.reports_today, icon: '🚩', color: 'red'    },
    ];

    return (
        <div>
            <h1 className="text-xl font-black text-[#12142D] mb-6">Pregled sistema</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map(c => (
                    <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="text-3xl mb-2">{c.icon}</div>
                        <div className="text-2xl font-black text-[#12142D]">{c.value ?? '—'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
                    </div>
                ))}
            </div>

            {/* Oglasi na čekanju */}
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

    const approve = useMutation({
        mutationFn: (id) => axios.patch(`/admin/ads/${id}/approve`),
        onSuccess: () => { toast.success('Oglas odobren!'); qc.invalidateQueries(['pending-ads']); }
    });
    const reject = useMutation({
        mutationFn: (id) => axios.patch(`/admin/ads/${id}/reject`),
        onSuccess: () => { toast.success('Oglas odbijen.'); qc.invalidateQueries(['pending-ads']); }
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
                        src={ad.primary_image
                            ? `http://localhost:8000/storage/${ad.primary_image.path}`
                            : '/placeholder-car.jpg'}
                        className="w-14 h-10 object-cover rounded-lg flex-shrink-0"
                        alt=""
                    />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#12142D] truncate">{ad.title}</p>
                        <p className="text-xs text-gray-400">{ad.user?.name} · {ad.city?.name} · {ad.price?.toLocaleString()} €</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => approve.mutate(ad.id)}
                            className="text-xs px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition">
                            ✓ Odobri
                        </button>
                        <button onClick={() => reject.mutate(ad.id)}
                            className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#FF0026] rounded-lg font-semibold transition">
                            ✕ Odbij
                        </button>
                        <a href={`/ads/${ad.slug}`} target="_blank" rel="noreferrer"
                            className="text-xs px-3 py-1.5 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg transition">
                            Pregled
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

function AdminAds() {
    const qc = useQueryClient();
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-ads', status, page],
        queryFn: () => axios.get(`/admin/ads?status=${status}&page=${page}&per_page=15`).then(r => r.data)
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/admin/ads/${id}`),
        onSuccess: () => { toast.success('Oglas obrisan.'); qc.invalidateQueries(['admin-ads']); }
    });

    const statusColors = {
        active: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700',
        rejected: 'bg-red-100 text-red-600', sold: 'bg-blue-100 text-blue-700',
        inactive: 'bg-gray-100 text-gray-500', expired: 'bg-orange-100 text-orange-600',
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-xl font-black text-[#12142D]">Upravljanje oglasima</h1>
                <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF0026]">
                    <option value="">Svi statusi</option>
                    {['active','pending','inactive','sold','rejected','expired'].map(s => (
                        <option key={s} value={s} className="capitalize">{s}</option>
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
                        {isLoading && (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-400">Učitavanje...</td></tr>
                        )}
                        {data?.data?.map(ad => (
                            <tr key={ad.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={ad.primary_image
                                                ? `http://localhost:8000/storage/${ad.primary_image.path}`
                                                : '/placeholder-car.jpg'}
                                            className="w-10 h-8 object-cover rounded-lg"
                                            alt=""
                                        />
                                        <div>
                                            <p className="font-semibold text-[#12142D] truncate max-w-xs">{ad.title}</p>
                                            <p className="text-xs text-gray-400">{ad.year} · {ad.city?.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{ad.user?.name}</td>
                                <td className="px-4 py-3 font-bold text-[#FF0026]">{ad.price?.toLocaleString()} €</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[ad.status]}`}>
                                        {ad.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-1.5">
                                        <a href={`/ads/${ad.slug}`} target="_blank" rel="noreferrer"
                                            className="text-xs px-2 py-1 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition">
                                            👁
                                        </a>
                                        <button onClick={() => confirm('Obrisati?') && deleteMutation.mutate(ad.id)}
                                            className="text-xs px-2 py-1 bg-red-50 text-[#FF0026] rounded-lg hover:bg-red-100 transition">
                                            🗑
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Paginacija */}
                {data?.last_page > 1 && (
                    <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:border-[#FF0026] transition">
                            ←
                        </button>
                        <span className="px-3 py-1.5 text-xs text-gray-500">
                            {page} / {data.last_page}
                        </span>
                        <button disabled={page >= data.last_page} onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:border-[#FF0026] transition">
                            →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function AdminUsers() {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => axios.get('/admin/users').then(r => r.data)
    });

    const toggleMutation = useMutation({
        mutationFn: (id) => axios.patch(`/admin/users/${id}/toggle`),
        onSuccess: () => { toast.success('Status korisnika promijenjen.'); qc.invalidateQueries(['admin-users']); }
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
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Oglasi</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Akcija</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-400">Učitavanje...</td></tr>
                        )}
                        {data?.map(user => (
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
                                    <span className="text-xs bg-[#12142D] text-[#FFEA00] px-2 py-0.5 rounded-full font-bold capitalize">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{user.ads_count ?? 0}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                                        ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                        {user.is_active ? 'Aktivan' : 'Blokiran'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => toggleMutation.mutate(user.id)}
                                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition
                                            ${user.is_active
                                                ? 'bg-red-50 text-[#FF0026] hover:bg-red-100'
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
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

function AdminReports() {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['admin-reports'],
        queryFn: () => axios.get('/admin/reports').then(r => r.data)
    });

    const resolveMutation = useMutation({
        mutationFn: (id) => axios.patch(`/admin/reports/${id}/resolve`),
        onSuccess: () => { toast.success('Prijava riješena.'); qc.invalidateQueries(['admin-reports']); }
    });

    return (
        <div>
            <h1 className="text-xl font-black text-[#12142D] mb-5">Prijave korisnika</h1>
            <div className="space-y-3">
                {isLoading && <p className="text-gray-400 text-center py-8">Učitavanje...</p>}
                {data?.map(report => (
                    <div key={report.id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-start gap-4">
                        <div className="text-2xl">🚩</div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-[#12142D]">{report.ad?.title}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                                    ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
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
                {!isLoading && !data?.length && (
                    <div className="bg-white rounded-2xl p-10 text-center">
                        <div className="text-4xl mb-2">✅</div>
                        <p className="text-gray-400">Nema aktivnih prijava</p>
                    </div>
                )}
            </div>
        </div>
    );
}