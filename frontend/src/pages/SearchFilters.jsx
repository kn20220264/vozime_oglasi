import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createPortal } from 'react-dom';
import axios from '../api/axios';
import { useMultipleFilterOptions } from '../hooks/useFilterOptions';
import { useMakesByCategory } from '../hooks/useMakes';
import useAuthStore from '../store/authStore';

// ─── Portal dropdown helper ───────────────────────────────────
function PortalDropdown({ anchorRef, open, children }) {
  const [style, setStyle] = useState({});
  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const update = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      setStyle({ position: 'fixed', top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
  }, [open, anchorRef]);
  if (!open) return null;
  return createPortal(
    <div style={style} className="bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">{children}</div>,
    document.body
  );
}

// ─── Konstante koje ostaju hardkodirane (numeričke / standardne) ──
const REGISTERED_UNTIL_OPTIONS = (() => {
  const opts = [];
  const months = ['Januar','Februar','Mart','April','Maj','Jun','Jul','Avgust','Septembar','Oktobar','Novembar','Decembar'];
  const now = new Date();
  const startYear = now.getFullYear();
  for (let y = startYear; y <= startYear + 1; y++) {
    for (let m = 0; m < 12; m++) {
      if (y === startYear && m < now.getMonth()) continue;
      opts.push({ label: `${months[m]} ${y}`, value: `${y}-${String(m+1).padStart(2,'0')}` });
    }
  }
  return opts;
})();

const YEARS         = Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => new Date().getFullYear() - i);
const PRICE_STEPS   = [500,1000,2000,3000,4000,5000,7500,10000,12500,15000,20000,25000,30000,40000,50000,75000,100000,150000,200000,300000,500000,900000];
const MILEAGE_STEPS = [5000,10000,20000,30000,50000,75000,100000,125000,150000,200000,250000,300000];
const WEIGHT_STEPS  = [400,500,600,700,800,900,1000,1200,1400,1600,1800,2000,2500,3000];
const POWER_KS      = [34,40,50,60,70,80,90,100,110,120,130,150,170,200,250,300,350,400,454];
const POWER_KW      = [25,30,37,44,51,59,66,74,81,88,96,110,125,147,184,221,258,294,335];
const CC_STEPS      = [1000,1200,1400,1600,1800,2000,2200,2400,2600,2800,3000,3500,4000,5000,6000,9000];
const SEATS         = [2,3,4,5,6,7,8,9,10];
const DOORS         = ['2/3','4/5','6/7'];
const OWNERS        = ['do 1','do 2','do 3','do 4'];
const EURO_NORMS    = ['Euro 3','Euro 4','Euro 5','Euro 6','Euro 7'];
const CONSUMPTION_OPTIONS = [
  {label:'do 3 l/100km',value:3},{label:'do 4 l/100km',value:4},{label:'do 5 l/100km',value:5},
  {label:'do 6 l/100km',value:6},{label:'do 7 l/100km',value:7},{label:'do 8 l/100km',value:8},
  {label:'do 9 l/100km',value:9},{label:'do 10 l/100km',value:10},{label:'do 12 l/100km',value:12},
  {label:'do 15 l/100km',value:15},{label:'preko 15 l/100km',value:16},
];
const VEHICLE_TYPES_AUTO = ['Cabrio/Roadster','SUV/Pickup/Offroad','Mali auto','Karavan','Limuzina/Sedan','Sportski/Kupe','Kombi/Minibus','Ostalo'];
const TRAILER_COUPLING   = ['Fiksna','Odvojna','Okretna'];
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
const CRUISE_CONTROL     = ['Tempomat','Adaptivni tempomat'];
const PARKING_SENSORS    = ['360 kamera','Kamera','Prednji','Zadnji','Zadnji traffic alert','Samo-upravljanje'];
const EXTERIOR_EXTRAS    = ['ABS','Zatamnjena stakla','Upozorenje na rastojanje','Adaptivni sasija','All season gume','Grijano vjetrobransko staklo','Hill-start assist','Bi-Xenon','Krovni nosac','Elektricna prtljaznica','Imobilajzer','ESP','LED farovi','LED dnevna svjetla','Senzor svjetla','Air suspension','Maglenke','Emergency brake assist','Panoramski krov','Rain sensor','Nadzor pritiska guma','Rezervna guma','Sunroof','Power steering','Start-stop sistem','Blind spot assist','Traction control','Prepoznavanje saobracajnih znakova','Xenon farovi','Centralno zakljucavanje'];
const INTERIOR_FEATURES  = ['Alarm sistem','Android Auto','Apple CarPlay','Grijani volan','Bluetooth','Elektricni prozori','Head-up display','Indukcijsko punjenje','Isofix','Navigacija','Grijana sjedista','Touchscreen','USB','Digitalni kokpit','WLAN/WiFi hotspot','Masazna sjedista','Ventilacija sjedista'];
const AIRBAGS_OPTIONS    = ['Vozacev airbag','Prednji airbagi','Prednji + Bocni','Prednji + Bocni + Vise'];
const AC_OPTIONS         = ['Klima','Auto klima','Auto klima 2-zone','Auto klima 3-zone','Auto klima 4-zone'];

const VEHICLE_TYPES_MOTO = ['Chopper / Cruiser','Dirt Bike','Enduro / Touring Enduro','Sidecar','Small / Lightweight','Moped / Mokick','Motocikl','Naked Bike','Pocket Bike','Quad/ATV','Rally / Cross','Racing','Roadster','Scooter / Roller','Sportbike / Superbike','Sport Tourer','Streetfighter','Super Moto','Tourer','Trike','Ostalo'];
const MOTO_SEAT_HEIGHTS  = [450,500,550,600,650,700,750,800,850,900,950];
const MOTO_CC            = [50,100,125,200,250,300,400,500,600,700,750,800,900,1000,1200,1500];
const MOTO_DRIVE         = ['Kardanski (Shaft)','Lancani (Chain)','Remenski (Belt)'];

const BOAT_TYPES         = ['Camac','Gliser','Jedrilica','Jahta','Katamaran','Gumenjak / RIB','Ostalo'];
const SKUTER_TYPES       = ['Sportski','Rekreativni'];
const BOAT_MAKES_BY_TYPE = {
  'Camac': ['Alumacraft','Bayliner','Boston Whaler','Lund','Ostalo'],
  'Gliser': ['Bayliner','Chaparral','Four Winns','Sea Ray','Sessa Marine','Ostalo'],
  'Jedrilica': ['Bavaria','Beneteau','Elan','Hanse','Jeanneau','Ostalo'],
  'Jahta': ['Azimut-Benetti','Ferretti','Galeon','Princess','Sunseeker','Ostalo'],
  'Katamaran': ['Bali','Fountaine Pajot','Lagoon','Leopard','Ostalo'],
  'Gumenjak / RIB': ['AB Inflatables','Highfield','Joker Boat','Navar','Ostalo'],
  'Sportski': ['Sea-Doo (BRP)','Yamaha','Kawasaki','Ostalo'],
  'Rekreativni': ['Sea-Doo (BRP)','Yamaha','Kawasaki','Ostalo'],
  'Ostalo': ['Ostalo'],
};
const ALL_BOAT_MAKES     = [...new Set(Object.values(BOAT_MAKES_BY_TYPE).flat())].sort();
const HULL_MATERIALS     = ['Fibreglas/Plastika','Aluminijum','Celik','Drvo','Guma/PVC','Ostalo'];
const ENGINE_TYPES       = ['Vanbrodski (Outboard)','Unutrasnji (Inboard)','I/O (Sterndrive)','Elektricni','Bez motora (jedra)'];
const BOAT_LENGTH        = ['do 5m','5-8m','8-12m','12-20m','20m+'];
const BOAT_HP            = [5,10,15,20,30,40,50,75,100,150,200,300,400,500,750];
const BOAT_HOURS         = [100,200,300,500,750,1000,1500,2000,3000];
const BOAT_EXTRAS        = ['GPS/Chartplotter','VHF Radio','Autopilot','Dubinomjer/Fishfinder','Radar','AIS','Hidraulicna sidra','Bow thruster','Bimini/Tenda','Platforma za kupanje','Solarni panel','Generator','Oprema za ribolov','Oprema za ronjenje','Soferka','Navigacijska svjetla'];

const TRUCK_CATEGORIES   = [{value:'kombi',label:'Kombi vozila'},{value:'kamion-do-7t',label:'Kamioni do 7.5t'},{value:'kamion-preko-7t',label:'Kamioni preko 7.5t'},{value:'prikolica',label:'Prikolice'},{value:'autobus',label:'Autobusi'},{value:'kamper',label:'Kamperi'}];
const TRUCK_MAKES_BY_KAT = {
  'kombi': ['Volkswagen','Mercedes-Benz','Renault','Ford','Fiat','Citroën','Opel','Peugeot','Iveco','Toyota','Kia','Nissan','Ostalo'],
  'kamion-do-7t': ['Mercedes-Benz','Iveco','Ford','Volkswagen','Renault','Fiat','MAN','DAF','Ostalo'],
  'kamion-preko-7t': ['Mercedes-Benz','Volvo','Scania','MAN','DAF','Iveco','Renault Trucks','Ostalo'],
  'prikolica': ['Schmitz Cargobull','Krone','Kögel','Stema','Gorica','Hoffmann','Ostalo'],
  'autobus': ['Mercedes-Benz','Setra','MAN','Iveco','Neoplan','Volvo','Scania','Solaris','Ostalo'],
  'kamper': ['Fendt','Hymer','Knaus','Bürstner','Dethleffs','Hobby','LMC','Carado','Volkswagen','Mercedes-Benz','Ostalo'],
};
const ALL_TRUCK_MAKES = [...new Set(Object.values(TRUCK_MAKES_BY_KAT).flat())].sort();

// ─── Helpers ─────────────────────────────────────────────────
function toggleArr(arr, val) { return arr.includes(val) ? arr.filter(v=>v!==val) : [...arr,val]; }

// Konvertuje filter_options niz u format za Chips/ColorSwatches
const toChips     = (opts = []) => opts.map(o => ({ value: o.value, label: o.label }));
const toSwatches  = (opts = []) => opts.map(o => ({ value: o.value, label: o.label, hex: o.metadata?.hex ?? '#e5e7eb' }));

// ─── Multi-select marka ───────────────────────────────────────
function MakeMultiSelect({ makes, selectedIds, onChange }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const selectedNames = makes.filter(m => selectedIds.includes(m.id)).map(m => m.name);
  const label = selectedNames.length === 0 ? 'Sve marke' : selectedNames.length === 1 ? selectedNames[0] : `${selectedNames.length} marke`;
  const toggle = (id) => onChange(selectedIds.includes(id) ? selectedIds.filter(x=>x!==id) : [...selectedIds,id]);
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">Marka</label>
      <div className="relative">
        <button ref={btnRef} onClick={()=>setOpen(p=>!p)}
          className={`border rounded-xl px-3 py-2.5 text-sm w-full text-left flex items-center justify-between transition ${selectedIds.length>0?'border-[#FF0026] bg-red-50 text-[#FF0026] font-semibold':'border-gray-200 bg-white text-gray-700'}`}>
          <span>{label}</span><span className="text-gray-400 ml-2">▾</span>
        </button>
        <PortalDropdown anchorRef={btnRef} open={open} onClose={()=>setOpen(false)}>
          {makes.map(m=>(
            <label key={m.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
              <input type="checkbox" checked={selectedIds.includes(m.id)} onChange={()=>toggle(m.id)} className="accent-[#FF0026]" />
              {m.name}
            </label>
          ))}
        </PortalDropdown>
      </div>
    </div>
  );
}

function ModelHierarchySelect({ series, selectedIds, onChange, label = 'Model' }) {
  const [open, setOpen] = useState(false);
  const [expandedSeries, setExpandedSeries] = useState({});
  const btnRef = useRef(null);
  const count = selectedIds.length;
  const btnLabel = count === 0 ? 'Svi modeli' : count === 1
    ? (() => { for (const s of series) { if (selectedIds.includes(s.id)) return s.name; const child = s.children?.find(c=>selectedIds.includes(c.id)); if (child) return child.name; } return `${count} modela`; })()
    : `${count} modela`;
  const toggle = (id) => onChange(selectedIds.includes(id)?selectedIds.filter(x=>x!==id):[...selectedIds,id]);
  const toggleSeries = (id) => setExpandedSeries(p=>({...p,[id]:!p[id]}));
  const byMake = {};
  series.forEach(s => { const n = s.make?.name||'Ostalo'; if(!byMake[n]) byMake[n]=[]; byMake[n].push(s); });
  const makeNames = Object.keys(byMake).sort((a, b) => a.localeCompare(b));
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {!series.length
        ? <div className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-400 bg-gray-50">Svi modeli</div>
        : <div className="relative">
            <button ref={btnRef} onClick={()=>setOpen(p=>!p)}
              className={`border rounded-xl px-3 py-2.5 text-sm w-full text-left flex items-center justify-between transition ${count>0?'border-[#FF0026] bg-red-50 text-[#FF0026] font-semibold':'border-gray-200 bg-white text-gray-700'}`}>
              <span>{btnLabel}</span><span className="text-gray-400 ml-2">▾</span>
            </button>
            <PortalDropdown anchorRef={btnRef} open={open} onClose={()=>setOpen(false)}>
              {makeNames.map(makeName=>(
                <div key={makeName}>
                  {makeNames.length>1 && <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 text-xs font-black text-[#12142D] uppercase tracking-wider sticky top-0">{makeName}</div>}
                  {byMake[makeName].map(s=>(
                    <div key={s.id}>
                      <div className="flex items-center gap-1 px-3 py-2 hover:bg-gray-50">
                        <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={()=>toggle(s.id)} className="accent-[#FF0026] flex-shrink-0" />
                        <span className="flex-1 text-sm font-semibold text-[#12142D] cursor-pointer" onClick={()=>toggle(s.id)}>{s.name}</span>
                        {s.children?.length>0 && <button onClick={e=>{e.stopPropagation();toggleSeries(s.id);}} className="text-gray-400 text-xs px-1 hover:text-[#FF0026] flex-shrink-0">{expandedSeries[s.id]?'▲':'▼'}</button>}
                      </div>
                      {expandedSeries[s.id] && s.children?.map(child=>(
                        <label key={child.id} className="flex items-center gap-2 pl-8 pr-3 py-1.5 hover:bg-gray-50 cursor-pointer text-xs text-gray-600">
                          <input type="checkbox" checked={selectedIds.includes(child.id)} onChange={()=>toggle(child.id)} className="accent-[#FF0026]" />{child.name}
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </PortalDropdown>
          </div>
      }
    </div>
  );
}

function MultiChipSelect({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const btnLabel = selected.length===0?'Sve':selected.length===1?selected[0]:`${selected.length} odabrano`;
  const toggle = (v) => onChange(selected.includes(v)?selected.filter(x=>x!==v):[...selected,v]);
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>}
      <div className="relative">
        <button ref={btnRef} onClick={()=>setOpen(p=>!p)}
          className={`border rounded-xl px-3 py-2.5 text-sm w-full text-left flex items-center justify-between transition ${selected.length>0?'border-[#FF0026] bg-red-50 text-[#FF0026] font-semibold':'border-gray-200 bg-white text-gray-700'}`}>
          <span className="truncate">{btnLabel}</span><span className="text-gray-400 ml-2 flex-shrink-0">▾</span>
        </button>
        <PortalDropdown anchorRef={btnRef} open={open} onClose={()=>setOpen(false)}>
          {options.map(opt=>(
            <label key={opt} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
              <input type="checkbox" checked={selected.includes(opt)} onChange={()=>toggle(opt)} className="accent-[#FF0026]" />{opt}
            </label>
          ))}
        </PortalDropdown>
      </div>
    </div>
  );
}

// mobile.de stil sekcija — bijela kartica, deblji naslov sa akcentom, tanka linija
function Section({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-3 shadow-sm overflow-hidden">
      <button onClick={()=>setOpen(p=>!p)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition border-b border-gray-100">
        <span className="flex items-center gap-2.5 font-black text-[#12142D] text-sm uppercase tracking-wide">
          <span className="w-1 h-4 bg-[#FF0026] rounded-full inline-block" />
          {title}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

function Sel({ label, value, onChange, options, placeholder='Bilo koji' }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
        <option value="">{placeholder}</option>
        {options.map(o=>typeof o==='object'?<option key={o.value} value={o.value}>{o.label}</option>:<option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function ComboInput({ value, onChange, placeholder, options, numericOnly=false }) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef(null);
  const pendingRef = useRef('');
  const getLabel = (val) => {
    if (!val) return '';
    const opt = options.find(o=>String(typeof o==='object'?o.value:o)===String(val));
    if (opt) return typeof opt==='object'?opt.label:String(opt).toLocaleString();
    return String(val);
  };
  const displayValue = focused ? input : getLabel(value);
  const filtered = input.length>0 ? options.filter(o=>{const lbl=typeof o==='object'?o.label:String(o);const v=typeof o==='object'?String(o.value):String(o);return lbl.toLowerCase().startsWith(input.toLowerCase())||v.startsWith(input);}) : options;
  const saveInput = (raw) => { const t=(raw??input).trim(); if(t&&!isNaN(t)){onChange(t);pendingRef.current='';} };
  const handleFocus = () => { setFocused(true); setInput(value?String(value):''); setOpen(true); };
  const handleChange = (e) => { let v=e.target.value; if(numericOnly) v=v.replace(/[^0-9]/g,''); setInput(v); pendingRef.current=v; setOpen(true); };
  const handleBlur = () => { saveInput(pendingRef.current); setTimeout(()=>{setFocused(false);setOpen(false);},100); };
  const handleSelect = (opt) => { const val=typeof opt==='object'?opt.value:opt; onChange(val); pendingRef.current=''; setInput(''); setOpen(false); setFocused(false); };
  const handleKeyDown = (e) => { if(e.key==='Enter'){saveInput(input);setOpen(false);setFocused(false);e.target.blur();} if(e.key==='Escape'){setOpen(false);e.target.blur();} };
  const handleClear = (e) => { e.stopPropagation(); onChange(''); setInput(''); pendingRef.current=''; };
  return (
    <div className="relative flex-1" ref={wrapRef}>
      <div className="relative">
        <input type="text" inputMode={numericOnly?'numeric':'text'} value={displayValue} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={placeholder}
          className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white pr-7 ${value?'border-[#FF0026]':'border-gray-200'}`} />
        {value ? <button onMouseDown={handleClear} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF0026] text-xs">✕</button>
               : <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">▾</span>}
      </div>
      <PortalDropdown anchorRef={wrapRef} open={open && filtered.length>0}>
        {filtered.slice(0,60).map(opt=>{
          const val=typeof opt==='object'?opt.value:opt;
          const lbl=typeof opt==='object'?opt.label:String(opt).toLocaleString();
          return <button key={val} onMouseDown={()=>handleSelect(opt)} className={`w-full text-left px-3 py-2 text-sm hover:bg-red-50 hover:text-[#FF0026] transition ${String(value)===String(val)?'bg-red-50 text-[#FF0026] font-semibold':'text-gray-700'}`}>{lbl}</button>;
        })}
      </PortalDropdown>
    </div>
  );
}

function ComboRange({ label, valueFrom, valueTo, onFrom, onTo, options, lockTo=false, numeric=true }) {
  const filteredToOptions = lockTo&&valueFrom ? options.filter(o=>{const v=typeof o==='object'?Number(o.value):Number(o);return v>=Number(valueFrom);}) : options;
  const handleFrom = (v) => { onFrom(v); if(valueTo&&v&&Number(valueTo)<Number(v)) onTo(v); };
  const handleTo = (v) => { if(valueFrom&&v&&Number(v)<Number(valueFrom)) return; onTo(v); };
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>}
      <div className="flex gap-2">
        <ComboInput value={valueFrom} onChange={handleFrom} placeholder="Od" options={options} numericOnly={numeric} />
        <ComboInput value={valueTo} onChange={handleTo} placeholder="Do" options={filteredToOptions} numericOnly={numeric} />
      </div>
    </div>
  );
}

function Chips({ options, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt=>{
        const val=typeof opt==='object'?opt.value:opt;
        const lbl=typeof opt==='object'?opt.label:opt;
        const active=Array.isArray(selected)?selected.includes(val):selected===val;
        return (
          <button key={val} onClick={()=>onToggle(val)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${active?'bg-[#FF0026] border-[#FF0026] text-white':'border-gray-200 text-gray-600 hover:border-[#FF0026] hover:text-[#FF0026]'}`}>
            {lbl}
          </button>
        );
      })}
    </div>
  );
}

function ColorSwatches({ colors, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map(c=>{
        const active=Array.isArray(selected)?selected.includes(c.value):selected===c.value;
        return (
          <button key={c.value} title={c.label} onClick={()=>onToggle(c.value)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${active?'border-[#FF0026] scale-110 shadow-md':'border-gray-200 hover:border-gray-400'}`}
            style={{backgroundColor:c.hex}} />
        );
      })}
    </div>
  );
}

function CheckGrid({ items, selected, onToggle, cols=3 }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-1.5`}>
      {items.map(item=>(
        <label key={item} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-[#FF0026] transition">
          <input type="checkbox" checked={selected.includes(item)} onChange={()=>onToggle(item)} className="accent-[#FF0026]" />{item}
        </label>
      ))}
    </div>
  );
}

function PowerSelector({ powerUnit, setPowerUnit, powerFrom, powerTo, onFrom, onTo }) {
  const options = (powerUnit==='ks'?POWER_KS:POWER_KW).map(o=>({value:o,label:`${o} ${powerUnit==='ks'?'KS':'kW'}`}));
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-xs font-semibold text-gray-500">Snaga</label>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs">
          <button onClick={()=>setPowerUnit('ks')} className={`px-3 py-1 font-semibold transition ${powerUnit==='ks'?'bg-[#FF0026] text-white':'bg-white text-gray-500 hover:bg-gray-50'}`}>KS</button>
          <button onClick={()=>setPowerUnit('kw')} className={`px-3 py-1 font-semibold transition ${powerUnit==='kw'?'bg-[#FF0026] text-white':'bg-white text-gray-500 hover:bg-gray-50'}`}>kW</button>
        </div>
      </div>
      <div className="flex gap-2">
        <ComboInput value={powerFrom} onChange={v=>{onFrom(v);if(powerTo&&v&&Number(powerTo)<Number(v))onTo(v);}} placeholder="Od" options={options} />
        <ComboInput value={powerTo} onChange={onTo} placeholder="Do" options={options.filter(o=>!powerFrom||o.value>=Number(powerFrom))} />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
export default function SearchFilters() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'auto');
  const parseIds = (str) => str ? str.split(',').map(Number).filter(Boolean) : [];

  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [savedDropdownOpen, setSavedDropdownOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!savedDropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSavedDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [savedDropdownOpen]);

  const { data: savedSearches = [] } = useQuery({
    queryKey: ['saved-searches'],
    queryFn: () => axios.get('/saved-searches').then(r => r.data),
    enabled: !!token,
    staleTime: 0,
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => axios.post('/saved-searches', payload).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-searches']);
      setSaveModalOpen(false);
      setSaveName('');
      toast.success('Pretraga sačuvana!');
    },
    onError: () => toast.error('Greška pri čuvanju pretrage.'),
  });

  const deleteSavedMutation = useMutation({
    mutationFn: (id) => axios.delete(`/saved-searches/${id}`).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-searches']);
      toast.success('Pretraga obrisana.');
    },
    onError: () => toast.error('Greška pri brisanju.'),
  });

  const handleSaveSearch = () => {
    if (!saveName.trim()) return;
    const params = new URLSearchParams();
    params.set('tab', activeTab);
    const addAll = obj => Object.entries(obj).forEach(([k, v]) => {
      if (!v || (Array.isArray(v) && !v.length) || v === false) return;
      params.set(k, Array.isArray(v) ? v.join(',') : v);
    });
    if (activeTab === 'auto') addAll(auto);
    else if (activeTab === 'moto') addAll(moto);
    else if (activeTab === 'nautika') addAll(nautika);
    else addAll(truck);
    const filtersObj = {};
    params.forEach((v, k) => { filtersObj[k] = v; });
    saveMutation.mutate({ name: saveName.trim(), filters: filtersObj });
  };

  const applyLoadedSearch = (saved) => {
    setSavedDropdownOpen(false);
    navigate(`/search?${new URLSearchParams(saved.filters).toString()}`);
  };

  // ─── Filter opcije iz API-ja ──────────────────────────────
  const { data: autoFilters }     = useMultipleFilterOptions(['fuel_type','body_type','transmission','drive_type','condition','damage','emission_class','color_exterior','color_interior','seat_material'], 'auto');
  const { data: motoFilters }     = useMultipleFilterOptions(['fuel_type','body_type','transmission','drive_type','color_exterior'], 'motocikl');
  const { data: nautikaFilters }  = useMultipleFilterOptions(['fuel_type','color_exterior'], 'nautika');
  const { data: transportFilters }= useMultipleFilterOptions(['fuel_type','transmission','drive_type','color_exterior'], 'transport');

  // ─── State ───────────────────────────────────────────────
  const [auto, setAuto] = useState({
    make_ids:parseIds(searchParams.get('make_ids')), model_ids:parseIds(searchParams.get('model_ids')),
    variant:searchParams.get('variant')||'',
    vehicle_types:(searchParams.get('vehicle_types')||'').split(',').filter(Boolean),
    seats_from:searchParams.get('seats_from')||'', seats_to:searchParams.get('seats_to')||'', doors:searchParams.get('doors')||'',
    price_from:searchParams.get('price_from')||'', price_to:searchParams.get('price_to')||'',
    year_from:searchParams.get('year_from')||'', year_to:searchParams.get('year_to')||'',
    mileage_from:searchParams.get('mileage_from')||'', mileage_to:searchParams.get('mileage_to')||'',
    condition:searchParams.get('condition')||'', seller:searchParams.get('seller')||'', registered_until:'', owners:'', city_id:searchParams.get('city_id')||'',
    fuel_types:(searchParams.get('fuel_types')||'').split(',').filter(Boolean),
    power_from:searchParams.get('power_from')||'', power_to:searchParams.get('power_to')||'', power_unit:searchParams.get('power_unit')||'ks',
    cc_from:searchParams.get('cc_from')||'', cc_to:searchParams.get('cc_to')||'',
    cylinders_from:'', cylinders_to:'', weight_from:'', weight_to:'', drive_type:searchParams.get('drive_type')||'',
    transmissions:(searchParams.get('transmissions')||'').split(',').filter(Boolean), consumption_to:'', emission:searchParams.get('emission')||'',
    color_exterior:(searchParams.get('color_exterior')||'').split(',').filter(Boolean),
    trailer_coupling:searchParams.get('trailer_coupling')||'', trailer_assist:false,
    vehicle_history:(searchParams.get('vehicle_history')||'').split(',').filter(Boolean),
    parking_sensors:[], cruise_control:'', exterior_extras:[],
    color_interior:(searchParams.get('color_interior')||'').split(',').filter(Boolean),
    interior_material:(searchParams.get('interior_material')||'').split(',').filter(Boolean),
    airbags:'', ac:'', interior_features:[], damage:searchParams.get('damage')||'',
  });
  const setA = (k,v) => setAuto(p=>({...p,[k]:v}));

  const [moto, setMoto] = useState({
    moto_makes:(searchParams.get('moto_makes')||'').split(',').filter(Boolean),
    make_id:searchParams.get('make_id')||'', model:searchParams.get('model')||'',
    kategorije:(searchParams.get('kategorije')||'').split(',').filter(Boolean),
    condition:searchParams.get('condition')||'',
    price_from:searchParams.get('price_from')||'', price_to:searchParams.get('price_to')||'',
    year_from:searchParams.get('year_from')||'', year_to:searchParams.get('year_to')||'',
    mileage_from:searchParams.get('mileage_from')||'', mileage_to:searchParams.get('mileage_to')||'',
    seat_height_from:'', seat_height_to:'', city_id:searchParams.get('city_id')||'',
    fuel_types:[], drive_type:'', transmissions:[],
    power_from:searchParams.get('power_from')||'', power_to:searchParams.get('power_to')||'', power_unit:searchParams.get('power_unit')||'ks',
    cc_from:searchParams.get('cc_from')||'', cc_to:searchParams.get('cc_to')||'',
    cylinders_from:'', cylinders_to:'', weight_from:'', weight_to:'',
    color_exterior:(searchParams.get('color_exterior')||'').split(',').filter(Boolean),
    cruise_control:'', extras:[], maintenance:[], seller:'', owners:'', damage:'',
  });
  const setM = (k,v) => setMoto(p=>({...p,[k]:v}));

  const [nautika, setNautika] = useState({
    nautika_kat:searchParams.get('nautika_kat')||'Nautika (sve)',
    boat_types:searchParams.get('tip')&&searchParams.get('tip')!=='Svi tipovi'?[searchParams.get('tip')]:[],
    boat_makes:searchParams.get('make')?[searchParams.get('make')]:[],
    boat_type:searchParams.get('tip')||'', make:searchParams.get('make')||'',
    model:searchParams.get('model')||'', hull_material:searchParams.get('hull_material')||'', engine_type:searchParams.get('engine_type')||'',
    year_from:searchParams.get('year_from')||'', year_to:searchParams.get('year_to')||'',
    price_from:searchParams.get('price_from')||'', price_to:searchParams.get('price_to')||'',
    city_id:searchParams.get('city_id')||'',
    hp_from:searchParams.get('hp_from')||'', hp_to:searchParams.get('hp_to')||'', length:searchParams.get('length')||'', hours_from:'', hours_to:'',
    cabins:searchParams.get('cabins')||'', berths:searchParams.get('berths')||'', wc:'', kitchen:'', color:[], trailer:false,
    extras:(searchParams.get('extras')||'').split(',').filter(Boolean), seller:'', condition:searchParams.get('condition')||'',
  });
  const setN = (k,v) => setNautika(p=>({...p,[k]:v}));

  const [truck, setTruck] = useState({
    kategorije:(searchParams.get('truck_kats')||'').split(',').filter(Boolean),
    truck_makes:(searchParams.get('truck_makes')||'').split(',').filter(Boolean),
    kategorija:searchParams.get('kategorija')||'', tip:'', model:searchParams.get('model')||'',
    fuels:[], trans_types:[], drives:[], seats_list:[], fuel:'',
    year_from:searchParams.get('year_from')||'', year_to:searchParams.get('year_to')||'',
    km_from:'', km_to:searchParams.get('mileage_to')||'',
    price_from:searchParams.get('price_from')||'', price_to:searchParams.get('price_to')||'',
    city_id:searchParams.get('city_id')||'',
    hp_from:'', hp_to:'', power_unit:'ks', cc_from:'', cc_to:'', cc_class:'',
    trans:'', drive:'', payload_from:'', payload_to:'', total_mass:'', mass_from:'', mass_to:'',
    euro:'', axles:'', length:'', seats:'', seats_from:'', seats_to:'',
    berths_from:'', berths_to:'', sleeping:'', bed_types:[], sliding_door:'',
    equipment:[], extras:[], heating:[], condition:searchParams.get('condition')||'', seller:'',
  });
  const setT = (k,v) => setTruck(p=>({...p,[k]:v}));

  // ─── API data ─────────────────────────────────────────────
  const makes = useMakesByCategory('automobili');

  const { data: autoModelsData } = useQuery({
    queryKey:['models-multi', auto.make_ids],
    queryFn:()=>axios.get(`/makes/models-multi?make_ids=${auto.make_ids.join(',')}`).then(r=>r.data),
    enabled: auto.make_ids.length > 0,
  });
  const autoSeries = autoModelsData?.data ?? [];

  const { data: motoModelsData } = useQuery({
    queryKey:['models', moto.make_id],
    queryFn:()=>axios.get(`/makes/${moto.make_id}/models`).then(r=>r.data),
    enabled: !!moto.make_id,
  });
  const motoSeries = motoModelsData?.data ?? [];

  const { data: citiesData } = useQuery({ queryKey:['cities'], queryFn:()=>axios.get('/cities').then(r=>r.data.data ?? r.data), staleTime:Infinity });
  const cities = Array.isArray(citiesData) ? citiesData : [];

  // Živi broj rezultata (mobile.de stil) — samo auto tab, /ads/count podržava te filtere
  const countParams = {
    ...(auto.make_ids[0]  ? { make_id:  auto.make_ids[0] }  : {}),
    ...(auto.model_ids[0] ? { model_id: auto.model_ids[0] } : {}),
    ...(auto.city_id      ? { city_id:  auto.city_id }      : {}),
    ...(auto.price_from   ? { price_from: auto.price_from } : {}),
    ...(auto.price_to     ? { price_to:   auto.price_to }   : {}),
    ...(auto.year_from    ? { year_from:  auto.year_from }  : {}),
    ...(auto.year_to      ? { year_to:    auto.year_to }    : {}),
    ...(auto.mileage_to   ? { mileage_to: auto.mileage_to } : {}),
  };
  const { data: countData } = useQuery({
    queryKey: ['ads-count', countParams],
    queryFn: () => axios.get(`/ads/count?${new URLSearchParams(countParams).toString()}`).then(r=>r.data),
    enabled: activeTab === 'auto',
    keepPreviousData: true,
    staleTime: 10000,
  });
  const resultCount = activeTab === 'auto' ? countData?.count : null;

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('tab', activeTab);
    const addAll = obj => Object.entries(obj).forEach(([k,v]) => {
      if (!v || (Array.isArray(v)&&!v.length) || v===false) return;
      params.set(k, Array.isArray(v)?v.join(','):v);
    });
    if (activeTab==='auto') addAll(auto);
    else if (activeTab==='moto') addAll(moto);
    else if (activeTab==='nautika') addAll(nautika);
    else addAll(truck);
    navigate(`/search?${params.toString()}`);
  };

  const TABS = [{id:'auto',label:'🚗 Auto'},{id:'moto',label:'🏍 Motocikl'},{id:'nautika',label:'⛵ Nautika'},{id:'truck',label:'🚛 Transport'}];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#12142D] py-5 sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={()=>navigate(-1)} className="text-[#6674A3] hover:text-white transition text-sm">← Nazad</button>
            <h1 className="text-white font-black text-lg">Detaljna pretraga</h1>
          </div>
          <div className="flex items-center gap-2">
            {token && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setSavedDropdownOpen(p => !p)}
                  title="Sačuvane pretrage"
                  className={`bg-[#1B2B5A] hover:bg-[#243570] text-white px-3 py-2.5 rounded-xl text-sm transition flex items-center gap-1.5 relative ${savedDropdownOpen ? 'ring-2 ring-[#FFEA00]' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill={savedSearches.length > 0 ? '#FFEA00' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span className="hidden sm:inline text-xs font-semibold">Sačuvane</span>
                  {savedSearches.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FFEA00] text-[#12142D] text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                      {savedSearches.length}
                    </span>
                  )}
                </button>
                {savedDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-black text-[#12142D]">Sačuvane pretrage</span>
                      <span className="text-xs text-gray-400">{savedSearches.length} {savedSearches.length === 1 ? 'pretraga' : 'pretrage'}</span>
                    </div>
                    {savedSearches.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <div className="text-3xl mb-2">🔖</div>
                        <p className="text-sm text-gray-500">Nemate sačuvanih pretraga.</p>
                        <p className="text-xs text-gray-400 mt-1">Postavite filtere i kliknite "Sačuvaj pretragu".</p>
                      </div>
                    ) : (
                      <ul className="max-h-64 overflow-y-auto">
                        {savedSearches.map(s => (
                          <li key={s.id} className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 group border-b border-gray-50 last:border-0">
                            <button onClick={() => applyLoadedSearch(s)} className="flex-1 text-left">
                              <span className="text-sm font-semibold text-[#12142D] group-hover:text-[#FF0026] transition block truncate">{s.name}</span>
                              <span className="text-xs text-gray-400">{Object.keys(s.filters).length} {Object.keys(s.filters).length === 1 ? 'filter' : 'filtera'}</span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteSavedMutation.mutate(s.id); }}
                              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-[#FF0026] transition p-1 rounded-lg hover:bg-red-50"
                              title="Obriši"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
            <button onClick={handleSearch} className="bg-[#FF0026] hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition">
              {resultCount != null ? `Prikaži ${Number(resultCount).toLocaleString()}` : 'Pretraži'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal za čuvanje pretrage */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSaveModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-base font-black text-[#12142D] mb-1">Sačuvaj pretragu</h3>
            <p className="text-xs text-gray-500 mb-4">Dajte naziv ovoj pretrazi kako biste je lako pronašli.</p>
            <input
              type="text"
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveSearch()}
              placeholder="npr. Golf 2018-2022 do 10000€"
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveSearch}
                disabled={!saveName.trim() || saveMutation.isLoading}
                className="flex-1 bg-[#FF0026] hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
              >
                {saveMutation.isLoading ? 'Čuvanje...' : 'Sačuvaj'}
              </button>
              <button
                onClick={() => { setSaveModalOpen(false); setSaveName(''); }}
                className="px-4 py-2.5 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl text-sm transition"
              >
                Otkaži
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* mobile.de stil segmentirani tabovi */}
        <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 mb-6 shadow-sm flex-wrap">
          {TABS.map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm transition ${activeTab===tab.id?'bg-[#12142D] text-white shadow':'text-gray-500 hover:text-[#12142D]'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════ AUTO ══════════ */}
        {activeTab==='auto' && (
          <>
            <Section title="Osnovi podaci">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <MakeMultiSelect makes={makes} selectedIds={auto.make_ids} onChange={ids=>{setA('make_ids',ids);setA('model_ids',[]);}} />
                <ModelHierarchySelect series={autoSeries} selectedIds={auto.model_ids} onChange={ids=>setA('model_ids',ids)} />
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Varijanta</label>
                  <input type="text" placeholder='npr. "GTI"' value={auto.variant} onChange={e=>setA('variant',e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-500 mb-2">Tip vozila</label>
                <Chips options={VEHICLE_TYPES_AUTO} selected={auto.vehicle_types} onToggle={v=>setA('vehicle_types',toggleArr(auto.vehicle_types,v))} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <ComboRange numeric label="Broj sjedista" valueFrom={auto.seats_from} valueTo={auto.seats_to} onFrom={v=>setA('seats_from',v)} onTo={v=>setA('seats_to',v)} options={SEATS} />
                <Sel label="Broj vrata" value={auto.doors} onChange={v=>setA('doors',v)} options={DOORS} />
              </div>
            </Section>

            <Section title="Cijena / Godiste / Kilometraza">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ComboRange numeric label="Cijena (EUR)" valueFrom={auto.price_from} valueTo={auto.price_to} onFrom={v=>setA('price_from',v)} onTo={v=>setA('price_to',v)} options={PRICE_STEPS} />
                <ComboRange lockTo numeric label="Godiste" valueFrom={auto.year_from} valueTo={auto.year_to} onFrom={v=>setA('year_from',v)} onTo={v=>setA('year_to',v)} options={YEARS} />
                <ComboRange numeric label="Kilometraza (km)" valueFrom={auto.mileage_from} valueTo={auto.mileage_to} onFrom={v=>setA('mileage_from',v)} onTo={v=>setA('mileage_to',v)} options={MILEAGE_STEPS} />
              </div>
            </Section>

            <Section title="Stanje / Prodavac">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Stanje</label>
                  <Chips options={toChips(autoFilters?.condition)} selected={[auto.condition]} onToggle={v=>setA('condition',auto.condition===v?'':v)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Prodavac</label>
                  <div className="flex gap-2">
                    {['Bilo koji','Auto plac','Privatni'].map(s=>(
                      <button key={s} onClick={()=>setA('seller',auto.seller===s?'':s)}
                        className={`flex-1 text-xs py-2 rounded-lg border font-medium transition ${auto.seller===s?'bg-[#12142D] border-[#12142D] text-white':'border-gray-200 text-gray-600 hover:border-[#12142D]'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <Sel label="Broj vlasnika" value={auto.owners} onChange={v=>setA('owners',v)} options={OWNERS} />
                <Sel label="Grad" value={auto.city_id} onChange={v=>setA('city_id',v)} options={cities.map(c=>({value:c.id,label:c.name}))} placeholder="Svi gradovi" />
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Registrovan do</label>
                  <select value={auto.registered_until} onChange={e=>setA('registered_until',e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white">
                    <option value="">Bilo kada</option>
                    {REGISTERED_UNTIL_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </Section>

            <Section title="Tehnicki podaci">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Gorivo</label>
                  <Chips options={toChips(autoFilters?.fuel_type)} selected={auto.fuel_types} onToggle={v=>setA('fuel_types',toggleArr(auto.fuel_types,v))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <PowerSelector powerUnit={auto.power_unit} setPowerUnit={v=>setA('power_unit',v)} powerFrom={auto.power_from} powerTo={auto.power_to} onFrom={v=>setA('power_from',v)} onTo={v=>setA('power_to',v)} />
                  <ComboRange numeric label="Kubikaza (cm3)" valueFrom={auto.cc_from} valueTo={auto.cc_to} onFrom={v=>setA('cc_from',v)} onTo={v=>setA('cc_to',v)} options={CC_STEPS} />
                  <ComboRange numeric label="Cilindri" valueFrom={auto.cylinders_from} valueTo={auto.cylinders_to} onFrom={v=>setA('cylinders_from',v)} onTo={v=>setA('cylinders_to',v)} options={[3,4,5,6,8,10,12]} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ComboRange numeric label="Masa (kg)" valueFrom={auto.weight_from} valueTo={auto.weight_to} onFrom={v=>setA('weight_from',v)} onTo={v=>setA('weight_to',v)} options={WEIGHT_STEPS} />
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Pogon</label>
                    <Chips options={toChips(autoFilters?.drive_type)} selected={[auto.drive_type]} onToggle={v=>setA('drive_type',auto.drive_type===v?'':v)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Mjenjac</label>
                    <Chips options={toChips(autoFilters?.transmission)} selected={auto.transmissions} onToggle={v=>setA('transmissions',toggleArr(auto.transmissions,v))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Sel label="Potrosnja do (l/100km)" value={auto.consumption_to} onChange={v=>setA('consumption_to',v)} options={CONSUMPTION_OPTIONS} />
                  <Sel label="Euro norma" value={auto.emission} onChange={v=>setA('emission',v)} options={toChips(autoFilters?.emission_class)} />
                </div>
              </div>
            </Section>

            <Section title="Istorija vozila">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {VEHICLE_HISTORY_OPTIONS.map(({value,label})=>(
                  <label key={value} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition text-sm ${
                    auto.vehicle_history.includes(value) ? 'border-[#FF0026] bg-red-50 text-[#FF0026] font-semibold' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                    <input type="checkbox" className="w-4 h-4 accent-[#FF0026]"
                      checked={auto.vehicle_history.includes(value)}
                      onChange={()=>setA('vehicle_history',toggleArr(auto.vehicle_history,value))} />
                    {label}
                  </label>
                ))}
              </div>
            </Section>

            <Section title="Eksterijer">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Boja eksterijera</label>
                  <ColorSwatches colors={toSwatches(autoFilters?.color_exterior)} selected={auto.color_exterior} onToggle={v=>setA('color_exterior',toggleArr(auto.color_exterior,v))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Sel label="Kuka za prikolicu" value={auto.trailer_coupling} onChange={v=>setA('trailer_coupling',v)} options={TRAILER_COUPLING} />
                  <MultiChipSelect label="Senzori parkiranja" options={PARKING_SENSORS} selected={auto.parking_sensors} onChange={v=>setA('parking_sensors',v)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Karoserija</label>
                  <Chips options={toChips(autoFilters?.body_type)} selected={[auto.body_type??'']} onToggle={v=>setA('body_type',auto.body_type===v?'':v)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Tempomat</label>
                  <Chips options={CRUISE_CONTROL} selected={[auto.cruise_control]} onToggle={v=>setA('cruise_control',auto.cruise_control===v?'':v)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Eksterijerna oprema</label>
                  <CheckGrid items={EXTERIOR_EXTRAS} selected={auto.exterior_extras} onToggle={v=>setA('exterior_extras',toggleArr(auto.exterior_extras,v))} cols={3} />
                </div>
              </div>
            </Section>

            <Section title="Interijer">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Boja interijera</label>
                  <ColorSwatches colors={toSwatches(autoFilters?.color_interior)} selected={auto.color_interior} onToggle={v=>setA('color_interior',toggleArr(auto.color_interior,v))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Materijal sjedista</label>
                    <Chips options={toChips(autoFilters?.seat_material)} selected={auto.interior_material} onToggle={v=>setA('interior_material',toggleArr(auto.interior_material,v))} />
                  </div>
                  <Sel label="Airbagi" value={auto.airbags} onChange={v=>setA('airbags',v)} options={AIRBAGS_OPTIONS} />
                  <Sel label="Klimatizacija" value={auto.ac} onChange={v=>setA('ac',v)} options={AC_OPTIONS} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Interijerna oprema</label>
                  <CheckGrid items={INTERIOR_FEATURES} selected={auto.interior_features} onToggle={v=>setA('interior_features',toggleArr(auto.interior_features,v))} cols={3} />
                </div>
              </div>
            </Section>

            <Section title="Istorija vozila">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Ostecenje</label>
                  <Chips options={toChips(autoFilters?.damage)} selected={[auto.damage]} onToggle={v=>setA('damage',auto.damage===v?'':v)} />
                </div>
              </div>
            </Section>
          </>
        )}

        {/* ══════════ MOTO ══════════ */}
        {activeTab==='moto' && (
          <>
            <Section title="Osnovi podaci">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <MakeMultiSelect makes={makes} selectedIds={moto.moto_makes.map(Number).filter(Boolean)} onChange={ids=>setM('moto_makes',ids.map(String))} />
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Model</label>
                  <input type="text" value={moto.model} onChange={e=>setM('model',e.target.value)} placeholder="Slobodan unos"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-500 mb-2">Kategorija</label>
                <Chips options={toChips(motoFilters?.body_type ?? VEHICLE_TYPES_MOTO.map(v=>({value:v,label:v})))} selected={moto.kategorije} onToggle={v=>setM('kategorije',toggleArr(moto.kategorije,v))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 mt-4">Stanje</label>
                <div className="flex gap-2 max-w-xs">
                  {[{value:'',label:'Bilo koje'},{value:'novo',label:'Novo'},{value:'polovnjak',label:'Polovno'}].map(c=>(
                    <button key={c.value} onClick={()=>setM('condition',moto.condition===c.value?'':c.value)}
                      className={`flex-1 text-xs py-2 rounded-lg border font-medium transition ${moto.condition===c.value?'bg-[#FF0026] border-[#FF0026] text-white':'border-gray-200 text-gray-600 hover:border-[#FF0026]'}`}>{c.label}</button>
                  ))}
                </div>
              </div>
            </Section>

            <Section title="Cijena / Godiste / Kilometraza / Visina sjedista">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ComboRange numeric label="Cijena (EUR)" valueFrom={moto.price_from} valueTo={moto.price_to} onFrom={v=>setM('price_from',v)} onTo={v=>setM('price_to',v)} options={[500,1000,2000,3000,5000,7500,10000,15000,20000,30000,50000]} />
                <ComboRange lockTo numeric label="Godiste" valueFrom={moto.year_from} valueTo={moto.year_to} onFrom={v=>setM('year_from',v)} onTo={v=>setM('year_to',v)} options={YEARS} />
                <ComboRange numeric label="Kilometraza (km)" valueFrom={moto.mileage_from} valueTo={moto.mileage_to} onFrom={v=>setM('mileage_from',v)} onTo={v=>setM('mileage_to',v)} options={[1000,5000,10000,20000,30000,50000,75000,100000]} />
                <ComboRange numeric label="Visina sjedista (mm)" valueFrom={moto.seat_height_from} valueTo={moto.seat_height_to} onFrom={v=>setM('seat_height_from',v)} onTo={v=>setM('seat_height_to',v)} options={MOTO_SEAT_HEIGHTS} />
                <Sel label="Grad" value={moto.city_id} onChange={v=>setM('city_id',v)} options={cities.map(c=>({value:c.id,label:c.name}))} placeholder="Svi gradovi" />
              </div>
            </Section>

            <Section title="Tehnicki podaci">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Gorivo</label>
                  <Chips options={toChips(motoFilters?.fuel_type)} selected={moto.fuel_types} onToggle={v=>setM('fuel_types',toggleArr(moto.fuel_types,v))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Pogon</label>
                  <Chips options={MOTO_DRIVE} selected={[moto.drive_type]} onToggle={v=>setM('drive_type',moto.drive_type===v?'':v)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Mjenjac</label>
                  <Chips options={toChips(motoFilters?.transmission)} selected={moto.transmissions} onToggle={v=>setM('transmissions',toggleArr(moto.transmissions,v))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <PowerSelector powerUnit={moto.power_unit||'ks'} setPowerUnit={v=>setM('power_unit',v)} powerFrom={moto.power_from} powerTo={moto.power_to} onFrom={v=>setM('power_from',v)} onTo={v=>setM('power_to',v)} />
                  <ComboRange numeric label="Kubikaza (cm3)" valueFrom={moto.cc_from} valueTo={moto.cc_to} onFrom={v=>setM('cc_from',v)} onTo={v=>setM('cc_to',v)} options={MOTO_CC} />
                  <ComboRange numeric label="Cilindri" valueFrom={moto.cylinders_from} valueTo={moto.cylinders_to} onFrom={v=>setM('cylinders_from',v)} onTo={v=>setM('cylinders_to',v)} options={[1,2,3,4,5,6]} />
                </div>
                <ComboRange numeric label="Tezina (kg)" valueFrom={moto.weight_from} valueTo={moto.weight_to} onFrom={v=>setM('weight_from',v)} onTo={v=>setM('weight_to',v)} options={[50,75,100,125,150,175,200,250,300,350,400]} />
              </div>
            </Section>

            <Section title="Oprema">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Boja eksterijera</label>
                  <ColorSwatches colors={toSwatches(motoFilters?.color_exterior)} selected={moto.color_exterior} onToggle={v=>setM('color_exterior',toggleArr(moto.color_exterior,v))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Tempomat</label>
                  <Chips options={['Tempomat','Adaptivni tempomat']} selected={[moto.cruise_control]} onToggle={v=>setM('cruise_control',moto.cruise_control===v?'':v)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Extras</label>
                  <CheckGrid items={['ABS','Distance warning','ASR (traction control)','Hill-start assist','Bi-Xenon','Blipper/Quickshifter','Electric starter','Heated grips','Catalyst','Kickstarter','Panniers/Koffer','Cornering ABS','LED headlights','Navigation','Semi-active suspension','Crash guards','Blind spot assist','USB','Wheelie control','Xenon']}
                    selected={moto.extras||[]} onToggle={v=>setM('extras',toggleArr(moto.extras||[],v))} cols={3} />
                </div>
              </div>
            </Section>

            <Section title="Detalji ponude">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Prodavac</label>
                  <div className="flex gap-2">
                    {['Bilo koji','Dealer','Privatni'].map(s=>(
                      <button key={s} onClick={()=>setM('seller',moto.seller===s?'':s)}
                        className={`flex-1 text-xs py-2 rounded-lg border font-medium transition ${moto.seller===s?'bg-[#12142D] border-[#12142D] text-white':'border-gray-200 text-gray-600 hover:border-[#12142D]'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Odrzavanje</label>
                  <CheckGrid items={['Prvi vlasnik','Kupljen nov u CG','Servisna knjiga','Restauriran','Old timer','U garanciji','Garaziran','Tuning']}
                    selected={moto.maintenance||[]} onToggle={v=>setM('maintenance',toggleArr(moto.maintenance||[],v))} cols={1} />
                </div>
                <div>
                  <Sel label="Ostecena vozila" value={moto.damage} onChange={v=>setM('damage',v)} options={[{value:'hide',label:'Ne prikazuj'},{value:'only',label:'Samo ostecena'}]} />
                  <div className="mt-3">
                    <Sel label="Broj vlasnika" value={moto.owners} onChange={v=>setM('owners',v)} options={OWNERS} />
                  </div>
                </div>
              </div>
            </Section>
          </>
        )}

        {/* ══════════ NAUTIKA ══════════ */}
        {activeTab==='nautika' && (
          <>
            <Section title="Plovila - Osnovi podaci">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Kategorija</label>
                  <div className="flex gap-2 flex-wrap">
                    {['Nautika (sve)','Plovila','Vodeni skuter'].map(k=>(
                      <button key={k} onClick={()=>setN('nautika_kat',nautika.nautika_kat===k?'Nautika (sve)':k)}
                        className={`text-xs px-3 py-2 rounded-lg border font-medium transition ${nautika.nautika_kat===k?'bg-[#FF0026] border-[#FF0026] text-white':'border-gray-200 text-gray-600 hover:border-[#FF0026]'}`}>{k}</button>
                    ))}
                  </div>
                </div>
                <MultiChipSelect label={nautika.nautika_kat==='Vodeni skuter'?'Tip skutera':'Tip plovila'}
                  options={nautika.nautika_kat==='Vodeni skuter'?SKUTER_TYPES:BOAT_TYPES}
                  selected={nautika.boat_types} onChange={vals=>setN('boat_types',vals)} />
                <MultiChipSelect label="Marka"
                  options={nautika.boat_types.length>0?[...new Set(nautika.boat_types.flatMap(t=>BOAT_MAKES_BY_TYPE[t]??[]))].sort():ALL_BOAT_MAKES}
                  selected={nautika.boat_makes} onChange={vals=>setN('boat_makes',vals)} />
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Model</label>
                  <input type="text" value={nautika.model} onChange={e=>setN('model',e.target.value)} placeholder="Slobodan unos"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
                </div>
                <Sel label="Materijal trupa" value={nautika.hull_material} onChange={v=>setN('hull_material',v)} options={HULL_MATERIALS} />
                <Sel label="Vrsta motora" value={nautika.engine_type} onChange={v=>setN('engine_type',v)} options={ENGINE_TYPES} />
                <Sel label="Grad" value={nautika.city_id} onChange={v=>setN('city_id',v)} options={cities.map(c=>({value:c.id,label:c.name}))} placeholder="Svi gradovi" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <ComboRange lockTo numeric label="Godiste" valueFrom={nautika.year_from} valueTo={nautika.year_to} onFrom={v=>setN('year_from',v)} onTo={v=>setN('year_to',v)} options={YEARS} />
                <ComboRange numeric label="Cijena (EUR)" valueFrom={nautika.price_from} valueTo={nautika.price_to} onFrom={v=>setN('price_from',v)} onTo={v=>setN('price_to',v)} options={[500,1000,2000,5000,10000,20000,50000,100000,200000,500000]} />
              </div>
            </Section>

            <Section title="Tehnicki podaci">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ComboRange numeric label="Konjska snaga (KS)" valueFrom={nautika.hp_from} valueTo={nautika.hp_to} onFrom={v=>setN('hp_from',v)} onTo={v=>setN('hp_to',v)} options={BOAT_HP} />
                <Sel label="Duzina" value={nautika.length} onChange={v=>setN('length',v)} options={BOAT_LENGTH} />
                <ComboRange numeric label="Radni sati motora" valueFrom={nautika.hours_from} valueTo={nautika.hours_to} onFrom={v=>setN('hours_from',v)} onTo={v=>setN('hours_to',v)} options={BOAT_HOURS} />
              </div>
            </Section>

            <Section title="Smjestaj">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Sel label="Broj kabina" value={nautika.cabins} onChange={v=>setN('cabins',v)} options={[0,1,2,3,4].map(n=>({value:n,label:n===4?'4+':String(n)}))} />
                <Sel label="Broj lezaja" value={nautika.berths} onChange={v=>setN('berths',v)} options={[1,2,3,4,5,6,7,8].map(n=>({value:n,label:n===8?'8+':String(n)}))} />
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">WC / Kupatilo</label>
                  <div className="flex gap-1">
                    {['Sa WC','Bez WC'].map(o=>(
                      <button key={o} onClick={()=>setN('wc',nautika.wc===o?'':o)} className={`flex-1 text-xs py-2 rounded-lg border font-medium transition ${nautika.wc===o?'bg-[#1B2B5A] border-[#1B2B5A] text-white':'border-gray-200 text-gray-600'}`}>{o}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Kuhinja</label>
                  <div className="flex gap-1">
                    {['Sa kuhinjom','Bez kuhinje'].map(o=>(
                      <button key={o} onClick={()=>setN('kitchen',nautika.kitchen===o?'':o)} className={`flex-1 text-xs py-2 rounded-lg border font-medium transition ${nautika.kitchen===o?'bg-[#1B2B5A] border-[#1B2B5A] text-white':'border-gray-200 text-gray-600'}`}>{o}</button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Oprema i extras">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Boja trupa</label>
                  <ColorSwatches colors={toSwatches(nautikaFilters?.color_exterior)} selected={nautika.color} onToggle={v=>setN('color',toggleArr(nautika.color,v))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Extras</label>
                  <CheckGrid items={BOAT_EXTRAS} selected={nautika.extras} onToggle={v=>setN('extras',toggleArr(nautika.extras,v))} cols={3} />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={nautika.trailer} onChange={e=>setN('trailer',e.target.checked)} className="accent-[#FF0026]" />
                  <span className="text-sm text-gray-700 font-medium">Prikolica ukljucena</span>
                </label>
              </div>
            </Section>

            <Section title="Detalji ponude">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Prodavac</label>
                  <div className="flex gap-2">
                    {['Bilo koji','Dealer','Privatni'].map(s=>(
                      <button key={s} onClick={()=>setN('seller',nautika.seller===s?'':s)} className={`flex-1 text-xs py-2 rounded-lg border font-medium transition ${nautika.seller===s?'bg-[#12142D] border-[#12142D] text-white':'border-gray-200 text-gray-600 hover:border-[#12142D]'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Stanje</label>
                  <div className="flex gap-2">
                    {[{value:'',label:'Bilo koje'},{value:'novo',label:'Novo'},{value:'polovnjak',label:'Polovno'}].map(c=>(
                      <button key={c.value} onClick={()=>setN('condition',nautika.condition===c.value?'':c.value)} className={`flex-1 text-xs py-2 rounded-lg border font-medium transition ${nautika.condition===c.value?'bg-[#FF0026] border-[#FF0026] text-white':'border-gray-200 text-gray-600 hover:border-[#FF0026]'}`}>{c.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>
          </>
        )}

        {/* ══════════ TRANSPORT ══════════ */}
        {activeTab==='truck' && (
          <>
            <Section title="Transport - Osnovi podaci">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Kategorija</label>
                  <Chips options={TRUCK_CATEGORIES} selected={truck.kategorije} onToggle={v=>setT('kategorije',toggleArr(truck.kategorije,v))} />
                </div>
                {truck.kategorije.length===1 && (()=>{
                  const tipMap = {
                    'kombi': ['Zatvoreni','Otvoreni','Rashladni','Kombi s podom','Ostalo'],
                    'kamion-do-7t': ['Sanduk','Kiper','Hladnjaca','Cisterna','Platforma','Ostalo'],
                    'kamion-preko-7t': ['Sanduk metalni','Kiper','Hladnjaca','Cisterna','Platforma','Seper/Tegljac','Betonska pumpa','Ostalo'],
                    'prikolica': ['Standardne','Lake auto prikolice','Kiperi','Hladnjace','Kontejneri','Za prevoz radnih masina','Poluprikolice','Ostalo'],
                    'autobus': ['Gradski autobus','Turisticki autobus','Minibus (do 22 mjesta)','Skolski autobus','Zglobni autobus','Ostalo'],
                    'kamper': ['Kamper van','Integrisani','Polu-integrisani','Alkoven','Kamp kucica (karavan)','Ostalo'],
                  };
                  const tipovi = tipMap[truck.kategorije[0]];
                  return tipovi ? <Sel label="Tip" value={truck.tip} onChange={v=>setT('tip',v)} options={tipovi} /> : null;
                })()}
                <MultiChipSelect label="Marka"
                  options={truck.kategorije.length>0?[...new Set(truck.kategorije.flatMap(k=>TRUCK_MAKES_BY_KAT[k]??[]))].sort():ALL_TRUCK_MAKES}
                  selected={truck.truck_makes} onChange={vals=>setT('truck_makes',vals)} />
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Model</label>
                  <input type="text" value={truck.model} onChange={e=>setT('model',e.target.value)} placeholder="Slobodan unos"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]" />
                </div>
                {!truck.kategorije.includes('prikolica') && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Gorivo</label>
                    <Chips options={toChips(transportFilters?.fuel_type)} selected={truck.fuels||[]} onToggle={v=>setT('fuels',toggleArr(truck.fuels||[],v))} />
                  </div>
                )}
                <Sel label="Grad" value={truck.city_id} onChange={v=>setT('city_id',v)} options={cities.map(c=>({value:c.id,label:c.name}))} placeholder="Svi gradovi" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <ComboRange lockTo numeric label="Godiste" valueFrom={truck.year_from} valueTo={truck.year_to} onFrom={v=>setT('year_from',v)} onTo={v=>setT('year_to',v)} options={YEARS} />
                {!truck.kategorije.includes('prikolica') && (
                  <ComboRange numeric label="Kilometraza (km)" valueFrom={truck.km_from} valueTo={truck.km_to} onFrom={v=>setT('km_from',v)} onTo={v=>setT('km_to',v)} options={[10000,50000,100000,200000,300000,500000,750000,1000000]} />
                )}
                <ComboRange numeric label="Cijena (EUR)" valueFrom={truck.price_from} valueTo={truck.price_to} onFrom={v=>setT('price_from',v)} onTo={v=>setT('price_to',v)} options={PRICE_STEPS} />
              </div>
            </Section>

            {(truck.kategorije.length===0||truck.kategorije.includes('kombi')) && (
              <Section title="Tehnicki podaci — Kombi">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ComboRange numeric label="Kubikaza (cm3)" valueFrom={truck.cc_from} valueTo={truck.cc_to} onFrom={v=>setT('cc_from',v)} onTo={v=>setT('cc_to',v)} options={[1000,1500,2000,2500,3000,3500,4000,5000]} />
                  <PowerSelector powerUnit={truck.power_unit||'ks'} setPowerUnit={v=>setT('power_unit',v)} powerFrom={truck.hp_from} powerTo={truck.hp_to} onFrom={v=>setT('hp_from',v)} onTo={v=>setT('hp_to',v)} />
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Mjenjac</label>
                    <Chips options={toChips(transportFilters?.transmission)} selected={truck.trans_types||[]} onToggle={v=>setT('trans_types',toggleArr(truck.trans_types||[],v))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Pogon</label>
                    <Chips options={toChips(transportFilters?.drive_type)} selected={truck.drives||[]} onToggle={v=>setT('drives',toggleArr(truck.drives||[],v))} />
                  </div>
                  <ComboRange numeric label="Nosivost (kg)" valueFrom={truck.payload_from} valueTo={truck.payload_to} onFrom={v=>setT('payload_from',v)} onTo={v=>setT('payload_to',v)} options={[300,500,750,1000,1500,2000,3000,3500]} />
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Broj sjedista</label>
                    <Chips options={[2,3,4,5,6,7,8,9].map(String)} selected={(truck.seats_list||[]).map(String)} onToggle={v=>setT('seats_list',toggleArr(truck.seats_list||[],v))} />
                  </div>
                  <Sel label="Euro norma" value={truck.euro} onChange={v=>setT('euro',v)} options={EURO_NORMS} />
                </div>
              </Section>
            )}

            {(truck.kategorije.length===0||truck.kategorije.includes('kombi')) && (
              <Section title="Oprema — Kombi">
                <div className="space-y-4">
                  <CheckGrid items={['Klima','Navigacija','Kamera za voznju unazad','Pregradni zid','Kuka za prikolicu']}
                    selected={truck.equipment||[]} onToggle={v=>setT('equipment',toggleArr(truck.equipment||[],v))} cols={3} />
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Bocna klizna vrata</label>
                    <Chips options={['Desno','Lijevo','Obostrano']} selected={[truck.sliding_door]} onToggle={v=>setT('sliding_door',truck.sliding_door===v?'':v)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Extras</label>
                    <CheckGrid items={['ABS','ESP','Tempomat','Bluetooth','Senzori parkiranja','Grijanje sjedista','USB']}
                      selected={truck.extras||[]} onToggle={v=>setT('extras',toggleArr(truck.extras||[],v))} cols={3} />
                  </div>
                </div>
              </Section>
            )}

            {(truck.kategorije.length===0||truck.kategorije.includes('kamion-do-7t')) && (
              <Section title="Tehnicki podaci — Kamion do 7.5t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <PowerSelector powerUnit={truck.power_unit||'ks'} setPowerUnit={v=>setT('power_unit',v)} powerFrom={truck.hp_from} powerTo={truck.hp_to} onFrom={v=>setT('hp_from',v)} onTo={v=>setT('hp_to',v)} />
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Mjenjac</label>
                    <Chips options={['Manuelni','Automatik']} selected={truck.trans_types||[]} onToggle={v=>setT('trans_types',toggleArr(truck.trans_types||[],v))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Pogon</label>
                    <Chips options={['4x2','4x4','6x2','6x4']} selected={truck.drives||[]} onToggle={v=>setT('drives',toggleArr(truck.drives||[],v))} />
                  </div>
                  <Sel label="Ukupna masa (kg)" value={truck.total_mass} onChange={v=>setT('total_mass',v)} options={[2800,3500,5000,6000,7500].map(n=>({value:n,label:n.toLocaleString()+' kg'}))} />
                  <ComboRange numeric label="Nosivost (kg)" valueFrom={truck.payload_from} valueTo={truck.payload_to} onFrom={v=>setT('payload_from',v)} onTo={v=>setT('payload_to',v)} options={[500,1000,2000,3000,4000,5000,6000]} />
                  <Sel label="Euro norma" value={truck.euro} onChange={v=>setT('euro',v)} options={EURO_NORMS} />
                </div>
              </Section>
            )}

            {(truck.kategorije.length===0||truck.kategorije.includes('kamion-do-7t')) && (
              <Section title="Oprema — Kamion do 7.5t">
                <CheckGrid items={['Kuka za prikolicu','Hidraulicna rampa','Dizalica/Kran','Klima','Spavaonica u kabini','Dvostruka kabina']}
                  selected={truck.equipment||[]} onToggle={v=>setT('equipment',toggleArr(truck.equipment||[],v))} cols={3} />
              </Section>
            )}

            {(truck.kategorije.length===0||truck.kategorije.includes('kamion-preko-7t')) && (
              <Section title="Tehnicki podaci — Kamion preko 7.5t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Sel label="Kubikaza motora" value={truck.cc_class} onChange={v=>setT('cc_class',v)} options={['do 8l','8-10l','10-13l','13l+']} />
                  <PowerSelector powerUnit={truck.power_unit||'ks'} setPowerUnit={v=>setT('power_unit',v)} powerFrom={truck.hp_from} powerTo={truck.hp_to} onFrom={v=>setT('hp_from',v)} onTo={v=>setT('hp_to',v)} />
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Mjenjac</label>
                    <Chips options={['Manuelni','Automatik','Poluautomatik']} selected={truck.trans_types||[]} onToggle={v=>setT('trans_types',toggleArr(truck.trans_types||[],v))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Pogon</label>
                    <Chips options={['4x2','4x4','6x2','6x4','8x4']} selected={truck.drives||[]} onToggle={v=>setT('drives',toggleArr(truck.drives||[],v))} />
                  </div>
                  <Sel label="Ukupna masa (kg)" value={truck.total_mass} onChange={v=>setT('total_mass',v)} options={[7500,10000,15000,18000,24000,32000,40000,44000,60000].map(n=>({value:n,label:n.toLocaleString()+' kg'}))} />
                  <ComboRange numeric label="Nosivost (kg)" valueFrom={truck.payload_from} valueTo={truck.payload_to} onFrom={v=>setT('payload_from',v)} onTo={v=>setT('payload_to',v)} options={[1000,2000,5000,10000,15000,20000,25000,30000]} />
                  <Sel label="Euro norma" value={truck.euro} onChange={v=>setT('euro',v)} options={EURO_NORMS} />
                  <Sel label="Broj osovina" value={truck.axles} onChange={v=>setT('axles',v)} options={[2,3,4,5].map(n=>({value:n,label:n===5?'5+':String(n)}))} />
                </div>
              </Section>
            )}

            {(truck.kategorije.length===0||truck.kategorije.includes('kamion-preko-7t')) && (
              <Section title="Oprema — Kamion preko 7.5t">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Spavaonica</label>
                    <Chips options={['Bez spavaonice','Mala spavaonica','Velika spavaonica']} selected={[truck.sleeping]} onToggle={v=>setT('sleeping',truck.sleeping===v?'':v)} />
                  </div>
                  <CheckGrid items={['Retarder','Hidraulika','Kuka za poluprikolicu','Klima','Parkovna klima']}
                    selected={truck.equipment||[]} onToggle={v=>setT('equipment',toggleArr(truck.equipment||[],v))} cols={3} />
                </div>
              </Section>
            )}

            {(truck.kategorije.length===0||truck.kategorije.includes('prikolica')) && (
              <Section title="Tehnicki podaci — Prikolice">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ComboRange numeric label="Korisna nosivost (kg)" valueFrom={truck.payload_from} valueTo={truck.payload_to} onFrom={v=>setT('payload_from',v)} onTo={v=>setT('payload_to',v)} options={[500,1000,2000,5000,10000,15000,20000,30000]} />
                  <ComboRange numeric label="Ukupna masa (kg)" valueFrom={truck.mass_from} valueTo={truck.mass_to} onFrom={v=>setT('mass_from',v)} onTo={v=>setT('mass_to',v)} options={[500,1000,2000,5000,10000,20000,30000]} />
                  <Sel label="Duzina" value={truck.length} onChange={v=>setT('length',v)} options={['do 2m','2-5m','5-8m','8-13.6m','13.6m+']} />
                  <Sel label="Broj osovina" value={truck.axles} onChange={v=>setT('axles',v)} options={[1,2,3,4].map(n=>({value:n,label:n===4?'4+':String(n)}))} />
                </div>
              </Section>
            )}

            {(truck.kategorije.length===0||truck.kategorije.includes('prikolica')) && (
              <Section title="Oprema — Prikolice">
                <CheckGrid items={['Cerada/Plane','Hladnjacki agregat','Hidraulicni kiper','Rolo vrata']}
                  selected={truck.equipment||[]} onToggle={v=>setT('equipment',toggleArr(truck.equipment||[],v))} cols={2} />
              </Section>
            )}

            {(truck.kategorije.length===0||truck.kategorije.includes('autobus')) && (
              <Section title="Tehnicki podaci — Autobusi">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <PowerSelector powerUnit={truck.power_unit||'ks'} setPowerUnit={v=>setT('power_unit',v)} powerFrom={truck.hp_from} powerTo={truck.hp_to} onFrom={v=>setT('hp_from',v)} onTo={v=>setT('hp_to',v)} />
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Mjenjac</label>
                    <Chips options={['Manuelni','Automatik']} selected={truck.trans_types||[]} onToggle={v=>setT('trans_types',toggleArr(truck.trans_types||[],v))} />
                  </div>
                  <ComboRange numeric label="Broj sjedista" valueFrom={truck.seats_from} valueTo={truck.seats_to} onFrom={v=>setT('seats_from',v)} onTo={v=>setT('seats_to',v)} options={[8,12,16,20,25,30,40,50,60,70,80,90]} />
                  <Sel label="Euro norma" value={truck.euro} onChange={v=>setT('euro',v)} options={EURO_NORMS} />
                  <Sel label="Duzina" value={truck.length} onChange={v=>setT('length',v)} options={['6m','8m','10m','12m','15m','18m','24m']} />
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Pogon</label>
                    <Chips options={['4x2','6x2','6x4']} selected={truck.drives||[]} onToggle={v=>setT('drives',toggleArr(truck.drives||[],v))} />
                  </div>
                </div>
              </Section>
            )}

            {(truck.kategorije.length===0||truck.kategorije.includes('autobus')) && (
              <Section title="Oprema — Autobusi">
                <CheckGrid items={['Klima','Toalet','Wifi','USB punjaci','Prostor za prtljag ispod','Rampa za invalidska kolica','Monitori/Ekrani']}
                  selected={truck.equipment||[]} onToggle={v=>setT('equipment',toggleArr(truck.equipment||[],v))} cols={3} />
              </Section>
            )}

            {(truck.kategorije.length===0||truck.kategorije.includes('kamper')) && (
              <Section title="Tehnicki podaci — Kamperi">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <PowerSelector powerUnit={truck.power_unit||'ks'} setPowerUnit={v=>setT('power_unit',v)} powerFrom={truck.hp_from} powerTo={truck.hp_to} onFrom={v=>setT('hp_from',v)} onTo={v=>setT('hp_to',v)} />
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Mjenjac</label>
                    <Chips options={['Manuelni','Automatik']} selected={truck.trans_types||[]} onToggle={v=>setT('trans_types',toggleArr(truck.trans_types||[],v))} />
                  </div>
                  <Sel label="Duzina" value={truck.length} onChange={v=>setT('length',v)} options={['4m','5m','6m','7m','8m','10m','12m+']} />
                  <Sel label="Ukupna masa (kg)" value={truck.total_mass} onChange={v=>setT('total_mass',v)} options={[2000,2500,3000,3500,4000,5000,7000].map(n=>({value:n,label:n.toLocaleString()+' kg'}))} />
                </div>
              </Section>
            )}

            {(truck.kategorije.length===0||truck.kategorije.includes('kamper')) && (
              <Section title="Smjestaj — Kamperi">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ComboRange numeric label="Broj lezaja" valueFrom={truck.berths_from} valueTo={truck.berths_to} onFrom={v=>setT('berths_from',v)} onTo={v=>setT('berths_to',v)} options={[2,3,4,5,6,8]} />
                  <ComboRange numeric label="Broj sjedista" valueFrom={truck.seats_from} valueTo={truck.seats_to} onFrom={v=>setT('seats_from',v)} onTo={v=>setT('seats_to',v)} options={[2,3,4,5,6,9]} />
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Tip kreveta</label>
                    <CheckGrid items={['Fiksni krevet','Francuski krevet','Jednostruki kreveti','Na kat','Kreveta iz sjedista']}
                      selected={truck.bed_types||[]} onToggle={v=>setT('bed_types',toggleArr(truck.bed_types||[],v))} cols={2} />
                  </div>
                </div>
              </Section>
            )}

            {(truck.kategorije.length===0||truck.kategorije.includes('kamper')) && (
              <Section title="Oprema — Kamperi">
                <div className="space-y-3">
                  <CheckGrid items={['Klima','Solar panel','WC/Kupatilo','Satelitska antena','Tenda/Markiza','Hladnjak/Frizider']}
                    selected={truck.equipment||[]} onToggle={v=>setT('equipment',toggleArr(truck.equipment||[],v))} cols={3} />
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">Grijanje</label>
                    <Chips options={['Dizel grijanje','Gas grijanje','Elektricno grijanje']} selected={truck.heating||[]} onToggle={v=>setT('heating',toggleArr(truck.heating||[],v))} />
                  </div>
                </div>
              </Section>
            )}

            <Section title="Detalji ponude">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Stanje</label>
                  <div className="flex gap-2">
                    {[{value:'novo',label:'Novo'},{value:'polovnjak',label:'Polovno'}].map(s=>(
                      <button key={s.value} onClick={()=>setT('condition',truck.condition===s.value?'':s.value)}
                        className={`flex-1 text-xs py-2 rounded-lg border font-medium transition ${truck.condition===s.value?'bg-[#FF0026] border-[#FF0026] text-white':'border-gray-200 text-gray-600 hover:border-[#FF0026]'}`}>{s.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Prodavac</label>
                  <div className="flex gap-2">
                    {['Bilo koji','Dealer','Privatni'].map(s=>(
                      <button key={s} onClick={()=>setT('seller',truck.seller===s?'':s)}
                        className={`flex-1 text-xs py-2 rounded-lg border font-medium transition ${truck.seller===s?'bg-[#12142D] border-[#12142D] text-white':'border-gray-200 text-gray-600 hover:border-[#12142D]'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>
          </>
        )}

        {/* Submit */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4 -mx-4 mt-4">
          {token && (
            <button
              onClick={() => setSaveModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 mb-2 text-sm text-[#6674A3] hover:text-[#FF0026] hover:bg-red-50 rounded-xl transition font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Sačuvaj ovu pretragu
            </button>
          )}
          <button onClick={handleSearch} className="w-full bg-[#FF0026] hover:bg-red-700 text-white py-3.5 rounded-xl font-black text-base transition">
            {resultCount != null ? `Prikaži ${Number(resultCount).toLocaleString()} oglasa` : 'Pretraži oglase'}
          </button>
        </div>
      </div>
    </div>
  );
}