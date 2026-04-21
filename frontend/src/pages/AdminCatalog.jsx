import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════
// STATIČKI PODACI — sve vrijednosti iz SearchFilters.jsx
// ═══════════════════════════════════════════════════════════════

const CATALOG_TABS = [
  { key: 'auto',      label: 'Auto',      icon: '🚗' },
  { key: 'motocikl',  label: 'Motocikl',  icon: '🏍' },
  { key: 'nautika',   label: 'Nautika',   icon: '⛵' },
  { key: 'transport', label: 'Transport', icon: '🚛' },
];

// Sekcije filter opcija po kategoriji — svaka sekcija ima filter_type i tip prikaza
const AUTO_FILTER_SECTIONS = [
  { key: 'body_type',        label: 'Karoserija',          type: 'list' },
  { key: 'fuel_type',        label: 'Gorivo',              type: 'list' },
  { key: 'transmission',     label: 'Mjenjač',             type: 'list' },
  { key: 'drive_type',       label: 'Pogon',               type: 'list' },
  { key: 'condition',        label: 'Stanje vozila',       type: 'list' },
  { key: 'damage',           label: 'Oštećenje',           type: 'list' },
  { key: 'emission_class',   label: 'Euro norma',          type: 'list' },
  { key: 'color_exterior',   label: 'Boje eksterijera',    type: 'color' },
  { key: 'color_interior',   label: 'Boje interijera',     type: 'color' },
  { key: 'seat_material',    label: 'Materijal sjedišta',  type: 'list' },
  { key: 'airbags',          label: 'Airbagi',             type: 'list' },
  { key: 'ac',               label: 'Klimatizacija',       type: 'list' },
  { key: 'trailer_coupling', label: 'Kuka za prikolicu',   type: 'list' },
  { key: 'cruise_control',   label: 'Tempomat',            type: 'list' },
  { key: 'parking_sensors',  label: 'Parking senzori',     type: 'list' },
  { key: 'exterior_extras',  label: 'Oprema eksterijera',  type: 'checklist' },
  { key: 'interior_features',label: 'Oprema interijera',   type: 'checklist' },
];

const MOTO_FILTER_SECTIONS = [
  { key: 'fuel_type',    label: 'Gorivo',    type: 'list' },
  { key: 'transmission', label: 'Mjenjač',   type: 'list' },
  { key: 'drive_type',   label: 'Pogon',     type: 'list' },
  { key: 'condition',    label: 'Stanje',    type: 'list' },
  { key: 'damage',       label: 'Oštećenje', type: 'list' },
  { key: 'color_exterior', label: 'Boje',    type: 'color' },
];

const NAUTIKA_FILTER_SECTIONS = [
  { key: 'hull_material', label: 'Materijal trupa',  type: 'list' },
  { key: 'engine_type',   label: 'Tip motora',       type: 'list' },
  { key: 'boat_length',   label: 'Dužina plovila',   type: 'list' },
  { key: 'condition',     label: 'Stanje',           type: 'list' },
  { key: 'color_exterior',label: 'Boje',             type: 'color' },
  { key: 'boat_extras',   label: 'Oprema plovila',   type: 'checklist' },
];

const TRANSPORT_FILTER_SECTIONS = [
  { key: 'fuel_type',    label: 'Gorivo',     type: 'list' },
  { key: 'transmission', label: 'Mjenjač',    type: 'list' },
  { key: 'drive_type',   label: 'Pogon',      type: 'list' },
  { key: 'emission_class',label: 'Euro norma', type: 'list' },
  { key: 'condition',    label: 'Stanje',     type: 'list' },
  { key: 'damage',       label: 'Oštećenje',  type: 'list' },
  { key: 'truck_length', label: 'Dužina',     type: 'list' },
  { key: 'truck_load',   label: 'Nosivost',   type: 'list' },
  { key: 'bed_type',     label: 'Tip kreveta (kamperi)', type: 'checklist' },
  { key: 'heating',      label: 'Grijanje (kamperi)',    type: 'checklist' },
  { key: 'trailer_equipment', label: 'Oprema prikolica', type: 'checklist' },
  { key: 'bus_equipment',     label: 'Oprema autobusa',  type: 'checklist' },
  { key: 'camper_equipment',  label: 'Oprema kampera',   type: 'checklist' },
];

const FILTER_SECTIONS_BY_TAB = {
  auto:      AUTO_FILTER_SECTIONS,
  motocikl:  MOTO_FILTER_SECTIONS,
  nautika:   NAUTIKA_FILTER_SECTIONS,
  transport: TRANSPORT_FILTER_SECTIONS,
};

// ═══════════════════════════════════════════════════════════════
// HELPER UI KOMPONENTE
// ═══════════════════════════════════════════════════════════════

function Btn({ children, variant = 'primary', size = 'md', disabled, onClick, type = 'button', className = '' }) {
  const variants = {
    primary:   'bg-[#FF0026] hover:bg-red-700 text-white',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200',
    success:   'bg-green-500 hover:bg-green-600 text-white',
    danger:    'bg-red-50 hover:bg-red-100 text-[#FF0026]',
    yellow:    'bg-[#FFEA00] hover:bg-yellow-400 text-[#12142D]',
    ghost:     'text-gray-500 hover:text-[#FF0026] hover:bg-red-50',
  };
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-sm',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`font-semibold rounded-xl transition disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>}
      <input {...props}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white" />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>}
      <select {...props}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
        {children}
      </select>
    </div>
  );
}

function Badge({ children, color = 'gray' }) {
  const colors = {
    green:  'bg-green-100 text-green-700',
    red:    'bg-red-50 text-[#FF0026]',
    yellow: 'bg-[#FFEA00]/30 text-[#12142D]',
    blue:   'bg-blue-100 text-blue-700',
    gray:   'bg-gray-100 text-gray-600',
    purple: 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[color]}`}>
      {children}
    </span>
  );
}

function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${width} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-black text-[#12142D]">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function SectionAccordion({ title, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden mb-3">
      <button onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-[#12142D]">{title}</span>
          {badge !== undefined && (
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-semibold">{badge}</span>
          )}
        </div>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="bg-white">{children}</div>}
    </div>
  );
}

// Reorder strelice
function ReorderBtns({ onUp, onDown }) {
  return (
    <div className="flex flex-col gap-0.5 flex-shrink-0">
      <button onClick={onUp} className="text-gray-300 hover:text-gray-500 text-xs leading-none px-0.5">▲</button>
      <button onClick={onDown} className="text-gray-300 hover:text-gray-500 text-xs leading-none px-0.5">▼</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FILTER OPCIJE SEKCIJA — CRUD za jednu filter_type vrijednost
// ═══════════════════════════════════════════════════════════════

function FilterSection({ section, category }) {
  const qc = useQueryClient();
  const qKey = ['filter-options', section.key, category];

  const { data: options = [], isLoading } = useQuery({
    queryKey: qKey,
    queryFn: () => axios.get('/admin/filter-options', {
      params: { filter_type: section.key, category }
    }).then(r => r.data),
  });

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ label: '', value: '', sort_order: 0, is_active: true });
  const [hexColor, setHexColor] = useState('');

  const isColor = section.type === 'color';

  const save = useMutation({
    mutationFn: (d) => editing
      ? axios.put(`/admin/filter-options/${editing.id}`, d)
      : axios.post('/admin/filter-options', d),
    onSuccess: () => {
      toast.success(editing ? 'Ažurirano.' : 'Dodano.');
      qc.invalidateQueries({ queryKey: qKey });
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.'),
  });

  const remove = useMutation({
    mutationFn: (id) => axios.delete(`/admin/filter-options/${id}`),
    onSuccess: () => { toast.success('Obrisano.'); qc.invalidateQueries({ queryKey: qKey }); },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.'),
  });

  const toggle = useMutation({
    mutationFn: ({ id, is_active, ...rest }) =>
      axios.put(`/admin/filter-options/${id}`, { ...rest, is_active: !is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qKey }),
  });

  const reorder = useMutation({
    mutationFn: (items) => axios.put('/admin/filter-options/reorder', { items }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qKey }),
  });

  const moveUp = (opt) => {
    const idx = options.findIndex(o => o.id === opt.id);
    if (idx === 0) return;
    const arr = [...options];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    reorder.mutate(arr.map((o, i) => ({ id: o.id, sort_order: i })));
  };

  const moveDown = (opt) => {
    const idx = options.findIndex(o => o.id === opt.id);
    if (idx === options.length - 1) return;
    const arr = [...options];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    reorder.mutate(arr.map((o, i) => ({ id: o.id, sort_order: i })));
  };

  const openAdd = () => {
    setEditing(null);
    setHexColor('');
    setForm({ label: '', value: '', sort_order: options.length, is_active: true });
    setModal(true);
  };

  const openEdit = (opt) => {
    setEditing(opt);
    setHexColor(opt.metadata?.hex ?? '');
    setForm({ label: opt.label, value: opt.value, sort_order: opt.sort_order, is_active: opt.is_active });
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditing(null); setHexColor(''); };

  const handleSave = () => {
    const data = {
      ...form,
      filter_type: section.key,
      category,
      metadata: isColor && hexColor ? { hex: hexColor } : {},
    };
    save.mutate(data);
  };

  return (
    <SectionAccordion title={section.label} badge={options.length}>
      <div className="px-4 py-3 border-b border-gray-50 flex justify-end">
        <Btn size="sm" onClick={openAdd}>+ Dodaj</Btn>
      </div>

      {isLoading && <div className="p-4 text-center text-gray-400 text-xs">Učitavanje...</div>}

      {!isLoading && options.length === 0 && (
        <div className="p-4 text-center text-gray-400 text-xs">
          Nema opcija. <button onClick={openAdd} className="text-[#FF0026] hover:underline">Dodaj prvu →</button>
        </div>
      )}

      <div className="divide-y divide-gray-50">
        {options.map((opt) => (
          <div key={opt.id} className={`flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50/50 ${!opt.is_active ? 'opacity-50' : ''}`}>
            <ReorderBtns onUp={() => moveUp(opt)} onDown={() => moveDown(opt)} />

            {isColor && opt.metadata?.hex && (
              <div className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0"
                style={{ backgroundColor: opt.metadata.hex }} />
            )}

            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm text-[#12142D]">{opt.label}</span>
              <span className="text-xs text-gray-400 ml-2 font-mono">{opt.value}</span>
            </div>

            <button onClick={() => toggle.mutate(opt)}
              className={`text-xs font-semibold px-2 py-0.5 rounded-full transition flex-shrink-0
                ${opt.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {opt.is_active ? '✓' : '✗'}
            </button>

            <div className="flex gap-1 flex-shrink-0">
              <Btn size="xs" variant="secondary" onClick={() => openEdit(opt)}>✏️</Btn>
              <Btn size="xs" variant="danger"
                onClick={() => window.confirm('Obrisati opciju?') && remove.mutate(opt.id)}>🗑</Btn>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={closeModal}
        title={editing ? `Uredi — ${editing.label}` : `Dodaj u "${section.label}"`}>
        <div className="space-y-4">
          <Input label="Prikaz korisniku *" value={form.label}
            onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
            placeholder="npr. Benzin" />
          <Input label="Vrijednost (slug) *" value={form.value}
            onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
            placeholder="npr. benzin" />
          <Input label="Redoslijed" type="number" value={form.sort_order}
            onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} />
          {isColor && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Hex boja</label>
              <div className="flex items-center gap-3">
                <input type="color" value={hexColor || '#000000'} onChange={e => setHexColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <input value={hexColor} onChange={e => setHexColor(e.target.value)}
                  placeholder="#FF0000"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
              </div>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_active}
              onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" />
            Aktivna opcija
          </label>
          <div className="flex gap-3 pt-2">
            <Btn onClick={handleSave} disabled={!form.label || !form.value || save.isPending}>
              {save.isPending ? 'Čuvanje...' : editing ? 'Sačuvaj' : 'Dodaj'}
            </Btn>
            <Btn variant="secondary" onClick={closeModal}>Otkaži</Btn>
          </div>
        </div>
      </Modal>
    </SectionAccordion>
  );
}

// ═══════════════════════════════════════════════════════════════
// MARKE & MODELI — hijerarhija 3 nivoa (samo za auto i transport)
// ═══════════════════════════════════════════════════════════════

function MakesModelsPanel({ categorySlug }) {
  const qc = useQueryClient();

  // Dohvati kategorije da nađemo category_id po slogu
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => axios.get('/categories').then(r => r.data.data ?? r.data),
    staleTime: 0,
  });

  const categoryId = categories?.find(c =>
    c.name.toLowerCase() === categorySlug || c.slug === categorySlug
  )?.id;

  const { data: makes = [], isLoading: makesLoading } = useQuery({
    queryKey: ['admin-makes', categoryId],
    queryFn: () => axios.get('/admin/makes', { params: { category_id: categoryId } }).then(r => r.data),
    enabled: !!categoryId,
  });

  const [selectedMake, setSelectedMake] = useState(null);
  const [makeSearch, setMakeSearch] = useState('');
  const [makeModal, setMakeModal] = useState(false);
  const [editingMake, setEditingMake] = useState(null);
  const [makeForm, setMakeForm] = useState({ name: '', country: '', is_active: true });

  const [modelModal, setModelModal] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [parentModel, setParentModel] = useState(null);
  const [modelForm, setModelForm] = useState({ name: '', year_from: '', year_to: '', is_active: true });

  // Modeli za odabranu marku
  const { data: modelsData } = useQuery({
    queryKey: ['admin-models', selectedMake?.id],
    queryFn: () => axios.get('/admin/models', { params: { make_id: selectedMake?.id, per_page: 300 } }).then(r => r.data),
    enabled: !!selectedMake,
  });

  const rootModels = (modelsData?.data ?? []).filter(m => !m.parent_id);
  const childMap = (modelsData?.data ?? []).reduce((acc, m) => {
    if (m.parent_id) { if (!acc[m.parent_id]) acc[m.parent_id] = []; acc[m.parent_id].push(m); }
    return acc;
  }, {});

  // MUTATIONS — marke
  const saveMake = useMutation({
    mutationFn: (d) => editingMake
      ? axios.put(`/admin/makes/${editingMake.id}`, d)
      : axios.post('/admin/makes', { ...d, category_id: categoryId }),
    onSuccess: () => {
      toast.success(editingMake ? 'Marka ažurirana.' : 'Marka dodana.');
      qc.invalidateQueries({ queryKey: ['admin-makes', categoryId] });
      closeMakeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.'),
  });

  const deleteMake = useMutation({
    mutationFn: (id) => axios.delete(`/admin/makes/${id}`),
    onSuccess: () => {
      toast.success('Marka obrisana.');
      qc.invalidateQueries({ queryKey: ['admin-makes', categoryId] });
      if (selectedMake) setSelectedMake(null);
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.'),
  });

  // MUTATIONS — modeli
  const saveModel = useMutation({
    mutationFn: (d) => editingModel
      ? axios.put(`/admin/models/${editingModel.id}`, d)
      : axios.post('/admin/models', { ...d, make_id: selectedMake?.id, parent_id: parentModel?.id ?? null }),
    onSuccess: () => {
      toast.success(editingModel ? 'Model ažuriran.' : 'Model dodan.');
      qc.invalidateQueries({ queryKey: ['admin-models', selectedMake?.id] });
      closeModelModal();
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.'),
  });

  const deleteModel = useMutation({
    mutationFn: (id) => axios.delete(`/admin/models/${id}`),
    onSuccess: () => {
      toast.success('Model obrisan.');
      qc.invalidateQueries({ queryKey: ['admin-models', selectedMake?.id] });
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.'),
  });

  const toggleModel = useMutation({
    mutationFn: ({ id, is_active, name, year_from, year_to }) =>
      axios.put(`/admin/models/${id}`, { name, year_from, year_to, is_active: !is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-models', selectedMake?.id] }),
  });

  const openAddMake = () => {
    setEditingMake(null);
    setMakeForm({ name: '', country: '', is_active: true });
    setMakeModal(true);
  };
  const openEditMake = (m) => {
    setEditingMake(m);
    setMakeForm({ name: m.name, country: m.country ?? '', is_active: m.is_active });
    setMakeModal(true);
  };
  const closeMakeModal = () => { setMakeModal(false); setEditingMake(null); };

  const openAddModel = (parent = null) => {
    setEditingModel(null);
    setParentModel(parent);
    setModelForm({ name: '', year_from: '', year_to: '', is_active: true });
    setModelModal(true);
  };
  const openEditModel = (m) => {
    setEditingModel(m);
    setParentModel(null);
    setModelForm({ name: m.name, year_from: m.year_from ?? '', year_to: m.year_to ?? '', is_active: m.is_active });
    setModelModal(true);
  };
  const closeModelModal = () => { setModelModal(false); setEditingModel(null); setParentModel(null); };

  const filteredMakes = makes.filter(m =>
    m.name.toLowerCase().includes(makeSearch.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* ── LISTA MARKI ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-black text-sm text-[#12142D]">Marke</h3>
          <Btn size="sm" onClick={openAddMake}>+ Dodaj marku</Btn>
        </div>
        <div className="p-3 border-b border-gray-100">
          <input value={makeSearch} onChange={e => setMakeSearch(e.target.value)}
            placeholder="Pretraži marku..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
        </div>
        {makesLoading && <div className="p-6 text-center text-gray-400 text-sm">Učitavanje...</div>}
        <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
          {filteredMakes.map(m => (
            <div key={m.id} onClick={() => setSelectedMake(m)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition
                ${selectedMake?.id === m.id ? 'bg-[#FF0026]/5 border-l-4 border-[#FF0026]' : 'hover:bg-gray-50'}`}>
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 flex-shrink-0">
                {m.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-[#12142D]">{m.name}</p>
                  {!m.is_active && <Badge color="gray">Neaktivna</Badge>}
                </div>
                <div className="flex gap-2 text-xs text-gray-400">
                  {m.country && <span>{m.country}</span>}
                  <span>{m.models_count ?? 0} modela</span>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <Btn size="xs" variant="secondary" onClick={() => openEditMake(m)}>✏️</Btn>
                <Btn size="xs" variant="danger"
                  onClick={() => window.confirm(`Obrisati "${m.name}"?`) && deleteMake.mutate(m.id)}>🗑</Btn>
              </div>
            </div>
          ))}
          {!makesLoading && filteredMakes.length === 0 && (
            <div className="p-6 text-center text-gray-400 text-sm">Nema marki.</div>
          )}
        </div>
      </div>

      {/* ── MODELI (hijerarhija) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="font-black text-sm text-[#12142D]">
              {selectedMake ? selectedMake.name : '← Odaberi marku'}
            </h3>
            {selectedMake && <p className="text-xs text-gray-400">{(modelsData?.data ?? []).length} modela</p>}
          </div>
          {selectedMake && (
            <Btn size="sm" onClick={() => openAddModel(null)}>+ Dodaj seriju</Btn>
          )}
        </div>

        {!selectedMake && (
          <div className="p-8 text-center text-gray-400 text-sm">Klikni na marku lijevo da vidiš modele</div>
        )}

        <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
          {rootModels.map(root => (
            <div key={root.id}>
              {/* ROOT model / serija */}
              <div className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50/50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {childMap[root.id]?.length > 0 && <span className="text-gray-400 text-xs">📁</span>}
                    <p className="font-semibold text-sm text-[#12142D]">{root.name}</p>
                    {!root.is_active && <Badge color="gray">Off</Badge>}
                    {childMap[root.id]?.length > 0 && (
                      <span className="text-xs text-[#6674A3]">({childMap[root.id].length})</span>
                    )}
                  </div>
                  {(root.year_from || root.year_to) && (
                    <p className="text-xs text-gray-400">
                      {root.year_from}–{root.year_to || ''}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Btn size="xs" variant="secondary" onClick={() => openAddModel(root)} title="Dodaj podmodel">+ Sub</Btn>
                  <Btn size="xs" variant="secondary" onClick={() => openEditModel(root)}>✏️</Btn>
                  <Btn size="xs" variant="danger"
                    onClick={() => window.confirm('Obrisati model i sve podmodele?') && deleteModel.mutate(root.id)}>🗑</Btn>
                </div>
              </div>

              {/* PODMODELI */}
              {childMap[root.id]?.map(child => (
                <div key={child.id}
                  className={`flex items-center gap-2 pl-10 pr-4 py-2 hover:bg-blue-50/30 ${!child.is_active ? 'opacity-50' : ''}`}>
                  <div className="w-3 h-3 border-l-2 border-b-2 border-gray-200 flex-shrink-0 -mt-1" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-[#12142D]">{child.name}</span>
                    {(child.year_from || child.year_to) && (
                      <span className="text-xs text-gray-400 ml-2">{child.year_from}–{child.year_to || ''}</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleModel.mutate(child)}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition
                        ${child.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {child.is_active ? '✓' : '✗'}
                    </button>
                    <Btn size="xs" variant="secondary" onClick={() => openEditModel(child)}>✏️</Btn>
                    <Btn size="xs" variant="danger"
                      onClick={() => window.confirm('Obrisati podmodel?') && deleteModel.mutate(child.id)}>🗑</Btn>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {selectedMake && rootModels.length === 0 && (
            <div className="p-6 text-center text-gray-400 text-sm">
              Nema modela.{' '}
              <button onClick={() => openAddModel(null)} className="text-[#FF0026] hover:underline">Dodaj →</button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL — marka */}
      <Modal open={makeModal} onClose={closeMakeModal}
        title={editingMake ? `Uredi marku — ${editingMake.name}` : 'Dodaj marku'}>
        <div className="space-y-4">
          <Input label="Naziv *" value={makeForm.name}
            onChange={e => setMakeForm(p => ({ ...p, name: e.target.value }))} placeholder="npr. BMW" />
          <Input label="Zemlja porijekla" value={makeForm.country}
            onChange={e => setMakeForm(p => ({ ...p, country: e.target.value }))} placeholder="npr. Njemačka" />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={makeForm.is_active}
              onChange={e => setMakeForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" />
            Aktivna marka
          </label>
          <div className="flex gap-3 pt-2">
            <Btn onClick={() => saveMake.mutate(makeForm)} disabled={!makeForm.name || saveMake.isPending}>
              {saveMake.isPending ? 'Čuvanje...' : editingMake ? 'Sačuvaj' : 'Dodaj marku'}
            </Btn>
            <Btn variant="secondary" onClick={closeMakeModal}>Otkaži</Btn>
          </div>
        </div>
      </Modal>

      {/* MODAL — model */}
      <Modal open={modelModal} onClose={closeModelModal}
        title={editingModel ? `Uredi — ${editingModel.name}` : parentModel ? `Dodaj podmodel u "${parentModel.name}"` : `Nova serija — ${selectedMake?.name}`}>
        <div className="space-y-4">
          {parentModel && !editingModel && (
            <div className="bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-lg">
              Podmodel unutar: <strong>{parentModel.name}</strong>
            </div>
          )}
          <Input label="Naziv *" value={modelForm.name}
            onChange={e => setModelForm(p => ({ ...p, name: e.target.value }))}
            placeholder={parentModel ? 'npr. 320d' : 'npr. Serija 3'} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Od godine" type="number" value={modelForm.year_from}
              onChange={e => setModelForm(p => ({ ...p, year_from: e.target.value }))} placeholder="npr. 2005" />
            <Input label="Do godine" type="number" value={modelForm.year_to}
              onChange={e => setModelForm(p => ({ ...p, year_to: e.target.value }))} placeholder="npr. 2012" />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={modelForm.is_active}
              onChange={e => setModelForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" />
            Aktivan model
          </label>
          <div className="flex gap-3 pt-2">
            <Btn onClick={() => saveModel.mutate(modelForm)} disabled={!modelForm.name || saveModel.isPending}>
              {saveModel.isPending ? 'Čuvanje...' : editingModel ? 'Sačuvaj' : 'Dodaj'}
            </Btn>
            <Btn variant="secondary" onClick={closeModelModal}>Otkaži</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PODKATEGORIJE PANEL — za Motocikl, Nautika, Transport
// ═══════════════════════════════════════════════════════════════

function SubcategoriesPanel({ parentCategorySlug }) {
  const qc = useQueryClient();

  const { data: allCats } = useQuery({
    queryKey: ['categories'],
    queryFn: () => axios.get('/categories').then(r => r.data.data ?? r.data),
    staleTime: 0,
  });

  const parentCat = allCats?.find(c =>
    c.name.toLowerCase() === parentCategorySlug || c.slug === parentCategorySlug
  );

  // Djeca kategorije dolaze direktno iz /categories koji ih uključuje kao children array
  const subcats = allCats?.find(c => c.id === parentCat?.id)?.children ?? [];
  const isLoading = !allCats;

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '', sort_order: 0, is_active: true });

  const save = useMutation({
    mutationFn: (d) => editing
      ? axios.put(`/admin/categories/${editing.id}`, d)
      : axios.post('/admin/categories', { ...d, parent_id: parentCat?.id }),
    onSuccess: () => {
      toast.success(editing ? 'Ažurirano.' : 'Dodano.');
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.'),
  });

  const remove = useMutation({
    mutationFn: (id) => axios.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      toast.success('Obrisano.');
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.'),
  });

  const reorder = useMutation({
    mutationFn: (items) => axios.put('/admin/categories/reorder', { items }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-subcategories', parentCat?.id] }),
  });

  const moveUp = (cat) => {
    const idx = subcats.findIndex(c => c.id === cat.id);
    if (idx === 0) return;
    const arr = [...subcats];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    reorder.mutate(arr.map((c, i) => ({ id: c.id, sort_order: i })));
  };

  const moveDown = (cat) => {
    const idx = subcats.findIndex(c => c.id === cat.id);
    if (idx === subcats.length - 1) return;
    const arr = [...subcats];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    reorder.mutate(arr.map((c, i) => ({ id: c.id, sort_order: i })));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', icon: '', sort_order: subcats.length, is_active: true });
    setModal(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, icon: c.icon ?? '', sort_order: c.sort_order, is_active: c.is_active });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-black text-sm text-[#12142D]">Podkategorije</h3>
        <Btn size="sm" onClick={openAdd}>+ Dodaj</Btn>
      </div>

      {isLoading && <div className="p-6 text-center text-gray-400 text-sm">Učitavanje...</div>}

      {!isLoading && subcats.length === 0 && (
        <div className="p-6 text-center text-gray-400 text-sm">
          Nema podkategorija.{' '}
          <button onClick={openAdd} className="text-[#FF0026] hover:underline">Dodaj →</button>
        </div>
      )}

      <div className="divide-y divide-gray-50">
        {subcats.map(cat => (
          <div key={cat.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${!cat.is_active ? 'opacity-50' : ''}`}>
            <ReorderBtns onUp={() => moveUp(cat)} onDown={() => moveDown(cat)} />
            <span className="text-lg flex-shrink-0">{cat.icon ?? '📁'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[#12142D]">{cat.name}</p>
              {cat.slug && <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>}
            </div>
            <Badge color={cat.is_active ? 'green' : 'gray'}>{cat.is_active ? 'Aktivna' : 'Neaktivna'}</Badge>
            <div className="flex gap-1 flex-shrink-0">
              <Btn size="xs" variant="secondary" onClick={() => openEdit(cat)}>✏️</Btn>
              <Btn size="xs" variant="danger"
                onClick={() => window.confirm(`Obrisati "${cat.name}"?`) && remove.mutate(cat.id)}>🗑</Btn>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={closeModal}
        title={editing ? `Uredi — ${editing.name}` : 'Dodaj podkategoriju'}>
        <div className="space-y-4">
          <Input label="Naziv *" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ikonica (emoji)</label>
              <input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                placeholder="npr. 🏍"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
            </div>
            <Input label="Redoslijed" type="number" value={form.sort_order}
              onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_active}
              onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" />
            Aktivna
          </label>
          <div className="flex gap-3 pt-2">
            <Btn onClick={() => save.mutate(form)} disabled={!form.name || save.isPending}>
              {save.isPending ? 'Čuvanje...' : editing ? 'Sačuvaj' : 'Dodaj'}
            </Btn>
            <Btn variant="secondary" onClick={closeModal}>Otkaži</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MOTO MARKE PANEL — string marke (ne FK) za moto/nautiku/transport
// ═══════════════════════════════════════════════════════════════

function StringMakesPanel({ filterType, title }) {
  const qc = useQueryClient();
  const qKey = ['filter-options', filterType, ''];

  const { data: options = [], isLoading } = useQuery({
    queryKey: qKey,
    queryFn: () => axios.get('/admin/filter-options', { params: { filter_type: filterType } }).then(r => r.data),
  });

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ label: '', value: '', sort_order: 0, is_active: true });

  const save = useMutation({
    mutationFn: (d) => editing
      ? axios.put(`/admin/filter-options/${editing.id}`, d)
      : axios.post('/admin/filter-options', { ...d, filter_type: filterType }),
    onSuccess: () => {
      toast.success(editing ? 'Ažurirano.' : 'Dodano.');
      qc.invalidateQueries({ queryKey: qKey });
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.'),
  });

  const remove = useMutation({
    mutationFn: (id) => axios.delete(`/admin/filter-options/${id}`),
    onSuccess: () => { toast.success('Obrisano.'); qc.invalidateQueries({ queryKey: qKey }); },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Greška.'),
  });

  const toggle = useMutation({
    mutationFn: ({ id, is_active, ...rest }) =>
      axios.put(`/admin/filter-options/${id}`, { ...rest, is_active: !is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qKey }),
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ label: '', value: '', sort_order: options.length, is_active: true });
    setModal(true);
  };
  const openEdit = (o) => {
    setEditing(o);
    setForm({ label: o.label, value: o.value, sort_order: o.sort_order, is_active: o.is_active });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-sm text-[#12142D]">{title}</h3>
          <Badge color="gray">{options.length}</Badge>
        </div>
        <Btn size="sm" onClick={openAdd}>+ Dodaj</Btn>
      </div>

      <div className="p-3 border-b border-gray-100">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Pretraži..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
      </div>

      {isLoading && <div className="p-4 text-center text-gray-400 text-sm">Učitavanje...</div>}

      <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50">
        {filtered.map(opt => (
          <div key={opt.id} className={`flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 ${!opt.is_active ? 'opacity-50' : ''}`}>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm text-[#12142D]">{opt.label}</span>
              {opt.value !== opt.label && (
                <span className="text-xs text-gray-400 ml-2 font-mono">{opt.value}</span>
              )}
            </div>
            <button onClick={() => toggle.mutate(opt)}
              className={`text-xs font-semibold px-2 py-0.5 rounded-full transition flex-shrink-0
                ${opt.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {opt.is_active ? '✓' : '✗'}
            </button>
            <div className="flex gap-1">
              <Btn size="xs" variant="secondary" onClick={() => openEdit(opt)}>✏️</Btn>
              <Btn size="xs" variant="danger"
                onClick={() => window.confirm('Obrisati?') && remove.mutate(opt.id)}>🗑</Btn>
            </div>
          </div>
        ))}
        {!isLoading && filtered.length === 0 && (
          <div className="p-4 text-center text-gray-400 text-sm">Nema rezultata.</div>
        )}
      </div>

      <Modal open={modal} onClose={closeModal}
        title={editing ? `Uredi — ${editing.label}` : `Dodaj u "${title}"`}>
        <div className="space-y-4">
          <Input label="Naziv *" value={form.label}
            onChange={e => setForm(p => ({ ...p, label: e.target.value }))} />
          <Input label="Vrijednost (slug)" value={form.value}
            onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
            placeholder="Ako prazan, koristi se naziv" />
          <Input label="Redoslijed" type="number" value={form.sort_order}
            onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_active}
              onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" />
            Aktivan
          </label>
          <div className="flex gap-3 pt-2">
            <Btn onClick={() => save.mutate({ ...form, value: form.value || form.label })}
              disabled={!form.label || save.isPending}>
              {save.isPending ? 'Čuvanje...' : editing ? 'Sačuvaj' : 'Dodaj'}
            </Btn>
            <Btn variant="secondary" onClick={closeModal}>Otkaži</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB SADRŽAJ — po kategoriji
// ═══════════════════════════════════════════════════════════════

function AutoTab() {
  return (
    <div className="space-y-6">
      {/* Marke & Modeli */}
      <div>
        <h2 className="font-black text-[#12142D] text-base mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#FF0026] rounded-full inline-block" />
          Marke & Modeli
        </h2>
        <MakesModelsPanel categorySlug="auto" />
      </div>

      {/* Filter vrijednosti */}
      <div>
        <h2 className="font-black text-[#12142D] text-base mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#FF0026] rounded-full inline-block" />
          Filter vrijednosti
        </h2>
        {AUTO_FILTER_SECTIONS.map(section => (
          <FilterSection key={section.key} section={section} category="auto" />
        ))}
      </div>
    </div>
  );
}

function MotociklTab() {
  return (
    <div className="space-y-6">
      {/* Podkategorije */}
      <div>
        <h2 className="font-black text-[#12142D] text-base mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#FF0026] rounded-full inline-block" />
          Podkategorije / Tipovi
        </h2>
        <SubcategoriesPanel parentCategorySlug="motocikl" />
      </div>

      {/* Moto marke */}
      <div>
        <h2 className="font-black text-[#12142D] text-base mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#FF0026] rounded-full inline-block" />
          Marke motocikala
        </h2>
        <StringMakesPanel filterType="moto_make" title="Marke motocikala" />
      </div>

      {/* Filter vrijednosti */}
      <div>
        <h2 className="font-black text-[#12142D] text-base mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#FF0026] rounded-full inline-block" />
          Filter vrijednosti
        </h2>
        {MOTO_FILTER_SECTIONS.map(section => (
          <FilterSection key={section.key} section={section} category="motocikl" />
        ))}
      </div>
    </div>
  );
}

function NautikaTab() {
  return (
    <div className="space-y-6">
      {/* Podkategorije plovila */}
      <div>
        <h2 className="font-black text-[#12142D] text-base mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#FF0026] rounded-full inline-block" />
          Podkategorije / Tipovi plovila
        </h2>
        <SubcategoriesPanel parentCategorySlug="nautika" />
      </div>

      {/* Marke plovila */}
      <div>
        <h2 className="font-black text-[#12142D] text-base mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#FF0026] rounded-full inline-block" />
          Marke plovila
        </h2>
        <StringMakesPanel filterType="boat_make" title="Marke plovila" />
      </div>

      {/* Filter vrijednosti */}
      <div>
        <h2 className="font-black text-[#12142D] text-base mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#FF0026] rounded-full inline-block" />
          Filter vrijednosti
        </h2>
        {NAUTIKA_FILTER_SECTIONS.map(section => (
          <FilterSection key={section.key} section={section} category="nautika" />
        ))}
      </div>
    </div>
  );
}

function TransportTab() {
  return (
    <div className="space-y-6">
      {/* Podkategorije */}
      <div>
        <h2 className="font-black text-[#12142D] text-base mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#FF0026] rounded-full inline-block" />
          Podkategorije transporta
        </h2>
        <SubcategoriesPanel parentCategorySlug="transport" />
      </div>

      {/* Marke */}
      <div>
        <h2 className="font-black text-[#12142D] text-base mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#FF0026] rounded-full inline-block" />
          Marke transportnih vozila
        </h2>
        <StringMakesPanel filterType="truck_make" title="Marke transportnih vozila" />
      </div>

      {/* Filter vrijednosti */}
      <div>
        <h2 className="font-black text-[#12142D] text-base mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-[#FF0026] rounded-full inline-block" />
          Filter vrijednosti
        </h2>
        {TRANSPORT_FILTER_SECTIONS.map(section => (
          <FilterSection key={section.key} section={section} category="transport" />
        ))}
      </div>
    </div>
  );
}

const TAB_COMPONENTS = {
  auto:      <AutoTab />,
  motocikl:  <MotociklTab />,
  nautika:   <NautikaTab />,
  transport: <TransportTab />,
};

// ═══════════════════════════════════════════════════════════════
// GLAVNI EXPORT
// ═══════════════════════════════════════════════════════════════

export default function AdminCatalog() {
  const [activeTab, setActiveTab] = useState('auto');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-black text-[#12142D]">Katalog & Filteri</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Upravljaj markama, modelima, podkategorijama i svim filter vrijednostima po kategoriji vozila
        </p>
      </div>

      {/* Tab navigacija */}
      <div className="flex gap-2 mb-6 bg-white rounded-2xl p-2 shadow-sm border border-gray-100 w-fit">
        {CATALOG_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition
              ${activeTab === tab.key
                ? 'bg-[#FF0026] text-white shadow-sm'
                : 'text-gray-500 hover:text-[#12142D] hover:bg-gray-50'
              }`}>
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Sadržaj taba */}
      <div key={activeTab}>
        {TAB_COMPONENTS[activeTab]}
      </div>
    </div>
  );
}