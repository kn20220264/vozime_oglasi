import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useMultipleFilterOptions, CATEGORY_SLUGS } from '../../hooks/useFilterOptions';

export default function EditAd() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [categorySlug, setCategorySlug] = useState(null);

    const { data: ad, isLoading } = useQuery({
        queryKey: ['ad-edit', slug],
        queryFn: () => axios.get(`/ads/${slug}`).then(r => r.data.data ?? r.data),
    });

    // Dohvati kategorije da znamo slug
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => axios.get('/categories').then(r => r.data.data ?? r.data),
    });

    // Filter opcije za kategoriju oglasa
    const { data: filters } = useMultipleFilterOptions(
        ['fuel_type', 'body_type', 'transmission', 'drive_type',
         'condition', 'damage', 'emission_class', 'color_exterior', 'color_interior'],
        categorySlug
    );

    useEffect(() => {
        if (ad) {
            setForm({
                title:           ad.title ?? '',
                description:     ad.description ?? '',
                price:           ad.price ?? '',
                price_negotiable: ad.price_negotiable ? 1 : 0,
                year:            ad.year ?? '',
                mileage:         ad.mileage ?? '',
                fuel_type:       ad.fuel_type ?? '',
                transmission:    ad.transmission ?? '',
                body_type:       ad.body_type ?? '',
                power_kw:        ad.power_kw ?? '',
                engine_cc:       ad.engine_cc ?? '',
                color_exterior:  ad.color_exterior ?? '',
                color_interior:  ad.color_interior ?? '',
                drive_type:      ad.drive_type ?? '',
                doors:           ad.doors ?? '',
                seats:           ad.seats ?? '',
                condition:       ad.condition ?? '',
                damage:          ad.damage ?? '',
                emission_class:  ad.emission_class ?? '',
                owners_count:    ad.owners_count ?? '',
                has_service_book: ad.has_service_book ? 1 : 0,
                has_warranty:    ad.has_warranty ? 1 : 0,
                accepts_exchange: ad.accepts_exchange ? 1 : 0,
            });

            // Postavi category slug za filter opcije
            if (ad.category_id) {
                setCategorySlug(CATEGORY_SLUGS[ad.category_id] ?? null);
            } else if (ad.category?.slug) {
                setCategorySlug(ad.category.slug);
            }
        }
    }, [ad]);

    const updateMutation = useMutation({
        mutationFn: (data) => axios.put(`/ads/${ad.id}`, data),
        onSuccess: () => {
            toast.success('Oglas uspješno ažuriran!');
            navigate('/dashboard/ads');
        },
        onError: (err) => {
            const errors = err.response?.data?.errors;
            if (errors) {
                Object.values(errors).forEach(e => toast.error(e[0]));
            } else {
                toast.error(err.response?.data?.message ?? 'Greška pri ažuriranju.');
            }
        },
    });

    const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = () => {
        if (!form.title || !form.price) {
            toast.error('Naslov i cijena su obavezni.');
            return;
        }
        updateMutation.mutate(form);
    };

    if (isLoading || !form) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-[#FF0026] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Helper: select iz filter opcija
    const FilterSelect = ({ label, field, options = [], required = false }) => (
        <Field label={label + (required ? ' *' : '')}>
            <select value={form[field]} onChange={e => set(field, e.target.value)} className="input">
                <option value="">Odaberi</option>
                {options.map(opt => (
                    <option key={opt.id ?? opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </Field>
    );

    // Boja selector
    const ColorSelect = ({ label, field, options = [] }) => (
        <Field label={label}>
            <div className="flex flex-wrap gap-2 mt-1">
                {options.map(opt => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => set(field, opt.value)}
                        title={opt.label}
                        className={`relative w-7 h-7 rounded-full border-2 transition ${
                            form[field] === opt.value
                                ? 'border-[#FF0026] scale-110'
                                : 'border-gray-200 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: opt.metadata?.hex ?? '#e5e7eb' }}
                    >
                        {form[field] === opt.value && (
                            <span className="absolute inset-0 flex items-center justify-center text-white text-xs">✓</span>
                        )}
                    </button>
                ))}
                {form[field] && (
                    <span className="text-xs text-gray-500 self-center ml-1">
                        {options.find(o => o.value === form[field])?.label ?? form[field]}
                    </span>
                )}
            </div>
        </Field>
    );

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <button
                    onClick={() => navigate('/dashboard/ads')}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-600"
                >
                    ←
                </button>
                <div>
                    <h1 className="text-2xl font-black text-[#12142D]">Uredi oglas</h1>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{ad?.title}</p>
                </div>
            </div>

            <div className="flex flex-col gap-6">

                {/* Osnovne info */}
                <Section title="Osnovne informacije">
                    <div className="flex flex-col gap-4">
                        <Field label="Naslov oglasa *">
                            <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                                className="input" placeholder="npr. BMW 320d xDrive 2019" />
                        </Field>
                        <Field label="Opis">
                            <textarea value={form.description} onChange={e => set('description', e.target.value)}
                                rows={5} className="input resize-none" placeholder="Opišite vozilo..." />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Cijena (€) *">
                                <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                                    className="input" placeholder="0" />
                            </Field>
                            <Field label="Cijena je">
                                <select value={form.price_negotiable} onChange={e => set('price_negotiable', Number(e.target.value))} className="input">
                                    <option value={0}>Fiksna</option>
                                    <option value={1}>Po dogovoru</option>
                                </select>
                            </Field>
                        </div>
                    </div>
                </Section>

                {/* Vozilo */}
                <Section title="Detalji vozila">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Godište">
                            <input type="number" value={form.year} onChange={e => set('year', e.target.value)}
                                className="input" placeholder="2020" />
                        </Field>
                        <Field label="Kilometraža">
                            <input type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)}
                                className="input" placeholder="50000" />
                        </Field>

                        <FilterSelect label="Gorivo"    field="fuel_type"    options={filters?.fuel_type ?? []}    required />
                        <FilterSelect label="Mjenjač"   field="transmission"  options={filters?.transmission ?? []} required />
                        <FilterSelect label="Karoserija" field="body_type"   options={filters?.body_type ?? []}    required />
                        <FilterSelect label="Pogon"     field="drive_type"   options={filters?.drive_type ?? []}   required />

                        <Field label="Snaga (kW)">
                            <input type="number" value={form.power_kw} onChange={e => set('power_kw', e.target.value)}
                                className="input" placeholder="110" />
                        </Field>
                        <Field label="Zapremina (cc)">
                            <input type="number" value={form.engine_cc} onChange={e => set('engine_cc', e.target.value)}
                                className="input" placeholder="1995" />
                        </Field>
                        <Field label="Broj vrata">
                            <select value={form.doors} onChange={e => set('doors', e.target.value)} className="input">
                                <option value="">Odaberi</option>
                                {[2, 3, 4, 5].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </Field>
                        <Field label="Broj sjedišta">
                            <select value={form.seats} onChange={e => set('seats', e.target.value)} className="input">
                                <option value="">Odaberi</option>
                                {[2, 4, 5, 6, 7, 8, 9].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </Field>

                        <FilterSelect label="Euro norma" field="emission_class" options={filters?.emission_class ?? []} />

                        <div className="col-span-2">
                            <ColorSelect label="Boja karoserije *" field="color_exterior" options={filters?.color_exterior ?? []} />
                        </div>
                        <div className="col-span-2">
                            <ColorSelect label="Boja enterijera" field="color_interior" options={filters?.color_interior ?? []} />
                        </div>
                    </div>
                </Section>

                {/* Stanje */}
                <Section title="Stanje vozila">
                    <div className="grid grid-cols-2 gap-4">
                        <FilterSelect label="Stanje"     field="condition" options={filters?.condition ?? []} required />
                        <FilterSelect label="Oštećenje"  field="damage"    options={filters?.damage ?? []}    required />
                        <Field label="Broj vlasnika">
                            <input type="number" value={form.owners_count} onChange={e => set('owners_count', e.target.value)}
                                className="input" placeholder="1" />
                        </Field>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        {[
                            { key: 'has_service_book', label: 'Servisna knjiga' },
                            { key: 'has_warranty',     label: 'Garancija' },
                            { key: 'accepts_exchange', label: 'Prihvata zamjenu' },
                        ].map(({ key, label }) => (
                            <label key={key} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${
                                form[key] ? 'border-[#FF0026] bg-red-50' : 'border-gray-200 bg-white'
                            }`}>
                                <input type="checkbox" checked={!!form[key]}
                                    onChange={e => set(key, e.target.checked ? 1 : 0)}
                                    className="accent-[#FF0026]" />
                                <span className="text-sm font-medium text-[#12142D]">{label}</span>
                            </label>
                        ))}
                    </div>
                </Section>

                {/* Submit */}
                <div className="flex gap-3 pb-8">
                    <button onClick={() => navigate('/dashboard/ads')}
                        className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition">
                        Odustani
                    </button>
                    <button onClick={handleSubmit} disabled={updateMutation.isPending}
                        className="flex-1 py-3 rounded-xl bg-[#FF0026] text-white font-bold hover:bg-red-600 transition disabled:opacity-60">
                        {updateMutation.isPending ? 'Čuvanje...' : 'Sačuvaj izmjene'}
                    </button>
                </div>
            </div>

            <style>{`
                .input {
                    width: 100%;
                    padding: 0.625rem 0.875rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 0.75rem;
                    font-size: 0.875rem;
                    color: #12142D;
                    background: white;
                    outline: none;
                    transition: border-color 0.15s;
                }
                .input:focus { border-color: #FF0026; }
                select.input { cursor: pointer; }
            `}</style>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                <h2 className="font-bold text-[#12142D] text-sm uppercase tracking-wide">{title}</h2>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
            {children}
        </div>
    );
}