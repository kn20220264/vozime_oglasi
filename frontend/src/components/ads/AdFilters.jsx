import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AdFilters({ filters, onChange }) {
    const [makes, setMakes]   = useState([]);
    const [models, setModels] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        api.get('/makes').then(r => setMakes(r.data));
        api.get('/cities').then(r => setCities(r.data));
    }, []);

    useEffect(() => {
        if (filters.make_id) {
            api.get(`/makes/${filters.make_id}/models`).then(r => setModels(r.data));
        } else {
            setModels([]);
        }
    }, [filters.make_id]);

    const handleChange = (key, value) => {
        onChange({ ...filters, [key]: value });
    };

    const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
    const labelClass = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide";

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-bold text-gray-700 text-base border-b pb-3">🔍 Filteri</h3>

            {/* Marka */}
            <div>
                <label className={labelClass}>Marka</label>
                <select className={inputClass} value={filters.make_id || ''}
                    onChange={e => handleChange('make_id', e.target.value)}>
                    <option value="">Sve marke</option>
                    {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
            </div>

            {/* Model */}
            <div>
                <label className={labelClass}>Model</label>
                <select className={inputClass} value={filters.model_id || ''}
                    onChange={e => handleChange('model_id', e.target.value)}
                    disabled={!filters.make_id}>
                    <option value="">Svi modeli</option>
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
            </div>

            {/* Cijena */}
            <div>
                <label className={labelClass}>Cijena (€)</label>
                <div className="flex gap-2">
                    <input type="number" placeholder="Od" className={inputClass}
                        value={filters.price_from || ''}
                        onChange={e => handleChange('price_from', e.target.value)} />
                    <input type="number" placeholder="Do" className={inputClass}
                        value={filters.price_to || ''}
                        onChange={e => handleChange('price_to', e.target.value)} />
                </div>
            </div>

            {/* Godište */}
            <div>
                <label className={labelClass}>Godište</label>
                <div className="flex gap-2">
                    <select className={inputClass} value={filters.year_from || ''}
                        onChange={e => handleChange('year_from', e.target.value)}>
                        <option value="">Od</option>
                        {Array.from({ length: 30 }, (_, i) => 2024 - i).map(y =>
                            <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select className={inputClass} value={filters.year_to || ''}
                        onChange={e => handleChange('year_to', e.target.value)}>
                        <option value="">Do</option>
                        {Array.from({ length: 30 }, (_, i) => 2024 - i).map(y =>
                            <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {/* Gorivo */}
            <div>
                <label className={labelClass}>Gorivo</label>
                <select className={inputClass} value={filters.fuel_type || ''}
                    onChange={e => handleChange('fuel_type', e.target.value)}>
                    <option value="">Sve</option>
                    {['benzin','dizel','hibrid','elektro','plin','benzin+plin'].map(f =>
                        <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                </select>
            </div>

            {/* Mjenjač */}
            <div>
                <label className={labelClass}>Mjenjač</label>
                <select className={inputClass} value={filters.transmission || ''}
                    onChange={e => handleChange('transmission', e.target.value)}>
                    <option value="">Sve</option>
                    <option value="manuelni">Manuelni</option>
                    <option value="automatik">Automatik</option>
                    <option value="poluautomatik">Poluautomatik</option>
                </select>
            </div>

            {/* Karoserija */}
            <div>
                <label className={labelClass}>Karoserija</label>
                <select className={inputClass} value={filters.body_type || ''}
                    onChange={e => handleChange('body_type', e.target.value)}>
                    <option value="">Sve</option>
                    {['sedan','karavan','suv','hatchback','coupe','kabrio','van','pickup'].map(b =>
                        <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
                </select>
            </div>

            {/* Grad */}
            <div>
                <label className={labelClass}>Grad</label>
                <select className={inputClass} value={filters.city_id || ''}
                    onChange={e => handleChange('city_id', e.target.value)}>
                    <option value="">Svi gradovi</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {/* Kilometraža */}
            <div>
                <label className={labelClass}>Kilometraža do</label>
                <select className={inputClass} value={filters.mileage_to || ''}
                    onChange={e => handleChange('mileage_to', e.target.value)}>
                    <option value="">Bez limita</option>
                    <option value="50000">50.000 km</option>
                    <option value="100000">100.000 km</option>
                    <option value="150000">150.000 km</option>
                    <option value="200000">200.000 km</option>
                </select>
            </div>

            {/* Reset */}
            <button
                onClick={() => onChange({})}
                className="w-full text-sm text-gray-500 hover:text-red-500 underline text-center pt-2"
            >
                Resetuj filtere
            </button>
        </div>
    );
}
