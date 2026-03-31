import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const NAV = [
    { to: '/moderator',         label: '⏳ Na čekanju', end: true },
    { to: '/moderator/all',     label: '🚗 Svi oglasi'           },
    { to: '/moderator/reports', label: '🚩 Prijave'              },
];

export default function ModeratorPanel() {
    const { user, token } = useAuthStore();

    if (!token) return <Navigate to="/login" replace />;
    if (user && user.role !== 'moderator' && user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <aside className="w-56 bg-[#12142D] flex-shrink-0 min-h-screen">
                <div className="p-5 border-b border-[#1B2B5A]">
                    <div className="bg-[#FF0026] px-2 py-0.5 rounded-lg inline-block">
                        <span className="text-white font-black text-sm">VOZIME</span>
                    </div>
                    <p className="text-[#6674A3] text-xs mt-1">Moderator panel</p>
                </div>
                <div className="p-4 border-b border-[#1B2B5A]">
                    <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                    <p className="text-[#6674A3] text-xs capitalize">{user?.role}</p>
                </div>
                <nav className="p-3 space-y-1">
                    {NAV.map(item => (
                        <NavLink key={item.to} to={item.to} end={item.end}
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
                    <Route index        element={<ModPending />} />
                    <Route path="all"     element={<ModAllAds />} />
                    <Route path="reports" element={<ModReports />} />
                </Routes>
            </main>
        </div>
    );
}

// ═══════════════════════════════════════
// OGLASI NA ČEKANJU
// ═══════════════════════════════════════

function ModPending() {
    const qc = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['mod-pending'],
        queryFn: () => axios.get('/admin/ads?status=pending&per_page=50').then(r => r.data)
    });

    const setStatus = useMutation({
        mutationFn: ({ id, status }) => axios.put(`/admin/ads/${id}/status`, { status }),
        onSuccess: (_, { status }) => {
            toast.success(status === 'active' ? 'Oglas odobren!' : 'Oglas odbijen.');
            qc.invalidateQueries({ queryKey: ['mod-pending'] });
        }
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-xl font-black text-[#12142D]">Oglasi na čekanju</h1>
                <span className="bg-[#FFEA00] text-[#12142D] text-xs font-bold px-3 py-1 rounded-full">
                    {data?.total ?? 0} oglasa
                </span>
            </div>

            {isLoading && (
                <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}
                </div>
            )}

            <div className="space-y-3">
                {data?.data?.map(ad => (
                    <div key={ad.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex gap-4">
                            <img
                                src={ad.primary_image ? `http://localhost:8000/storage/${ad.primary_image.path}` : '/placeholder-car.jpg'}
                                className="w-24 h-16 object-cover rounded-xl flex-shrink-0 bg-gray-100"
                                alt=""
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#12142D] truncate">{ad.title}</p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {ad.user?.name} · {ad.city?.name} · {ad.year} · {Number(ad.price).toLocaleString()} €
                                </p>
                                {ad.description && (
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ad.description}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                                <button onClick={() => setStatus.mutate({ id: ad.id, status: 'active' })}
                                    disabled={setStatus.isPending}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition disabled:opacity-50">
                                    ✓ Odobri
                                </button>
                                <button onClick={() => setStatus.mutate({ id: ad.id, status: 'rejected' })}
                                    disabled={setStatus.isPending}
                                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-[#FF0026] rounded-xl text-sm font-bold transition disabled:opacity-50">
                                    ✕ Odbij
                                </button>
                                <a href={`/ads/${ad.slug}`} target="_blank" rel="noreferrer"
                                    className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl text-sm text-center transition">
                                    Pregled
                                </a>
                            </div>
                        </div>
                    </div>
                ))}

                {!isLoading && !data?.data?.length && (
                    <div className="bg-white rounded-2xl p-12 text-center">
                        <div className="text-5xl mb-3">✅</div>
                        <p className="text-lg font-bold text-[#12142D]">Sve je obrađeno!</p>
                        <p className="text-gray-400 text-sm mt-1">Nema oglasa na čekanju</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════
// SVI OGLASI (moderator)
// ═══════════════════════════════════════

function ModAllAds() {
    const qc = useQueryClient();
    const [status, setStatusFilter] = useState('active');
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['mod-ads', status, page],
        queryFn: () => axios.get(`/admin/ads?status=${status}&page=${page}&per_page=20`).then(r => r.data)
    });

    const setStatus = useMutation({
        mutationFn: ({ id, status }) => axios.put(`/admin/ads/${id}/status`, { status }),
        onSuccess: () => { toast.success('Status ažuriran.'); qc.invalidateQueries({ queryKey: ['mod-ads'] }); }
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
                <h1 className="text-xl font-black text-[#12142D]">Svi oglasi</h1>
                <select value={status} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF0026]">
                    {Object.entries(statusLabels).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                    ))}
                    <option value="">Svi</option>
                </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Oglas</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Korisnik</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Akcije</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && <tr><td colSpan={4} className="text-center py-8 text-gray-400">Učitavanje...</td></tr>}
                        {data?.data?.map(ad => (
                            <tr key={ad.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <p className="font-semibold text-[#12142D] truncate max-w-xs">{ad.title}</p>
                                    <p className="text-xs text-gray-400">{ad.year} · {ad.city?.name} · {Number(ad.price).toLocaleString()} €</p>
                                </td>
                                <td className="px-4 py-3 text-gray-600 text-sm">{ad.user?.name}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[ad.status]}`}>
                                        {statusLabels[ad.status] ?? ad.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-1.5 flex-wrap">
                                        {ad.status === 'active' && (
                                            <button onClick={() => setStatus.mutate({ id: ad.id, status: 'inactive' })}
                                                className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition">
                                                Deaktiviraj
                                            </button>
                                        )}
                                        {ad.status === 'inactive' && (
                                            <button onClick={() => setStatus.mutate({ id: ad.id, status: 'active' })}
                                                className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition">
                                                Aktiviraj
                                            </button>
                                        )}
                                        {ad.status !== 'rejected' && ad.status !== 'sold' && (
                                            <button onClick={() => setStatus.mutate({ id: ad.id, status: 'rejected' })}
                                                className="text-xs px-2 py-1 bg-red-50 text-[#FF0026] rounded-lg hover:bg-red-100 transition">
                                                Odbij
                                            </button>
                                        )}
                                        <a href={`/ads/${ad.slug}`} target="_blank" rel="noreferrer"
                                            className="text-xs px-2 py-1 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg transition">
                                            👁
                                        </a>
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
// PRIJAVE (moderator)
// ═══════════════════════════════════════

function ModReports() {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['mod-reports'],
        queryFn: () => axios.get('/admin/reports?status=pending').then(r => r.data)
    });

    const resolveMutation = useMutation({
        mutationFn: (id) => axios.put(`/admin/reports/${id}/resolve`),
        onSuccess: () => { toast.success('Prijava riješena.'); qc.invalidateQueries({ queryKey: ['mod-reports'] }); }
    });

    const deactivateMutation = useMutation({
        mutationFn: (adId) => axios.put(`/admin/ads/${adId}/status`, { status: 'inactive' }),
        onSuccess: () => { toast.success('Oglas deaktiviran.'); qc.invalidateQueries({ queryKey: ['mod-reports'] }); }
    });

    return (
        <div>
            <h1 className="text-xl font-black text-[#12142D] mb-5">Prijave korisnika</h1>
            <div className="space-y-3">
                {isLoading && <p className="text-gray-400 text-center py-8">Učitavanje...</p>}
                {data?.data?.map(report => (
                    <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-start gap-4">
                            <div className="text-2xl">🚩</div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm text-[#12142D]">{report.ad?.title}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-1">
                                    Razlog: <strong className="capitalize">{report.reason}</strong> · Prijavio: {report.user?.name}
                                </p>
                                {report.description && (
                                    <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2">{report.description}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                                <button onClick={() => deactivateMutation.mutate(report.ad?.id)}
                                    className="text-xs px-3 py-1.5 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg font-semibold transition">
                                    Deaktiviraj oglas
                                </button>
                                <button onClick={() => resolveMutation.mutate(report.id)}
                                    className="text-xs px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition">
                                    Označi riješeno
                                </button>
                            </div>
                        </div>
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
