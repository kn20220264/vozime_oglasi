import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import AdminCatalog from './AdminCatalog';

// ═══════════════════════════════════════
// NAVIGACIJA
// ═══════════════════════════════════════

const NAV_GROUPS = [
    {
        label: null,
        items: [{ to: '/admin', label: 'Pregled', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', end: true }]
    },
    {
        label: 'OGLASI',
        items: [
            { to: '/admin/ads',     label: 'Svi oglasi', icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
            { to: '/admin/reports', label: 'Prijave',    icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z' },
        ]
    },
    {
        label: 'KORISNICI',
        items: [
            { to: '/admin/users', label: 'Korisnici', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        ]
    },

{
  label: 'KATALOG',
  items: [
    { to: '/admin/catalog', label: 'Katalog & Filteri', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  ]
},
    {
        label: 'FILTERI',
        items: [
            { to: '/admin/filters', label: 'Filter opcije', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
        ]
    },
    {
        label: 'FINANSIJE',
        items: [
            { to: '/admin/packages', label: 'Paketi',        icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { to: '/admin/payments', label: 'Plaćanja',      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
        ]
    },
    {
        label: 'MARKETING',
        items: [
            { to: '/admin/banners', label: 'Baneri / Reklame', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
        ]
    },
    {
        label: 'SISTEM',
        items: [
            { to: '/admin/settings', label: 'Podešavanja',  icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
        ]
    },
];

// Mala SVG ikona za dugmad i redove (bez emojija)
function Ic({ d, className = 'w-3.5 h-3.5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
        </svg>
    );
}

const IC = {
    check:   'M5 13l4 4L19 7',
    x:       'M6 18L18 6M6 6l12 12',
    eye:     'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 4.5 12 4.5c4.478 0 8.268 3.443 9.542 7.5-1.274 4.057-5.064 7.5-9.542 7.5-4.477 0-8.268-3.443-9.542-7.5z',
    pencil:  'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash:   'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    star:    'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    pin:     'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z',
    folder:  'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    chevron: 'M19 9l-7 7-7-7',
    megaphone: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
};

// ═══════════════════════════════════════
// LAYOUT
// ═══════════════════════════════════════

export default function AdminPanel() {
    const { user, token } = useAuthStore();

    if (!token) return <Navigate to="/login" replace />;
    if (user && user.role !== 'admin' && user.role !== 'moderator') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-[#12142D] text-white flex">
            {/* Sidebar */}
            <aside className="w-60 bg-[#12142D] border-r border-white/[0.06] flex-shrink-0 min-h-screen flex flex-col">
                <div className="p-5 border-b border-white/[0.06]">
                    <div className="bg-[#FF0026] px-2 py-0.5 rounded-lg inline-block">
                        <span className="text-white font-black text-sm">VOZIME</span>
                    </div>
                    <p className="text-[#6674A3] text-xs mt-1">Admin panel</p>
                </div>
                <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                    <p className="text-[#6674A3] text-xs capitalize">{user?.role}</p>
                </div>
                <nav className="p-3 flex-1 overflow-y-auto">
                    {NAV_GROUPS.map((group, gi) => (
                        <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
                            {group.label && (
                                <p className="text-[#6674A3] text-[10px] font-bold uppercase tracking-widest px-3 mb-1">
                                    {group.label}
                                </p>
                            )}
                            <div className="space-y-0.5">
                                {group.items.map(item => (
                                    <NavLink key={item.to} to={item.to} end={item.end}
                                        className={({ isActive }) =>
                                            `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition border ${
                                                isActive
                                                    ? 'bg-[#1A1D3A] border-white/[0.06] text-white font-semibold'
                                                    : 'border-transparent text-[#6674A3] hover:text-white hover:bg-[#1A1D3A]'
                                            }`
                                        }>
                                        {({ isActive }) => (
                                            <>
                                                <svg className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#FF0026]' : 'text-current'}`}
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                                </svg>
                                                <span>{item.label}</span>
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Sadržaj */}
            <main className="flex-1 overflow-auto">
             <Routes>
    <Route index                element={<AdminOverview />} />
    <Route path="ads"           element={<AdminAds />} />
    <Route path="ads/:id"       element={<AdminAdEdit />} />
    <Route path="users"         element={<AdminUsers />} />
    <Route path="users/:id"     element={<AdminUserDetail />} />
    <Route path="reports"       element={<AdminReports />} />
    <Route path="filters"       element={<AdminFilters />} />
    <Route path="packages"      element={<AdminPackages />} />
    <Route path="payments"      element={<AdminPayments />} />
    <Route path="catalog"       element={<AdminCatalog />} />
    <Route path="settings"      element={<AdminSettings />} />
    <Route path="banners"       element={<AdminBanners />} />
</Routes>
            </main>
        </div>
    );
}

// ═══════════════════════════════════════
// HELPER KOMPONENTE
// ═══════════════════════════════════════

function PageHeader({ title, subtitle, action }) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-xl font-black text-white">{title}</h1>
                {subtitle && <p className="text-sm text-[#6674A3] mt-0.5">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

function StatCard({ label, value, color = 'blue', icon }) {
    const colors = {
        blue:   'bg-white/[0.06] text-[#6674A3]',
        yellow: 'bg-[#FFEA00]/10 text-[#FFEA00]',
        green:  'bg-green-500/10 text-green-400',
        red:    'bg-[#FF0026]/10 text-[#FF0026]',
        purple: 'bg-white/[0.06] text-[#6674A3]',
        gray:   'bg-white/[0.06] text-[#6674A3]',
    };
    return (
        <div className="bg-[#1A1D3A] rounded-2xl p-5 border border-white/[0.06]">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
                <Ic d={icon} className="w-[18px] h-[18px]" />
            </div>
            <div className="text-2xl font-black text-white">{value ?? 0}</div>
            <div className="text-xs text-[#6674A3] mt-0.5">{label}</div>
        </div>
    );
}

function Badge({ children, color = 'gray' }) {
    const colors = {
        green:  'bg-green-500/15 text-green-400',
        red:    'bg-[#FF0026]/15 text-[#FF0026]',
        yellow: 'bg-[#FFEA00]/15 text-[#FFEA00]',
        blue:   'bg-white/[0.08] text-white/80',
        gray:   'bg-white/[0.08] text-[#6674A3]',
        purple: 'bg-white/[0.08] text-white/80',
    };
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[color]}`}>
            {children}
        </span>
    );
}

function Input({ label, ...props }) {
    return (
        <div>
            {label && <label className="block text-xs font-semibold text-[#6674A3] mb-1">{label}</label>}
            <input {...props}
                className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-[#6674A3] focus:outline-none focus:border-[#FF0026] bg-[#12142D]" />
        </div>
    );
}

function Select({ label, children, ...props }) {
    return (
        <div>
            {label && <label className="block text-xs font-semibold text-[#6674A3] mb-1">{label}</label>}
            <select {...props}
                className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF0026] bg-[#12142D]">
                {children}
            </select>
        </div>
    );
}

function Btn({ children, variant = 'primary', size = 'md', disabled, onClick, type = 'button' }) {
    const variants = {
        primary:  'bg-[#FF0026] hover:bg-red-700 text-white',
        secondary:'bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10',
        success:  'bg-green-500 hover:bg-green-600 text-white',
        danger:   'bg-[#FF0026]/10 hover:bg-[#FF0026]/25 text-[#FF0026]',
        yellow:   'bg-[#FFEA00] hover:bg-yellow-400 text-[#12142D]',
    };
    const sizes = {
        sm: 'px-2.5 py-1 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-2.5 text-sm',
    };
    return (
        <button type={type} onClick={onClick} disabled={disabled}
            className={`font-semibold rounded-xl transition disabled:opacity-50 ${variants[variant]} ${sizes[size]}`}>
            {children}
        </button>
    );
}

function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-[#1A1D3A] border border-white/[0.06] rounded-2xl shadow-xl w-full ${width} max-h-[90vh] overflow-y-auto`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <h3 className="font-black text-white">{title}</h3>
                    <button onClick={onClose} className="text-[#6674A3] hover:text-white transition">
                        <Ic d={IC.x} className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

function Pagination({ meta, onPage }) {
    if (!meta || meta.last_page <= 1) return null;
    return (
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06] text-sm text-[#6674A3]">
            <span>Prikazano {meta.from} do {meta.to} od {meta.total}</span>
            <div className="flex gap-1">
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => onPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                            p === meta.current_page
                                ? 'bg-[#FF0026] text-white'
                                : 'text-[#6674A3] hover:bg-white/[0.06] hover:text-white'
                        }`}>
                        {p}
                    </button>
                ))}
            </div>
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

    return (
        <div className="p-6">
            <PageHeader title="Pregled sistema" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Ukupno oglasa"  value={stats?.total_ads}        color="blue"   icon="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                <StatCard label="Na čekanju"     value={stats?.pending_ads}      color="yellow" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                <StatCard label="Korisnika"      value={stats?.total_users}      color="green"  icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                <StatCard label="Otvorene prijave" value={stats?.pending_reports} color="red"   icon="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" />
                <StatCard label="Aktivnih oglasa" value={stats?.active_ads}      color="green"  icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                <StatCard label="Dilera"         value={stats?.total_dealers}    color="purple" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                <StatCard label="Moderatora"     value={stats?.total_moderators} color="blue"   icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                <StatCard label="Čeka uplata"    value={stats?.pending_payments} color="yellow" icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PendingAdsWidget />
                <RecentPaymentsWidget />
            </div>
        </div>
    );
}

function PendingAdsWidget() {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['admin-pending-ads-widget'],
        queryFn: () => axios.get('/admin/ads?status=pending&per_page=8').then(r => r.data)
    });

    const setStatus = useMutation({
        mutationFn: ({ id, status }) => axios.put(`/admin/ads/${id}/status`, { status }),
        onSuccess: (_, { status }) => {
            toast.success(status === 'active' ? 'Oglas odobren!' : 'Oglas odbijen.');
            qc.invalidateQueries({ queryKey: ['admin-pending-ads-widget'] });
            qc.invalidateQueries({ queryKey: ['admin-stats'] });
        }
    });

    return (
        <div className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="font-black text-white">Na čekanju</h2>
                <Badge color="yellow">{data?.total ?? 0}</Badge>
            </div>
            {isLoading && <div className="p-8 text-center text-[#6674A3] text-sm">Učitavanje...</div>}
            <div className="divide-y divide-white/[0.06]">
                {data?.data?.map(ad => (
                    <div key={ad.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04]">
                        <img
                            src={ad.primary_image ? `http://localhost:8000${ad.primary_image}` : '/placeholder-car.jpg'}
                            className="w-12 h-9 object-cover rounded-lg bg-white/[0.06] flex-shrink-0"
                            alt=""
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-white truncate">{ad.title}</p>
                            <p className="text-xs text-[#6674A3] truncate">{ad.user?.name}, {Number(ad.price).toLocaleString()} €</p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                            <Btn size="sm" variant="success" onClick={() => setStatus.mutate({ id: ad.id, status: 'active' })}><Ic d={IC.check} /></Btn>
                            <Btn size="sm" variant="danger"  onClick={() => setStatus.mutate({ id: ad.id, status: 'rejected' })}><Ic d={IC.x} /></Btn>
                            <a href={`/ads/${ad.slug}`} target="_blank" rel="noreferrer">
                                <Btn size="sm" variant="secondary"><Ic d={IC.eye} /></Btn>
                            </a>
                        </div>
                    </div>
                ))}
            </div>
            {(!data?.data?.length && !isLoading) && (
                <div className="p-8 text-center text-[#6674A3] text-sm">Nema oglasa na čekanju.</div>
            )}
        </div>
    );
}

function RecentPaymentsWidget() {
    const { data, isLoading } = useQuery({
        queryKey: ['admin-recent-payments'],
        queryFn: () => axios.get('/admin/payments?status=pending&per_page=8').then(r => r.data)
    });

    return (
        <div className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="font-black text-white">Plaćanja na čekanju</h2>
                <Badge color="yellow">{data?.total ?? 0}</Badge>
            </div>
            {isLoading && <div className="p-8 text-center text-[#6674A3] text-sm">Učitavanje...</div>}
            <div className="divide-y divide-white/[0.06]">
                {data?.data?.map(p => (
                    <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.04]">
                        <div>
                            <p className="font-semibold text-sm text-white">{p.user_package?.user?.name ?? 'Nepoznato'}</p>
                            <p className="text-xs text-[#6674A3]">{p.user_package?.package?.name}, {p.reference}</p>
                        </div>
                        <Badge color="yellow">{p.amount} €</Badge>
                    </div>
                ))}
            </div>
            {(!data?.data?.length && !isLoading) && (
                <div className="p-8 text-center text-[#6674A3] text-sm">Nema plaćanja na čekanju.</div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════
// OGLASI
// ═══════════════════════════════════════

function AdminAds() {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [boostModal, setBoostModal] = useState(null); // { id, adTitle, featured }
    const [selectedPackage, setSelectedPackage] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-ads', page, search, status],
        queryFn: () => axios.get('/admin/ads', { params: { page, search, status, per_page: 20 } }).then(r => r.data)
    });

    // Dohvati ad_boost pakete za modal
    const { data: boostPackages } = useQuery({
        queryKey: ['boost-packages'],
        queryFn: () => axios.get('/packages', { params: { type: 'ad_boost' } }).then(r => r.data)
    });

    const setStatusMutation = useMutation({
        mutationFn: ({ id, st }) => axios.put(`/admin/ads/${id}/status`, { status: st }),
        onSuccess: () => { toast.success('Status ažuriran.'); qc.invalidateQueries({ queryKey: ['admin-ads'] }); }
    });

    const grantBoost = useMutation({
        mutationFn: ({ id, package_id }) => axios.post(`/admin/ads/${id}/grant-boost`, { package_id }),
        onSuccess: (res) => {
            toast.success(res.data.message);
            qc.invalidateQueries({ queryKey: ['admin-ads'] });
            setBoostModal(null);
            setSelectedPackage('');
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.')
    });

    const removeFeatured = useMutation({
        mutationFn: (id) => axios.post(`/admin/ads/${id}/toggle-featured`),
        onSuccess: (res) => { toast.success(res.data.message); qc.invalidateQueries({ queryKey: ['admin-ads'] }); }
    });

    const togglePinned = useMutation({
        mutationFn: (id) => axios.post(`/admin/ads/${id}/toggle-pinned`),
        onSuccess: (res) => { toast.success(res.data.message); qc.invalidateQueries({ queryKey: ['admin-ads'] }); }
    });

    const deleteAd = useMutation({
        mutationFn: (id) => axios.delete(`/admin/ads/${id}`),
        onSuccess: () => { toast.success('Oglas obrisan.'); qc.invalidateQueries({ queryKey: ['admin-ads'] }); }
    });

    const openBoostModal = (ad) => {
        setBoostModal({ id: ad.id, adTitle: ad.title, featured: ad.featured });
        setSelectedPackage(boostPackages?.[0]?.id?.toString() ?? '');
    };

    const statusColor = { active: 'green', pending: 'yellow', rejected: 'red', inactive: 'gray', sold: 'blue', expired: 'gray' };
    const statusLabel = { active: 'Aktivan', pending: 'Na čekanju', rejected: 'Odbijen', inactive: 'Neaktivan', sold: 'Prodat', expired: 'Istekao' };

    return (
        <div className="p-6">
            <PageHeader title="Oglasi" subtitle={`Ukupno: ${data?.total ?? 0}`} />

            {/* Filteri */}
            <div className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] p-4 mb-4 flex flex-wrap gap-3">
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Pretraži naslov, ad_code..."
                    className="border border-white/10 rounded-xl px-3 py-2 text-sm bg-[#12142D] text-white placeholder-[#6674A3] focus:outline-none focus:border-[#FF0026] flex-1 min-w-48" />
                <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
                    className="border border-white/10 rounded-xl px-3 py-2 text-sm bg-[#12142D] text-white placeholder-[#6674A3] focus:outline-none focus:border-[#FF0026]">
                    <option value="">Svi statusi</option>
                    <option value="pending">Na čekanju</option>
                    <option value="active">Aktivan</option>
                    <option value="inactive">Neaktivan</option>
                    <option value="rejected">Odbijen</option>
                    <option value="sold">Prodat</option>
                    <option value="expired">Istekao</option>
                </select>
            </div>

            <div className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] overflow-hidden">
                {isLoading && <div className="p-8 text-center text-[#6674A3]">Učitavanje...</div>}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.06] bg-white/[0.04]">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Oglas</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Korisnik</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Cijena</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Oznake</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-[#6674A3]">Akcije</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.06]">
                            {data?.data?.map(ad => (
                                <tr key={ad.id} className="hover:bg-white/[0.04]">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={ad.primary_image ? `http://localhost:8000${ad.primary_image}` : '/placeholder-car.jpg'}
                                                className="w-12 h-9 object-cover rounded-lg bg-white/[0.06] flex-shrink-0"
                                                alt=""
                                            />
                                            <div>
                                                <p className="font-semibold text-white truncate max-w-48">{ad.title}</p>
                                                <p className="text-xs text-[#6674A3]">{ad.ad_code ?? `#${ad.id}`}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-white">{ad.user?.name ?? 'Nepoznato'}</p>
                                        <p className="text-xs text-[#6674A3]">{ad.city?.name}</p>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-white">
                                        {Number(ad.price).toLocaleString()} €
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={ad.status}
                                            onChange={e => setStatusMutation.mutate({ id: ad.id, st: e.target.value })}
                                            className="text-xs border border-white/10 bg-[#12142D] text-white rounded-lg px-2 py-1 focus:outline-none focus:border-[#FF0026]">
                                            {Object.entries(statusLabel).map(([v, l]) => (
                                                <option key={v} value={v}>{l}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            {ad.featured && <Badge color="yellow">Istaknuto</Badge>}
                                            {ad.pinned   && <Badge color="blue">Prikvačen</Badge>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1.5 justify-end">
                                            <Btn size="sm" variant="secondary" onClick={() => navigate(`/admin/ads/${ad.id}`)}><Ic d={IC.pencil} /></Btn>
                                            <Btn size="sm" variant={ad.featured ? 'yellow' : 'secondary'} onClick={() => ad.featured ? removeFeatured.mutate(ad.id) : openBoostModal(ad)}><Ic d={IC.star} /></Btn>
                                            <Btn size="sm" variant={ad.pinned   ? 'yellow' : 'secondary'} onClick={() => togglePinned.mutate(ad.id)}><Ic d={IC.pin} /></Btn>
                                            <a href={`/ads/${ad.slug}`} target="_blank" rel="noreferrer">
                                                <Btn size="sm" variant="secondary"><Ic d={IC.eye} /></Btn>
                                            </a>
                                            <Btn size="sm" variant="danger" onClick={() => window.confirm('Obrisati oglas?') && deleteAd.mutate(ad.id)}><Ic d={IC.trash} /></Btn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination meta={data?.meta} onPage={setPage} />
            </div>

            {/* Modal — dodjela boost paketa */}
            <Modal open={!!boostModal} onClose={() => { setBoostModal(null); setSelectedPackage(''); }}
                title="Dodijeli istaknuto">
                <div className="space-y-4">
                    <p className="text-sm text-[#6674A3]">
                        Oglas: <span className="font-semibold text-white">{boostModal?.adTitle}</span>
                    </p>
                    <div>
                        <label className="block text-xs font-semibold text-[#6674A3] mb-2">Odaberi paket</label>
                        {boostPackages?.length ? (
                            <div className="space-y-2">
                                {boostPackages.map(pkg => (
                                    <label key={pkg.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                                            selectedPackage === pkg.id.toString()
                                                ? 'border-[#FF0026] bg-[#FF0026]/10'
                                                : 'border-white/10 hover:border-white/25'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="boost_package"
                                            value={pkg.id}
                                            checked={selectedPackage === pkg.id.toString()}
                                            onChange={e => setSelectedPackage(e.target.value)}
                                            className="accent-[#FF0026]"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold text-white text-sm">{pkg.name}</p>
                                            <p className="text-xs text-[#6674A3]">{pkg.duration_days} dana, {pkg.description || 'Istaknuto oglašavanje'}</p>
                                        </div>
                                        <Badge color="yellow">Besplatno</Badge>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-[#6674A3]">Nema dostupnih boost paketa.</p>
                        )}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Btn
                            variant="yellow"
                            disabled={!selectedPackage || grantBoost.isPending}
                            onClick={() => grantBoost.mutate({ id: boostModal.id, package_id: parseInt(selectedPackage) })}>
                            {grantBoost.isPending ? 'Dodjeljujem...' : 'Dodijeli paket'}
                        </Btn>
                        <Btn variant="secondary" onClick={() => { setBoostModal(null); setSelectedPackage(''); }}>Otkaži</Btn>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function AdminAdEdit() {
    const navigate = useNavigate();
    const id = window.location.pathname.split('/').pop();
    const qc = useQueryClient();

    const { data: ad, isLoading } = useQuery({
        queryKey: ['admin-ad-edit', id],
        queryFn: () => axios.get(`/admin/ads?search=${id}`).then(r => r.data?.data?.[0])
    });

    const [form, setForm] = useState({});

    useEffect(() => {
        if (ad) setForm({
            title: ad.title ?? '',
            price: ad.price ?? '',
            status: ad.status ?? 'pending',
            featured: ad.featured ?? false,
            pinned: ad.pinned ?? false,
            description: ad.description ?? '',
            year: ad.year ?? '',
            mileage: ad.mileage ?? '',
            fuel_type: ad.fuel_type ?? '',
            transmission: ad.transmission ?? '',
            body_type: ad.body_type ?? '',
            condition: ad.condition ?? '',
            color_exterior: ad.color_exterior ?? '',
            color_interior: ad.color_interior ?? '',
            power_kw: ad.power_kw ?? '',
            engine_cc: ad.engine_cc ?? '',
        });
    }, [ad]);

    const save = useMutation({
        mutationFn: (data) => axios.put(`/admin/ads/${id}`, data),
        onSuccess: () => { toast.success('Oglas ažuriran.'); navigate('/admin/ads'); }
    });

    const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    if (isLoading) return <div className="p-6 text-[#6674A3]">Učitavanje...</div>;

    return (
        <div className="p-6 max-w-3xl">
            <PageHeader title="Uredi oglas" action={
                <Btn variant="secondary" onClick={() => navigate('/admin/ads')}>Nazad</Btn>
            } />
            <div className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <Input label="Naslov" value={form.title ?? ''} onChange={f('title')} />
                    </div>
                    <Input label="Cijena (€)" type="number" value={form.price ?? ''} onChange={f('price')} />
                    <Input label="Godina" type="number" value={form.year ?? ''} onChange={f('year')} />
                    <Input label="Kilometraža" type="number" value={form.mileage ?? ''} onChange={f('mileage')} />
                    <Input label="Snaga (kW)" type="number" value={form.power_kw ?? ''} onChange={f('power_kw')} />
                    <Input label="Kubikaza (cc)" type="number" value={form.engine_cc ?? ''} onChange={f('engine_cc')} />
                    <Input label="Gorivo" value={form.fuel_type ?? ''} onChange={f('fuel_type')} />
                    <Input label="Mjenjač" value={form.transmission ?? ''} onChange={f('transmission')} />
                    <Input label="Karoserija" value={form.body_type ?? ''} onChange={f('body_type')} />
                    <Input label="Stanje" value={form.condition ?? ''} onChange={f('condition')} />
                    <Input label="Boja eksterijera" value={form.color_exterior ?? ''} onChange={f('color_exterior')} />
                    <Input label="Boja interijera" value={form.color_interior ?? ''} onChange={f('color_interior')} />
                    <Select label="Status" value={form.status ?? ''} onChange={f('status')}>
                        <option value="active">Aktivan</option>
                        <option value="pending">Na čekanju</option>
                        <option value="inactive">Neaktivan</option>
                        <option value="rejected">Odbijen</option>
                        <option value="sold">Prodat</option>
                        <option value="expired">Istekao</option>
                    </Select>
                    <div className="col-span-2">
                        <label className="block text-xs font-semibold text-[#6674A3] mb-1">Opis</label>
                        <textarea value={form.description ?? ''} onChange={f('description')} rows={4}
                            className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm bg-[#12142D] text-white placeholder-[#6674A3] focus:outline-none focus:border-[#FF0026] resize-none" />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                        <input type="checkbox" checked={form.featured ?? false} onChange={f('featured')} className="rounded" />
                        Istaknuto (bez plaćanja)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                        <input type="checkbox" checked={form.pinned ?? false} onChange={f('pinned')} className="rounded" />
                        Prikvačen na vrh
                    </label>
                </div>
                <div className="flex gap-3 pt-2">
                    <Btn onClick={() => save.mutate(form)} disabled={save.isPending}>
                        {save.isPending ? 'Čuvanje...' : 'Sačuvaj izmjene'}
                    </Btn>
                    <Btn variant="secondary" onClick={() => navigate('/admin/ads')}>Otkaži</Btn>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════
// KORISNICI
// ═══════════════════════════════════════

function AdminUsers() {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', page, search, role],
        queryFn: () => axios.get('/admin/users', { params: { page, search, role, per_page: 20 } }).then(r => r.data)
    });

    const toggleActive = useMutation({
        mutationFn: (id) => axios.put(`/admin/users/${id}/toggle-active`),
        onSuccess: (res) => { toast.success(res.data.message); qc.invalidateQueries({ queryKey: ['admin-users'] }); }
    });

    const updateRole = useMutation({
        mutationFn: ({ id, role: r }) => axios.put(`/admin/users/${id}/role`, { role: r }),
        onSuccess: () => { toast.success('Uloga ažurirana.'); qc.invalidateQueries({ queryKey: ['admin-users'] }); }
    });

    const roleColor = { admin: 'red', moderator: 'purple', dealer: 'blue', user: 'gray' };

    return (
        <div className="p-6">
            <PageHeader title="Korisnici" subtitle={`Ukupno: ${data?.total ?? 0}`} />

            <div className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] p-4 mb-4 flex flex-wrap gap-3">
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Pretraži ime, email..."
                    className="border border-white/10 rounded-xl px-3 py-2 text-sm bg-[#12142D] text-white placeholder-[#6674A3] focus:outline-none focus:border-[#FF0026] flex-1 min-w-48" />
                <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }}
                    className="border border-white/10 rounded-xl px-3 py-2 text-sm bg-[#12142D] text-white placeholder-[#6674A3] focus:outline-none focus:border-[#FF0026]">
                    <option value="">Sve uloge</option>
                    <option value="user">Korisnik</option>
                    <option value="dealer">Diler</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            <div className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] overflow-hidden">
                {isLoading && <div className="p-8 text-center text-[#6674A3]">Učitavanje...</div>}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.06] bg-white/[0.04]">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Korisnik</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Uloga</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Oglasi</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Registrovan</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-[#6674A3]">Akcije</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.06]">
                            {data?.data?.map(u => (
                                <tr key={u.id} className="hover:bg-white/[0.04]">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {u.avatar
                                                    ? <img src={`http://localhost:8000/storage/${u.avatar}`} className="w-full h-full object-cover" alt="" />
                                                    : <span className="text-sm font-bold text-[#6674A3]">{u.name?.[0]}</span>
                                                }
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{u.name}</p>
                                                <p className="text-xs text-[#6674A3]">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <select value={u.role}
                                            onChange={e => updateRole.mutate({ id: u.id, role: e.target.value })}
                                            className="text-xs border border-white/10 bg-[#12142D] text-white rounded-lg px-2 py-1 focus:outline-none focus:border-[#FF0026]">
                                            <option value="user">Korisnik</option>
                                            <option value="dealer">Diler</option>
                                            <option value="moderator">Moderator</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-white font-semibold">{u.ads_count ?? 0}</td>
                                    <td className="px-4 py-3">
                                        <Badge color={u.is_active ? 'green' : 'red'}>
                                            {u.is_active ? 'Aktivan' : 'Blokiran'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-[#6674A3] text-xs">
                                        {new Date(u.created_at).toLocaleDateString('bs')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1.5 justify-end">
                                            <Btn size="sm" variant="secondary" onClick={() => navigate(`/admin/users/${u.id}`)}>
                                                Detalji
                                            </Btn>
                                            <Btn size="sm" variant={u.is_active ? 'danger' : 'success'}
                                                onClick={() => toggleActive.mutate(u.id)}>
                                                {u.is_active ? 'Blokiraj' : 'Aktiviraj'}
                                            </Btn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination meta={data?.meta} onPage={setPage} />
            </div>
        </div>
    );
}

function AdminUserDetail() {
    const qc = useQueryClient();
    const id = window.location.pathname.split('/').pop();
    const navigate = useNavigate();
    const [privModal, setPrivModal] = useState(false);
    const [pkgModal, setPkgModal] = useState(false);
    const [privForm, setPrivForm] = useState({ privilege_key: '', privilege_value: '', expires_at: '', note: '' });
    const [pkgForm, setPkgForm] = useState({ package_id: '', ad_id: '', note: '' });

    const { data: user } = useQuery({
        queryKey: ['admin-user', id],
        queryFn: () => axios.get(`/admin/users/${id}`).then(r => r.data)
    });

    const { data: privileges } = useQuery({
        queryKey: ['admin-user-privileges', id],
        queryFn: () => axios.get(`/admin/users/${id}/privileges`).then(r => r.data)
    });

    const { data: availPriv } = useQuery({
        queryKey: ['admin-available-privileges'],
        queryFn: () => axios.get('/admin/privileges/available').then(r => r.data)
    });

    const { data: listingPackages } = useQuery({
        queryKey: ['admin-listing-packages'],
        queryFn: () => axios.get('/packages', { params: { type: 'account' } }).then(r => r.data)
    });

    const grantPriv = useMutation({
        mutationFn: (data) => axios.post(`/admin/users/${id}/privileges`, data),
        onSuccess: () => {
            toast.success('Privilegija dodijeljena.');
            qc.invalidateQueries({ queryKey: ['admin-user-privileges', id] });
            setPrivModal(false);
            setPrivForm({ privilege_key: '', privilege_value: '', expires_at: '', note: '' });
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.')
    });

    const revokePriv = useMutation({
        mutationFn: (privId) => axios.delete(`/admin/users/${id}/privileges/${privId}`),
        onSuccess: () => { toast.success('Privilegija uklonjena.'); qc.invalidateQueries({ queryKey: ['admin-user-privileges', id] }); }
    });

    const grantPkg = useMutation({
        mutationFn: (data) => axios.post('/admin/packages/grant', { user_id: id, ...data }),
        onSuccess: () => {
            toast.success('Paket dodijeljen.');
            setPkgModal(false);
            setPkgForm({ package_id: '', ad_id: '', note: '' });
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.')
    });
    if (!user) return <div className="p-6 text-[#6674A3]">Učitavanje...</div>;

    return (
        <div className="p-6 max-w-4xl">
            <PageHeader title={user.name} subtitle={user.email}
                action={<Btn variant="secondary" onClick={() => navigate('/admin/users')}>Nazad</Btn>} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Info kartica */}
                <div className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-full bg-white/[0.06] flex items-center justify-center overflow-hidden">
                            {user.avatar
                                ? <img src={`http://localhost:8000/storage/${user.avatar}`} className="w-full h-full object-cover" alt="" />
                                : <span className="text-xl font-bold text-[#6674A3]">{user.name?.[0]}</span>
                            }
                        </div>
                        <div>
                            <p className="font-black text-white">{user.name}</p>
                            <Badge color={{ admin: 'red', moderator: 'purple', dealer: 'blue', user: 'gray' }[user.role] ?? 'gray'}>
                                {user.role}
                            </Badge>
                        </div>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-[#6674A3]">Email</span>
                            <span className="text-white font-medium">{user.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#6674A3]">Oglasi</span>
                            <span className="font-semibold text-white">{user.ads_count ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#6674A3]">Status</span>
                            <Badge color={user.is_active ? 'green' : 'red'}>{user.is_active ? 'Aktivan' : 'Blokiran'}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#6674A3]">Registrovan</span>
                            <span className="text-xs text-[#6674A3]">{new Date(user.created_at).toLocaleDateString('bs')}</span>
                        </div>
                    </div>
                </div>

                {/* Privilegije */}
                <div className="lg:col-span-2 bg-[#1A1D3A] rounded-2xl border border-white/[0.06] overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <h2 className="font-black text-white">Privilegije</h2>
                        <div className="flex gap-2">
                            <Btn size="sm" variant="yellow" onClick={() => setPkgModal(true)}>Dodjeli paket</Btn>
                            <Btn size="sm" onClick={() => setPrivModal(true)}>Dodaj privilegiju</Btn>
                        </div>
                    </div>
                    <div className="divide-y divide-white/[0.06]">
                        {privileges?.length === 0 && (
                            <p className="text-center text-[#6674A3] text-sm py-8">Nema dodijeljenih privilegija.</p>
                        )}
                        {privileges?.map(priv => (
                            <div key={priv.id} className="flex items-center justify-between px-5 py-3">
                                <div>
                                    <p className="font-semibold text-sm text-white">{priv.privilege_key}</p>
                                    <div className="flex gap-2 mt-0.5">
                                        {priv.privilege_value && <span className="text-xs text-[#6674A3]">Vrijednost: {priv.privilege_value}</span>}
                                        {priv.expires_at && <span className="text-xs text-[#6674A3]">Ističe: {new Date(priv.expires_at).toLocaleDateString('bs')}</span>}
                                        {priv.granted_by && <span className="text-xs text-[#6674A3]">Od: {priv.granted_by?.name}</span>}
                                    </div>
                                    {priv.note && <p className="text-xs text-[#6674A3] mt-0.5">{priv.note}</p>}
                                </div>
                                <Btn size="sm" variant="danger" onClick={() => revokePriv.mutate(priv.id)}>Ukloni</Btn>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal — privilegija */}
            <Modal open={privModal} onClose={() => setPrivModal(false)} title="Dodaj privilegiju">
                <div className="space-y-4">
                    <Select label="Privilegija" value={privForm.privilege_key}
                        onChange={e => setPrivForm(p => ({ ...p, privilege_key: e.target.value }))}>
                        <option value="">Odaberi...</option>
                        {availPriv?.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                    </Select>
                    <Input label="Vrijednost (opciono)" value={privForm.privilege_value}
                        onChange={e => setPrivForm(p => ({ ...p, privilege_value: e.target.value }))}
                        placeholder="npr. 10 za custom_max_ads" />
                    <Input label="Ističe (opciono)" type="date" value={privForm.expires_at}
                        onChange={e => setPrivForm(p => ({ ...p, expires_at: e.target.value }))} />
                    <Input label="Napomena" value={privForm.note}
                        onChange={e => setPrivForm(p => ({ ...p, note: e.target.value }))} />
                    <div className="flex gap-3 pt-2">
                        <Btn onClick={() => grantPriv.mutate(privForm)} disabled={!privForm.privilege_key || grantPriv.isPending}>
                            {grantPriv.isPending ? 'Dodavanje...' : 'Dodaj privilegiju'}
                        </Btn>
                        <Btn variant="secondary" onClick={() => setPrivModal(false)}>Otkaži</Btn>
                    </div>
                </div>
            </Modal>

            {/* Modal — paket */}
            <Modal open={pkgModal} onClose={() => { setPkgModal(false); setPkgForm({ package_id: '', ad_id: '', note: '' }); }} title="Dodjeli nalog paket">
                <div className="space-y-4">
                    <p className="text-sm text-[#6674A3]">Odaberi paket koji želiš dodijeliti korisniku <strong className="text-white">{user.name}</strong> besplatno.</p>
                    <div className="space-y-2">
                        {listingPackages?.map(pkg => (
                            <label key={pkg.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                                    pkgForm.package_id === pkg.id.toString()
                                        ? 'border-[#FF0026] bg-[#FF0026]/10'
                                        : 'border-white/10 hover:border-white/25'
                                }`}>
                                <input
                                    type="radio"
                                    name="listing_package"
                                    value={pkg.id}
                                    checked={pkgForm.package_id === pkg.id.toString()}
                                    onChange={e => setPkgForm(p => ({ ...p, package_id: e.target.value }))}
                                    className="accent-[#FF0026]"
                                />
                                <div className="flex-1">
                                    <p className="font-semibold text-white text-sm">{pkg.name}</p>
                                    <p className="text-xs text-[#6674A3]">
                                        {pkg.duration_days} dana, max {pkg.max_active_ads ?? 'neograničeno'} oglasa
                                        {pkg.featured ? ', Premium' : ''}
                                    </p>
                                </div>
                                <Badge color="green">Besplatno</Badge>
                            </label>
                        ))}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Btn variant="primary" onClick={() => grantPkg.mutate(pkgForm)} disabled={!pkgForm.package_id || grantPkg.isPending}>
                            {grantPkg.isPending ? 'Dodjeljivanje...' : 'Dodjeli paket'}
                        </Btn>
                        <Btn variant="secondary" onClick={() => { setPkgModal(false); setPkgForm({ package_id: '', ad_id: '', note: '' }); }}>Otkaži</Btn>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// ═══════════════════════════════════════
// PRIJAVE
// ═══════════════════════════════════════

function AdminReports() {
    const qc = useQueryClient();
    const [status, setStatus] = useState('pending');
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-reports', status, page],
        queryFn: () => axios.get('/admin/reports', { params: { status, page } }).then(r => r.data)
    });

    const resolve = useMutation({
        mutationFn: (id) => axios.put(`/admin/reports/${id}/resolve`),
        onSuccess: () => { toast.success('Prijava riješena.'); qc.invalidateQueries({ queryKey: ['admin-reports'] }); }
    });

    return (
        <div className="p-6">
            <PageHeader title="Prijave" subtitle={`Ukupno: ${data?.total ?? 0}`} />

            <div className="flex gap-2 mb-4">
                {['pending', 'resolved', ''].map(s => (
                    <Btn key={s} size="sm" variant={status === s ? 'primary' : 'secondary'} onClick={() => { setStatus(s); setPage(1); }}>
                        {s === 'pending' ? 'Na čekanju' : s === 'resolved' ? 'Riješene' : 'Sve'}
                    </Btn>
                ))}
            </div>

            <div className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] overflow-hidden">
                {isLoading && <div className="p-8 text-center text-[#6674A3]">Učitavanje...</div>}
                <div className="divide-y divide-white/[0.06]">
                    {data?.data?.map(report => (
                        <div key={report.id} className="px-5 py-4 hover:bg-white/[0.04]">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge color={report.status === 'pending' ? 'yellow' : 'green'}>
                                            {report.status === 'pending' ? 'Na čekanju' : 'Riješeno'}
                                        </Badge>
                                        <span className="text-xs text-[#6674A3]">{new Date(report.created_at).toLocaleDateString('bs')}</span>
                                    </div>
                                    <p className="font-semibold text-sm text-white">{report.reason ?? 'Bez razloga'}</p>
                                    {report.description && <p className="text-xs text-[#6674A3] mt-1">{report.description}</p>}
                                    <div className="flex gap-3 mt-2 text-xs text-[#6674A3]">
                                        <span>Korisnik: <strong className="text-white">{report.user?.name}</strong></span>
                                        {report.ad && (
                                            <a href={`/ads/${report.ad.slug}`} target="_blank" rel="noreferrer"
                                                className="text-[#FF0026] hover:underline">
                                                Oglas: {report.ad.title}
                                            </a>
                                        )}
                                    </div>
                                </div>
                                {report.status === 'pending' && (
                                    <Btn size="sm" variant="success" onClick={() => resolve.mutate(report.id)}>
                                        Riješi
                                    </Btn>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {(!data?.data?.length && !isLoading) && (
                    <div className="p-8 text-center text-[#6674A3] text-sm">Nema prijava.</div>
                )}
                <Pagination meta={data?.meta} onPage={setPage} />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════
// MARKE & MODELI
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// ADMIN MARKE & MODELI — kompletna zamjena za AdminMakes() u AdminPanel.jsx
// ═══════════════════════════════════════

function AdminMakes() {
    const qc = useQueryClient();
    const [selectedMake, setSelectedMake] = useState(null);
    const [selectedParent, setSelectedParent] = useState(null); // za dodavanje podmodela
    const [activeCat, setActiveCat] = useState('');             // filter kategorije
    const [makeSearch, setMakeSearch] = useState('');
    const [makeModal, setMakeModal] = useState(false);
    const [modelModal, setModelModal] = useState(false);
    const [editingMake, setEditingMake] = useState(null);
    const [editingModel, setEditingModel] = useState(null);
    const [makeForm, setMakeForm] = useState({ name: '', country: '', category_id: '', is_active: true });
    const [modelForm, setModelForm] = useState({ name: '', year_from: '', year_to: '', is_active: true });

    // Kategorije
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => axios.get('/categories').then(r => r.data.data ?? r.data),
        staleTime: Infinity,
    });

    // Marke filtrirane po kategoriji
    const { data: makes, isLoading: makesLoading } = useQuery({
        queryKey: ['admin-makes', activeCat],
        queryFn: () => axios.get('/admin/makes', {
            params: { category_id: activeCat || undefined }
        }).then(r => r.data),
    });

    // Modeli za odabranu marku (root + children)
    const { data: modelsData } = useQuery({
        queryKey: ['admin-models', selectedMake?.id],
        queryFn: () => axios.get('/admin/models', {
            params: { make_id: selectedMake?.id, per_page: 200 }
        }).then(r => r.data),
        enabled: !!selectedMake,
    });

    // Grupiraj modele: root modeli sa djecom
    const rootModels = (modelsData?.data ?? []).filter(m => !m.parent_id);
    const childrenMap = (modelsData?.data ?? []).reduce((acc, m) => {
        if (m.parent_id) {
            if (!acc[m.parent_id]) acc[m.parent_id] = [];
            acc[m.parent_id].push(m);
        }
        return acc;
    }, {});

    // Mutations
    const saveMake = useMutation({
        mutationFn: (d) => editingMake
            ? axios.put(`/admin/makes/${editingMake.id}`, d)
            : axios.post('/admin/makes', d),
        onSuccess: () => {
            toast.success(editingMake ? 'Marka ažurirana.' : 'Marka dodana.');
            qc.invalidateQueries({ queryKey: ['admin-makes'] });
            closeMakeModal();
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.'),
    });

    const deleteMake = useMutation({
        mutationFn: (id) => axios.delete(`/admin/makes/${id}`),
        onSuccess: () => {
            toast.success('Marka obrisana.');
            qc.invalidateQueries({ queryKey: ['admin-makes'] });
            if (selectedMake?.id === deleteMake.variables) setSelectedMake(null);
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.'),
    });

    const saveModel = useMutation({
        mutationFn: (d) => editingModel
            ? axios.put(`/admin/models/${editingModel.id}`, d)
            : axios.post('/admin/models', {
                ...d,
                make_id: selectedMake?.id,
                parent_id: selectedParent?.id ?? null,
            }),
        onSuccess: () => {
            toast.success(editingModel ? 'Model ažuriran.' : 'Model dodan.');
            qc.invalidateQueries({ queryKey: ['admin-models', selectedMake?.id] });
            closeModelModal();
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.'),
    });

    const deleteModel = useMutation({
        mutationFn: (id) => axios.delete(`/admin/models/${id}`),
        onSuccess: () => {
            toast.success('Model obrisan.');
            qc.invalidateQueries({ queryKey: ['admin-models', selectedMake?.id] });
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.'),
    });

    const toggleModelActive = useMutation({
        mutationFn: ({ id, is_active, name, year_from, year_to }) =>
            axios.put(`/admin/models/${id}`, { name, year_from, year_to, is_active: !is_active }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-models', selectedMake?.id] }),
    });

    // Helpers
    const openAddMake = () => {
        setEditingMake(null);
        setMakeForm({ name: '', country: '', category_id: activeCat || '', is_active: true });
        setMakeModal(true);
    };
    const openEditMake = (m) => {
        setEditingMake(m);
        setMakeForm({ name: m.name, country: m.country ?? '', category_id: m.category_id ?? '', is_active: m.is_active });
        setMakeModal(true);
    };
    const closeMakeModal = () => { setMakeModal(false); setEditingMake(null); };

    const openAddModel = (parent = null) => {
        setEditingModel(null);
        setSelectedParent(parent);
        setModelForm({ name: '', year_from: '', year_to: '', is_active: true });
        setModelModal(true);
    };
    const openEditModel = (m) => {
        setEditingModel(m);
        setSelectedParent(null);
        setModelForm({ name: m.name, year_from: m.year_from ?? '', year_to: m.year_to ?? '', is_active: m.is_active });
        setModelModal(true);
    };
    const closeModelModal = () => { setModelModal(false); setEditingModel(null); setSelectedParent(null); };

    const catLabel = (id) => categories?.find(c => c.id == id)?.name ?? '—';

    const filteredMakes = (makes ?? []).filter(m =>
        m.name.toLowerCase().includes(makeSearch.toLowerCase())
    );

    const catColors = { 1: 'blue', 2: 'purple', 3: 'green', 4: 'yellow' };
    const catColor = (id) => ({ blue: 'bg-blue-100 text-blue-700', purple: 'bg-purple-100 text-purple-700', green: 'bg-green-500/15 text-green-400', yellow: 'bg-yellow-100 text-yellow-700' }[catColors[id]] ?? 'bg-white/[0.06] text-[#6674A3]');

    return (
        <div className="p-6">
            <PageHeader
                title="Marke & Modeli"
                subtitle="Odvojeno po kategoriji vozila"
                action={<Btn onClick={openAddMake}>Dodaj marku</Btn>}
            />

            {/* Kategorija filter tabovi */}
            <div className="flex gap-2 mb-4 flex-wrap">
                <Btn size="sm" variant={activeCat === '' ? 'primary' : 'secondary'} onClick={() => { setActiveCat(''); setSelectedMake(null); }}>
                    Sve kategorije
                </Btn>
                {categories?.map(cat => (
                    <Btn key={cat.id} size="sm"
                        variant={activeCat == cat.id ? 'primary' : 'secondary'}
                        onClick={() => { setActiveCat(cat.id); setSelectedMake(null); }}>
                        {cat.name}
                    </Btn>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── Lista marki ── */}
                <div className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] overflow-hidden">
                    <div className="p-4 border-b border-white/[0.06]">
                        <input value={makeSearch} onChange={e => setMakeSearch(e.target.value)}
                            placeholder="Pretraži marku..."
                            className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm bg-[#12142D] text-white placeholder-[#6674A3] focus:outline-none focus:border-[#FF0026]" />
                    </div>
                    {makesLoading && <div className="p-8 text-center text-[#6674A3] text-sm">Učitavanje...</div>}
                    <div className="divide-y divide-white/[0.06] max-h-[600px] overflow-y-auto">
                        {filteredMakes.map(m => (
                            <div key={m.id}
                                onClick={() => setSelectedMake(m)}
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition ${
                                    selectedMake?.id === m.id
                                        ? 'bg-[#FF0026]/5 border-l-2 border-[#FF0026]'
                                        : 'hover:bg-white/[0.04]'
                                }`}>
                                {/* Logo placeholder */}
                                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#6674A3]">
                                    {m.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-sm text-white">{m.name}</p>
                                        {!m.is_active && <span className="text-xs bg-white/[0.06] text-[#6674A3] px-1.5 py-0.5 rounded">Neaktivna</span>}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${catColor(m.category_id)}`}>
                                            {catLabel(m.category_id)}
                                        </span>
                                        {m.country && <span className="text-xs text-[#6674A3]">{m.country}</span>}
                                        <span className="text-xs text-[#6674A3]">{m.models_count ?? 0} modela</span>
                                    </div>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                    <Btn size="sm" variant="secondary" onClick={() => openEditMake(m)}>✏️</Btn>
                                    <Btn size="sm" variant="danger"
                                        onClick={() => window.confirm(`Obrisati marku "${m.name}"?`) && deleteMake.mutate(m.id)}>
                                        🗑
                                    </Btn>
                                </div>
                            </div>
                        ))}
                        {!makesLoading && filteredMakes.length === 0 && (
                            <div className="p-8 text-center text-[#6674A3] text-sm">Nema marki.</div>
                        )}
                    </div>
                </div>

                {/* ── Modeli sa hijerarhijom ── */}
                <div className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <div>
                            <h2 className="font-black text-white">
                                {selectedMake ? selectedMake.name : 'Odaberi marku →'}
                            </h2>
                            {selectedMake && (
                                <p className="text-xs text-[#6674A3] mt-0.5">{catLabel(selectedMake.category_id)}</p>
                            )}
                        </div>
                        {selectedMake && (
                            <Btn size="sm" onClick={() => openAddModel(null)}>Dodaj seriju/model</Btn>
                        )}
                    </div>

                    {!selectedMake && (
                        <div className="p-8 text-center text-[#6674A3] text-sm">← Klikni na marku da vidiš modele</div>
                    )}

                    <div className="divide-y divide-white/[0.06] max-h-[600px] overflow-y-auto">
                        {rootModels.map(rootModel => (
                            <div key={rootModel.id}>
                                {/* Root model / Serija */}
                                <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04]">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {childrenMap[rootModel.id]?.length > 0 && (
                                                <span className="text-[#6674A3] text-xs">📁</span>
                                            )}
                                            <p className="font-semibold text-sm text-white">{rootModel.name}</p>
                                            {!rootModel.is_active && (
                                                <span className="text-xs bg-white/[0.06] text-[#6674A3] px-1.5 py-0.5 rounded">Neaktivan</span>
                                            )}
                                            {childrenMap[rootModel.id]?.length > 0 && (
                                                <span className="text-xs text-[#6674A3]">
                                                    ({childrenMap[rootModel.id].length} modela)
                                                </span>
                                            )}
                                        </div>
                                        {(rootModel.year_from || rootModel.year_to) && (
                                            <p className="text-xs text-[#6674A3] mt-0.5">
                                                {rootModel.year_from && rootModel.year_to
                                                    ? `${rootModel.year_from}–${rootModel.year_to}`
                                                    : rootModel.year_from
                                                    ? `od ${rootModel.year_from}`
                                                    : `do ${rootModel.year_to}`}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-1.5 flex-shrink-0">
                                        <Btn size="sm" variant="secondary"
                                            onClick={() => openAddModel(rootModel)}
                                            title="Dodaj podmodel">
                                            Podmodel
                                        </Btn>
                                        <Btn size="sm" variant="secondary" onClick={() => openEditModel(rootModel)}>✏️</Btn>
                                        <Btn size="sm" variant="danger"
                                            onClick={() => window.confirm('Obrisati model i sve podmodele?') && deleteModel.mutate(rootModel.id)}>
                                            🗑
                                        </Btn>
                                    </div>
                                </div>

                                {/* Podmodeli (npr. 318d, 320d unutar Serije 3) */}
                                {childrenMap[rootModel.id]?.map(child => (
                                    <div key={child.id}
                                        className={`flex items-center gap-3 pl-10 pr-4 py-2.5 hover:bg-white/[0.04] ${!child.is_active ? 'opacity-50' : ''}`}>
                                        <div className="w-3 h-3 border-l-2 border-b-2 border-white/10 flex-shrink-0 -mt-1" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white">{child.name}</p>
                                            {(child.year_from || child.year_to) && (
                                                <p className="text-xs text-[#6674A3]">
                                                    {child.year_from && child.year_to
                                                        ? `${child.year_from}–${child.year_to}`
                                                        : child.year_from ? `od ${child.year_from}` : `do ${child.year_to}`}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => toggleModelActive.mutate(child)}
                                                className={`text-xs px-2 py-0.5 rounded-full font-medium transition ${
                                                    child.is_active ? 'bg-green-500/15 text-green-400' : 'bg-white/[0.06] text-[#6674A3]'
                                                }`}>
                                                {child.is_active ? '✓' : '✗'}
                                            </button>
                                            <Btn size="sm" variant="secondary" onClick={() => openEditModel(child)}>✏️</Btn>
                                            <Btn size="sm" variant="danger"
                                                onClick={() => window.confirm('Obrisati podmodel?') && deleteModel.mutate(child.id)}>
                                                🗑
                                            </Btn>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                        {selectedMake && rootModels.length === 0 && (
                            <div className="p-8 text-center text-[#6674A3] text-sm">
                                Nema modela. <button onClick={() => openAddModel(null)} className="text-[#FF0026] hover:underline">Dodaj prvi →</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Modal: Dodaj/Uredi marku ── */}
            <Modal open={makeModal} onClose={closeMakeModal}
                title={editingMake ? `Uredi marku — ${editingMake.name}` : 'Dodaj marku'}>
                <div className="space-y-4">
                    <Input label="Naziv marke *" value={makeForm.name}
                        onChange={e => setMakeForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="npr. Honda" />
                    <Select label="Kategorija vozila *" value={makeForm.category_id}
                        onChange={e => setMakeForm(p => ({ ...p, category_id: e.target.value }))}>
                        <option value="">Odaberi kategoriju...</option>
                        {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                    <Input label="Zemlja porijekla" value={makeForm.country}
                        onChange={e => setMakeForm(p => ({ ...p, country: e.target.value }))}
                        placeholder="npr. Japan" />
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={makeForm.is_active}
                            onChange={e => setMakeForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" />
                        Aktivna marka
                    </label>
                    <div className="flex gap-3 pt-2">
                        <Btn onClick={() => saveMake.mutate(makeForm)}
                            disabled={!makeForm.name || !makeForm.category_id || saveMake.isPending}>
                            {saveMake.isPending ? 'Čuvanje...' : editingMake ? 'Sačuvaj' : 'Dodaj marku'}
                        </Btn>
                        <Btn variant="secondary" onClick={closeMakeModal}>Otkaži</Btn>
                    </div>
                </div>
            </Modal>

            {/* ── Modal: Dodaj/Uredi model ── */}
            <Modal open={modelModal} onClose={closeModelModal}
                title={
                    editingModel
                        ? `Uredi — ${editingModel.name}`
                        : selectedParent
                        ? `Dodaj podmodel u "${selectedParent.name}"`
                        : `Dodaj seriju/model — ${selectedMake?.name}`
                }>
                <div className="space-y-4">
                    {selectedParent && !editingModel && (
                        <div className="bg-white/[0.06] text-[#6674A3] text-xs px-3 py-2 rounded-lg">
                            Podmodel unutar serije: <strong>{selectedParent.name}</strong>
                        </div>
                    )}
                    {!selectedParent && !editingModel && (
                        <div className="bg-white/[0.04] text-[#6674A3] text-xs px-3 py-2 rounded-lg">
                            Dodaješ root model ili seriju. Seriji možeš naknadno dodati podmodele.
                        </div>
                    )}
                    <Input label="Naziv modela/serije *" value={modelForm.name}
                        onChange={e => setModelForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="npr. Serija 3 ili 320d" />
                    
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={modelForm.is_active}
                            onChange={e => setModelForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" />
                        Aktivan model
                    </label>
                    <div className="flex gap-3 pt-2">
                        <Btn onClick={() => saveModel.mutate(modelForm)}
                            disabled={!modelForm.name || saveModel.isPending}>
                            {saveModel.isPending ? 'Čuvanje...' : editingModel ? 'Sačuvaj' : 'Dodaj'}
                        </Btn>
                        <Btn variant="secondary" onClick={closeModelModal}>Otkaži</Btn>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// ═══════════════════════════════════════
// GRADOVI
// ═══════════════════════════════════════

function AdminCities() {
    const qc = useQueryClient();
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', region: '', latitude: '', longitude: '' });
    const [search, setSearch] = useState('');

    const { data: cities, isLoading } = useQuery({
        queryKey: ['admin-cities'],
        queryFn: () => axios.get('/admin/cities').then(r => r.data)
    });

    const save = useMutation({
        mutationFn: (d) => editing ? axios.put(`/admin/cities/${editing.id}`, d) : axios.post('/admin/cities', d),
        onSuccess: () => {
            toast.success(editing ? 'Grad ažuriran.' : 'Grad dodan.');
            qc.invalidateQueries({ queryKey: ['admin-cities'] });
            setModal(false); setEditing(null); setForm({ name: '', region: '', latitude: '', longitude: '' });
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.')
    });

    const remove = useMutation({
        mutationFn: (id) => axios.delete(`/admin/cities/${id}`),
        onSuccess: () => { toast.success('Grad obrisan.'); qc.invalidateQueries({ queryKey: ['admin-cities'] }); }
    });

    const openEdit = (c) => { setEditing(c); setForm({ name: c.name, region: c.region ?? '', latitude: c.latitude ?? '', longitude: c.longitude ?? '' }); setModal(true); };
    const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

    const filtered = cities?.filter(c => c.name.toLowerCase().includes(search.toLowerCase())) ?? [];

    return (
        <div className="p-6">
            <PageHeader title="Gradovi" subtitle={`${cities?.length ?? 0} gradova`}
                action={<Btn onClick={() => { setEditing(null); setForm({ name: '', region: '', latitude: '', longitude: '' }); setModal(true); }}>Dodaj grad</Btn>} />

            <div className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] overflow-hidden">
                <div className="p-4 border-b border-white/[0.06]">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Pretraži grad..."
                        className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm bg-[#12142D] text-white placeholder-[#6674A3] focus:outline-none focus:border-[#FF0026]" />
                </div>
                {isLoading && <div className="p-8 text-center text-[#6674A3]">Učitavanje...</div>}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.06] bg-white/[0.04]">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Naziv</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Regija</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Koordinate</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-[#6674A3]">Akcije</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.06]">
                            {filtered.map(c => (
                                <tr key={c.id} className="hover:bg-white/[0.04]">
                                    <td className="px-4 py-3 font-semibold text-white">{c.name}</td>
                                    <td className="px-4 py-3 text-[#6674A3]">{c.region ?? '—'}</td>
                                    <td className="px-4 py-3 text-xs text-[#6674A3] font-mono">{c.latitude}, {c.longitude}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1.5 justify-end">
                                            <Btn size="sm" variant="secondary" onClick={() => openEdit(c)}>✏️</Btn>
                                            <Btn size="sm" variant="danger" onClick={() => window.confirm('Obrisati grad?') && remove.mutate(c.id)}>🗑</Btn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? 'Uredi grad' : 'Dodaj grad'}>
                <div className="space-y-4">
                    <Input label="Naziv grada" value={form.name} onChange={f('name')} placeholder="npr. Podgorica" />
                    <Input label="Regija" value={form.region} onChange={f('region')} placeholder="npr. Centralna Crna Gora" />
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Latitude" type="number" step="any" value={form.latitude} onChange={f('latitude')} placeholder="42.4415" />
                        <Input label="Longitude" type="number" step="any" value={form.longitude} onChange={f('longitude')} placeholder="19.2636" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Btn onClick={() => save.mutate(form)} disabled={!form.name || save.isPending}>
                            {save.isPending ? 'Čuvanje...' : editing ? 'Sačuvaj' : 'Dodaj grad'}
                        </Btn>
                        <Btn variant="secondary" onClick={() => { setModal(false); setEditing(null); }}>Otkaži</Btn>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// ═══════════════════════════════════════
// OPREMA
// ═══════════════════════════════════════

function AdminEquipment() {
    const qc = useQueryClient();
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', category: '' });
    const [catFilter, setCatFilter] = useState('');

    const { data: equipment, isLoading } = useQuery({
        queryKey: ['admin-equipment', catFilter],
        queryFn: () => axios.get('/admin/equipment', { params: { category: catFilter || undefined } }).then(r => r.data)
    });

    const save = useMutation({
        mutationFn: (d) => editing ? axios.put(`/admin/equipment/${editing.id}`, d) : axios.post('/admin/equipment', d),
        onSuccess: () => {
            toast.success(editing ? 'Oprema ažurirana.' : 'Oprema dodana.');
            qc.invalidateQueries({ queryKey: ['admin-equipment'] });
            setModal(false); setEditing(null); setForm({ name: '', category: '' });
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.')
    });

    const remove = useMutation({
        mutationFn: (id) => axios.delete(`/admin/equipment/${id}`),
        onSuccess: () => { toast.success('Oprema obrisana.'); qc.invalidateQueries({ queryKey: ['admin-equipment'] }); }
    });

    const openEdit = (eq) => { setEditing(eq); setForm({ name: eq.name, category: eq.category ?? '' }); setModal(true); };
    const categories = [...new Set(equipment?.map(e => e.category).filter(Boolean))];

    // Grupirano po kategoriji
    const grouped = equipment?.reduce((acc, eq) => {
        const cat = eq.category ?? 'Ostalo';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(eq);
        return acc;
    }, {});

    return (
        <div className="p-6">
            <PageHeader title="Oprema" subtitle={`${equipment?.length ?? 0} stavki`}
                action={<Btn onClick={() => { setEditing(null); setForm({ name: '', category: '' }); setModal(true); }}>Dodaj opremu</Btn>} />

            <div className="flex gap-2 mb-4 flex-wrap">
                <Btn size="sm" variant={catFilter === '' ? 'primary' : 'secondary'} onClick={() => setCatFilter('')}>Sve</Btn>
                {categories.map(c => (
                    <Btn key={c} size="sm" variant={catFilter === c ? 'primary' : 'secondary'} onClick={() => setCatFilter(c)}>{c}</Btn>
                ))}
            </div>

            {isLoading && <div className="p-8 text-center text-[#6674A3]">Učitavanje...</div>}

            <div className="space-y-4">
                {grouped && Object.entries(grouped).map(([cat, items]) => (
                    <div key={cat} className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] overflow-hidden">
                        <div className="px-5 py-3 border-b border-white/[0.06] bg-white/[0.04]">
                            <h3 className="font-bold text-sm text-white">{cat} <span className="text-[#6674A3] font-normal">({items.length})</span></h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0">
                            {items.map(eq => (
                                <div key={eq.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.04] border-b border-white/[0.06]">
                                    <span className="text-sm text-white">{eq.name}</span>
                                    <div className="flex gap-1.5">
                                        <Btn size="sm" variant="secondary" onClick={() => openEdit(eq)}>✏️</Btn>
                                        <Btn size="sm" variant="danger" onClick={() => window.confirm('Obrisati?') && remove.mutate(eq.id)}>🗑</Btn>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? 'Uredi opremu' : 'Dodaj opremu'}>
                <div className="space-y-4">
                    <Input label="Naziv opreme" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="npr. Klima uređaj" />
                    <Select label="Kategorija" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                        <option value="">Opšta oprema</option>
                        <option value="Sigurnost">Sigurnost</option>
                        <option value="Udobnost">Udobnost</option>
                        <option value="Multimedija">Multimedija</option>
                        <option value="Asistencija">Asistencija vožnje</option>
                        <option value="Eksterijer">Eksterijer</option>
                        <option value="Nautika">Nautika</option>
                        <option value="Transport">Transport</option>
                    </Select>
                    <div className="flex gap-3 pt-2">
                        <Btn onClick={() => save.mutate(form)} disabled={!form.name || save.isPending}>
                            {save.isPending ? 'Čuvanje...' : editing ? 'Sačuvaj' : 'Dodaj'}
                        </Btn>
                        <Btn variant="secondary" onClick={() => { setModal(false); setEditing(null); }}>Otkaži</Btn>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// ═══════════════════════════════════════
// FILTER OPCIJE
// ═══════════════════════════════════════

const FILTER_TYPE_LABELS = {
    fuel_type:      'Gorivo',
    body_type:      'Karoserija / Tip vozila',
    transmission:   'Mjenjač',
    drive_type:     'Pogon',
    condition:      'Stanje vozila',
    damage:         'Oštećenje',
    emission_class: 'Euro norma',
    color_exterior: 'Boja eksterijera',
    color_interior: 'Boja interijera',
    seat_material:  'Materijal sjedišta',
};

function EditableChipGroup({ opts = [], onAdd, onEdit, onDelete, isColor = false }) {
    return (
        <div className="flex flex-wrap gap-2">
            {opts.map(opt => (
                <div key={opt.id}
                    className={`group flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition
                        ${opt.is_active ? 'border-white/10 bg-[#12142D] text-white/80' : 'border-white/[0.06] bg-white/[0.02] text-[#6674A3]/60 line-through'}`}>
                    {isColor && opt.metadata?.hex && (
                        <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white/20"
                            style={{ backgroundColor: opt.metadata.hex }} />
                    )}
                    <span>{opt.label}</span>
                    <span className="text-[#6674A3]/70 text-[10px] font-mono ml-0.5">({opt.value})</span>
                    <div className="hidden group-hover:flex items-center gap-1 ml-1 pl-1.5 border-l border-white/10">
                        <button onClick={() => onEdit(opt)} title="Uredi"
                            className="text-[#6674A3] hover:text-white transition"><Ic d={IC.pencil} className="w-3 h-3" /></button>
                        <button onClick={() => onDelete(opt.id)} title="Obriši"
                            className="text-[#6674A3] hover:text-[#FF0026] transition"><Ic d={IC.x} className="w-3 h-3" /></button>
                    </div>
                </div>
            ))}
            <button onClick={onAdd}
                className="text-xs px-3 py-1.5 rounded-lg border border-dashed border-[#FF0026]/40 text-[#FF0026] font-medium hover:bg-[#FF0026]/10 hover:border-[#FF0026] transition">
                Dodaj
            </button>
        </div>
    );
}

function FilterSection({ title, children }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] mb-4 overflow-hidden">
            <button onClick={() => setOpen(p => !p)}
                className="w-full flex items-center justify-between px-5 py-4 bg-white/[0.02] hover:bg-white/[0.04] transition">
                <span className="font-bold text-white text-sm">{title}</span>
                <Ic d={IC.chevron} className={`w-4 h-4 text-[#6674A3] transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <div className="px-5 pb-5 pt-4 space-y-5">{children}</div>}
        </div>
    );
}

function AdminFilters() {
    const qc = useQueryClient();
    const [activeTab, setActiveTab] = useState('auto');
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [addCtx, setAddCtx] = useState({ filter_type: '', category: '', parent_id: null });
    const [form, setForm] = useState({ label: '', value: '', sort_order: 0, is_active: true });
    const [hexColor, setHexColor] = useState('');

    // Dohvati sve filter opcije grupirane po tipu i kategoriji
    const { data: grouped, isLoading } = useQuery({
        queryKey: ['admin-filter-options-grouped'],
        queryFn: () => axios.get('/admin/filter-options/grouped').then(r => r.data)
    });

    // Vrati opcije za dati filterType + category (spoji category-specific i 'all')
    const getOpts = (filterType, category) => {
        const byCat = grouped?.[filterType] ?? {};
        const catOpts = byCat[category] ?? [];
        const allOpts = byCat['all'] ?? [];
        const seen = new Set();
        return [...catOpts, ...allOpts]
            .filter(o => { if (seen.has(o.id)) return false; seen.add(o.id); return true; })
            .sort((a, b) => a.sort_order - b.sort_order);
    };

    const save = useMutation({
        mutationFn: (d) => editing
            ? axios.put(`/admin/filter-options/${editing.id}`, d)
            : axios.post('/admin/filter-options', d),
        onSuccess: () => {
            toast.success(editing ? 'Opcija ažurirana.' : 'Opcija dodana.');
            qc.invalidateQueries({ queryKey: ['admin-filter-options-grouped'] });
            closeModal();
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.')
    });

    const remove = useMutation({
        mutationFn: (id) => axios.delete(`/admin/filter-options/${id}`),
        onSuccess: () => {
            toast.success('Opcija obrisana.');
            qc.invalidateQueries({ queryKey: ['admin-filter-options-grouped'] });
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.')
    });

    const openAdd = (filterType, category, parentId = null) => {
        setEditing(null);
        setAddCtx({ filter_type: filterType, category, parent_id: parentId });
        setForm({ label: '', value: '', sort_order: getOpts(filterType, category).length, is_active: true });
        setHexColor('');
        setModal(true);
    };

    const openEdit = (opt, filterType, category) => {
        setEditing(opt);
        setAddCtx({ filter_type: filterType, category, parent_id: opt.parent_id ?? null });
        setHexColor(opt.metadata?.hex ?? '');
        setForm({ label: opt.label, value: opt.value, sort_order: opt.sort_order, is_active: opt.is_active });
        setModal(true);
    };

    const closeModal = () => { setModal(false); setEditing(null); setHexColor(''); };

    const handleSave = () => {
        const isColorType = addCtx.filter_type === 'color_exterior' || addCtx.filter_type === 'color_interior';
        save.mutate({
            ...form,
            parent_id:   addCtx.parent_id,
            filter_type: addCtx.filter_type,
            category:    addCtx.category || null,
            ...(isColorType && hexColor ? { metadata: { hex: hexColor } } : {}),
        });
    };

    // Shorthand: EditableChipGroup za aktivan tab
    const Chips = ({ ft, isColor }) => (
        <EditableChipGroup
            opts={getOpts(ft, activeTab)}
            onAdd={() => openAdd(ft, activeTab)}
            onEdit={(opt) => openEdit(opt, ft, activeTab)}
            onDelete={(id) => remove.mutate(id)}
            isColor={isColor}
        />
    );

    const TABS = [
        { id: 'auto',      label: 'Auto' },
        { id: 'motocikl',  label: 'Motocikl' },
        { id: 'nautika',   label: 'Nautika' },
        { id: 'transport', label: 'Transport' },
    ];

    return (
        <div className="p-6">
            <PageHeader
                title="Filter opcije"
                subtitle="Uredi vrijednosti prikazane u detaljnoj pretrazi"
            />

            {/* Tabovi — isti raspored kao detaljna pretraga */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition
                            ${activeTab === tab.id
                                ? 'bg-[#FF0026] text-white'
                                : 'bg-[#1A1D3A] border border-white/10 text-[#6674A3] hover:border-[#FF0026] hover:text-white'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {isLoading && <div className="p-8 text-center text-[#6674A3]">Učitavanje...</div>}

            {!isLoading && (
                <>
                    {/* ══════════ AUTO ══════════ */}
                    {activeTab === 'auto' && (
                        <>
                            <FilterSection title="Stanje / Istorija vozila">
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Stanje vozila</label>
                                    <Chips ft="condition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Oštećenje</label>
                                    <Chips ft="damage" />
                                </div>
                            </FilterSection>

                            <FilterSection title="Tehnički podaci">
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Gorivo</label>
                                    <Chips ft="fuel_type" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Mjenjač</label>
                                    <Chips ft="transmission" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Pogon</label>
                                    <Chips ft="drive_type" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Euro norma</label>
                                    <Chips ft="emission_class" />
                                </div>
                            </FilterSection>

                            <FilterSection title="Eksterijer">
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Karoserija</label>
                                    <Chips ft="body_type" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Boja eksterijera</label>
                                    <Chips ft="color_exterior" isColor />
                                </div>
                            </FilterSection>

                            <FilterSection title="Interijer">
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Boja interijera</label>
                                    <Chips ft="color_interior" isColor />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Materijal sjedišta</label>
                                    <Chips ft="seat_material" />
                                </div>
                            </FilterSection>
                        </>
                    )}

                    {/* ══════════ MOTOCIKL ══════════ */}
                    {activeTab === 'motocikl' && (
                        <>
                            <FilterSection title="Osnovi podaci">
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Kategorija (tip motocikla)</label>
                                    <Chips ft="body_type" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Stanje vozila</label>
                                    <Chips ft="condition" />
                                </div>
                            </FilterSection>

                            <FilterSection title="Tehnički podaci">
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Gorivo</label>
                                    <Chips ft="fuel_type" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Mjenjač</label>
                                    <Chips ft="transmission" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Pogon</label>
                                    <Chips ft="drive_type" />
                                </div>
                            </FilterSection>

                            <FilterSection title="Oprema">
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Boja eksterijera</label>
                                    <Chips ft="color_exterior" isColor />
                                </div>
                            </FilterSection>

                            <FilterSection title="Istorija vozila">
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Oštećenje</label>
                                    <Chips ft="damage" />
                                </div>
                            </FilterSection>
                        </>
                    )}

                    {/* ══════════ NAUTIKA ══════════ */}
                    {activeTab === 'nautika' && (
                        <>
                            <FilterSection title="Osnovi podaci">
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Gorivo / Vrsta motora</label>
                                    <Chips ft="fuel_type" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Stanje</label>
                                    <Chips ft="condition" />
                                </div>
                            </FilterSection>

                            <FilterSection title="Oprema">
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Boja</label>
                                    <Chips ft="color_exterior" isColor />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Oštećenje</label>
                                    <Chips ft="damage" />
                                </div>
                            </FilterSection>
                        </>
                    )}

                    {/* ══════════ TRANSPORT ══════════ */}
                    {activeTab === 'transport' && (
                        <>
                            <FilterSection title="Osnovi podaci">
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Stanje vozila</label>
                                    <Chips ft="condition" />
                                </div>
                            </FilterSection>

                            <FilterSection title="Tehnički podaci">
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Gorivo</label>
                                    <Chips ft="fuel_type" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Mjenjač</label>
                                    <Chips ft="transmission" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Pogon</label>
                                    <Chips ft="drive_type" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Euro norma</label>
                                    <Chips ft="emission_class" />
                                </div>
                            </FilterSection>

                            <FilterSection title="Eksterijer">
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Boja eksterijera</label>
                                    <Chips ft="color_exterior" isColor />
                                </div>
                            </FilterSection>

                            <FilterSection title="Istorija vozila">
                                <div>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-2">Oštećenje</label>
                                    <Chips ft="damage" />
                                </div>
                            </FilterSection>
                        </>
                    )}
                </>
            )}

            {/* Modal za dodavanje / uređivanje opcije */}
            <Modal open={modal} onClose={closeModal}
                title={editing
                    ? `Uredi: ${FILTER_TYPE_LABELS[addCtx.filter_type] ?? addCtx.filter_type}`
                    : `Dodaj: ${FILTER_TYPE_LABELS[addCtx.filter_type] ?? addCtx.filter_type}`}>
                <div className="space-y-4">
                    <div className="bg-white/[0.04] rounded-xl px-4 py-2.5 text-xs text-[#6674A3] flex gap-4">
                        <span>Tip: <strong className="text-white">{addCtx.filter_type}</strong></span>
                        <span>Kategorija: <strong className="text-white">{addCtx.category || 'sve'}</strong></span>
                    </div>
                    <Input label="Label (prikaz korisniku)" value={form.label}
                        onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                        placeholder="npr. Benzin" />
                    <Input label="Value (slug)" value={form.value}
                        onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                        placeholder="npr. benzin" />
                    <Input label="Redoslijed" type="number" value={form.sort_order}
                        onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} />
                    {(addCtx.filter_type === 'color_exterior' || addCtx.filter_type === 'color_interior') && (
                        <div>
                            <label className="block text-xs font-semibold text-[#6674A3] mb-1">Hex boja</label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={hexColor || '#000000'} onChange={e => setHexColor(e.target.value)}
                                    className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer" />
                                <input value={hexColor} onChange={e => setHexColor(e.target.value)}
                                    placeholder="#FF0000"
                                    className="flex-1 border border-white/10 rounded-xl px-3 py-2 text-sm bg-[#12142D] text-white placeholder-[#6674A3] focus:outline-none focus:border-[#FF0026]" />
                            </div>
                        </div>
                    )}
                    <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                        <input type="checkbox" checked={form.is_active}
                            onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" />
                        Aktivna opcija
                    </label>
                    <div className="flex gap-3 pt-2">
                        <Btn onClick={handleSave} disabled={!form.label || !form.value || save.isPending}>
                            {save.isPending ? 'Čuvanje...' : editing ? 'Sačuvaj' : 'Dodaj'}
                        </Btn>
                        <Btn variant="secondary" onClick={closeModal}>Otkaži</Btn>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// ═══════════════════════════════════════
// PAKETI
// ═══════════════════════════════════════

function AdminPackages() {
    const qc = useQueryClient();
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const emptyForm = { name: '', type: 'listing', price: '', duration_days: '', max_images: '10', max_active_ads: '', refresh_days: '', featured: false, premium_seller: false, description: '', is_active: true };
    const [form, setForm] = useState(emptyForm);

    const { data: packages, isLoading } = useQuery({
        queryKey: ['admin-packages'],
        queryFn: () => axios.get('/admin/packages').then(r => r.data)
    });

    const save = useMutation({
        mutationFn: (d) => editing ? axios.put(`/admin/packages/${editing.id}`, d) : axios.post('/admin/packages', d),
        onSuccess: () => {
            toast.success(editing ? 'Paket ažuriran.' : 'Paket dodan.');
            qc.invalidateQueries({ queryKey: ['admin-packages'] });
            setModal(false); setEditing(null); setForm(emptyForm);
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.')
    });

    const remove = useMutation({
        mutationFn: (id) => axios.delete(`/admin/packages/${id}`),
        onSuccess: () => { toast.success('Paket obrisan.'); qc.invalidateQueries({ queryKey: ['admin-packages'] }); }
    });

    const openEdit = (pkg) => {
        setEditing(pkg);
        setForm({ name: pkg.name, type: pkg.type ?? 'listing', price: pkg.price, duration_days: pkg.duration_days, max_images: pkg.max_images, max_active_ads: pkg.max_active_ads ?? '', refresh_days: pkg.refresh_days ?? '', featured: pkg.featured ?? false, premium_seller: pkg.premium_seller ?? false, description: pkg.description ?? '', is_active: pkg.is_active ?? true });
        setModal(true);
    };

    const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const typeLabel = { listing: 'Oglas', ad_boost: 'Boost', dealer: 'Diler' };
    const typeColor = { listing: 'blue', ad_boost: 'yellow', dealer: 'purple' };

    return (
        <div className="p-6">
            <PageHeader title="Paketi"
                action={<Btn onClick={() => { setEditing(null); setForm(emptyForm); setModal(true); }}>Novi paket</Btn>} />

            {isLoading && <div className="p-8 text-center text-[#6674A3]">Učitavanje...</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages?.map(pkg => (
                    <div key={pkg.id} className={`bg-[#1A1D3A] border border-white/[0.06] rounded-2xl overflow-hidden ${!pkg.is_active ? 'opacity-60' : ''}`}>
                        <div className="px-5 py-4 border-b border-white/[0.06]">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-black text-white">{pkg.name}</p>
                                    <div className="flex gap-1.5 mt-1">
                                        <Badge color={typeColor[pkg.type] ?? 'gray'}>{typeLabel[pkg.type] ?? pkg.type}</Badge>
                                        {pkg.featured && <Badge color="yellow">Featured</Badge>}
                                        {!pkg.is_active && <Badge color="gray">Neaktivan</Badge>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-[#FF0026]">{pkg.price} €</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-5 py-3 space-y-1 text-xs text-[#6674A3]">
                            <div className="flex justify-between"><span>Trajanje</span><span className="font-semibold text-white">{pkg.duration_days} dana</span></div>
                            <div className="flex justify-between"><span>Max slika</span><span className="font-semibold text-white">{pkg.max_images}</span></div>
                            {pkg.max_active_ads && <div className="flex justify-between"><span>Max aktivnih oglasa</span><span className="font-semibold text-white">{pkg.max_active_ads}</span></div>}
                            {pkg.refresh_days && <div className="flex justify-between"><span>Osvježi svakih</span><span className="font-semibold text-white">{pkg.refresh_days} dana</span></div>}
                            {pkg.description && <p className="text-[#6674A3] pt-1">{pkg.description}</p>}
                        </div>
                        <div className="px-5 py-3 border-t border-white/[0.06] flex gap-2">
                            <Btn size="sm" variant="secondary" onClick={() => openEdit(pkg)}>Uredi</Btn>
                            <Btn size="sm" variant="danger" onClick={() => window.confirm('Obrisati paket?') && remove.mutate(pkg.id)}>Obriši</Btn>
                        </div>
                    </div>
                ))}
            </div>

            <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? 'Uredi paket' : 'Novi paket'} width="max-w-xl">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2"><Input label="Naziv paketa" value={form.name} onChange={f('name')} placeholder="npr. Premium oglas" /></div>
                        <Select label="Tip paketa" value={form.type} onChange={f('type')}>
                            <option value="listing">Oglas (listing)</option>
                            <option value="ad_boost">Ad Boost</option>
                            <option value="dealer">Diler</option>
                        </Select>
                        <Input label="Cijena (€)" type="number" step="0.01" value={form.price} onChange={f('price')} />
                        <Input label="Trajanje (dana)" type="number" value={form.duration_days} onChange={f('duration_days')} />
                        <Input label="Max slika" type="number" value={form.max_images} onChange={f('max_images')} />
                        <Input label="Max aktivnih oglasa" type="number" value={form.max_active_ads} onChange={f('max_active_ads')} placeholder="0 = neograničeno" />
                        <Input label="Osvježi svakih (dana)" type="number" value={form.refresh_days} onChange={f('refresh_days')} placeholder="opciono" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#6674A3] mb-1">Opis</label>
                        <textarea value={form.description} onChange={f('description')} rows={2} placeholder="Kratak opis paketa..."
                            className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm bg-[#12142D] text-white placeholder-[#6674A3] focus:outline-none focus:border-[#FF0026] resize-none" />
                    </div>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={form.featured} onChange={f('featured')} className="rounded" />
                            Featured oglas
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={form.premium_seller} onChange={f('premium_seller')} className="rounded" />
                            Premium prodavac
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={form.is_active} onChange={f('is_active')} className="rounded" />
                            Aktivan
                        </label>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Btn onClick={() => save.mutate(form)} disabled={!form.name || !form.price || !form.duration_days || save.isPending}>
                            {save.isPending ? 'Čuvanje...' : editing ? 'Sačuvaj izmjene' : 'Kreiraj paket'}
                        </Btn>
                        <Btn variant="secondary" onClick={() => { setModal(false); setEditing(null); }}>Otkaži</Btn>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// ═══════════════════════════════════════
// PLAĆANJA
// ═══════════════════════════════════════

function AdminPayments() {
    const qc = useQueryClient();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');
    const [noteModal, setNoteModal] = useState(null);
    const [note, setNote] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-payments', page, status, search],
        queryFn: () => axios.get('/admin/payments', { params: { page, status, search, per_page: 20 } }).then(r => r.data)
    });

    const confirm = useMutation({
        mutationFn: ({ id, n }) => axios.post(`/admin/payments/${id}/confirm`, { note: n }),
        onSuccess: () => {
            toast.success('Uplata potvrđena!');
            qc.invalidateQueries({ queryKey: ['admin-payments'] });
            qc.invalidateQueries({ queryKey: ['admin-stats'] });
            setNoteModal(null); setNote('');
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.')
    });

    const reject = useMutation({
        mutationFn: ({ id, n }) => axios.post(`/admin/payments/${id}/reject`, { note: n }),
        onSuccess: () => {
            toast.success('Plaćanje odbijeno.');
            qc.invalidateQueries({ queryKey: ['admin-payments'] });
            setNoteModal(null); setNote('');
        }
    });

    const statusColor = { completed: 'green', pending: 'yellow', failed: 'red' };
    const statusLabel = { completed: 'Potvrđeno', pending: 'Na čekanju', failed: 'Odbijeno' };
    const methodLabel = { bank_transfer: 'Žiro', wspay: 'WSPay', admin_grant: 'Admin dodjela', free: 'Besplatno' };

    return (
        <div className="p-6">
            <PageHeader title="Plaćanja" subtitle={`Ukupno: ${data?.total ?? 0}`} />

            <div className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] p-4 mb-4 flex flex-wrap gap-3">
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Pretraži po referenci..."
                    className="border border-white/10 rounded-xl px-3 py-2 text-sm bg-[#12142D] text-white placeholder-[#6674A3] focus:outline-none focus:border-[#FF0026] flex-1 min-w-48" />
                <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
                    className="border border-white/10 rounded-xl px-3 py-2 text-sm bg-[#12142D] text-white placeholder-[#6674A3] focus:outline-none focus:border-[#FF0026]">
                    <option value="">Svi statusi</option>
                    <option value="pending">Na čekanju</option>
                    <option value="completed">Potvrđeno</option>
                    <option value="failed">Odbijeno</option>
                </select>
            </div>

            <div className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] overflow-hidden">
                {isLoading && <div className="p-8 text-center text-[#6674A3]">Učitavanje...</div>}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.06] bg-white/[0.04]">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Korisnik</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Paket</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Iznos</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Metoda</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Referenca</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6674A3]">Datum</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-[#6674A3]">Akcije</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.06]">
                            {data?.data?.map(p => (
                                <tr key={p.id} className="hover:bg-white/[0.04]">
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-white">{p.user_package?.user?.name ?? p.user?.name ?? 'Nepoznato'}</p>
                                        <p className="text-xs text-[#6674A3]">{p.user_package?.user?.email ?? p.user?.email}</p>
                                    </td>
                                    <td className="px-4 py-3 text-white">{p.user_package?.package?.name ?? 'Bez paketa'}</td>
                                    <td className="px-4 py-3 font-semibold text-white">{p.amount} €</td>
                                    <td className="px-4 py-3">
                                        <Badge color={p.payment_method === 'bank_transfer' ? 'blue' : p.payment_method === 'admin_grant' ? 'purple' : 'gray'}>
                                            {methodLabel[p.payment_method] ?? p.payment_method}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-[#6674A3]">{p.reference ?? 'Bez reference'}</td>
                                    <td className="px-4 py-3">
                                        <Badge color={statusColor[p.status] ?? 'gray'}>{statusLabel[p.status] ?? p.status}</Badge>
                                        {p.admin_note && <p className="text-xs text-[#6674A3] mt-0.5">{p.admin_note}</p>}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-[#6674A3]">{new Date(p.created_at).toLocaleDateString('bs')}</td>
                                    <td className="px-4 py-3">
                                        {p.status === 'pending' && (
                                            <div className="flex gap-1.5 justify-end">
                                                <Btn size="sm" variant="success" onClick={() => setNoteModal({ id: p.id, action: 'confirm' })}>
                                                    Potvrdi
                                                </Btn>
                                                <Btn size="sm" variant="danger" onClick={() => setNoteModal({ id: p.id, action: 'reject' })}>
                                                    Odbij
                                                </Btn>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {(!data?.data?.length && !isLoading) && (
                    <div className="p-8 text-center text-[#6674A3] text-sm">Nema plaćanja.</div>
                )}
                <Pagination meta={data?.meta} onPage={setPage} />
            </div>

            {/* Modal za napomenu pri potvrdi/odbijanju */}
            <Modal open={!!noteModal} onClose={() => { setNoteModal(null); setNote(''); }}
                title={noteModal?.action === 'confirm' ? 'Potvrdi uplatu' : 'Odbij uplatu'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#6674A3] mb-1">Napomena (opciono)</label>
                        <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                            placeholder="npr. Uplata primljena na račun 15.04.2026."
                            className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm bg-[#12142D] text-white placeholder-[#6674A3] focus:outline-none focus:border-[#FF0026] resize-none" />
                    </div>
                    <div className="flex gap-3">
                        {noteModal?.action === 'confirm'
                            ? <Btn variant="success" onClick={() => confirm.mutate({ id: noteModal.id, n: note })} disabled={confirm.isPending}>
                                {confirm.isPending ? 'Potvrđivanje...' : 'Potvrdi uplatu'}
                              </Btn>
                            : <Btn variant="danger" onClick={() => reject.mutate({ id: noteModal.id, n: note })} disabled={reject.isPending}>
                                {reject.isPending ? 'Odbijanje...' : 'Odbij uplatu'}
                              </Btn>
                        }
                        <Btn variant="secondary" onClick={() => { setNoteModal(null); setNote(''); }}>Otkaži</Btn>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// ═══════════════════════════════════════
// ADMIN KATEGORIJE
// ═══════════════════════════════════════
// 1. Dodati u NAV_GROUPS pod KATALOG: { to: '/admin/categories', label: 'Kategorije', icon: '📂' }
// 2. Dodati rutu: <Route path="categories" element={<AdminCategories />} />
// 3. Zalijepiti ovu funkciju u fajl
// ═══════════════════════════════════════

function AdminCategories() {
    const qc = useQueryClient();
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [parentForNew, setParentForNew] = useState(null);
    const emptyForm = { name: '', icon: '', sort_order: 0, is_active: true };
    const [form, setForm] = useState(emptyForm);

    const { data: categories, isLoading } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: () => axios.get('/admin/categories').then(r => r.data),
    });

    const save = useMutation({
        mutationFn: (d) => editing
            ? axios.put(`/admin/categories/${editing.id}`, d)
            : axios.post('/admin/categories', d),
        onSuccess: () => {
            toast.success(editing ? 'Kategorija ažurirana.' : 'Kategorija dodana.');
            qc.invalidateQueries({ queryKey: ['admin-categories'] });
            qc.invalidateQueries({ queryKey: ['categories'] });
            closeModal();
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.'),
    });

    const remove = useMutation({
        mutationFn: (id) => axios.delete(`/admin/categories/${id}`),
        onSuccess: () => {
            toast.success('Kategorija obrisana.');
            qc.invalidateQueries({ queryKey: ['admin-categories'] });
            qc.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.'),
    });

    const reorder = useMutation({
        mutationFn: (items) => axios.put('/admin/categories/reorder', { items }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }),
    });

    const openAdd = (parent = null) => {
        setEditing(null);
        setParentForNew(parent);
        setForm({ ...emptyForm, sort_order: parent ? (parent.children?.length ?? 0) : (categories?.length ?? 0) });
        setModal(true);
    };

    const openEdit = (cat) => {
        setEditing(cat);
        setParentForNew(null);
        setForm({ name: cat.name, icon: cat.icon ?? '', sort_order: cat.sort_order, is_active: cat.is_active });
        setModal(true);
    };

    const closeModal = () => { setModal(false); setEditing(null); setParentForNew(null); };

    const handleSave = () => {
        const data = { ...form };
        if (!editing && parentForNew) data.parent_id = parentForNew.id;
        save.mutate(data);
    };

    const moveUp = (cat, list) => {
        const idx = list.findIndex(c => c.id === cat.id);
        if (idx === 0) return;
        const items = [...list];
        [items[idx - 1], items[idx]] = [items[idx], items[idx - 1]];
        reorder.mutate(items.map((c, i) => ({ id: c.id, sort_order: i })));
    };

    const moveDown = (cat, list) => {
        const idx = list.findIndex(c => c.id === cat.id);
        if (idx === list.length - 1) return;
        const items = [...list];
        [items[idx], items[idx + 1]] = [items[idx + 1], items[idx]];
        reorder.mutate(items.map((c, i) => ({ id: c.id, sort_order: i })));
    };

    const f = (k) => (e) => setForm(p => ({
        ...p,
        [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));

    return (
        <div className="p-6">
            <PageHeader
                title="Kategorije vozila"
                subtitle="Upravljaj hijerarhijom kategorija i podkategorija"
                action={<Btn onClick={() => openAdd(null)}>Dodaj kategoriju</Btn>}
            />

            {isLoading && <div className="text-center text-[#6674A3] py-8">Učitavanje...</div>}

            <div className="space-y-3">
                {categories?.map(cat => (
                    <div key={cat.id} className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] overflow-hidden">

                        {/* Root kategorija */}
                        <div className="flex items-center gap-3 px-5 py-4 bg-white/[0.04]">
                            <div className="flex flex-col gap-0.5">
                                <button onClick={() => moveUp(cat, categories)} className="text-[#6674A3]/50 hover:text-[#6674A3] text-xs leading-none">▲</button>
                                <button onClick={() => moveDown(cat, categories)} className="text-[#6674A3]/50 hover:text-[#6674A3] text-xs leading-none">▼</button>
                            </div>
                            <span className="text-xl">{cat.icon ?? '📁'}</span>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-black text-white">{cat.name}</p>
                                    {!cat.is_active && <Badge color="gray">Neaktivna</Badge>}
                                    <span className="text-xs text-[#6674A3]">
                                        {cat.children?.length ?? 0} podkategorija · {cat.makes_count ?? 0} marki
                                    </span>
                                </div>
                                <p className="text-xs text-[#6674A3] font-mono">{cat.slug}</p>
                            </div>
                            <div className="flex gap-2">
                                <Btn size="sm" variant="secondary" onClick={() => openAdd(cat)}>Podkategorija</Btn>
                                <Btn size="sm" variant="secondary" onClick={() => openEdit(cat)}>✏️</Btn>
                                <Btn size="sm" variant="danger"
                                    onClick={() => window.confirm(`Obrisati "${cat.name}"?`) && remove.mutate(cat.id)}>
                                    🗑
                                </Btn>
                            </div>
                        </div>

                        {/* Podkategorije */}
                        {cat.children?.length > 0 && (
                            <div className="divide-y divide-white/[0.06]">
                                {cat.children.map(sub => (
                                    <div key={sub.id} className={`flex items-center gap-3 pl-14 pr-5 py-3 hover:bg-white/[0.04] ${!sub.is_active ? 'opacity-50' : ''}`}>
                                        <div className="flex flex-col gap-0.5">
                                            <button onClick={() => moveUp(sub, cat.children)} className="text-[#6674A3]/50 hover:text-[#6674A3] text-xs leading-none">▲</button>
                                            <button onClick={() => moveDown(sub, cat.children)} className="text-[#6674A3]/50 hover:text-[#6674A3] text-xs leading-none">▼</button>
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#6674A3]/50 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-white">{sub.name}</p>
                                                {!sub.is_active && <Badge color="gray">Neaktivna</Badge>}
                                                <span className="text-xs text-[#6674A3]">{sub.makes_count ?? 0} marki</span>
                                            </div>
                                            <p className="text-xs text-[#6674A3] font-mono">{sub.slug}</p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <Btn size="sm" variant="secondary" onClick={() => openEdit(sub)}>✏️</Btn>
                                            <Btn size="sm" variant="danger"
                                                onClick={() => window.confirm(`Obrisati "${sub.name}"?`) && remove.mutate(sub.id)}>
                                                🗑
                                            </Btn>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Dodaj prvu podkategoriju */}
                        {cat.children?.length === 0 && (
                            <div className="px-14 py-3 border-t border-white/[0.06]">
                                <button onClick={() => openAdd(cat)}
                                    className="text-xs text-[#6674A3] hover:text-[#FF0026] transition">
                                    + Dodaj podkategoriju
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal */}
            <Modal
                open={modal}
                onClose={closeModal}
                title={
                    editing
                        ? `Uredi — ${editing.name}`
                        : parentForNew
                        ? `Nova podkategorija u "${parentForNew.name}"`
                        : 'Nova kategorija'
                }>
                <div className="space-y-4">
                    {parentForNew && !editing && (
                        <div className="bg-white/[0.06] text-[#6674A3] text-xs px-3 py-2 rounded-lg">
                            Podkategorija unutar: <strong>{parentForNew.name}</strong>
                        </div>
                    )}
                    <Input
                        label="Naziv *"
                        value={form.name}
                        onChange={f('name')}
                        placeholder="npr. Dirt Bike"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-[#6674A3] mb-1">Ikonica (emoji)</label>
                            <input
                                value={form.icon}
                                onChange={f('icon')}
                                placeholder="npr. 🏍"
                                className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm bg-[#12142D] text-white placeholder-[#6674A3] focus:outline-none focus:border-[#FF0026]"
                            />
                        </div>
                        <Input
                            label="Redoslijed"
                            type="number"
                            value={form.sort_order}
                            onChange={f('sort_order')}
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={form.is_active} onChange={f('is_active')} className="rounded" />
                        Aktivna kategorija
                    </label>
                    <div className="flex gap-3 pt-2">
                        <Btn onClick={handleSave} disabled={!form.name || save.isPending}>
                            {save.isPending ? 'Čuvanje...' : editing ? 'Sačuvaj' : 'Dodaj'}
                        </Btn>
                        <Btn variant="secondary" onClick={closeModal}>Otkaži</Btn>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// ═══════════════════════════════════════
// PODEŠAVANJA (bank detalji, itd.)
// ═══════════════════════════════════════

function AdminSettings() {
    const qc = useQueryClient();

    const { data: settings, isLoading } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: () => axios.get('/admin/settings').then(r => r.data)
    });

    const [form, setForm] = useState({});

    // Popuni formu kad stignu settings
    useEffect(() => {
        if (settings) {
            const map = {};
            settings.forEach(s => { map[s.key] = s.value ?? ''; });
            setForm(map);
        }
    }, [settings]);

    const save = useMutation({
        mutationFn: (data) => axios.put('/admin/settings', data),
        onSuccess: () => {
            toast.success('Podešavanja sačuvana.');
            qc.invalidateQueries({ queryKey: ['admin-settings'] });
        },
        onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.')
    });

    const f = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

    const FIELDS = [
        { key: 'bank_naziv', label: 'Naziv korisnika (primatelja)', placeholder: 'BEBOLD DOO BAR' },
        { key: 'bank_banka', label: 'Naziv banke',                  placeholder: 'CKB banka' },
        { key: 'bank_racun', label: 'Žiro račun',                   placeholder: 'XXX-XXXX-XXXX' },
        { key: 'bank_info',  label: 'Dodatna napomena na uplatnici', placeholder: 'Navedite svrhu uplate...', textarea: true },
    ];

    return (
        <div className="p-6 max-w-2xl">
            <PageHeader title="Podešavanja" subtitle="Konfiguracija podataka za uplatnicu i sistem" />

            {isLoading && <div className="p-8 text-center text-[#6674A3]">Učitavanje...</div>}

            {!isLoading && (
                <div className="space-y-6">
                    {/* Uplatnica podaci */}
                    <div className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] p-6">
                        <h2 className="font-black text-white mb-1">Podaci za uplatnicu</h2>
                        <p className="text-xs text-[#6674A3] mb-5">
                            Ovi podaci se prikazuju korisnicima kada odaberu plaćanje uplatnicom.
                        </p>

                        {/* Preview uplatnice */}
                        <div className="bg-[#12142D] rounded-2xl p-5 mb-6">
                            <p className="text-[#6674A3] text-xs font-semibold mb-3 uppercase tracking-widest">
                                Pregled uplatnice
                            </p>
                            <div className="space-y-2.5">
                                {[
                                    { l: 'Iznos za uplatu',  v: 'IZNOS PAKETA' },
                                    { l: 'Svrha uplate',     v: 'AD384226... (auto-generisan)', highlight: true },
                                    { l: 'Naziv korisnika',  v: form.bank_naziv || 'Nije unijeto' },
                                    { l: 'Banka',            v: form.bank_banka || 'Nije unijeto' },
                                    { l: 'Žiro račun',       v: form.bank_racun || 'Nije unijeto', mono: true },
                                ].map(row => (
                                    <div key={row.l} className={`rounded-xl p-3 ${row.highlight ? 'bg-[#FFEA00]/20' : 'bg-white/5'}`}>
                                        <p className="text-[#6674A3] text-[10px] mb-0.5">{row.l}</p>
                                        <p className={`font-bold text-white text-sm ${row.mono ? 'font-mono' : ''}`}>{row.v}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Forma */}
                        <div className="space-y-4">
                            {FIELDS.map(field => (
                                <div key={field.key}>
                                    <label className="block text-xs font-semibold text-[#6674A3] mb-1">{field.label}</label>
                                    {field.textarea ? (
                                        <textarea
                                            value={form[field.key] ?? ''}
                                            onChange={f(field.key)}
                                            placeholder={field.placeholder}
                                            rows={3}
                                            className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm bg-[#12142D] text-white placeholder-[#6674A3] focus:outline-none focus:border-[#FF0026] resize-none"
                                        />
                                    ) : (
                                        <input
                                            value={form[field.key] ?? ''}
                                            onChange={f(field.key)}
                                            placeholder={field.placeholder}
                                            className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm bg-[#12142D] text-white placeholder-[#6674A3] focus:outline-none focus:border-[#FF0026]"
                                        />
                                    )}
                                </div>
                            ))}

                            <div className="flex gap-3 pt-2">
                                <Btn onClick={() => save.mutate(form)} disabled={save.isPending}>
                                    {save.isPending ? 'Čuvanje...' : 'Sačuvaj podešavanja'}
                                </Btn>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════
// BANERI / REKLAME
// ═══════════════════════════════════════

function AdminBanners() {
    const qc = useQueryClient();
    const [form, setForm] = useState({ title: '', link_url: '', position: 'sidebar', image: null });
    const [showForm, setShowForm] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-banners'],
        queryFn: () => axios.get('/admin/banners').then(r => r.data.data),
    });

    const createMutation = useMutation({
        mutationFn: () => {
            const fd = new FormData();
            fd.append('title', form.title);
            fd.append('position', form.position);
            if (form.link_url) fd.append('link_url', form.link_url);
            if (form.image) fd.append('image', form.image);
            return axios.post('/admin/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        },
        onSuccess: () => {
            toast.success('Baner kreiran.');
            qc.invalidateQueries(['admin-banners']);
            setForm({ title: '', link_url: '', position: 'sidebar', image: null });
            setShowForm(false);
        },
        onError: (e) => {
            const errors = e.response?.data?.errors;
            if (errors) Object.values(errors).forEach(err => toast.error(err[0]));
            else toast.error('Greška pri kreiranju banera.');
        },
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, is_active }) => axios.put(`/admin/banners/${id}`, { is_active: !is_active }),
        onSuccess: () => qc.invalidateQueries(['admin-banners']),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/admin/banners/${id}`),
        onSuccess: () => {
            toast.success('Baner obrisan.');
            qc.invalidateQueries(['admin-banners']);
        },
    });

    const banners = data ?? [];
    const POSITION_LABELS = { popup: 'Pop-up (ulazak na sajt)', sidebar: 'Bočni (sidebar)', homepage: 'Početna stranica' };

    return (
        <div className="p-6 max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-black text-white">Baneri / Reklame</h1>
                    <p className="text-sm text-[#6674A3] mt-0.5">Pop-up reklame i bočni ad placementi za sponzore</p>
                </div>
                <button onClick={() => setShowForm(p => !p)}
                    className="bg-[#FF0026] hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition">
                    {showForm ? 'Zatvori' : 'Novi baner'}
                </button>
            </div>

            {showForm && (
                <div className="bg-[#1A1D3A] border border-white/[0.06] rounded-2xl p-5 shadow-sm mb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#6674A3] mb-1">Naziv (sponzor/kampanja)</label>
                            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm bg-[#12142D] text-white placeholder-[#6674A3] focus:outline-none focus:border-[#FF0026]" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#6674A3] mb-1">Link (opciono)</label>
                            <input type="url" placeholder="https://..." value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))}
                                className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm bg-[#12142D] text-white placeholder-[#6674A3] focus:outline-none focus:border-[#FF0026]" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#6674A3] mb-1">Pozicija</label>
                            <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                                className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm bg-[#12142D] text-white focus:outline-none focus:border-[#FF0026]">
                                <option value="sidebar">Bočni (sidebar)</option>
                                <option value="popup">Pop-up (ulazak na sajt)</option>
                                <option value="homepage">Početna stranica</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#6674A3] mb-1">Slika banera</label>
                            <input type="file" accept="image/*" onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))}
                                className="w-full text-sm text-[#6674A3] file:mr-3 file:px-3 file:py-2 file:rounded-xl file:border-0 file:bg-[#FF0026] file:text-white file:text-xs file:font-bold file:cursor-pointer" />
                        </div>
                    </div>
                    <button
                        onClick={() => createMutation.mutate()}
                        disabled={!form.title || !form.image || createMutation.isPending}
                        className="bg-[#FF0026] hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-50">
                        {createMutation.isPending ? 'Čuvanje...' : 'Sačuvaj baner'}
                    </button>
                </div>
            )}

            {isLoading && <p className="text-[#6674A3] py-8 text-center">Učitavanje...</p>}

            {!isLoading && banners.length === 0 && (
                <div className="bg-[#1A1D3A] border border-white/[0.06] rounded-2xl p-10 text-center shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.06] flex items-center justify-center mx-auto mb-3 text-[#6674A3]">
                        <Ic d={IC.megaphone} className="w-6 h-6" />
                    </div>
                    <p className="text-[#6674A3]">Nema banera. Dodajte prvi baner za sponzora.</p>
                </div>
            )}

            <div className="space-y-3">
                {banners.map(b => (
                    <div key={b.id} className="bg-[#1A1D3A] border border-white/[0.06] rounded-2xl shadow-sm p-4 flex items-center gap-4">
                        <img src={b.image} alt={b.title} className="w-28 h-16 object-cover rounded-xl bg-white/[0.06] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{b.title}</p>
                            <p className="text-xs text-[#6674A3]">{POSITION_LABELS[b.position] ?? b.position}</p>
                            {b.link_url && <p className="text-xs text-[#6674A3] truncate">{b.link_url}</p>}
                            <p className="text-xs text-[#6674A3] mt-0.5">{b.views_count} prikaza, {b.clicks_count} klikova</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => toggleMutation.mutate({ id: b.id, is_active: b.is_active })}
                                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                                    b.is_active ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25' : 'bg-white/[0.06] text-[#6674A3] hover:bg-white/[0.1]'
                                }`}>
                                {b.is_active ? 'Aktivan' : 'Neaktivan'}
                            </button>
                            <button onClick={() => { if (window.confirm('Obrisati baner?')) deleteMutation.mutate(b.id); }}
                                className="text-xs px-3 py-1.5 bg-[#FF0026]/10 hover:bg-[#FF0026]/20 text-[#FF0026] rounded-lg font-semibold transition">
                                Obriši
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}