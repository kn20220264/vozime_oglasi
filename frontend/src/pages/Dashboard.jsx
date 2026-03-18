import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const tabs = [
    { id: 'ads',      label: 'Moji oglasi',   icon: '🚗' },
    { id: 'favorites',label: 'Favoriti',       icon: '❤️' },
    { id: 'messages', label: 'Poruke',         icon: '✉️' },
    { id: 'profile',  label: 'Profil',         icon: '👤' },
];

const statusBadge = {
    active:   'bg-green-100 text-green-700',
    pending:  'bg-yellow-100 text-yellow-700',
    inactive: 'bg-gray-100 text-gray-500',
    sold:     'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-600',
    expired:  'bg-orange-100 text-orange-600',
};
const statusLabel = {
    active: 'Aktivan', pending: 'Na čekanju', inactive: 'Neaktivan',
    sold: 'Prodano', rejected: 'Odbijen', expired: 'Istekao'
};

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('ads');
    const navigate = useNavigate();
    const qc = useQueryClient();

    const { data: user } = useQuery({
        queryKey: ['me'],
        queryFn: () => axios.get('/me').then(r => r.data)
    });

    const { data: myAds, isLoading: adsLoading } = useQuery({
        queryKey: ['my-ads'],
        queryFn: () => axios.get('/my-ads').then(r => r.data),
        enabled: activeTab === 'ads'
    });

    const { data: favorites } = useQuery({
        queryKey: ['favorites'],
        queryFn: () => axios.get('/favorites').then(r => r.data),
        enabled: activeTab === 'favorites'
    });

    const { data: messages } = useQuery({
        queryKey: ['messages'],
        queryFn: () => axios.get('/messages').then(r => r.data),
        enabled: activeTab === 'messages'
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/ads/${id}`),
        onSuccess: () => {
            toast.success('Oglas obrisan.');
            qc.invalidateQueries(['my-ads']);
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (id) => axios.patch(`/ads/${id}/toggle`),
        onSuccess: () => qc.invalidateQueries(['my-ads'])
    });

    const stats = [
        { label: 'Aktivnih oglasa', value: myAds?.filter(a => a.status === 'active').length ?? '-', icon: '🚗', color: 'blue' },
        { label: 'Ukupno pregleda', value: myAds?.reduce((s, a) => s + (a.views_count || 0), 0) ?? '-', icon: '👁', color: 'purple' },
        { label: 'Favorita',        value: favorites?.length ?? '-', icon: '❤️', color: 'red' },
        { label: 'Novih poruka',    value: messages?.filter(m => !m.read_at)?.length ?? '-', icon: '✉️', color: 'green' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header korisnika */}
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                            {user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
                            <p className="text-sm text-gray-500 capitalize">{user?.email} · {user?.role}</p>
                        </div>
                    </div>
                    <Link
                        to="/ads/create"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-2"
                    >
                        + Novi oglas
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {stats.map(s => (
                        <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <div className="text-2xl mb-1">{s.icon}</div>
                            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-6 w-fit">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition
                                ${activeTab === t.id ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* TAB: Moji oglasi */}
                {activeTab === 'ads' && (
                    <div className="space-y-3">
                        {adsLoading && <p className="text-center text-gray-400 py-10">Učitavanje...</p>}
                        {!adsLoading && !myAds?.length && (
                            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                                <div className="text-5xl mb-3">🚗</div>
                                <p className="text-gray-500 mb-4">Nemate objavljenih oglasa.</p>
                                <Link to="/ads/create" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition">
                                    Objavi prvi oglas
                                </Link>
                            </div>
                        )}
                        {myAds?.map(ad => (
                            <div key={ad.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden hover:shadow-md transition">
                                {/* Slika */}
                                <div className="w-40 h-32 flex-shrink-0 bg-gray-100">
                                    <img
                                        src={ad.primary_image
                                            ? `http://localhost:8000/storage/${ad.primary_image.path}`
                                            : '/placeholder-car.jpg'}
                                        className="w-full h-full object-cover"
                                        alt={ad.title}
                                    />
                                </div>
                                {/* Info */}
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                                                <Link to={`/ads/${ad.slug}`}>{ad.title}</Link>
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {ad.year} · {ad.mileage?.toLocaleString()} km · {ad.city?.name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-blue-600">{ad.price?.toLocaleString()} €</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[ad.status]}`}>
                                                {statusLabel[ad.status]}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs text-gray-400">👁 {ad.views_count} pregleda · {new Date(ad.created_at).toLocaleDateString('sr-ME')}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleMutation.mutate(ad.id)}
                                                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
                                            >
                                                {ad.status === 'active' ? 'Deaktiviraj' : 'Aktiviraj'}
                                            </button>
                                            <Link
                                                to={`/ads/${ad.slug}/edit`}
                                                className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition font-medium"
                                            >
                                                Uredi
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Obrisati oglas?')) deleteMutation.mutate(ad.id);
                                                }}
                                                className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition font-medium"
                                            >
                                                Obriši
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* TAB: Favoriti */}
                {activeTab === 'favorites' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {!favorites?.length && (
                            <div className="col-span-3 text-center py-12 bg-white rounded-2xl shadow-sm">
                                <div className="text-5xl mb-3">❤️</div>
                                <p className="text-gray-500">Niste sačuvali nijedan oglas u favorite.</p>
                            </div>
                        )}
                        {favorites?.map(fav => (
                            <Link key={fav.id} to={`/ads/${fav.ad?.slug}`}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                                <img
                                    src={fav.ad?.primary_image
                                        ? `http://localhost:8000/storage/${fav.ad.primary_image.path}`
                                        : '/placeholder-car.jpg'}
                                    className="w-full h-40 object-cover"
                                    alt={fav.ad?.title}
                                />
                                <div className="p-3">
                                    <p className="font-semibold text-sm truncate">{fav.ad?.title}</p>
                                    <p className="text-blue-600 font-bold mt-1">{fav.ad?.price?.toLocaleString()} €</p>
                                    <p className="text-xs text-gray-400">{fav.ad?.year} · {fav.ad?.mileage?.toLocaleString()} km</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* TAB: Poruke */}
                {activeTab === 'messages' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {!messages?.length && (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-3">✉️</div>
                                <p className="text-gray-500">Nemate poruka.</p>
                            </div>
                        )}
                        {messages?.map(msg => (
                            <div key={msg.id}
                                className={`flex items-start gap-4 p-4 border-b last:border-0 hover:bg-gray-50 transition
                                    ${!msg.read_at ? 'bg-blue-50' : ''}`}>
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 flex-shrink-0">
                                    {msg.sender?.name?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-sm">{msg.sender?.name}</p>
                                        <p className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleDateString('sr-ME')}</p>
                                    </div>
                                    <p className="text-xs text-blue-500 mb-1">Re: {msg.ad?.title}</p>
                                    <p className="text-sm text-gray-600 truncate">{msg.body}</p>
                                </div>
                                {!msg.read_at && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
                            </div>
                        ))}
                    </div>
                )}

                {/* TAB: Profil */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-xl">
                        <h2 className="font-bold text-lg mb-5">Moj profil</h2>
                        <ProfileForm user={user} />
                    </div>
                )}
            </div>
        </div>
    );
}

function ProfileForm({ user }) {
    const qc = useQueryClient();
    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });

    const mutation = useMutation({
        mutationFn: () => axios.put('/profile', form),
        onSuccess: () => {
            toast.success('Profil ažuriran!');
            qc.invalidateQueries(['me']);
        }
    });

    return (
        <div className="space-y-4">
            {[
                { label: 'Ime i prezime', key: 'name', type: 'text' },
                { label: 'Telefon', key: 'phone', type: 'tel' },
            ].map(f => (
                <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <input
                        type={f.type}
                        value={form[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            ))}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input disabled value={user?.email || ''} className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-400" />
            </div>
            <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition"
            >
                {mutation.isPending ? 'Čuvanje...' : 'Sačuvaj izmjene'}
            </button>
        </div>
    );
}