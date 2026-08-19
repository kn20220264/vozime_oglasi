import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import AdCard from '../components/ads/AdCard';
import AdFilters from '../components/ads/AdFilters';
import Spinner from '../components/ui/Spinner';
import Pagination from '../components/ui/Pagination';

export default function AdList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [ads, setAds]       = useState([]);
    const [meta, setMeta]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState(Object.fromEntries(searchParams));

    const fetchAds = (params = filters, page = 1) => {
        setLoading(true);
        const query = new URLSearchParams(
            Object.fromEntries(Object.entries({ ...params, page }).filter(([, v]) => v))
        );
        api.get(`/ads?${query}`).then(r => {
            setAds(r.data.data);
            setMeta(r.data.meta);
        }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchAds(); }, []);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setSearchParams(newFilters);
        fetchAds(newFilters, 1);
    };

    const handleSort = (sort) => {
        const newFilters = { ...filters, sort };
        handleFilterChange(newFilters);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex gap-6">
                {/* Sidebar filteri */}
                <aside className="hidden lg:block w-72 flex-shrink-0">
                    <AdFilters filters={filters} onChange={handleFilterChange} />
                </aside>

                {/* Oglasi */}
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-5">
                        <h1 className="text-xl font-bold text-gray-800">
                            {meta ? `${meta.total} oglasa` : 'Oglasi'}
                        </h1>
                        <select
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={e => handleSort(e.target.value)}
                            value={filters.sort || 'newest'}
                        >
                            <option value="newest">Najnoviji</option>
                            <option value="price_asc">Cijena: niža → viša</option>
                            <option value="price_desc">Cijena: viša → niža</option>
                            <option value="mileage_asc">Najmanje km</option>
                        </select>
                    </div>

                    {loading ? <Spinner /> : ads.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <div className="text-5xl mb-4">🔍</div>
                            <p className="text-lg font-medium">Nema oglasa za ove filtere.</p>
                            <button
                                onClick={() => handleFilterChange({})}
                                className="mt-4 text-blue-600 hover:underline"
                            >
                                Resetuj filtere
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
                            </div>
                            <Pagination meta={meta} onPageChange={p => fetchAds(filters, p)} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}