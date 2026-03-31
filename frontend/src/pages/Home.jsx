import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import AdCard from '../components/AdCard';

const fuelTypes = ['Svi', 'benzin', 'dizel', 'hibrid', 'elektro', 'plin'];
const bodyTypes = ['Svi', 'sedan', 'karavan', 'suv', 'hatchback', 'coupe', 'kabrio', 'van', 'pickup'];
const priceRanges = [
    { label: 'Do 5.000 €', max: 5000 },
    { label: 'Do 10.000 €', max: 10000 },
    { label: 'Do 20.000 €', max: 20000 },
    { label: 'Do 50.000 €', max: 50000 },
];

export default function Home() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        make_id: '', model_id: '', price_max: '',
        year_from: '', fuel_type: '', body_type: '', city_id: '',
    });

    const { data: makesData } = useQuery({
        queryKey: ['makes'],
        queryFn: () => axios.get('/makes').then(r => r.data)
    });
    const makes = makesData?.data ?? [];

    const { data: modelsData } = useQuery({
        queryKey: ['models', filters.make_id],
        queryFn: () => axios.get(`/makes/${filters.make_id}/models`).then(r => r.data),
        enabled: !!filters.make_id
    });
    const models = modelsData?.data ?? [];

    const { data: citiesData } = useQuery({
        queryKey: ['cities'],
        queryFn: () => axios.get('/cities').then(r => r.data)
    });
    const cities = citiesData?.data ?? [];

    const { data: featuredAds } = useQuery({
        queryKey: ['featured-ads'],
        queryFn: () => axios.get('/ads?featured=1&per_page=6').then(r => r.data)
    });

    const { data: latestAds } = useQuery({
        queryKey: ['latest-ads'],
        queryFn: () => axios.get('/ads?sort=latest&per_page=12').then(r => r.data)
    });

    const set = (key, val) => setFilters(p => ({
        ...p, [key]: val,
        ...(key === 'make_id' ? { model_id: '' } : {})
    }));

    const handleSearch = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
        navigate(`/search?${params.toString()}`);
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

    return (
        <div className="min-h-screen bg-white">

            {/* ===== HERO ===== */}
            <section className="bg-[#12142D] relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF0026] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFEA00] rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="relative max-w-6xl mx-auto px-4 py-12">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                            Pronađi svoje{' '}
                            <span className="text-[#FF0026]">savršeno</span>{' '}
                            vozilo
                        </h1>
                        <p className="text-[#6674A3] mt-3 text-lg">
                            Hiljade oglasa vozila u Crnoj Gori na jednom mjestu
                        </p>
                    </div>

                    {/* Search box */}
                    <div className="bg-white rounded-2xl p-5 shadow-2xl max-w-4xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <select
                                value={filters.make_id}
                                onChange={e => set('make_id', e.target.value)}
                                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white col-span-2 md:col-span-1"
                            >
                                <option value="">Svi proizvođači</option>
                                {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>

                            <select
                                value={filters.model_id}
                                onChange={e => set('model_id', e.target.value)}
                                disabled={!filters.make_id}
                                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white disabled:bg-gray-50 disabled:text-gray-400 col-span-2 md:col-span-1"
                            >
                                <option value="">Svi modeli</option>
                                {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>

                            <select
                                value={filters.price_max}
                                onChange={e => set('price_max', e.target.value)}
                                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white"
                            >
                                <option value="">Cijena do</option>
                                {priceRanges.map(r => (
                                    <option key={r.max} value={r.max}>{r.label}</option>
                                ))}
                            </select>

                            <select
                                value={filters.year_from}
                                onChange={e => set('year_from', e.target.value)}
                                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white"
                            >
                                <option value="">Godište od</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <select
                                value={filters.fuel_type}
                                onChange={e => set('fuel_type', e.target.value)}
                                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white"
                            >
                                {fuelTypes.map(f => (
                                    <option key={f} value={f === 'Svi' ? '' : f}>{f}</option>
                                ))}
                            </select>

                            <select
                                value={filters.body_type}
                                onChange={e => set('body_type', e.target.value)}
                                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white capitalize"
                            >
                                {bodyTypes.map(b => (
                                    <option key={b} value={b === 'Svi' ? '' : b} className="capitalize">{b}</option>
                                ))}
                            </select>

                            <select
                                value={filters.city_id}
                                onChange={e => set('city_id', e.target.value)}
                                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white"
                            >
                                <option value="">Svi gradovi</option>
                                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>

                            <button
                                onClick={handleSearch}
                                className="bg-[#FF0026] hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl transition text-sm flex items-center justify-center gap-2"
                            >
                                🔍 Pretraži
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                            <span className="text-xs text-gray-400 mr-1 self-center">Popularno:</span>
                            {['VW Golf', 'BMW', 'Mercedes', 'Audi', 'Toyota', 'Elektro vozila'].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => navigate(`/search?q=${tag}`)}
                                    className="text-xs bg-gray-100 hover:bg-[#FF0026] hover:text-white text-gray-600 px-3 py-1 rounded-full transition"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== ISTAKNUTI OGLASI ===== */}
            {featuredAds?.data?.length > 0 && (
                <section className="max-w-6xl mx-auto px-4 py-10">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-7 bg-[#FF0026] rounded-full" />
                            <h2 className="text-xl font-black text-[#12142D]">Istaknuti oglasi</h2>
                            <span className="bg-[#FFEA00] text-[#12142D] text-xs font-bold px-2 py-0.5 rounded-md">PREMIUM</span>
                        </div>
                        <button
                            onClick={() => navigate('/search?featured=1')}
                            className="text-sm text-[#FF0026] hover:underline font-semibold"
                        >
                            Pogledaj sve →
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {featuredAds.data.map(ad => <AdCard key={ad.id} ad={ad} />)}
                    </div>
                </section>
            )}

            {/* ===== KATEGORIJE ===== */}
            <section className="bg-gray-50 py-10">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-7 bg-[#1B2B5A] rounded-full" />
                        <h2 className="text-xl font-black text-[#12142D]">Pretraži po tipu</h2>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                        {[
                            { type: 'suv',       label: 'SUV',       emoji: '🚙' },
                            { type: 'sedan',     label: 'Sedan',     emoji: '🚗' },
                            { type: 'hatchback', label: 'Hatchback', emoji: '🚘' },
                            { type: 'karavan',   label: 'Karavan',   emoji: '🚐' },
                            { type: 'coupe',     label: 'Kupé',      emoji: '🎏' },
                            { type: 'kabrio',    label: 'Kabrio',    emoji: '🏖️' },
                            { type: 'van',       label: 'Van',       emoji: '🚌' },
                            { type: 'pickup',    label: 'Pickup',    emoji: '🛻' },
                        ].map(cat => (
                            <button
                                key={cat.type}
                                onClick={() => navigate(`/search?body_type=${cat.type}`)}
                                className="bg-white hover:bg-[#12142D] group rounded-2xl p-3 text-center shadow-sm border border-gray-100 hover:border-[#12142D] transition-all"
                            >
                                <div className="text-2xl mb-1">{cat.emoji}</div>
                                <div className="text-xs font-semibold text-gray-700 group-hover:text-white transition-colors">
                                    {cat.label}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== NAJNOVIJI OGLASI ===== */}
            <section className="max-w-6xl mx-auto px-4 py-10">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-7 bg-[#FF0026] rounded-full" />
                        <h2 className="text-xl font-black text-[#12142D]">Najnoviji oglasi</h2>
                    </div>
                    <button
                        onClick={() => navigate('/search')}
                        className="text-sm text-[#FF0026] hover:underline font-semibold"
                    >
                        Svi oglasi →
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {latestAds?.data?.map(ad => <AdCard key={ad.id} ad={ad} />)}
                </div>
                {!latestAds?.data?.length && (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-lg">Nema aktivnih oglasa.</p>
                    </div>
                )}
                <div className="text-center mt-8">
                    <button
                        onClick={() => navigate('/search')}
                        className="bg-[#12142D] hover:bg-[#1B2B5A] text-white px-10 py-3 rounded-xl font-bold transition"
                    >
                        Pogledaj sve oglase
                    </button>
                </div>
            </section>

            {/* ===== ZAŠTO VOZIME ===== */}
            <section className="bg-[#12142D] py-12">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-black text-white mb-2">Zašto VozimeOglasi?</h2>
                    <p className="text-[#6674A3] mb-8">Najpouzdaniji oglasnik vozila u Crnoj Gori</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: '🔒', title: 'Sigurno', desc: 'Verifikovani prodavci i zaštita od prevare' },
                            { icon: '⚡', title: 'Brzo', desc: 'Objavi oglas za manje od 5 minuta' },
                            { icon: '🎯', title: 'Precizno', desc: 'Napredni filteri za brže pronalaženje' },
                        ].map(f => (
                            <div key={f.title} className="bg-[#1B2B5A] rounded-2xl p-6">
                                <div className="text-4xl mb-3">{f.icon}</div>
                                <h3 className="font-bold text-white text-lg mb-1">{f.title}</h3>
                                <p className="text-[#6674A3] text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="bg-[#FF0026] py-10">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                        Prodaješ vozilo?
                    </h2>
                    <p className="text-red-100 mb-6">Objavi oglas besplatno i dođi do kupca za kratko vrijeme</p>
                    <button
                        onClick={() => navigate('/ads/create')}
                        className="bg-[#FFEA00] hover:bg-yellow-300 text-[#12142D] font-black px-10 py-3.5 rounded-xl text-lg transition shadow-lg"
                    >
                        + Objavi oglas besplatno
                    </button>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="bg-[#12142D] border-t border-[#1B2B5A] py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-[#FF0026] px-3 py-1 rounded-lg">
                                <span className="text-white font-black text-lg">VOZIME</span>
                            </div>
                            <span className="text-[#FFEA00] font-bold">OGLASI</span>
                        </div>
                        <p className="text-[#6674A3] text-xs text-center">
                            © {new Date().getFullYear()} VozimeOglasi – Oglasnik vozila za Crnu Goru
                        </p>
                        <div className="flex gap-4 text-xs text-[#6674A3]">
                            <button className="hover:text-white transition">Uslovi korišćenja</button>
                            <button className="hover:text-white transition">Privatnost</button>
                            <button className="hover:text-white transition">Kontakt</button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
