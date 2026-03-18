import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const STEPS = [
    { id: 1, label: 'Kategorija',    icon: '📂' },
    { id: 2, label: 'Vozilo',        icon: '🚗' },
    { id: 3, label: 'Detalji',       icon: '🔧' },
    { id: 4, label: 'Oprema',        icon: '⚙️' },
    { id: 5, label: 'Slike i cijena',icon: '📷' },
];

const FUEL_TYPES    = ['benzin', 'dizel', 'hibrid', 'elektro', 'plin', 'benzin+plin'];
const TRANSMISSIONS = ['manuelni', 'automatik', 'poluautomatik'];
const BODY_TYPES    = ['sedan', 'karavan', 'suv', 'hatchback', 'coupe', 'kabrio', 'van', 'pickup'];
const DRIVE_TYPES   = ['prednji', 'zadnji', '4x4'];
const CONDITIONS    = ['novo', 'polovnjak'];
const DAMAGE_TYPES  = ['neosteceno', 'osteceno', 'nije_vozno'];
const EMISSION      = ['euro3', 'euro4', 'euro5', 'euro6'];
const COLORS        = ['bijela', 'crna', 'siva', 'srebrna', 'crvena', 'plava', 'zelena', 'smeđa', 'zlatna', 'narandžasta', 'ljubičasta', 'bež'];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 35 }, (_, i) => currentYear - i);

export default function CreateAd() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [images, setImages] = useState([]);
    const [primaryIdx, setPrimaryIdx] = useState(0);

    const [form, setForm] = useState({
        // Korak 1
        category_id: '',
        // Korak 2
        make_id: '', model_id: '', year: '', mileage: '',
        fuel_type: '', transmission: '', body_type: '', condition: 'polovnjak',
        // Korak 3
        power_kw: '', engine_cc: '', drive_type: '', color_exterior: '',
        color_interior: '', doors: '', seats: '', damage: 'neosteceno',
        emission_class: '', owners_count: '', registered_until: '',
        vin: '', has_service_book: false, has_warranty: false,
        accepts_exchange: false, import: false,
        // Korak 4
        equipment: [],
        // Korak 5
        title: '', description: '', price: '', price_negotiable: false,
        city_id: '',
    });

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const toggleEquip = (id) => setForm(p => ({
        ...p,
        equipment: p.equipment.includes(id)
            ? p.equipment.filter(e => e !== id)
            : [...p.equipment, id]
    }));

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => axios.get('/categories').then(r => r.data)
    });
    const { data: makes } = useQuery({
        queryKey: ['makes'],
        queryFn: () => axios.get('/makes').then(r => r.data)
    });
    const { data: models } = useQuery({
        queryKey: ['models', form.make_id],
        queryFn: () => axios.get(`/models?make_id=${form.make_id}`).then(r => r.data),
        enabled: !!form.make_id
    });
    const { data: equipment } = useQuery({
        queryKey: ['equipment'],
        queryFn: () => axios.get('/equipment').then(r => r.data)
    });
    const { data: cities } = useQuery({
        queryKey: ['cities'],
        queryFn: () => axios.get('/cities').then(r => r.data)
    });

    const equipByCategory = equipment?.reduce((acc, eq) => {
        if (!acc[eq.category]) acc[eq.category] = [];
        acc[eq.category].push(eq);
        return acc;
    }, {}) || {};

    const submitMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (k === 'equipment') {
                    v.forEach(id => formData.append('equipment[]', id));
                } else if (typeof v === 'boolean') {
                    formData.append(k, v ? '1' : '0');
                } else if (v !== '') {
                    formData.append(k, v);
                }
            });
            images.forEach((img, i) => {
                formData.append('images[]', img.file);
                if (i === primaryIdx) formData.append('primary_image_index', i);
            });
            return axios.post('/ads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        onSuccess: (res) => {
            toast.success('Oglas uspješno objavljen!');
            navigate(`/ads/${res.data.slug}`);
        },
        onError: (err) => {
            const errors = err.response?.data?.errors;
            if (errors) {
                Object.values(errors).flat().forEach(e => toast.error(e));
            } else {
                toast.error('Greška pri objavi oglasa.');
            }
        }
    });

    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        const newImgs = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setImages(p => [...p, ...newImgs].slice(0, 20));
    };

    const removeImage = (idx) => {
        setImages(p => p.filter((_, i) => i !== idx));
        if (primaryIdx >= idx && primaryIdx > 0) setPrimaryIdx(p => p - 1);
    };

    const validateStep = () => {
        if (step === 1 && !form.category_id) { toast.error('Odaberite kategoriju'); return false; }
        if (step === 2) {
            if (!form.make_id)      { toast.error('Odaberite marku'); return false; }
            if (!form.year)         { toast.error('Unesite godište'); return false; }
            if (!form.mileage && form.condition !== 'novo') { toast.error('Unesite kilometražu'); return false; }
            if (!form.fuel_type)    { toast.error('Odaberite gorivo'); return false; }
            if (!form.transmission) { toast.error('Odaberite mjenjač'); return false; }
            if (!form.body_type)    { toast.error('Odaberite tip karoserije'); return false; }
        }
        if (step === 5) {
            if (!form.title)    { toast.error('Unesite naslov'); return false; }
            if (!form.price)    { toast.error('Unesite cijenu'); return false; }
            if (!form.city_id)  { toast.error('Odaberite grad'); return false; }
            if (images.length === 0) { toast.error('Dodajte bar jednu sliku'); return false; }
        }
        return true;
    };

    const next = () => { if (validateStep()) setStep(p => p + 1); };
    const prev = () => setStep(p => p - 1);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4">

                {/* Naslov */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-[#12142D]">Objavi oglas</h1>
                    <p className="text-gray-500 text-sm mt-1">Popunite podatke o vozilu korak po korak</p>
                </div>

                {/* Progress stepper */}
                <div className="flex items-center justify-between mb-8 relative">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0" />
                    <div
                        className="absolute top-5 left-0 h-0.5 bg-[#FF0026] transition-all duration-500 -z-0"
                        style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                    />
                    {STEPS.map(s => (
                        <div key={s.id} className="flex flex-col items-center z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                                ${step > s.id  ? 'bg-[#FF0026] border-[#FF0026] text-white' :
                                  step === s.id ? 'bg-white border-[#FF0026] text-[#FF0026] shadow-md' :
                                                  'bg-white border-gray-200 text-gray-400'}`}>
                                {step > s.id ? '✓' : s.icon}
                            </div>
                            <span className={`text-xs mt-1 font-medium hidden sm:block
                                ${step === s.id ? 'text-[#FF0026]' : 'text-gray-400'}`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">

                    {/* ===== KORAK 1 — Kategorija ===== */}
                    {step === 1 && (
                        <StepWrap title="Odaberite kategoriju vozila">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {categories?.map(cat => (
                                    <button key={cat.id}
                                        onClick={() => set('category_id', cat.id)}
                                        className={`p-4 rounded-xl border-2 text-center transition
                                            ${form.category_id === cat.id
                                                ? 'border-[#FF0026] bg-red-50'
                                                : 'border-gray-100 hover:border-gray-300'}`}>
                                        <div className="text-3xl mb-2">{cat.icon || '🚗'}</div>
                                        <div className={`text-sm font-semibold ${form.category_id === cat.id ? 'text-[#FF0026]' : 'text-gray-700'}`}>
                                            {cat.name}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </StepWrap>
                    )}

                    {/* ===== KORAK 2 — Vozilo ===== */}
                    {step === 2 && (
                        <StepWrap title="Podaci o vozilu">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <FormField label="Marka *">
                                    <select value={form.make_id}
                                        onChange={e => { set('make_id', e.target.value); set('model_id', ''); }}
                                        className="form-select">
                                        <option value="">Odaberite marku</option>
                                        {makes?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </FormField>

                                <FormField label="Model">
                                    <select value={form.model_id} onChange={e => set('model_id', e.target.value)}
                                        disabled={!form.make_id} className="form-select disabled:bg-gray-50 disabled:text-gray-400">
                                        <option value="">Odaberite model</option>
                                        {models?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </FormField>

                                <FormField label="Godište *">
                                    <select value={form.year} onChange={e => set('year', e.target.value)} className="form-select">
                                        <option value="">Odaberite godište</option>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </FormField>

                                <FormField label="Kilometraža (km)">
                                    <input type="number" value={form.mileage}
                                        onChange={e => set('mileage', e.target.value)}
                                        placeholder="npr. 95000" className="form-input" />
                                </FormField>

                                <FormField label="Gorivo *">
                                    <div className="flex flex-wrap gap-1.5">
                                        {FUEL_TYPES.map(f => (
                                            <ToggleChip key={f} label={f} active={form.fuel_type === f}
                                                onClick={() => set('fuel_type', f)} />
                                        ))}
                                    </div>
                                </FormField>

                                <FormField label="Mjenjač *">
                                    <div className="flex flex-wrap gap-1.5">
                                        {TRANSMISSIONS.map(t => (
                                            <ToggleChip key={t} label={t} active={form.transmission === t}
                                                onClick={() => set('transmission', t)} />
                                        ))}
                                    </div>
                                </FormField>

                                <FormField label="Tip karoserije *">
                                    <div className="flex flex-wrap gap-1.5">
                                        {BODY_TYPES.map(b => (
                                            <ToggleChip key={b} label={b} active={form.body_type === b}
                                                onClick={() => set('body_type', b)} />
                                        ))}
                                    </div>
                                </FormField>

                                <FormField label="Stanje">
                                    <div className="flex gap-2">
                                        {CONDITIONS.map(c => (
                                            <ToggleChip key={c} label={c} active={form.condition === c}
                                                onClick={() => set('condition', c)} />
                                        ))}
                                    </div>
                                </FormField>
                            </div>
                        </StepWrap>
                    )}

                    {/* ===== KORAK 3 — Detalji ===== */}
                    {step === 3 && (
                        <StepWrap title="Tehničke specifikacije">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <FormField label="Snaga motora (kW)">
                                    <input type="number" value={form.power_kw}
                                        onChange={e => set('power_kw', e.target.value)}
                                        placeholder="npr. 110" className="form-input" />
                                </FormField>

                                <FormField label="Zapremina motora (ccm)">
                                    <input type="number" value={form.engine_cc}
                                        onChange={e => set('engine_cc', e.target.value)}
                                        placeholder="npr. 1984" className="form-input" />
                                </FormField>

                                <FormField label="Pogon">
                                    <div className="flex flex-wrap gap-1.5">
                                        {DRIVE_TYPES.map(d => (
                                            <ToggleChip key={d} label={d} active={form.drive_type === d}
                                                onClick={() => set('drive_type', d)} />
                                        ))}
                                    </div>
                                </FormField>

                                <FormField label="Euro norma">
                                    <div className="flex flex-wrap gap-1.5">
                                        {EMISSION.map(e => (
                                            <ToggleChip key={e} label={e.toUpperCase()} active={form.emission_class === e}
                                                onClick={() => set('emission_class', e)} />
                                        ))}
                                    </div>
                                </FormField>

                                <FormField label="Boja (eksterijer)">
                                    <select value={form.color_exterior}
                                        onChange={e => set('color_exterior', e.target.value)} className="form-select">
                                        <option value="">Odaberite boju</option>
                                        {COLORS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                                    </select>
                                </FormField>

                                <FormField label="Boja (interijer)">
                                    <select value={form.color_interior}
                                        onChange={e => set('color_interior', e.target.value)} className="form-select">
                                        <option value="">Odaberite boju</option>
                                        {COLORS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                                    </select>
                                </FormField>

                                <FormField label="Broj vrata">
                                    <div className="flex gap-1.5">
                                        {[2, 3, 4, 5].map(d => (
                                            <ToggleChip key={d} label={d} active={form.doors === d}
                                                onClick={() => set('doors', d)} />
                                        ))}
                                    </div>
                                </FormField>

                                <FormField label="Broj sjedišta">
                                    <div className="flex flex-wrap gap-1.5">
                                        {[2, 4, 5, 6, 7, 8].map(s => (
                                            <ToggleChip key={s} label={s} active={form.seats === s}
                                                onClick={() => set('seats', s)} />
                                        ))}
                                    </div>
                                </FormField>

                                <FormField label="Oštećenje">
                                    <div className="flex flex-wrap gap-1.5">
                                        {DAMAGE_TYPES.map(d => (
                                            <ToggleChip key={d} label={d.replace('_', ' ')} active={form.damage === d}
                                                onClick={() => set('damage', d)} />
                                        ))}
                                    </div>
                                </FormField>

                                <FormField label="Broj vlasnika">
                                    <input type="number" min="1" max="10" value={form.owners_count}
                                        onChange={e => set('owners_count', e.target.value)}
                                        placeholder="npr. 2" className="form-input" />
                                </FormField>

                                <FormField label="Registrovan do">
                                    <input type="date" value={form.registered_until}
                                        onChange={e => set('registered_until', e.target.value)} className="form-input" />
                                </FormField>

                                <FormField label="VIN broj">
                                    <input type="text" value={form.vin}
                                        onChange={e => set('vin', e.target.value.toUpperCase())}
                                        placeholder="17 karaktera" maxLength={17} className="form-input font-mono" />
                                </FormField>

                                {/* Checkboxovi */}
                                <div className="col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                    {[
                                        { key: 'has_service_book', label: '📋 Servisna knjiga' },
                                        { key: 'has_warranty',     label: '🛡️ Garancija' },
                                        { key: 'accepts_exchange', label: '🔄 Prima zamjenu' },
                                        { key: 'import',           label: '🌍 Uvoz' },
                                    ].map(({ key, label }) => (
                                        <label key={key}
                                            className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition
                                                ${form[key] ? 'border-[#FF0026] bg-red-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                            <input type="checkbox" checked={form[key]}
                                                onChange={e => set(key, e.target.checked)}
                                                className="accent-[#FF0026]" />
                                            <span className="text-xs font-medium text-gray-700">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </StepWrap>
                    )}

                    {/* ===== KORAK 4 — Oprema ===== */}
                    {step === 4 && (
                        <StepWrap title="Oprema i dodaci">
                            <p className="text-sm text-gray-500 mb-4">
                                Označeno: <strong>{form.equipment.length}</strong> stavki
                            </p>
                            {Object.entries(equipByCategory).map(([cat, items]) => (
                                <div key={cat} className="mb-5">
                                    <h3 className="text-xs font-black text-[#12142D] uppercase tracking-wide mb-2 capitalize">
                                        {cat}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {items.map(eq => (
                                            <button key={eq.id}
                                                onClick={() => toggleEquip(eq.id)}
                                                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition
                                                    ${form.equipment.includes(eq.id)
                                                        ? 'bg-[#12142D] border-[#12142D] text-white'
                                                        : 'border-gray-200 text-gray-600 hover:border-[#12142D]'}`}>
                                                {form.equipment.includes(eq.id) ? '✓ ' : ''}{eq.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </StepWrap>
                    )}

                    {/* ===== KORAK 5 — Slike i cijena ===== */}
                    {step === 5 && (
                        <StepWrap title="Slike, opis i cijena">
                            <div className="space-y-5">

                                {/* Upload slika */}
                                <FormField label="Slike vozila * (max 20)">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#FF0026] hover:bg-red-50 transition">
                                        <span className="text-3xl mb-1">📷</span>
                                        <span className="text-sm text-gray-500">Kliknite ili prevucite slike</span>
                                        <span className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP — max 10MB po slici</span>
                                        <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
                                    </label>

                                    {images.length > 0 && (
                                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-3">
                                            {images.map((img, i) => (
                                                <div key={i}
                                                    className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition
                                                        ${primaryIdx === i ? 'border-[#FF0026]' : 'border-transparent'}`}
                                                    onClick={() => setPrimaryIdx(i)}>
                                                    <img src={img.preview} className="w-full h-20 object-cover" alt="" />
                                                    {primaryIdx === i && (
                                                        <span className="absolute top-1 left-1 bg-[#FF0026] text-white text-xs px-1 rounded font-bold">
                                                            Glavna
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={e => { e.stopPropagation(); removeImage(i); }}
                                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black">
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </FormField>

                                {/* Naslov */}
                                <FormField label="Naslov oglasa *">
                                    <input type="text" value={form.title}
                                        onChange={e => set('title', e.target.value)}
                                        placeholder="npr. VW Golf 7 1.6 TDI 2018, odličan, servisiran"
                                        maxLength={150} className="form-input" />
                                    <p className="text-xs text-gray-400 mt-1 text-right">{form.title.length}/150</p>
                                </FormField>

                                {/* Opis */}
                                <FormField label="Opis vozila">
                                    <textarea value={form.description}
                                        onChange={e => set('description', e.target.value)}
                                        placeholder="Opišite vozilo detaljno — istorija, oprema, razlog prodaje..."
                                        rows={5} maxLength={3000}
                                        className="form-input resize-none" />
                                    <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/3000</p>
                                </FormField>

                                {/* Cijena i grad */}
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Cijena (€) *">
                                        <input type="number" value={form.price}
                                            onChange={e => set('price', e.target.value)}
                                            placeholder="npr. 12500" className="form-input" />
                                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                            <input type="checkbox" checked={form.price_negotiable}
                                                onChange={e => set('price_negotiable', e.target.checked)}
                                                className="accent-[#FF0026]" />
                                            <span className="text-xs text-gray-600">Cijena po dogovoru</span>
                                        </label>
                                    </FormField>

                                    <FormField label="Grad *">
                                        <select value={form.city_id}
                                            onChange={e => set('city_id', e.target.value)} className="form-select">
                                            <option value="">Odaberite grad</option>
                                            {cities?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </FormField>
                                </div>

                                {/* Pregled */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Pregled oglasa</p>
                                    <p className="font-bold text-[#12142D]">{form.title || '—'}</p>
                                    <p className="text-[#FF0026] font-black text-lg mt-1">
                                        {form.price ? `${Number(form.price).toLocaleString()} €` : '—'}
                                    </p>
                                    <div className="flex gap-2 flex-wrap mt-1">
                                        {[form.year, form.mileage && `${Number(form.mileage).toLocaleString()} km`,
                                          form.fuel_type, form.transmission].filter(Boolean).map((v, i) => (
                                            <span key={i} className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md">{v}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </StepWrap>
                    )}

                    {/* Navigacija */}
                    <div className="flex justify-between mt-8 pt-5 border-t border-gray-100">
                        <button
                            onClick={prev} disabled={step === 1}
                            className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition">
                            ← Nazad
                        </button>
                        {step < STEPS.length ? (
                            <button onClick={next}
                                className="px-8 py-2.5 bg-[#FF0026] hover:bg-red-700 text-white rounded-xl text-sm font-bold transition">
                                Dalje →
                            </button>
                        ) : (
                            <button
                                onClick={() => submitMutation.mutate()}
                                disabled={submitMutation.isPending}
                                className="px-8 py-2.5 bg-[#12142D] hover:bg-[#1B2B5A] disabled:opacity-50 text-white rounded-xl text-sm font-bold transition flex items-center gap-2">
                                {submitMutation.isPending ? (
                                    <><span className="animate-spin">⏳</span> Objavljujem...</>
                                ) : (
                                    '✅ Objavi oglas'
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StepWrap({ title, children }) {
    return (
        <div>
            <h2 className="text-lg font-black text-[#12142D] mb-5">{title}</h2>
            {children}
        </div>
    );
}

function FormField({ label, children }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
            {children}
        </div>
    );
}

function ToggleChip({ label, active, onClick }) {
    return (
        <button onClick={onClick}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium capitalize transition
                ${active
                    ? 'bg-[#FF0026] border-[#FF0026] text-white'
                    : 'border-gray-200 text-gray-600 hover:border-[#FF0026] hover:text-[#FF0026]'}`}>
            {label}
        </button>
    );
}