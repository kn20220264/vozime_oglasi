import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '../api/axios';
import toast from 'react-hot-toast';

export default function EditAd() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);

    const { data: ad, isLoading } = useQuery({
        queryKey: ['ad-edit', slug],
        queryFn: () => axios.get(`/ads/${slug}`).then(r => r.data)
    });

    useEffect(() => {
        if (ad) setForm({
            title:           ad.title || '',
            description:     ad.description || '',
            price:           ad.price || '',
            price_negotiable:ad.price_negotiable || false,
            year:            ad.year || '',
            mileage:         ad.mileage || '',
            fuel_type:       ad.fuel_type || '',
            transmission:    ad.transmission || '',
            body_type:       ad.body_type || '',
            power_kw:        ad.power_kw || '',
            engine_cc:       ad.engine_cc || '',
            color_exterior:  ad.color_exterior || '',
            drive_type:      ad.drive_type || '',
            damage:          ad.damage || '',
            condition:       ad.condition || '',
            city_id:         ad.city_id || '',
            has_service_book:ad.has_service_book || false,
            has_warranty:    ad.has_warranty || false,
            accepts_exchange:ad.accepts_exchange || false,
            registered_until:ad.registered_until || '',
        });
    }, [ad]);

    const { data: cities } = useQuery({
        queryKey: ['cities'],
        queryFn: () => axios.get('/cities').then(r => r.data)
    });

    const mutation = useMutation({
        mutationFn: () => axios.put(`/ads/${ad.id}`, form),
        onSuccess: () => {
            toast.success('Oglas ažuriran!');
            navigate(`/ads/${slug}`);
        },
        onError: (err) => {
            const errors = err.response?.data?.errors;
            if (errors) Object.values(errors).flat().forEach(e => toast.error(e));
            else toast.error('Greška pri ažuriranju.');
        }
    });

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    if (isLoading || !form) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF0026]" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <h1 className="text-2xl font-black text-[#12142D] mb-6">Uredi oglas</h1>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Naslov *</label>
                        <input value={form.title} onChange={e => set('title', e.target.value)}
                            className="form-input w-full" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Opis</label>
                        <textarea value={form.description} onChange={e => set('description', e.target.value)}
                            rows={4} className="form-input w-full resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Cijena (€) *</label>
                            <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                                className="form-input w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Grad *</label>
                            <select value={form.city_id} onChange={e => set('city_id', e.target.value)}
                                className="form-select w-full">
                                <option value="">Odaberite grad</option>
                                {cities?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Godište</label>
                            <input type="number" value={form.year} onChange={e => set('year', e.target.value)}
                                className="form-input w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Kilometraža</label>
                            <input type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)}
                                className="form-input w-full" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Registrovan do</label>
                        <input type="date" value={form.registered_until}
                            onChange={e => set('registered_until', e.target.value)}
                            className="form-input w-full" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {[
                            { key: 'has_service_book', label: '📋 Servisna knjiga' },
                            { key: 'has_warranty',     label: '🛡️ Garancija' },
                            { key: 'accepts_exchange', label: '🔄 Prima zamjenu' },
                            { key: 'price_negotiable', label: '💬 Po dogovoru' },
                        ].map(({ key, label }) => (
                            <label key={key}
                                className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition text-xs
                                    ${form[key] ? 'border-[#FF0026] bg-red-50' : 'border-gray-100'}`}>
                                <input type="checkbox" checked={form[key]}
                                    onChange={e => set(key, e.target.checked)}
                                    className="accent-[#FF0026]" />
                                <span className="font-medium text-gray-700">{label}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button onClick={() => navigate(-1)}
                            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                            Odustani
                        </button>
                        <button onClick={() => mutation.mutate()}
                            disabled={mutation.isPending}
                            className="flex-1 bg-[#FF0026] hover:bg-red-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-bold text-sm transition">
                            {mutation.isPending ? 'Čuvanje...' : '✅ Sačuvaj izmjene'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}