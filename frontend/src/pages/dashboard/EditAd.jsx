import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const FUEL_TYPES = ['benzin', 'dizel', 'hibrid', 'elektro', 'plin', 'benzin+plin'];
const TRANSMISSIONS = ['manuelni', 'automatik', 'poluautomatik'];
const BODY_TYPES = ['sedan', 'karavan', 'suv', 'hatchback', 'coupe', 'kabrio', 'van', 'pickup'];
const DRIVE_TYPES = ['prednji', 'zadnji', '4x4'];
const CONDITIONS = ['novo', 'polovnjak'];
const DAMAGES = ['neosteceno', 'osteceno', 'nije_vozno'];
const EMISSION_CLASSES = ['euro3', 'euro4', 'euro5', 'euro6'];

export default function EditAd() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);

    const { data: ad, isLoading } = useQuery({
        queryKey: ['ad-edit', slug],
        queryFn: () => axios.get(`/ads/${slug}`).then(r => r.data.data),
    });

    useEffect(() => {
        if (ad) {
            setForm({
                title: ad.title ?? '',
                description: ad.description ?? '',
                price: ad.price ?? '',
                price_negotiable: ad.price_negotiable ? 1 : 0,
                year: ad.year ?? '',
                mileage: ad.mileage ?? '',
                fuel_type: ad.fuel_type ?? '',
                transmission: ad.transmission ?? '',
                body_type: ad.body_type ?? '',
                power_kw: ad.power_kw ?? '',
                engine_cc: ad.engine_cc ?? '',
                color_exterior: ad.color_exterior ?? '',
                drive_type: ad.drive_type ?? '',
                doors: ad.doors ?? '',
                seats: ad.seats ?? '',
                condition: ad.condition ?? '',
                damage: ad.damage ?? '',
                emission_class: ad.emission_class ?? '',
                owners_count: ad.owners_count ?? '',
                has_service_book: ad.has_service_book ? 1 : 0,
                has_warranty: ad.has_warranty ? 1 : 0,
                accepts_exchange: ad.accepts_exchange ? 1 : 0,
            });
        }
    }, [ad]);

    const updateMutation = useMutation({
        mutationFn: (data) => axios.put(`/ads/${ad.id}`, data),
        onSuccess: () => {
            toast.success('Oglas uspješno ažuriran!');
            navigate('/dashboard/ads');
        },
        onError: (err) => {
            const msg = err.response?.data?.message ?? 'Greška pri ažuriranju.';
            toast.error(msg);
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
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => set('title', e.target.value)}
                                className="input"
                                placeholder="npr. BMW 320d xDrive 2019"
                            />
                        </Field>
                        <Field label="Opis">
                            <textarea
                                value={form.description}
                                onChange={e => set('description', e.target.value)}
                                rows={5}
                                className="input resize-none"
                                placeholder="Opišite vozilo..."
                            />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Cijena (€) *">
                                <input
                                    type="number"
                                    value={form.price}
                                    onChange={e => set('price', e.target.value)}
                                    className="input"
                                    placeholder="0"
                                />
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
                            <input type="number" value={form.year} onChange={e => set('year', e.target.value)} className="input" placeholder="2020" />
                        </Field>
                        <Field label="Kilometraža">
                            <input type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)} className="input" placeholder="50000" />
                        </Field>
                        <Field label="Gorivo">
                            <select value={form.fuel_type} onChange={e => set('fuel_type', e.target.value)} className="input">
                                <option value="">Odaberi</option>
                                {FUEL_TYPES.map(f => <option key={f} value={f} className="capitalize">{f}</option>)}
                            </select>
                        </Field>
                        <Field label="Mjenjač">
                            <select value={form.transmission} onChange={e => set('transmission', e.target.value)} className="input">
                                <option value="">Odaberi</option>
                                {TRANSMISSIONS.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                            </select>
                        </Field>
                        <Field label="Karoserija">
                            <select value={form.body_type} onChange={e => set('body_type', e.target.value)} className="input">
                                <option value="">Odaberi</option>
                                {BODY_TYPES.map(b => <option key={b} value={b} className="capitalize">{b}</option>)}
                            </select>
                        </Field>
                        <Field label="Pogon">
                            <select value={form.drive_type} onChange={e => set('drive_type', e.target.value)} className="input">
                                <option value="">Odaberi</option>
                                {DRIVE_TYPES.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
                            </select>
                        </Field>
                        <Field label="Snaga (kW)">
                            <input type="number" value={form.power_kw} onChange={e => set('power_kw', e.target.value)} className="input" placeholder="110" />
                        </Field>
                        <Field label="Zapremina (cc)">
                            <input type="number" value={form.engine_cc} onChange={e => set('engine_cc', e.target.value)} className="input" placeholder="1995" />
                        </Field>
                        <Field label="Broj vrata">
                            <input type="number" value={form.doors} onChange={e => set('doors', e.target.value)} className="input" placeholder="4" />
                        </Field>
                        <Field label="Broj sjedišta">
                            <input type="number" value={form.seats} onChange={e => set('seats', e.target.value)} className="input" placeholder="5" />
                        </Field>
                        <Field label="Boja">
                            <input type="text" value={form.color_exterior} onChange={e => set('color_exterior', e.target.value)} className="input" placeholder="Crna" />
                        </Field>
                        <Field label="Euro norma">
                            <select value={form.emission_class} onChange={e => set('emission_class', e.target.value)} className="input">
                                <option value="">Odaberi</option>
                                {EMISSION_CLASSES.map(e => <option key={e} value={e} className="uppercase">{e}</option>)}
                            </select>
                        </Field>
                    </div>
                </Section>

                {/* Stanje */}
                <Section title="Stanje vozila">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Stanje">
                            <select value={form.condition} onChange={e => set('condition', e.target.value)} className="input">
                                <option value="">Odaberi</option>
                                {CONDITIONS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                            </select>
                        </Field>
                        <Field label="Oštećenje">
                            <select value={form.damage} onChange={e => set('damage', e.target.value)} className="input">
                                <option value="">Odaberi</option>
                                {DAMAGES.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
                            </select>
                        </Field>
                        <Field label="Broj vlasnika">
                            <input type="number" value={form.owners_count} onChange={e => set('owners_count', e.target.value)} className="input" placeholder="1" />
                        </Field>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        {[
                            { key: 'has_service_book', label: 'Servisna knjiga' },
                            { key: 'has_warranty', label: 'Garancija' },
                            { key: 'accepts_exchange', label: 'Prihvata zamjenu' },
                        ].map(({ key, label }) => (
                            <label key={key} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${form[key] ? 'border-[#FF0026] bg-red-50' : 'border-gray-200 bg-white'}`}>
                                <input
                                    type="checkbox"
                                    checked={!!form[key]}
                                    onChange={e => set(key, e.target.checked ? 1 : 0)}
                                    className="accent-[#FF0026]"
                                />
                                <span className="text-sm font-medium text-[#12142D]">{label}</span>
                            </label>
                        ))}
                    </div>
                </Section>

                {/* Submit */}
                <div className="flex gap-3 pb-8">
                    <button
                        onClick={() => navigate('/dashboard/ads')}
                        className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition"
                    >
                        Odustani
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={updateMutation.isPending}
                        className="flex-1 py-3 rounded-xl bg-[#FF0026] text-white font-bold hover:bg-red-600 transition disabled:opacity-60"
                    >
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
                .input:focus {
                    border-color: #FF0026;
                }
                select.input {
                    cursor: pointer;
                }
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
