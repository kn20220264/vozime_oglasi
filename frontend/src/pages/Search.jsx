import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import AdCard from '../components/AdCard';

const FUEL_TYPES    = ['benzin', 'dizel', 'hibrid', 'elektro', 'plin', 'benzin+plin'];
const TRANSMISSIONS = ['manuelni', 'automatik', 'poluautomatik'];
const BODY_TYPES    = ['sedan', 'karavan', 'suv', 'hatchback', 'coupe', 'kabrio', 'van', 'pickup'];
const DRIVE_TYPES   = ['prednji', 'zadnji', '4x4'];
const CONDITIONS    = ['novo', 'polovnjak'];
const DAMAGE_TYPES  = ['neosteceno', 'osteceno', 'nije_vozno'];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 35 }, (_, i) => currentYear - i);

const sortMap = {
    'latest':     { sort: 'created_at', dir: 'desc' },
    'price_asc':  { sort: 'price',      dir: 'asc'  },
    'price_desc': { sort: 'price',      dir: 'desc' },
    'year_desc':  { sort: 'year',       dir: 'desc' },
    'mileage_asc':{ sort: 'mileage',    dir: 'asc'  },
    'views':      { sort: 'views_count',dir: 'desc' },
};

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [filters, setFilters] = useState({
        q:            searchParams.get('q')            || '',
        make_id:      searchParams.get('make_id')      || '',
        model_id:     searchParams.get('model_id')     || '',
        price_from:   searchParams.get('price_from')   || '',
        price_to:     searchParams.get('price_to')     || '',
        year_from:    searchParams.get('year_from')    || '',
        year_to:      searchParams.get('year_to')      || '',
        mileage_to:   searchParams.get('mileage_to')   || '',
        fuel_type:    searchParams.get('fuel_type')    || '',
        transmission: searchParams.get('transmission') || '',
        body_type:    searchParams.get('body_type')    || '',
        drive_type:   searchParams.get('drive_type')   || '',
        condition:    searchParams.get('condition')    || '',
        damage:       searchParams.get('damage')       || '',
        city_id:      searchParams.get('city_id')      || '',
        power_kw_from:searchParams.get('power_kw_from')|| '',
        power_kw_to:  searchParams.get('power_kw_to')  || '',
        sort:         searchParams.get('sort')         || 'latest',
        page:         Number(searchParams.get('page')) || 1,
    });

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { data: makes } = useQuery({
        queryKey: ['makes'],
        queryFn: () => axios.get('/makes').then(r => r.data.data),
        staleTime: Infinity,
    });

    const { data: models } = useQuery({
        queryKey: ['models', filters.make_id],
        queryFn: () => axios.get(`/makes/${filters.make_id}/models`).then(r => r.data.data),
        enabled: !!filters.make_id,
    });

    const { data: cities } = useQuery({
        queryKey: ['cities'],
        queryFn: () => axios.get('/cities').then(r => r.data.data),
        staleTime: Infinity,
    });

    const { data: results, isLoading } = useQuery({
        queryKey: ['search', filters],
        queryFn: () => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([k, v]) => {
                if (k === 'sort' || k === 'page' || !v) return;
                params.set(k, v);
            });
            const s = sortMap[filters.sort] || sortMap['latest'];
            params.set('sort', s.sort);
            params.set('dir', s.dir);
            params.set('page', filters.page);
            return axios.get(`/ads?${params.toString()}`).then(r => r.data);
        },
        keepPreviousData: true,
    });

    const set = (key, val) => setFilters(p => ({
        ...p, [key]: val, page: 1,
        ...(key === 'make_id' ? { model_id: '' } : {})
    }));

    const applyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
        setSearchParams(params);
        setSidebarOpen(false);
    };

    const resetFilters = () => {
        setFilters({
            q: '', make_id: '', model_id: '', price_from: '', price_to: '',
            year_from: '', year_to: '', mileage_to: '', fuel_type: '',
            transmission: '', body_type: '', drive_type: '', condition: '',
            damage: '', city_id: '', power_kw_from: '', power_kw_to: '',
            sort: 'latest', page: 1,
        });
    };

    const activeFiltersCount = Object.entries(filters)
        .filter(([k, v]) => v && !['sort', 'page', 'q'].includes(k)).length;

    const ads      = results?.data        || [];
    const total    = results?.meta?.total || 0;
    const lastPage = results?.meta?.last_page || 1;

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="bg-[#12142D] py-4 sticky top-16 z-30">
                <div className="max-w-6xl mx-auto px-4 flex gap-3">
                    <input
                        type="text"
                        value={filters.q}
                        onChange={e => set('q', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters()}
                        placeholder="Pretraži vozila... (npr. VW Golf 2018)"
                        className="flex-1 bg-[#1B2B5A] text-white placeholder-[#6674A3] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]"
                    />
                    <button onClick={applyFilters}
                        className="bg-[#FF0026] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition">
                        Traži
                    </button>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden bg-[#1B2B5A] text-white px-4 py-2.5 rounded-xl text-sm flex items-center gap-1.5 relative"
                    >
                        Filteri
                        {activeFiltersCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#FFEA00] text-[#12142D] text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">

                <aside className="hidden md:block w-72 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-36">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-black text-[#12142D] text-base">Filteri</h2>
                            {activeFiltersCount > 0 && (
                                <span className="bg-[#FF0026] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </div>
                        <FilterSidebar
                            filters={filters}
                            set={set}
                            makes={makes}
                            models={models}
                            cities={cities}
                            applyFilters={applyFilters}
                            resetFilters={resetFilters}
                        />
                    </div>
                </aside>

                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 md:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-black text-[#12142D]">Filteri</h2>
                                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                            </div>
                            <FilterSidebar
                                filters={filters}
                                set={set}
                                makes={makes}
                                models={models}
                                cities={cities}
                                applyFilters={applyFilters}
                                resetFilters={resetFilters}
                            />
                        </div>
                    </div>
                )}

                <main className="flex-1 min-w-0">

                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <div>
                            <span className="font-black text-[#12142D] text-lg">{total.toLocaleString()}</span>
                            <span className="text-gray-500 text-sm ml-1">vozila pronađeno</span>
                            {filters.q && (
                                <span className="ml-1 text-sm text-gray-500">za "<span className="font-semibold text-[#12142D]">{filters.q}</span>"</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Sortiraj:</span>
                            <select
                                value={filters.sort}
                                onChange={e => set('sort', e.target.value)}
                                className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white"
                            >
                                <option value="latest">Najnoviji</option>
                                <option value="price_asc">Cijena ↑</option>
                                <option value="price_desc">Cijena ↓</option>
                                <option value="year_desc">Najnovije godište</option>
                                <option value="mileage_asc">Najmanje km</option>
                                <option value="views">Najpregledaniji</option>
                            </select>
                        </div>
                    </div>

                    {activeFiltersCount > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {Object.entries(filters)
                                .filter(([k, v]) => v && !['sort', 'page', 'q'].includes(k))
                                .map(([k, v]) => (
                                    <span key={k}
                                        className="inline-flex items-center gap-1 bg-[#12142D] text-white text-xs px-3 py-1 rounded-full">
                                        {v}
                                        <button onClick={() => set(k, '')} className="ml-1 hover:text-[#FFEA00]">✕</button>
                                    </span>
                                ))}
                            <button onClick={resetFilters}
                                className="text-xs text-[#FF0026] hover:underline px-2">
                                Obriši sve
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {Array(6).fill(0).map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                                    <div className="h-48 bg-gray-200" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                                        <div className="h-6 bg-gray-200 rounded w-1/3 mt-3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && ads.length === 0 && (
                        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                            <div className="text-5xl mb-3">🔍</div>
                            <h3 className="font-bold text-gray-800 text-lg mb-1">Nema rezultata</h3>
                            <p className="text-gray-400 text-sm mb-4">Pokušajte sa drugačijim filterima</p>
                            <button onClick={resetFilters}
                                className="bg-[#FF0026] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-700 transition">
                                Resetuj filtere
                            </button>
                        </div>
                    )}

                    {!isLoading && ads.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
                            </div>

                            {lastPage > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                                    <button
                                        disabled={filters.page <= 1}
                                        onClick={() => set('page', filters.page - 1)}
                                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-[#FF0026] hover:text-[#FF0026] transition"
                                    >
                                        ← Prethodna
                                    </button>
                                    {Array.from({ length: Math.min(lastPage, 7) }, (_, i) => {
                                        const p = i + 1;
                                        return (
                                            <button key={p}
                                                onClick={() => set('page', p)}
                                                className={`w-9 h-9 rounded-xl text-sm font-bold transition
                                                    ${filters.page === p
                                                        ? 'bg-[#FF0026] text-white'
                                                        : 'border border-gray-200 text-gray-600 hover:border-[#FF0026] hover:text-[#FF0026]'}`}>
                                                {p}
                                            </button>
                                        );
                                    })}
                                    <button
                                        disabled={filters.page >= lastPage}
                                        onClick={() => set('page', filters.page + 1)}
                                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-[#FF0026] hover:text-[#FF0026] transition"
                                    >
                                        Sljedeća →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

function FilterSidebar({ filters, set, makes, models, cities, applyFilters, resetFilters }) {
    return (
        <div className="space-y-5">

            <FilterSection title="Marka i model">
                <select value={filters.make_id} onChange={e => set('make_id', e.target.value)}
                    className="filter-select">
                    <option value="">Svi proizvođači</option>
                    {makes?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <select value={filters.model_id} onChange={e => set('model_id', e.target.value)}
                    disabled={!filters.make_id}
                    className="filter-select mt-2 disabled:bg-gray-50 disabled:text-gray-400">
                    <option value="">Svi modeli</option>
                    {models?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
            </FilterSection>

            <FilterSection title="Cijena (€)">
                <div className="flex gap-2">
                    <input type="number" placeholder="Od" value={filters.price_from}
                        onChange={e => set('price_from', e.target.value)}
                        className="filter-input w-1/2" />
                    <input type="number" placeholder="Do" value={filters.price_to}
                        onChange={e => set('price_to', e.target.value)}
                        className="filter-input w-1/2" />
                </div>
            </FilterSection>

            <FilterSection title="Godište">
                <div className="flex gap-2">
                    <select value={filters.year_from} onChange={e => set('year_from', e.target.value)}
                        className="filter-select w-1/2">
                        <option value="">Od</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select value={filters.year_to} onChange={e => set('year_to', e.target.value)}
                        className="filter-select w-1/2">
                        <option value="">Do</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </FilterSection>

            <FilterSection title="Kilometraža do (km)">
                <input type="number" placeholder="npr. 150000" value={filters.mileage_to}
                    onChange={e => set('mileage_to', e.target.value)}
                    className="filter-input" />
            </FilterSection>

            <FilterSection title="Gorivo">
                <div className="flex flex-wrap gap-1.5">
                    {FUEL_TYPES.map(f => (
                        <button key={f}
                            onClick={() => set('fuel_type', filters.fuel_type === f ? '' : f)}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-medium capitalize transition
                                ${filters.fuel_type === f
                                    ? 'bg-[#FF0026] border-[#FF0026] text-white'
                                    : 'border-gray-200 text-gray-600 hover:border-[#FF0026] hover:text-[#FF0026]'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Mjenjač">
                <div className="flex flex-wrap gap-1.5">
                    {TRANSMISSIONS.map(t => (
                        <button key={t}
                            onClick={() => set('transmission', filters.transmission === t ? '' : t)}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-medium capitalize transition
                                ${filters.transmission === t
                                    ? 'bg-[#12142D] border-[#12142D] text-white'
                                    : 'border-gray-200 text-gray-600 hover:border-[#12142D]'}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Tip karoserije">
                <div className="flex flex-wrap gap-1.5">
                    {BODY_TYPES.map(b => (
                        <button key={b}
                            onClick={() => set('body_type', filters.body_type === b ? '' : b)}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-medium capitalize transition
                                ${filters.body_type === b
                                    ? 'bg-[#1B2B5A] border-[#1B2B5A] text-white'
                                    : 'border-gray-200 text-gray-600 hover:border-[#1B2B5A]'}`}>
                            {b}
                        </button>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Pogon">
                <div className="flex flex-wrap gap-1.5">
                    {DRIVE_TYPES.map(d => (
                        <button key={d}
                            onClick={() => set('drive_type', filters.drive_type === d ? '' : d)}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-medium capitalize transition
                                ${filters.drive_type === d
                                    ? 'bg-[#12142D] border-[#12142D] text-white'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                            {d}
                        </button>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Snaga (kW)">
                <div className="flex gap-2">
                    <input type="number" placeholder="Od" value={filters.power_kw_from}
                        onChange={e => set('power_kw_from', e.target.value)}
                        className="filter-input w-1/2" />
                    <input type="number" placeholder="Do" value={filters.power_kw_to}
                        onChange={e => set('power_kw_to', e.target.value)}
                        className="filter-input w-1/2" />
                </div>
            </FilterSection>

            <FilterSection title="Stanje">
                <div className="flex gap-2">
                    {CONDITIONS.map(c => (
                        <button key={c}
                            onClick={() => set('condition', filters.condition === c ? '' : c)}
                            className={`flex-1 text-xs py-2 rounded-lg border font-medium capitalize transition
                                ${filters.condition === c
                                    ? 'bg-[#FF0026] border-[#FF0026] text-white'
                                    : 'border-gray-200 text-gray-600 hover:border-[#FF0026]'}`}>
                            {c}
                        </button>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Oštećenje">
                <div className="flex flex-wrap gap-1.5">
                    {DAMAGE_TYPES.map(d => (
                        <button key={d}
                            onClick={() => set('damage', filters.damage === d ? '' : d)}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-medium capitalize transition
                                ${filters.damage === d
                                    ? 'bg-[#12142D] border-[#12142D] text-white'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                            {d.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Grad">
                <select value={filters.city_id} onChange={e => set('city_id', e.target.value)}
                    className="filter-select">
                    <option value="">Svi gradovi</option>
                    {cities?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </FilterSection>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button onClick={applyFilters}
                    className="flex-1 bg-[#FF0026] hover:bg-red-700 text-white py-2.5 rounded-xl font-bold text-sm transition">
                    Primijeni filtere
                </button>
                <button onClick={resetFilters}
                    className="px-4 py-2.5 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl text-sm transition">
                    Reset
                </button>
            </div>
        </div>
    );
}

function FilterSection({ title, children }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-b border-gray-100 pb-4">
            <button
                onClick={() => setOpen(p => !p)}
                className="flex items-center justify-between w-full mb-3"
            >
                <span className="text-sm font-bold text-[#12142D]">{title}</span>
                <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
            </button>
            {open && children}
        </div>
    );
}
