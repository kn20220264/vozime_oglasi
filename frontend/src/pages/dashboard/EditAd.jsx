import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useMultipleFilterOptions, CATEGORY_SLUGS } from '../../hooks/useFilterOptions';

const VEHICLE_HISTORY_OPTIONS = [
    { value: 'prvi_vlasnik',           label: 'Prvi vlasnik' },
    { value: 'kupljen_nov_cg',         label: 'Kupljen nov u Crnoj Gori' },
    { value: 'servisna_knjiga',        label: 'Servisna knjiga' },
    { value: 'restauriran',            label: 'Restauriran' },
    { value: 'oldtimer',               label: 'Oldtimer' },
    { value: 'u_garanciji',            label: 'Garancija' },
    { value: 'garaziran',              label: 'Garažiran' },
    { value: 'prilagodjen_invalidima', label: 'Prilagođen invalidima' },
    { value: 'tuning',                 label: 'Tuning' },
];

const EQUIPMENT_CATEGORY_LABELS = {
    safety: 'Sigurnost',
    comfort: 'Udobnost',
    multimedia: 'Multimedija',
    exterior: 'Eksterijer',
    assistance: 'Asistencija',
};

// Opciona polja koja korisnik smije i isprazniti — šalju se i prazna, da se obrišu u bazi
const CLEARABLE_FIELDS = [
    'emission_class', 'trailer_coupling', 'color_interior',
    'registered_until', 'owners_count', 'engine_cc', 'vin',
];

export default function EditAd() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [categorySlug, setCategorySlug] = useState(null);
    const [selectedMakeId, setSelectedMakeId] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState([]);
    const [vehicleHistory, setVehicleHistory] = useState([]);

    // Slike: postojeće za brisanje, nove za upload, izbor naslovne
    const [deleteImages, setDeleteImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [primaryImageId, setPrimaryImageId] = useState(null);

    // Limit slika prema paketu korisnika (GALERIJA paket podiže limit)
    const { data: imageLimit } = useQuery({
        queryKey: ['image-limit'],
        queryFn: () => axios.get('/image-limit').then(r => r.data.max_images),
    });
    const maxImages = imageLimit ?? 5;

    const { data: ad, isLoading } = useQuery({
        queryKey: ['ad-edit', slug],
        queryFn: () => axios.get(`/ads/${slug}`).then(r => r.data.data ?? r.data),
    });

    // Filter opcije za kategoriju oglasa
    const { data: filters } = useMultipleFilterOptions(
        ['fuel_type', 'body_type', 'transmission', 'drive_type',
         'condition', 'damage', 'emission_class', 'color_exterior', 'color_interior'],
        categorySlug
    );

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => axios.get('/categories').then(r => r.data.data ?? r.data),
    });

    const { data: cities } = useQuery({
        queryKey: ['cities'],
        queryFn: () => axios.get('/cities').then(r => r.data.data ?? r.data),
    });

    const { data: makes } = useQuery({
        queryKey: ['makes', form?.category_id],
        queryFn: () => axios.get('/makes', { params: { category_id: form.category_id } })
            .then(r => r.data.data ?? r.data),
        enabled: !!form?.category_id,
    });

    const { data: models } = useQuery({
        queryKey: ['models', selectedMakeId],
        queryFn: () => axios.get(`/makes/${selectedMakeId}/models`).then(r => r.data.data ?? r.data),
        enabled: !!selectedMakeId,
    });

    const { data: equipment } = useQuery({
        queryKey: ['equipment'],
        queryFn: () => axios.get('/equipment').then(r => r.data.data ?? r.data),
    });

    useEffect(() => {
        if (ad) {
            setForm({
                category_id:     ad.category?.id ?? '',
                make_id:         ad.make?.id ?? '',
                model_id:        ad.model?.id ?? '',
                city_id:         ad.city?.id ?? '',
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
                registered_until: ad.registered_until_raw ?? '',
                vin:             ad.vin ?? '',
                trailer_coupling: ad.trailer_coupling ?? '',
                has_service_book: ad.has_service_book ? 1 : 0,
                has_warranty:    ad.has_warranty ? 1 : 0,
                accepts_exchange: ad.accepts_exchange ? 1 : 0,
                import:          ad.import ? 1 : 0,
            });

            setSelectedMakeId(ad.make?.id ?? '');
            setSelectedEquipment(ad.equipment_ids ?? []);
            setVehicleHistory(ad.vehicle_history ?? []);

            // Postavi category slug za filter opcije
            if (ad.category?.slug) {
                setCategorySlug(ad.category.slug);
            } else if (ad.category?.id) {
                setCategorySlug(CATEGORY_SLUGS[ad.category.id] ?? null);
            }
        }
    }, [ad]);

    const updateMutation = useMutation({
        mutationFn: (data) => axios.post(`/ads/${ad.id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
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

    const toggleHistory = (value) =>
        setVehicleHistory(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );

    const toggleEquipment = (id) =>
        setSelectedEquipment(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );

    // Ukupan broj slika nakon izmjene (postojeće - obrisane + nove)
    const existingImages = ad?.images ?? [];
    const totalImages = existingImages.length - deleteImages.length + newImages.length;

    const toggleDeleteImage = (id) => {
        setDeleteImages(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        if (primaryImageId === id) setPrimaryImageId(null);
    };

    const addNewImages = (files) => {
        const list = Array.from(files);
        const remaining = maxImages - (existingImages.length - deleteImages.length + newImages.length);
        if (list.length > remaining) {
            toast.error(`Vaš paket dozvoljava najviše ${maxImages} slika po oglasu.`);
        }
        setNewImages(prev => [...prev, ...list.slice(0, Math.max(0, remaining))]);
    };

    const handleSubmit = () => {
        if (!form.title || !form.price) {
            toast.error('Naslov i cijena su obavezni.');
            return;
        }
        if (form.description && form.description.length < 30) {
            toast.error('Opis mora imati najmanje 30 karaktera.');
            return;
        }
        if (form.vin && form.vin.length !== 17) {
            toast.error('VIN broj mora imati tačno 17 karaktera (ili ga ostavite prazan).');
            return;
        }
        if (totalImages > maxImages) {
            toast.error(`Vaš paket dozvoljava najviše ${maxImages} slika po oglasu.`);
            return;
        }

        // multipart/form-data zbog upload-a slika; _method=PUT jer PHP ne parsira multipart PUT
        const fd = new FormData();
        fd.append('_method', 'PUT');
        Object.entries(form).forEach(([key, value]) => {
            if (value === '' || value === null || value === undefined) {
                if (CLEARABLE_FIELDS.includes(key)) fd.append(key, '');
                return;
            }
            fd.append(key, value);
        });

        // Oprema i istorija — prazan string briše sve stavke
        if (selectedEquipment.length > 0) {
            selectedEquipment.forEach(id => fd.append('equipment[]', id));
        } else {
            fd.append('equipment', '');
        }
        if (vehicleHistory.length > 0) {
            vehicleHistory.forEach(v => fd.append('vehicle_history[]', v));
        } else {
            fd.append('vehicle_history', '');
        }

        deleteImages.forEach(id => fd.append('delete_images[]', id));
        newImages.forEach(file => fd.append('images[]', file));
        if (primaryImageId) fd.append('primary_image_id', primaryImageId);

        updateMutation.mutate(fd);
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

    // Oprema grupisana po kategoriji
    const equipmentByCategory = Array.isArray(equipment)
        ? equipment.reduce((acc, eq) => {
            const cat = eq.category ?? 'Ostalo';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(eq);
            return acc;
        }, {})
        : equipment && typeof equipment === 'object' ? equipment : {};

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
                        <Field label="Opis * (min. 30 karaktera)">
                            <textarea value={form.description} onChange={e => set('description', e.target.value)}
                                rows={6} className="input resize-none" placeholder="Opišite vozilo..." />
                            {form.description && form.description.length < 30 && (
                                <p className="text-xs text-red-500">Još {30 - form.description.length} karaktera</p>
                            )}
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

                {/* Kategorija i lokacija */}
                <Section title="Kategorija i lokacija">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Kategorija *">
                            <select
                                value={form.category_id}
                                onChange={e => {
                                    const val = e.target.value;
                                    setForm(prev => ({
                                        ...prev,
                                        category_id: val,
                                        // Marka, model i filter polja zavise od kategorije
                                        make_id: '', model_id: '',
                                        fuel_type: '', body_type: '', transmission: '', drive_type: '',
                                    }));
                                    setSelectedMakeId('');
                                    setCategorySlug(CATEGORY_SLUGS[val] ?? null);
                                }}
                                className="input"
                            >
                                <option value="">Odaberi kategoriju</option>
                                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Grad *">
                            <select value={form.city_id} onChange={e => set('city_id', e.target.value)} className="input">
                                <option value="">Odaberi grad</option>
                                {cities?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Marka *">
                            <select value={form.make_id}
                                onChange={e => {
                                    setForm(prev => ({ ...prev, make_id: e.target.value, model_id: '' }));
                                    setSelectedMakeId(e.target.value);
                                }}
                                disabled={!form.category_id} className="input disabled:opacity-50">
                                <option value="">{form.category_id ? 'Odaberi marku' : 'Prvo odaberi kategoriju'}</option>
                                {makes?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Model *">
                            <select value={form.model_id} onChange={e => set('model_id', e.target.value)}
                                disabled={!selectedMakeId} className="input disabled:opacity-50">
                                <option value="">Odaberi model</option>
                                {models?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </Field>
                    </div>
                </Section>

                {/* Fotografije */}
                <Section title={`Fotografije (${totalImages}/${maxImages})`}>
                    {existingImages.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                            {existingImages.map(img => {
                                const marked = deleteImages.includes(img.id);
                                const isPrimary = primaryImageId ? primaryImageId === img.id : img.is_primary;
                                return (
                                    <div key={img.id} className={`relative rounded-xl overflow-hidden border-2 ${
                                        marked ? 'border-red-300 opacity-40' : isPrimary ? 'border-[#FF0026]' : 'border-gray-200'
                                    }`}>
                                        <img src={img.url} alt="" className="w-full h-24 object-cover" />
                                        {isPrimary && !marked && (
                                            <span className="absolute top-1 left-1 bg-[#FF0026] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                Naslovna
                                            </span>
                                        )}
                                        <div className="absolute bottom-1 right-1 flex gap-1">
                                            {!marked && !isPrimary && (
                                                <button type="button" title="Postavi kao naslovnu"
                                                    onClick={() => setPrimaryImageId(img.id)}
                                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-white/90 text-xs hover:bg-white shadow">
                                                    ★
                                                </button>
                                            )}
                                            <button type="button" title={marked ? 'Poništi brisanje' : 'Obriši sliku'}
                                                onClick={() => toggleDeleteImage(img.id)}
                                                className="w-6 h-6 flex items-center justify-center rounded-md bg-white/90 text-xs hover:bg-white shadow">
                                                {marked ? '↩' : '🗑'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {newImages.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                            {newImages.map((file, i) => (
                                <div key={i} className="relative rounded-xl overflow-hidden border-2 border-green-300">
                                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-24 object-cover" />
                                    <span className="absolute top-1 left-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                        Nova
                                    </span>
                                    <button type="button" title="Ukloni"
                                        onClick={() => setNewImages(prev => prev.filter((_, j) => j !== i))}
                                        className="absolute bottom-1 right-1 w-6 h-6 flex items-center justify-center rounded-md bg-white/90 text-xs hover:bg-white shadow">
                                        🗑
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <label className={`flex flex-col items-center justify-center gap-1 p-6 rounded-xl border-2 border-dashed transition ${
                        totalImages >= maxImages
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-gray-300 text-gray-500 hover:border-[#FF0026] hover:text-[#FF0026] cursor-pointer'
                    }`}>
                        <span className="text-2xl">＋</span>
                        <span className="text-sm font-medium">
                            {totalImages >= maxImages
                                ? `Dostigli ste limit od ${maxImages} slika`
                                : 'Dodaj fotografije'}
                        </span>
                        <span className="text-xs text-gray-400">JPG, PNG ili WEBP, do 5MB po slici</span>
                        <input type="file" multiple accept="image/jpeg,image/png,image/webp"
                            className="hidden" disabled={totalImages >= maxImages}
                            onChange={e => { addNewImages(e.target.files); e.target.value = ''; }} />
                    </label>
                    {maxImages <= 10 && (
                        <p className="text-xs text-gray-400 mt-2">
                            Želite više od {maxImages} slika? Kupite GALERIJA paket u sekciji Paketi.
                        </p>
                    )}
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

                        <Field label="Registrovan do">
                            <input type="date" value={form.registered_until} onChange={e => set('registered_until', e.target.value)}
                                className="input" />
                        </Field>

                        <Field label="VIN broj (opciono)">
                            <input type="text" value={form.vin} onChange={e => set('vin', e.target.value)}
                                className="input" placeholder="17 karaktera" />
                            {form.vin && form.vin.length !== 17 && (
                                <p className="text-xs text-red-500">VIN mora imati tačno 17 karaktera ({form.vin.length}/17)</p>
                            )}
                        </Field>

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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        {[
                            { key: 'has_service_book', label: 'Servisna knjiga' },
                            { key: 'has_warranty',     label: 'Garancija' },
                            { key: 'accepts_exchange', label: 'Prihvata zamjenu' },
                            { key: 'import',           label: 'Uvoz' },
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

                    {/* Istorija vozila */}
                    <div className="pt-5">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Istorija vozila</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {VEHICLE_HISTORY_OPTIONS.map(({ value, label }) => (
                                <label key={value} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${
                                    vehicleHistory.includes(value) ? 'border-[#FF0026] bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                    <input type="checkbox" checked={vehicleHistory.includes(value)} onChange={() => toggleHistory(value)}
                                        className="w-4 h-4 accent-[#FF0026]" />
                                    <span className="text-sm font-medium text-gray-700">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Kuka za prikolicu */}
                    <div className="pt-5">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Kuka za prikolicu</p>
                        <div className="flex flex-wrap gap-2">
                            {['', 'Fiksna', 'Odvojna', 'Okretna'].map(opt => (
                                <button
                                    key={opt || 'none'}
                                    type="button"
                                    onClick={() => set('trailer_coupling', opt)}
                                    className={`text-sm px-4 py-2 rounded-full border-2 transition font-medium ${
                                        form.trailer_coupling === opt
                                            ? 'border-[#FF0026] bg-red-50 text-[#FF0026]'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    {opt || 'Nema'}
                                </button>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* Oprema */}
                <Section title="Oprema vozila">
                    <p className="text-sm text-gray-400 mb-4">Opciono — odaberite opremu koja se nalazi u vozilu.</p>
                    <div className="space-y-4">
                        {Object.entries(equipmentByCategory).map(([cat, items]) => (
                            <div key={cat}>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    {EQUIPMENT_CATEGORY_LABELS[cat] ?? cat}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {items.map(eq => (
                                        <button key={eq.id} type="button" onClick={() => toggleEquipment(eq.id)}
                                            className={`text-sm px-3 py-1.5 rounded-full border-2 transition font-medium ${
                                                selectedEquipment.includes(eq.id)
                                                    ? 'border-[#FF0026] bg-red-50 text-[#FF0026]'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}>
                                            {eq.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    {selectedEquipment.length > 0 && (
                        <p className="text-sm text-green-600 font-medium mt-4">Odabrano: {selectedEquipment.length} stavki</p>
                    )}
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
