import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import axios from '../api/axios';
import AdCard from '../components/AdCard';
import Aurora from '../components/ui/Aurora';
import GlassIcons from '../components/GlassIcons';

// ─── Portal dropdown helper ───────────────────────────────────
function PortalDropdown({ anchorRef, open, onClose, children }) {
  const [style, setStyle] = useState({});

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const update = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      setStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, anchorRef]);

  if (!open) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div style={style} className="bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] max-h-64 overflow-y-auto">
        {children}
      </div>
    </>,
    document.body
  );
}

// ─── konstante ───────────────────────────────────────────────
const YEARS = Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => new Date().getFullYear() - i);

const MILEAGE_OPTIONS = [
  { label: 'Do 10.000 km',   value: 10000  },
  { label: 'Do 30.000 km',   value: 30000  },
  { label: 'Do 50.000 km',   value: 50000  },
  { label: 'Do 100.000 km',  value: 100000 },
  { label: 'Do 150.000 km',  value: 150000 },
  { label: 'Do 200.000 km',  value: 200000 },
  { label: 'Do 300.000 km',  value: 300000 },
  { label: 'Preko 300.000 km', value: 300001 },
];

const PRICE_OPTIONS = [
  { label: 'Do 2.000 €',   value: 2000  },
  { label: 'Do 5.000 €',   value: 5000  },
  { label: 'Do 10.000 €',  value: 10000 },
  { label: 'Do 20.000 €',  value: 20000 },
  { label: 'Do 30.000 €',  value: 30000 },
  { label: 'Do 50.000 €',  value: 50000 },
  { label: 'Do 90.000 €',  value: 90000 },
  { label: 'Preko 90.000 €', value: 90001 },
];

const MILEAGE_MOTO = [
  { label: 'Do 1.000 km',   value: 1000  },
  { label: 'Do 5.000 km',   value: 5000  },
  { label: 'Do 20.000 km',  value: 20000 },
  { label: 'Do 50.000 km',  value: 50000 },
  { label: 'Do 100.000 km', value: 100000},
];

const PRICE_NAUTIKA = [
  { label: 'Do 5.000 €',    value: 5000   },
  { label: 'Do 20.000 €',   value: 20000  },
  { label: 'Do 50.000 €',   value: 50000  },
  { label: 'Do 100.000 €',  value: 100000 },
  { label: 'Do 500.000 €',  value: 500000 },
  { label: 'Preko 500.000 €', value: 500001},
];

const PRICE_TRUCK = [
  { label: 'Do 5.000 €',     value: 5000    },
  { label: 'Do 20.000 €',    value: 20000   },
  { label: 'Do 50.000 €',    value: 50000   },
  { label: 'Do 100.000 €',   value: 100000  },
  { label: 'Do 500.000 €',   value: 500000  },
  { label: 'Do 1.500.000 €', value: 1500000 },
];

const MILEAGE_TRUCK = [
  { label: 'Do 50.000 km',    value: 50000   },
  { label: 'Do 100.000 km',   value: 100000  },
  { label: 'Do 200.000 km',   value: 200000  },
  { label: 'Do 500.000 km',   value: 500000  },
  { label: 'Do 1.000.000 km', value: 1000000 },
];

const NAUTIKA_KAT = ['Nautika (sve)', 'Plovila', 'Vodeni skuter'];
const PLOVILA_TIPOVI = ['Svi tipovi', 'Camac', 'Gliser', 'Jedrilica', 'Jahta', 'Katamaran', 'Gumenjak / RIB', 'Ostalo'];
const SKUTER_TIPOVI  = ['Svi tipovi', 'Sportski', 'Rekreativni'];

const NAUTIKA_MAKES_BY_TIP = {
  'Svi tipovi':      ['Beneteau','Bavaria','Jeanneau','Azimut-Benetti','Four Winns','Sessa Marine','Rinker','Maxum','Elan','Sea-Doo','Yamaha','Kawasaki','Ostalo'],
  'Camac':           ['Alumacraft','Boston Whaler','Bayliner','Lund','Princecraft','Tracker','Ostalo'],
  'Gliser':          ['Bayliner','Chaparral','Chris-Craft','Cobalt','Four Winns','Mastercraft','Rinker','Sea Ray','Sessa Marine','Ostalo'],
  'Jedrilica':       ['Bavaria','Beneteau','Catalina','Elan','Hanse','Hunter','Jeanneau','Lagoon','X-Yachts','Ostalo'],
  'Jahta':           ['Azimut-Benetti','Ferretti','Galeon','Jeanneau','Princess','Sanlorenzo','Sunseeker','Ostalo'],
  'Katamaran':       ['Bali','Fountaine Pajot','Lagoon','Leopard','Nautitech','Ostalo'],
  'Gumenjak / RIB':  ['AB Inflatables','Bombard','Highfield','Joker Boat','Navar','Ribeye','Zar','Ostalo'],
  'Ostalo':          ['Ostalo'],
  'Sportski':        ['Sea-Doo (BRP)','Yamaha','Kawasaki','Ostalo'],
  'Rekreativni':     ['Sea-Doo (BRP)','Yamaha','Kawasaki','Ostalo'],
};

const ALL_NAUTIKA_MAKES = [...new Set(Object.values(NAUTIKA_MAKES_BY_TIP).flat())].sort();

const MOTO_KAT = [
  'Chopper / Cruiser','Dirt Bike','Enduro / Touring Enduro','Sidecar',
  'Small / Lightweight','Moped / Mokick','Motocikl','Naked Bike','Pocket Bike',
  'Quad/ATV','Rally / Cross','Racing','Roadster','Scooter / Roller',
  'Sportbike / Superbike','Sport Tourer','Streetfighter','Super Moto',
  'Tourer','Trike','Ostalo',
];

const MOTO_MAKES_BY_CAT = {
  'Chopper / Cruiser':       ['Harley-Davidson','Indian','Honda','Yamaha','Kawasaki','Suzuki','BMW','Triumph','Ducati','Moto Guzzi','Royal Enfield','Victory'],
  'Dirt Bike':               ['KTM','Honda','Yamaha','Kawasaki','Suzuki','Husqvarna','Beta','Gas Gas','Sherco','TM Racing'],
  'Enduro / Touring Enduro': ['KTM','Husqvarna','Honda','Yamaha','BMW','Suzuki','Kawasaki','Beta','Gas Gas','Sherco'],
  'Sidecar':                 ['Ural','Honda','Yamaha','BMW','Zundapp'],
  'Small / Lightweight':     ['Honda','Yamaha','Kawasaki','Suzuki','Aprilia','Derbi','Peugeot','Rieju','Kymco'],
  'Moped / Mokick':          ['Honda','Yamaha','Peugeot','Kymco','Piaggio','Aprilia','Sym','Rieju','Derbi'],
  'Motocikl':                ['Honda','Yamaha','Kawasaki','Suzuki','BMW','Ducati','KTM','Triumph','Aprilia','MV Agusta'],
  'Naked Bike':              ['Ducati','KTM','Kawasaki','Yamaha','Honda','Suzuki','BMW','Aprilia','Triumph','Husqvarna'],
  'Pocket Bike':             ['Honda','Kawasaki','Yamaha','Blata','Minimoto'],
  'Quad/ATV':                ['Honda','Yamaha','Kawasaki','Suzuki','Can-Am','Polaris','Kymco','CF Moto','Linhai','Arctic Cat'],
  'Rally / Cross':           ['KTM','Honda','Yamaha','Husqvarna','Gas Gas','Beta','Sherco','TM Racing'],
  'Racing':                  ['Ducati','Honda','Yamaha','Kawasaki','Suzuki','Aprilia','BMW','KTM'],
  'Roadster':                ['Ducati','Triumph','BMW','Yamaha','Honda','KTM','Kawasaki','Suzuki','Aprilia'],
  'Scooter / Roller':        ['Honda','Yamaha','Piaggio','Vespa','Kymco','Sym','Aprilia','Peugeot','Suzuki','Burgman'],
  'Sportbike / Superbike':   ['Honda','Yamaha','Kawasaki','Suzuki','Ducati','Aprilia','BMW','KTM','MV Agusta','Triumph'],
  'Sport Tourer':            ['Honda','Yamaha','BMW','Kawasaki','Suzuki','Ducati','Aprilia','Triumph','Moto Guzzi'],
  'Streetfighter':           ['Ducati','Kawasaki','Yamaha','BMW','Honda','Aprilia','KTM','Triumph'],
  'Super Moto':              ['KTM','Husqvarna','Honda','Yamaha','Suzuki','Gas Gas','Beta','Aprilia'],
  'Tourer':                  ['BMW','Honda','Yamaha','Kawasaki','Suzuki','Harley-Davidson','Indian','Moto Guzzi','Triumph'],
  'Trike':                   ['Can-Am','Harley-Davidson','Honda','Yamaha','Boom Trikes'],
  'Ostalo':                  ['Honda','Yamaha','Kawasaki','Suzuki','BMW','KTM','Ducati','Triumph','Aprilia','Ostalo'],
};

const ALL_MOTO_MAKES = [...new Set(Object.values(MOTO_MAKES_BY_CAT).flat())].sort();

const TRUCK_KAT = [
  { label: 'Kombi vozila',      value: 'kombi'           },
  { label: 'Kamion do 7.5t',    value: 'kamion-do-7t'    },
  { label: 'Kamion preko 7.5t', value: 'kamion-preko-7t' },
  { label: 'Prikolica',         value: 'prikolica'       },
  { label: 'Autobus',           value: 'autobus'         },
  { label: 'Kamper',            value: 'kamper'          },
];

const TRUCK_MAKES_BY_KAT = {
  'kombi':           ['Volkswagen','Mercedes-Benz','Renault','Ford','Fiat','Citroën','Opel','Peugeot','Iveco','Toyota','Kia','Nissan','Ostalo'],
  'kamion-do-7t':    ['Mercedes-Benz','Iveco','Ford','Volkswagen','Renault','Fiat','MAN','DAF','Ostalo'],
  'kamion-preko-7t': ['Mercedes-Benz','Volvo','Scania','MAN','DAF','Iveco','Renault Trucks','Ostalo'],
  'prikolica':       ['Schmitz Cargobull','Krone','Kögel','Stema','Gorica','Hoffmann','Ostalo'],
  'autobus':         ['Mercedes-Benz','Setra','MAN','Iveco','Neoplan','Volvo','Scania','Solaris','Ostalo'],
  'kamper':          ['Fendt','Hymer','Knaus','Bürstner','Dethleffs','Hobby','LMC','Carado','Volkswagen','Mercedes-Benz','Ostalo'],
};

const ALL_TRUCK_MAKES = [...new Set(Object.values(TRUCK_MAKES_BY_KAT).flat())].sort();

const TABS = [
  { id: 'auto',    label: 'Auto',      icon: '🚗' },
  { id: 'moto',    label: 'Motocikl',  icon: '🏍' },
  { id: 'nautika', label: 'Nautika',   icon: '⛵' },
  { id: 'truck',   label: 'Transport', icon: '🚛' },
];

// ─── Select helper ────────────────────────────────────────────
function Sel({ value, onChange, placeholder, children, disabled }) {
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      className={`border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white w-full ${disabled ? 'text-gray-400 cursor-not-allowed bg-gray-50' : ''}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
}

// ─── ComboInput — unos s prijedlozima + custom broj ──────────
function ComboInput({ value, onChange, placeholder, options }) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef(null);
  const pendingValueRef = useRef('');

  const getLabel = (val) => {
    if (!val) return '';
    const opt = options.find(o => String(typeof o === 'object' ? o.value : o) === String(val));
    if (opt) return typeof opt === 'object' ? opt.label : String(opt).toLocaleString();
    return String(val);
  };

  const displayValue = focused ? input : getLabel(value);

  const filtered = input.length > 0
    ? options.filter(o => {
        const lbl = typeof o === 'object' ? o.label : String(o);
        const val = typeof o === 'object' ? String(o.value) : String(o);
        return lbl.toLowerCase().startsWith(input.toLowerCase()) || val.startsWith(input);
      })
    : options;

  const saveInput = (raw) => {
    const trimmed = (raw ?? input).trim();
    if (trimmed && !isNaN(trimmed)) {
      onChange(trimmed);
      pendingValueRef.current = '';
    }
  };

  const handleFocus = () => {
    setFocused(true);
    setInput(value ? String(value) : '');
    setOpen(true);
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    pendingValueRef.current = e.target.value;
    setOpen(true);
  };

  const handleBlur = () => {
    saveInput(pendingValueRef.current);
    setTimeout(() => { setFocused(false); setOpen(false); }, 100);
  };

  const handleSelect = (opt) => {
    const val = typeof opt === 'object' ? opt.value : opt;
    onChange(val);
    pendingValueRef.current = '';
    setInput(''); setOpen(false); setFocused(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveInput(input);
      setOpen(false); setFocused(false); e.target.blur();
    }
    if (e.key === 'Escape') { setOpen(false); e.target.blur(); }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setInput('');
    pendingValueRef.current = '';
  };

  return (
    <div className="relative w-full" ref={wrapRef}>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white pr-7
          ${value ? 'border-[#FF0026]' : 'border-gray-200'}`}
      />
      {value ? (
        <button onMouseDown={handleClear} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF0026] text-xs">✕</button>
      ) : (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">▾</span>
      )}
      <PortalDropdown anchorRef={wrapRef} open={open && filtered.length > 0} onClose={() => setOpen(false)}>
        {filtered.slice(0, 60).map(opt => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : String(opt).toLocaleString();
          return (
            <button key={val} onMouseDown={() => handleSelect(opt)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-red-50 hover:text-[#FF0026] transition
                ${String(value) === String(val) ? 'bg-red-50 text-[#FF0026] font-semibold' : 'text-gray-700'}`}>
              {lbl}
            </button>
          );
        })}
      </PortalDropdown>
    </div>
  );
}

// ─── Multi-select marka dropdown ─────────────────────────────
function MakeMultiSelect({ makes, selectedIds, onChange }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  const selectedNames = makes.filter(m => selectedIds.includes(m.id)).map(m => m.name);
  const label = selectedNames.length === 0 ? 'Marka' :
    selectedNames.length === 1 ? selectedNames[0] :
    `${selectedNames.length} marke`;

  const toggle = (id) => onChange(
    selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]
  );

  return (
    <div className="relative">
      <button ref={btnRef} onClick={() => setOpen(p => !p)}
        className={`border rounded-xl px-3 py-2.5 text-sm w-full text-left flex items-center justify-between transition
          ${selectedIds.length > 0 ? 'border-[#FF0026] bg-red-50 text-[#FF0026] font-semibold' : 'border-gray-200 bg-white text-gray-700'}`}
      >
        <span>{label}</span>
        <span className="text-gray-400 ml-2">▾</span>
      </button>
      <PortalDropdown anchorRef={btnRef} open={open} onClose={() => setOpen(false)}>
        {makes.map(m => (
          <label key={m.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
            <input type="checkbox" checked={selectedIds.includes(m.id)} onChange={() => toggle(m.id)} className="accent-[#FF0026]" />
            {m.name}
          </label>
        ))}
      </PortalDropdown>
    </div>
  );
}

// ─── Hijerarhijski model multi-select ────────────────────────
function ModelHierarchySelect({ series, selectedIds, onChange }) {
  const [open, setOpen] = useState(false);
  const [expandedSeries, setExpandedSeries] = useState({});
  const btnRef = useRef(null);

  const count = selectedIds.length;
  const label = count === 0 ? 'Model' : count === 1
    ? (() => {
        for (const s of series) {
          if (selectedIds.includes(s.id)) return s.name;
          const child = s.children?.find(c => selectedIds.includes(c.id));
          if (child) return child.name;
        }
        return `${count} modela`;
      })()
    : `${count} modela`;

  const toggle = (id) => onChange(
    selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]
  );
  const toggleSeries = (id) => setExpandedSeries(p => ({ ...p, [id]: !p[id] }));

  if (!series.length) {
    return (
      <div className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-400 bg-gray-50 w-full">
        Model
      </div>
    );
  }

  const byMake = {};
  series.forEach(s => {
    const makeName = s.make?.name || 'Ostalo';
    if (!byMake[makeName]) byMake[makeName] = [];
    byMake[makeName].push(s);
  });
  const makeNames = Object.keys(byMake);

  return (
    <div className="relative">
      <button ref={btnRef} onClick={() => setOpen(p => !p)}
        className={`border rounded-xl px-3 py-2.5 text-sm w-full text-left flex items-center justify-between transition
          ${count > 0 ? 'border-[#FF0026] bg-red-50 text-[#FF0026] font-semibold' : 'border-gray-200 bg-white text-gray-700'}`}
      >
        <span>{label}</span>
        <span className="text-gray-400 ml-2">▾</span>
      </button>

      <PortalDropdown anchorRef={btnRef} open={open} onClose={() => setOpen(false)}>
        {makeNames.map(makeName => (
          <div key={makeName}>
            {makeNames.length > 1 && (
              <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 text-xs font-black text-[#12142D] uppercase tracking-wider sticky top-0">
                {makeName}
              </div>
            )}
            {byMake[makeName].map(s => (
              <div key={s.id}>
                <div className="flex items-center gap-1 px-3 py-2 hover:bg-gray-50">
                  <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => toggle(s.id)} className="accent-[#FF0026] flex-shrink-0" />
                  <span className="flex-1 text-sm font-semibold text-[#12142D] cursor-pointer" onClick={() => toggle(s.id)}>
                    {s.name}
                  </span>
                  {s.children?.length > 0 && (
                    <button onClick={e => { e.stopPropagation(); toggleSeries(s.id); }}
                      className="text-gray-400 text-xs px-1 hover:text-[#FF0026] flex-shrink-0">
                      {expandedSeries[s.id] ? '▲' : '▼'}
                    </button>
                  )}
                </div>
                {expandedSeries[s.id] && s.children?.map(child => (
                  <label key={child.id} className="flex items-center gap-2 pl-8 pr-3 py-1.5 hover:bg-gray-50 cursor-pointer text-xs text-gray-600">
                    <input type="checkbox" checked={selectedIds.includes(child.id)} onChange={() => toggle(child.id)} className="accent-[#FF0026]" />
                    {child.name}
                  </label>
                ))}
              </div>
            ))}
          </div>
        ))}
      </PortalDropdown>
    </div>
  );
}

// ─── Moto kategorija multi-select ────────────────────────────
function MotoCatSelect({ selectedCats, onChange }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  const label = selectedCats.length === 0 ? 'Kategorija' :
    selectedCats.length === 1 ? selectedCats[0] :
    `${selectedCats.length} kategorije`;

  const toggle = (cat) => onChange(
    selectedCats.includes(cat) ? selectedCats.filter(c => c !== cat) : [...selectedCats, cat]
  );

  return (
    <div className="relative">
      <button ref={btnRef} onClick={() => setOpen(p => !p)}
        className={`border rounded-xl px-3 py-2.5 text-sm w-full text-left flex items-center justify-between transition
          ${selectedCats.length > 0 ? 'border-[#FF0026] bg-red-50 text-[#FF0026] font-semibold' : 'border-gray-200 bg-white text-gray-700'}`}>
        <span>{label}</span>
        <span className="text-gray-400 ml-2">▾</span>
      </button>
      <PortalDropdown anchorRef={btnRef} open={open} onClose={() => setOpen(false)}>
        {MOTO_KAT.map(cat => (
          <label key={cat} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
            <input type="checkbox" checked={selectedCats.includes(cat)} onChange={() => toggle(cat)} className="accent-[#FF0026]" />
            {cat}
          </label>
        ))}
      </PortalDropdown>
    </div>
  );
}

// ─── Moto marka multi-select (filtrirano po kategoriji) ───────
function MotoMakeSelect({ selectedCats, selectedMakes, onChange }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  const relevantMakes = selectedCats.length > 0
    ? [...new Set(selectedCats.flatMap(c => MOTO_MAKES_BY_CAT[c] ?? []))].sort()
    : ALL_MOTO_MAKES;

  const filteredSelected = selectedMakes.filter(m => relevantMakes.includes(m));

  const label = filteredSelected.length === 0 ? 'Marka' :
    filteredSelected.length === 1 ? filteredSelected[0] :
    `${filteredSelected.length} marke`;

  const toggle = (make) => {
    const current = filteredSelected;
    onChange(current.includes(make) ? current.filter(m => m !== make) : [...current, make]);
  };

  return (
    <div className="relative">
      <button ref={btnRef} onClick={() => setOpen(p => !p)}
        className={`border rounded-xl px-3 py-2.5 text-sm w-full text-left flex items-center justify-between transition
          ${filteredSelected.length > 0 ? 'border-[#FF0026] bg-red-50 text-[#FF0026] font-semibold' : 'border-gray-200 bg-white text-gray-700'}`}>
        <span>{label}</span>
        <span className="text-gray-400 ml-2">▾</span>
      </button>
      <PortalDropdown anchorRef={btnRef} open={open} onClose={() => setOpen(false)}>
        {selectedCats.length > 0 && (
          <div className="px-3 py-1.5 bg-gray-50 text-xs text-gray-400 border-b border-gray-100">
            Marke za odabrane kategorije
          </div>
        )}
        {relevantMakes.map(make => (
          <label key={make} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
            <input type="checkbox" checked={filteredSelected.includes(make)} onChange={() => toggle(make)} className="accent-[#FF0026]" />
            {make}
          </label>
        ))}
      </PortalDropdown>
    </div>
  );
}

// ─── Truck kategorija multi-select ───────────────────────────
function TruckKatSelect({ selectedKats, onChange }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  const label = selectedKats.length === 0 ? 'Kategorija' :
    selectedKats.length === 1 ? TRUCK_KAT.find(k=>k.value===selectedKats[0])?.label || selectedKats[0] :
    `${selectedKats.length} kategorije`;

  const toggle = (val) => onChange(
    selectedKats.includes(val) ? selectedKats.filter(v => v !== val) : [...selectedKats, val]
  );

  return (
    <div className="relative">
      <button ref={btnRef} onClick={() => setOpen(p => !p)}
        className={`border rounded-xl px-3 py-2.5 text-sm w-full text-left flex items-center justify-between transition
          ${selectedKats.length > 0 ? 'border-[#FF0026] bg-red-50 text-[#FF0026] font-semibold' : 'border-gray-200 bg-white text-gray-700'}`}>
        <span>{label}</span>
        <span className="text-gray-400 ml-2">▾</span>
      </button>
      <PortalDropdown anchorRef={btnRef} open={open} onClose={() => setOpen(false)}>
        {TRUCK_KAT.map(k => (
          <label key={k.value} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
            <input type="checkbox" checked={selectedKats.includes(k.value)} onChange={() => toggle(k.value)} className="accent-[#FF0026]" />
            {k.label}
          </label>
        ))}
      </PortalDropdown>
    </div>
  );
}

// ─── Truck marka multi-select ─────────────────────────────────
function TruckMakeSelect({ selectedKats, selectedMakes, onChange }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  const relevantMakes = selectedKats.length > 0
    ? [...new Set(selectedKats.flatMap(k => TRUCK_MAKES_BY_KAT[k] ?? []))].sort()
    : ALL_TRUCK_MAKES;

  const label = selectedMakes.length === 0 ? 'Marka' :
    selectedMakes.length === 1 ? selectedMakes[0] :
    `${selectedMakes.length} marke`;

  const toggle = (make) => onChange(
    selectedMakes.includes(make) ? selectedMakes.filter(m => m !== make) : [...selectedMakes, make]
  );

  return (
    <div className="relative">
      <button ref={btnRef} onClick={() => setOpen(p => !p)}
        className={`border rounded-xl px-3 py-2.5 text-sm w-full text-left flex items-center justify-between transition
          ${selectedMakes.length > 0 ? 'border-[#FF0026] bg-red-50 text-[#FF0026] font-semibold' : 'border-gray-200 bg-white text-gray-700'}`}>
        <span>{label}</span>
        <span className="text-gray-400 ml-2">▾</span>
      </button>
      <PortalDropdown anchorRef={btnRef} open={open} onClose={() => setOpen(false)}>
        {selectedKats.length > 0 && (
          <div className="px-3 py-1.5 bg-gray-50 text-xs text-gray-400 border-b border-gray-100">
            Marke za odabrane kategorije
          </div>
        )}
        {relevantMakes.map(make => (
          <label key={make} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
            <input type="checkbox" checked={selectedMakes.includes(make)} onChange={() => toggle(make)} className="accent-[#FF0026]" />
            {make}
          </label>
        ))}
      </PortalDropdown>
    </div>
  );
}

// ─── Search dugme ─────────────────────────────────────────────
function SearchBtn({ count, onSearch }) {
  return (
    <button
      onClick={onSearch}
      className="bg-[#FF0026] hover:bg-red-700 text-white rounded-xl px-4 py-2.5 font-bold text-sm transition flex items-center justify-center gap-2 w-full"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      {count} oglasa
    </button>
  );
}

// ═════════════════════════════════════════════════════════════
export default function Home() {
  const navigate = useNavigate();
  const dealersRef = useRef(null);
  const [activeTab, setActiveTab] = useState('auto');

  // Auto
  const [autoMakeIds, setAutoMakeIds]   = useState([]);
  const [autoModelIds, setAutoModelIds] = useState([]);
  const [autoF, setAutoF] = useState({ year_from: '', year_to: '', mileage_to: '', price_to: '', city_id: '' });

  // Moto
  const [motoCatIds, setMotoCatIds] = useState([]);
  const [motoMakeIds, setMotoMakeIds] = useState([]);
  const [motoF, setMotoF] = useState({ year_from: '', mileage_to: '', price_to: '', city_id: '' });

  // Nautika
  const [nautikaKat, setNautikaKat] = useState('Nautika (sve)');
  const [nautikaF, setNautikaF]     = useState({ tip: '', make: '', model: '', price_to: '', year_to: '', city_id: '' });

  // Truck
  const [truckKatIds, setTruckKatIds] = useState([]);
  const [truckMakeIds, setTruckMakeIds] = useState([]);
  const [truckF, setTruckF] = useState({ model: '', year_from: '', mileage_to: '', price_to: '', city_id: '' });

  // ─── API ─────────────────────────────────────────────────
  const { data: makesData } = useQuery({
    queryKey: ['makes'],
    queryFn: () => axios.get('/makes').then(r => r.data),
  });
  const makes = makesData?.data ?? [];

  const { data: multiModelsData } = useQuery({
    queryKey: ['models-multi', autoMakeIds],
    queryFn: () => axios.get(`/makes/models-multi?make_ids=${autoMakeIds.join(',')}`).then(r => r.data),
    enabled: autoMakeIds.length > 0,
  });
  const autoSeries = multiModelsData?.data ?? [];

  const { data: motoModelsData } = useQuery({
    queryKey: ['models', motoF.make_id],
    queryFn: () => axios.get(`/makes/${motoF.make_id}/models`).then(r => r.data),
    enabled: !!motoF.make_id,
  });
  const motoSeries = motoModelsData?.data ?? [];

  const { data: citiesData } = useQuery({
    queryKey: ['cities'],
    queryFn: () => axios.get('/cities').then(r => r.data),
  });
  const cities = citiesData?.data ?? [];

  // Count za dugme pretrage
  const activeFilters = activeTab === 'auto'
    ? { make_ids: autoMakeIds.join(','), model_ids: autoModelIds.join(','), ...autoF }
    : activeTab === 'moto' ? { kategorije: motoCatIds.join(','), moto_makes: motoMakeIds.join(','), ...motoF }
    : activeTab === 'nautika' ? nautikaF
    : { truck_kats: truckKatIds.join(','), truck_makes: truckMakeIds.join(','), ...truckF };

  const { data: countData } = useQuery({
    queryKey: ['ads-count', activeTab, activeFilters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(activeFilters).forEach(([k, v]) => v && params.set(k, v));
      return axios.get(`/ads/count?${params.toString()}`).then(r => r.data);
    },
    staleTime: 30000,
  });
  const adsCount = countData?.count ?? '...';

  // Ukupan broj oglasa za hero stats traku
  const { data: totalCountData } = useQuery({
    queryKey: ['total-ads-count'],
    queryFn: () => axios.get('/ads/count').then(r => r.data),
    staleTime: 60000,
  });
  const totalAdsCount = totalCountData?.count ?? null;

  // Featured
  const { data: featuredData } = useQuery({
    queryKey: ['featured-ads'],
    queryFn: () => axios.get('/ads/featured').then(r => r.data),
  });
  const featuredAds = featuredData?.data ?? [];

  // Popularne marke
  const { data: popularData } = useQuery({
    queryKey: ['popular-makes'],
    queryFn: () => axios.get('/makes/popular').then(r => r.data),
  });
  const popularMakes = popularData?.data ?? [];

  // Dileri
  const { data: dealersData } = useQuery({
    queryKey: ['dealers'],
    queryFn: () => axios.get('/dealers').then(r => r.data),
  });
  const dealers = dealersData?.data ?? [];

  // Najnoviji
  const { data: latestData } = useQuery({
    queryKey: ['latest-ads'],
    queryFn: () => axios.get('/ads?sort=created_at&dir=desc').then(r => r.data),
  });
  const latestAds = latestData?.data ?? [];

  // Prosječna cijena iz latest auto oglasa
  const avgPrice = latestAds.length > 0
    ? latestAds.filter(a => a.price > 0).reduce((sum, a, _, arr) => sum + a.price / arr.length, 0)
    : null;

  // ─── Search ──────────────────────────────────────────────
  const buildAutoParams = () => {
    const params = new URLSearchParams();
    params.set('tab', 'auto');
    if (autoMakeIds.length)  params.set('make_ids',  autoMakeIds.join(','));
    if (autoModelIds.length) params.set('model_ids', autoModelIds.join(','));
    Object.entries(autoF).forEach(([k, v]) => v && params.set(k, v));
    return params;
  };

  const handleSearch = () => {
    if (document.activeElement) document.activeElement.blur();
    setTimeout(() => {
      let params;
      if (activeTab === 'auto') {
        params = buildAutoParams();
      } else if (activeTab === 'moto') {
        params = new URLSearchParams();
        if (motoCatIds.length)  params.set('kategorije', motoCatIds.join(','));
        if (motoMakeIds.length) params.set('moto_makes', motoMakeIds.join(','));
        Object.entries(motoF).forEach(([k, v]) => v && params.set(k, v));
        params.set('tab', 'moto');
      } else if (activeTab === 'nautika') {
        params = new URLSearchParams();
        Object.entries(nautikaF).forEach(([k, v]) => v && params.set(k, v));
        if (nautikaKat !== 'Nautika (sve)') params.set('nautika_kat', nautikaKat);
        params.set('tab', 'nautika');
      } else {
        params = new URLSearchParams();
        if (truckKatIds.length)  params.set('truck_kats',  truckKatIds.join(','));
        if (truckMakeIds.length) params.set('truck_makes', truckMakeIds.join(','));
        Object.entries(truckF).forEach(([k, v]) => v && params.set(k, v));
        params.set('tab', 'truck');
      }
      navigate(`/search?${params.toString()}`);
    }, 50);
  };

  const handleReset = () => {
    if (activeTab === 'auto') { setAutoMakeIds([]); setAutoModelIds([]); setAutoF({ year_from: '', year_to: '', mileage_to: '', price_to: '', city_id: '' }); }
    else if (activeTab === 'moto') { setMotoCatIds([]); setMotoMakeIds([]); setMotoF({ year_from: '', mileage_to: '', price_to: '', city_id: '' }); }
    else if (activeTab === 'nautika') { setNautikaKat('Nautika (sve)'); setNautikaF({ tip: '', make: '', model: '', price_to: '', year_to: '', city_id: '' }); }
    else { setTruckKatIds([]); setTruckMakeIds([]); setTruckF({ model: '', year_from: '', mileage_to: '', price_to: '', city_id: '' }); }
  };

  const nautikaTipOpcije = nautikaKat === 'Plovila' ? PLOVILA_TIPOVI : nautikaKat === 'Vodeni skuter' ? SKUTER_TIPOVI : null;
  const tipDisabled = nautikaKat === 'Nautika (sve)' || !nautikaKat;

  // Dinamičan datum za hero (MM/YYYY)
  const heroDate = new Date().toLocaleDateString('sr-Latn', { month: '2-digit', year: 'numeric' })
    .replace('. ', '/').replace('.', '');

  return (
    <div className="min-h-screen bg-white">

      {/* ══ HERO ══ */}
<section className="relative overflow-hidden min-h-[600px]">

  {/* 1. Pozadinska slika — najdolje */}
  <div
    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80')" }}
  />

  {/* 2. Tamni overlay preko slike */}
  <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#12142D] via-[#12142D]/90 to-[#12142D]/60" />
  <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#12142D] via-transparent to-transparent" />

  {/* 3. Aurora animacija */}
  <div className="absolute inset-0 z-[2]" style={{ mixBlendMode: 'screen' }}>
    <Aurora
      colorStops={["#FF0026", "#1B2B5A", "#12142D"]}
      blend={0.6}
      amplitude={1.2}
      speed={0.8}
    />
  </div>

  {/* 4. Sadržaj */}
 <div className="relative z-[3] max-w-6xl mx-auto px-4 pt-24 pb-10">
          {/* Hero tekst — lijevo poravnat */}
          <div className="mb-8 max-w-2xl">
            {/* Meta linija */}
            <p className="text-[#FF0026] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-6 h-px bg-[#FF0026] inline-block" />
              CRNA GORA · {heroDate} · {totalAdsCount ? `${totalAdsCount.toLocaleString('sr-Latn')} OGLASA` : '— OGLASA'}
            </p>

            {/* Glavni naslov */}
            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.05] mb-5">
              Pronađi svoje<br />sljedeće vozilo.
            </h1>

            {/* Tagline */}
            <p className="text-2xl md:text-3xl font-black">
              <span className="text-[#FF0026] italic">Brzo.</span>{' '}
              <span className="text-[#6674A3]">Pošteno.</span>{' '}
              <span className="text-[#FFEA00]">Bez buke.</span>
            </p>

            {/* Podnaslov */}
            <p className="text-[#6674A3] mt-4 text-base max-w-lg leading-relaxed">
              Crnogorski marketplace za automobile, motocikle, plovila i transport.
              Jedna pretraga — hiljade oglasa.
            </p>
          </div>

          {/* ── Search box ── */}
<div className="max-w-5xl overflow-hidden rounded-2xl border border-white/20"
  style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>

  {/* Tabovi */}
  <div className="flex border-b border-white/15">
    {TABS.map(tab => (
      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
        className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition
          ${activeTab === tab.id ? 'bg-[#FF0026] text-white' : 'text-white/70 hover:bg-white/10'}`}>
        <span>{tab.icon}</span>
        <span className="hidden sm:inline">{tab.label}</span>
      </button>
    ))}
  </div>

  <div className="p-5">
    {/* ── AUTO ── */}
    {activeTab === 'auto' && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MakeMultiSelect makes={makes} selectedIds={autoMakeIds} onChange={ids => { setAutoMakeIds(ids); setAutoModelIds([]); }} />
        <ModelHierarchySelect series={autoSeries} selectedIds={autoModelIds} onChange={setAutoModelIds} />
        <ComboInput value={autoF.year_from} onChange={v => setAutoF(p => ({...p, year_from: v, year_to: p.year_to && v && Number(p.year_to) < Number(v) ? v : p.year_to}))} placeholder="Godiste od" options={YEARS.map(y => ({value: y, label: String(y)}))} />
        <ComboInput value={autoF.year_to} onChange={v => setAutoF(p => ({...p, year_to: v}))} placeholder="Godiste do" options={YEARS.filter(y => !autoF.year_from || y >= Number(autoF.year_from)).map(y => ({value: y, label: String(y)}))} />
        <ComboInput value={autoF.mileage_to} onChange={v => setAutoF(p => ({...p, mileage_to: v}))} placeholder="Kilometraza do" options={MILEAGE_OPTIONS} />
        <ComboInput value={autoF.price_to} onChange={v => setAutoF(p => ({...p, price_to: v}))} placeholder="Cijena do" options={PRICE_OPTIONS} />
        <Sel value={autoF.city_id} onChange={v => setAutoF(p => ({...p, city_id: v}))} placeholder="Grad">
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Sel>
        <SearchBtn count={adsCount} onSearch={handleSearch} />
      </div>
    )}

    {/* ── MOTO ── */}
    {activeTab === 'moto' && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MotoCatSelect selectedCats={motoCatIds} onChange={ids => { setMotoCatIds(ids); setMotoMakeIds([]); }} />
        <MotoMakeSelect selectedCats={motoCatIds} selectedMakes={motoMakeIds} onChange={setMotoMakeIds} />
        <ComboInput value={motoF.year_from} onChange={v => setMotoF(p=>({...p,year_from:v}))} placeholder="Godiste" options={YEARS.map(y=>({value:y,label:String(y)}))} />
        <ComboInput value={motoF.mileage_to} onChange={v => setMotoF(p=>({...p,mileage_to:v}))} placeholder="Kilometraza do" options={MILEAGE_MOTO} />
        <ComboInput value={motoF.price_to} onChange={v => setMotoF(p=>({...p,price_to:v}))} placeholder="Cijena do" options={PRICE_OPTIONS} />
        <Sel value={motoF.city_id} onChange={v => setMotoF(p=>({...p,city_id:v}))} placeholder="Grad">
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Sel>
        <div />
        <SearchBtn count={adsCount} onSearch={handleSearch} />
      </div>
    )}

    {/* ── NAUTIKA ── */}
    {activeTab === 'nautika' && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Sel value={nautikaKat} onChange={v => { setNautikaKat(v); setNautikaF(p=>({...p,tip:'',make:''})); }} placeholder="">
          {NAUTIKA_KAT.map(k => <option key={k} value={k}>{k}</option>)}
        </Sel>
        <Sel value={nautikaF.tip} onChange={v => setNautikaF(p=>({...p,tip:v,make:''}))} placeholder="Tip" disabled={tipDisabled}>
          {nautikaTipOpcije?.map(t => <option key={t} value={t}>{t}</option>)}
        </Sel>
        <Sel value={nautikaF.make} onChange={v => setNautikaF(p=>({...p,make:v}))} placeholder="Marka">
          {(nautikaF.tip && nautikaF.tip !== 'Svi tipovi'
            ? NAUTIKA_MAKES_BY_TIP[nautikaF.tip] ?? ALL_NAUTIKA_MAKES
            : ALL_NAUTIKA_MAKES
          ).map(m => <option key={m} value={m}>{m}</option>)}
        </Sel>
        <input type="text" value={nautikaF.model} onChange={e => setNautikaF(p=>({...p,model:e.target.value}))}
          placeholder="Model" className="border border-white/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] w-full bg-white/90" />
        <ComboInput value={nautikaF.price_to} onChange={v => setNautikaF(p=>({...p,price_to:v}))} placeholder="Cijena do" options={PRICE_NAUTIKA} />
        <ComboInput value={nautikaF.year_to} onChange={v => setNautikaF(p=>({...p,year_to:v}))} placeholder="Godiste do" options={YEARS.map(y=>({value:y,label:String(y)}))} />
        <Sel value={nautikaF.city_id} onChange={v => setNautikaF(p=>({...p,city_id:v}))} placeholder="Grad">
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Sel>
        <SearchBtn count={adsCount} onSearch={handleSearch} />
      </div>
    )}

    {/* ── TRUCK ── */}
    {activeTab === 'truck' && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <TruckKatSelect selectedKats={truckKatIds} onChange={ids => { setTruckKatIds(ids); setTruckMakeIds([]); }} />
        <TruckMakeSelect selectedKats={truckKatIds} selectedMakes={truckMakeIds} onChange={setTruckMakeIds} />
        <ComboInput value={truckF.year_from} onChange={v => setTruckF(p=>({...p,year_from:v}))} placeholder="Godiste od" options={YEARS.map(y=>({value:y,label:String(y)}))} />
        <ComboInput value={truckF.mileage_to} onChange={v => setTruckF(p=>({...p,mileage_to:v}))} placeholder="Kilometraza do" options={MILEAGE_TRUCK} />
        <ComboInput value={truckF.price_to} onChange={v => setTruckF(p=>({...p,price_to:v}))} placeholder="Cijena do" options={PRICE_TRUCK} />
        <Sel value={truckF.city_id} onChange={v => setTruckF(p=>({...p,city_id:v}))} placeholder="Grad">
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Sel>
        <div />
        <SearchBtn count={adsCount} onSearch={handleSearch} />
      </div>
    )}

          {/* Reset + Više filtera */}
      <div className="flex items-center gap-4 mt-3">
        <button onClick={handleReset} className="text-xs text-white/50 hover:text-white flex items-center gap-1 transition">
          🔄 Resetuj filtere
        </button>

        <button
          onClick={() => {
            if (document.activeElement) document.activeElement.blur();
            setTimeout(() => {
              const params = activeTab === 'auto' ? buildAutoParams() : new URLSearchParams();
              params.set('tab', activeTab);

              if (activeTab === 'moto') {
                if (motoCatIds.length) params.set('kategorije', motoCatIds.join(','));
                if (motoMakeIds.length) params.set('moto_makes', motoMakeIds.join(','));
                Object.entries(motoF).forEach(([k, v]) => v && params.set(k, v));
              } else if (activeTab === 'nautika') {
                Object.entries(nautikaF).forEach(([k, v]) => v && params.set(k, v));
                if (nautikaKat !== 'Nautika (sve)') params.set('nautika_kat', nautikaKat);
              } else if (activeTab === 'truck') {
                if (truckKatIds.length) params.set('truck_kats', truckKatIds.join(','));
                if (truckMakeIds.length) params.set('truck_makes', truckMakeIds.join(','));
                Object.entries(truckF).forEach(([k, v]) => v && params.set(k, v));
              }

              navigate(`/search/filters?${params.toString()}`);
            }, 50);
          }}
          className="text-xs text-white/70 hover:text-white flex items-center gap-1 font-semibold transition"
        >
          ⚙ Više filtera
        </button>
      </div>

    </div>   {/* p-5 */}
  </div>     {/* search box */}
</div>       {/* HERO content wrapper */}
</section>
    

      {/* ══ STATS TRAKA ══ */}
      <div className="bg-[#1B2B5A] border-b border-[#12142D]">
        <div className="max-w-6xl mx-auto px-4 py-5 grid grid-cols-3 divide-x divide-[#12142D]">
          {[
            {
              value: totalAdsCount != null ? totalAdsCount.toLocaleString('sr-Latn') : '—',
              label: 'AKTIVNIH OGLASA',
            },
            {
              value: dealers.length > 0 ? dealers.length.toLocaleString('sr-Latn') : '—',
              label: 'VERIFIKOVANIH TRGOVACA',
            },
            {
              value: avgPrice ? `€ ${Math.round(avgPrice).toLocaleString('sr-Latn')}` : '—',
              label: 'PROSJEČNA CIJENA',
            },
          ].map(s => (
            <div key={s.label} className="text-center px-4">
              <div className="text-2xl md:text-3xl font-black text-white">{s.value}</div>
              <div className="text-[#6674A3] text-xs font-bold tracking-widest mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ ISTAKNUTI ══ */}
      {featuredAds.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10">
  <div className="flex items-start justify-between mb-8">
    <div>
      <h2 className="text-2xl font-black text-[#12142D]">Istaknuti oglasi</h2>
      <div className="w-10 h-0.5 bg-[#FFEA00] mt-1.5 mb-1" />
      <p className="text-sm text-gray-400">Oglasi koji su danas u fokusu kupaca.</p>
    </div>
    <button
      onClick={() => navigate('/search?featured=1')}
      className="text-sm text-[#FF0026] hover:underline font-semibold whitespace-nowrap mt-1"
    >
      Svi istaknuti →
    </button>
  </div>
  <div className={`grid gap-4 ${featuredAds.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : featuredAds.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
    {featuredAds.slice(0, 30).map(ad => <AdCard key={ad.id} ad={ad} />)}
  </div>
</section>
      )}

     
{/* ══ PO TIPU ══ */}
<section className="bg-gray-50 py-12">
  <div className="max-w-6xl mx-auto px-4">
    <div className="mb-4">
      <h2 className="text-2xl font-black text-[#12142D]">Pretraži po tipu karoserije</h2>
      <div className="w-10 h-0.5 bg-[#FFEA00] mt-1.5 mb-1" />
      <p className="text-sm text-gray-400">Odaberi tip koji ti odgovara.</p>
    </div>
    <GlassIcons
      items={[
        { icon: <img src="/src/assets/body-types/suv.png"       alt="SUV"       />, color: 'navy',    label: 'SUV',       onClick: () => navigate('/search?body_type=suv')       },
        { icon: <img src="/src/assets/body-types/sedan.png"     alt="Sedan"     />, color: 'indigo',  label: 'Sedan',     onClick: () => navigate('/search?body_type=sedan')     },
        { icon: <img src="/src/assets/body-types/karavan.png"   alt="Karavan"   />, color: 'blue',    label: 'Karavan',   onClick: () => navigate('/search?body_type=karavan')   },
        { icon: <img src="/src/assets/body-types/kabriolet.png" alt="Kabriolet" />, color: 'crimson', label: 'Kabriolet', onClick: () => navigate('/search?body_type=kabriolet') },
        { icon: <img src="/src/assets/body-types/hatchback.png" alt="Hatchback" />, color: 'purple',  label: 'Hatchback', onClick: () => navigate('/search?body_type=hatchback') },
        { icon: <img src="/src/assets/body-types/kupe.png"      alt="Kupe"      />, color: 'red',     label: 'Kupe',      onClick: () => navigate('/search?body_type=kupe')      },
        { icon: <img src="/src/assets/body-types/van.png"       alt="Kombi"     />, color: 'orange',  label: 'Kombi',     onClick: () => navigate('/search?body_type=van')       },
        { icon: <img src="/src/assets/body-types/pickup.png"    alt="Pickup"    />, color: 'green',   label: 'Pickup',    onClick: () => navigate('/search?body_type=pickup')    },
      ]}
    />
  </div>
</section>

      {/* ══ POPULARNE MARKE ══ */}
      {popularMakes.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-7 bg-[#FFEA00] rounded-full" />
            <h2 className="text-xl font-black text-[#12142D]">Popularne marke</h2>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {popularMakes.map(make => (
              <button key={make.id} onClick={() => navigate(`/search?make_ids=${make.id}`)}
                className="bg-white border border-gray-100 hover:border-[#FF0026] hover:shadow-md rounded-2xl p-4 flex flex-col items-center gap-2 transition-all group">
                {make.logo ? (
                  <img src={`http://localhost:8000/storage/${make.logo}`} alt={make.name}
                    className="h-12 w-full object-contain"
                    onError={e => { e.target.style.display='none'; }} />
                ) : (
                  <div className="h-12 flex items-center justify-center">
                    <span className="text-2xl font-black text-[#12142D] group-hover:text-[#FF0026] transition-colors">
                      {make.name.substring(0,2).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-xs font-semibold text-gray-600 group-hover:text-[#FF0026] transition-colors">{make.name}</span>
                <span className="text-xs text-gray-400">{make.ads_count} oglasa</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ══ DILERI ══ */}
      {dealers.length > 0 && (
        <section className="bg-gray-50 py-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-7 bg-[#1B2B5A] rounded-full" />
              <h2 className="text-xl font-black text-[#12142D]">Autoplaci i dileri</h2>
            </div>
            <div ref={dealersRef} className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
              style={{scrollbarWidth:'none',msOverflowStyle:'none'}}>
              {dealers.map(dealer => (
                <button key={dealer.id} onClick={() => navigate(`/users/${dealer.id}`)}
                  className="flex-shrink-0 snap-start w-44 bg-white border border-gray-100 hover:border-[#1B2B5A] hover:shadow-md rounded-2xl p-4 flex flex-col items-center gap-2 transition-all relative">
                  {dealer.featured && (
                    <span className="absolute top-2 right-2 bg-[#FFEA00] text-[#12142D] text-xs font-bold px-1.5 py-0.5 rounded">★</span>
                  )}
                  {dealer.logo ? (
                    <img src={dealer.logo} alt={dealer.company_name} className="h-14 w-full object-contain"
                      onError={e => { e.target.style.display='none'; }} />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-[#12142D] flex items-center justify-center">
                      <span className="text-white font-black text-lg">{dealer.company_name?.substring(0,1)}</span>
                    </div>
                  )}
                  <span className="text-xs font-bold text-[#12142D] text-center line-clamp-2">{dealer.company_name}</span>
                  <span className="text-xs text-gray-400">{dealer.ads_count} oglasa</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ NAJNOVIJI OGLASI ══ */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 bg-[#FF0026] rounded-full" />
            <h2 className="text-xl font-black text-[#12142D]">Najnoviji oglasi</h2>
          </div>
          <button onClick={() => navigate('/search')} className="text-sm text-[#FF0026] hover:underline font-semibold">Svi oglasi →</button>
        </div>
        {latestAds.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestAds.slice(0,12).map(ad => <AdCard key={ad.id} ad={ad} />)}
            </div>
            <div className="text-center mt-8">
              <button onClick={() => navigate('/search')}
                className="bg-[#FF0026] hover:bg-red-700 text-white px-10 py-3 rounded-xl font-bold transition">
                Pogledaj sve oglase →
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-gray-400"><p className="text-lg">Nema aktivnih oglasa.</p></div>
        )}
      </section>

      {/* ══ ZASTO VOZIME ══ */}
      <section className="bg-[#12142D] py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-white mb-2">Zašto VozimeOglasi?</h2>
          <p className="text-[#6674A3] mb-8">Najpouzdaniji oglasnik vozila u Crnoj Gori</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {icon:'🔒',title:'Sigurno',desc:'Verifikovani prodavci i zaštita od prevare'},
              {icon:'⚡',title:'Brzo',desc:'Objavi oglas za manje od 5 minuta'},
              {icon:'🎯',title:'Precizno',desc:'Napredni filteri za brže pronalaženje'},
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

      {/* ══ CTA ══ */}
      <section className="bg-[#FF0026] py-10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Prodaješ vozilo?</h2>
          <p className="text-red-100 mb-6">Objavi oglas besplatno i dođi do kupca za kratko vrijeme</p>
          <button onClick={() => navigate('/ads/create')}
            className="bg-[#FFEA00] hover:bg-yellow-300 text-[#12142D] font-black px-10 py-3.5 rounded-xl text-lg transition shadow-lg">
            + Objavi oglas besplatno
          </button>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      {/* ══ FOOTER ══ */}
      <footer className="bg-[#12142D] border-t border-[#1B2B5A] py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
             <img src="/images/bijeli.png" alt="VozimeOglasi" className="h-24 w-auto" />
            </div>
            <p className="text-[#6674A3] text-xs text-center">© {new Date().getFullYear()} VozimeOglasi – Oglasnik vozila za Crnu Goru</p>
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