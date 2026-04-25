import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import axios from "../api/axios";
import AdCard from "../components/AdCard";
import Aurora from "../components/ui/Aurora";
import GlassIcons from "../components/GlassIcons";
import BorderGlow from "../components/BorderGlow";
import SplitText from "../components/SplitText";
import AISearchBar from "../components/AISearchBar";
import RecentlyViewed from '../components/RecentlyViewed';

// ─── Portal dropdown helper ───────────────────────────────────
function PortalDropdown({ anchorRef, open, onClose, children }) {
  const [style, setStyle] = useState({});

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const update = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      setStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, anchorRef]);

  if (!open) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div
        style={style}
        className="bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] max-h-64 overflow-y-auto"
      >
        {children}
      </div>
    </>,
    document.body,
  );
}

// ─── konstante ───────────────────────────────────────────────
const YEARS = Array.from(
  { length: new Date().getFullYear() - 1899 },
  (_, i) => new Date().getFullYear() - i,
);

const MILEAGE_OPTIONS = [
  { label: "Do 10.000 km", value: 10000 },
  { label: "Do 30.000 km", value: 30000 },
  { label: "Do 50.000 km", value: 50000 },
  { label: "Do 100.000 km", value: 100000 },
  { label: "Do 150.000 km", value: 150000 },
  { label: "Do 200.000 km", value: 200000 },
  { label: "Do 300.000 km", value: 300000 },
  { label: "Preko 300.000 km", value: 300001 },
];

const PRICE_OPTIONS = [
  { label: "Do 2.000 €", value: 2000 },
  { label: "Do 5.000 €", value: 5000 },
  { label: "Do 10.000 €", value: 10000 },
  { label: "Do 20.000 €", value: 20000 },
  { label: "Do 30.000 €", value: 30000 },
  { label: "Do 50.000 €", value: 50000 },
  { label: "Do 90.000 €", value: 90000 },
  { label: "Preko 90.000 €", value: 90001 },
];

const MILEAGE_MOTO = [
  { label: "Do 1.000 km", value: 1000 },
  { label: "Do 5.000 km", value: 5000 },
  { label: "Do 20.000 km", value: 20000 },
  { label: "Do 50.000 km", value: 50000 },
  { label: "Do 100.000 km", value: 100000 },
];

const PRICE_NAUTIKA = [
  { label: "Do 5.000 €", value: 5000 },
  { label: "Do 20.000 €", value: 20000 },
  { label: "Do 50.000 €", value: 50000 },
  { label: "Do 100.000 €", value: 100000 },
  { label: "Do 500.000 €", value: 500000 },
  { label: "Preko 500.000 €", value: 500001 },
];

const PRICE_TRUCK = [
  { label: "Do 5.000 €", value: 5000 },
  { label: "Do 20.000 €", value: 20000 },
  { label: "Do 50.000 €", value: 50000 },
  { label: "Do 100.000 €", value: 100000 },
  { label: "Do 500.000 €", value: 500000 },
  { label: "Do 1.500.000 €", value: 1500000 },
];

const MILEAGE_TRUCK = [
  { label: "Do 50.000 km", value: 50000 },
  { label: "Do 100.000 km", value: 100000 },
  { label: "Do 200.000 km", value: 200000 },
  { label: "Do 500.000 km", value: 500000 },
  { label: "Do 1.000.000 km", value: 1000000 },
];

const NAUTIKA_KAT = ["Nautika (sve)", "Plovila", "Vodeni skuter"];
const PLOVILA_TIPOVI = [
  "Svi tipovi",
  "Camac",
  "Gliser",
  "Jedrilica",
  "Jahta",
  "Katamaran",
  "Gumenjak / RIB",
  "Ostalo",
];
const SKUTER_TIPOVI = ["Svi tipovi", "Sportski", "Rekreativni"];

const NAUTIKA_MAKES_BY_TIP = {
  "Svi tipovi": [
    "Beneteau",
    "Bavaria",
    "Jeanneau",
    "Azimut-Benetti",
    "Four Winns",
    "Sessa Marine",
    "Rinker",
    "Maxum",
    "Elan",
    "Sea-Doo",
    "Yamaha",
    "Kawasaki",
    "Ostalo",
  ],
  Camac: [
    "Alumacraft",
    "Boston Whaler",
    "Bayliner",
    "Lund",
    "Princecraft",
    "Tracker",
    "Ostalo",
  ],
  Gliser: [
    "Bayliner",
    "Chaparral",
    "Chris-Craft",
    "Cobalt",
    "Four Winns",
    "Mastercraft",
    "Rinker",
    "Sea Ray",
    "Sessa Marine",
    "Ostalo",
  ],
  Jedrilica: [
    "Bavaria",
    "Beneteau",
    "Catalina",
    "Elan",
    "Hanse",
    "Hunter",
    "Jeanneau",
    "Lagoon",
    "X-Yachts",
    "Ostalo",
  ],
  Jahta: [
    "Azimut-Benetti",
    "Ferretti",
    "Galeon",
    "Jeanneau",
    "Princess",
    "Sanlorenzo",
    "Sunseeker",
    "Ostalo",
  ],
  Katamaran: [
    "Bali",
    "Fountaine Pajot",
    "Lagoon",
    "Leopard",
    "Nautitech",
    "Ostalo",
  ],
  "Gumenjak / RIB": [
    "AB Inflatables",
    "Bombard",
    "Highfield",
    "Joker Boat",
    "Navar",
    "Ribeye",
    "Zar",
    "Ostalo",
  ],
  Ostalo: ["Ostalo"],
  Sportski: ["Sea-Doo (BRP)", "Yamaha", "Kawasaki", "Ostalo"],
  Rekreativni: ["Sea-Doo (BRP)", "Yamaha", "Kawasaki", "Ostalo"],
};

const ALL_NAUTIKA_MAKES = [
  ...new Set(Object.values(NAUTIKA_MAKES_BY_TIP).flat()),
].sort();

const MOTO_KAT = [
  "Chopper / Cruiser",
  "Dirt Bike",
  "Enduro / Touring Enduro",
  "Sidecar",
  "Small / Lightweight",
  "Moped / Mokick",
  "Motocikl",
  "Naked Bike",
  "Pocket Bike",
  "Quad/ATV",
  "Rally / Cross",
  "Racing",
  "Roadster",
  "Scooter / Roller",
  "Sportbike / Superbike",
  "Sport Tourer",
  "Streetfighter",
  "Super Moto",
  "Tourer",
  "Trike",
  "Ostalo",
];

const MOTO_MAKES_BY_CAT = {
  "Chopper / Cruiser": [
    "Harley-Davidson",
    "Indian",
    "Honda",
    "Yamaha",
    "Kawasaki",
    "Suzuki",
    "BMW",
    "Triumph",
    "Ducati",
    "Moto Guzzi",
    "Royal Enfield",
    "Victory",
  ],
  "Dirt Bike": [
    "KTM",
    "Honda",
    "Yamaha",
    "Kawasaki",
    "Suzuki",
    "Husqvarna",
    "Beta",
    "Gas Gas",
    "Sherco",
    "TM Racing",
  ],
  "Enduro / Touring Enduro": [
    "KTM",
    "Husqvarna",
    "Honda",
    "Yamaha",
    "BMW",
    "Suzuki",
    "Kawasaki",
    "Beta",
    "Gas Gas",
    "Sherco",
  ],
  Sidecar: ["Ural", "Honda", "Yamaha", "BMW", "Zundapp"],
  "Small / Lightweight": [
    "Honda",
    "Yamaha",
    "Kawasaki",
    "Suzuki",
    "Aprilia",
    "Derbi",
    "Peugeot",
    "Rieju",
    "Kymco",
  ],
  "Moped / Mokick": [
    "Honda",
    "Yamaha",
    "Peugeot",
    "Kymco",
    "Piaggio",
    "Aprilia",
    "Sym",
    "Rieju",
    "Derbi",
  ],
  Motocikl: [
    "Honda",
    "Yamaha",
    "Kawasaki",
    "Suzuki",
    "BMW",
    "Ducati",
    "KTM",
    "Triumph",
    "Aprilia",
    "MV Agusta",
  ],
  "Naked Bike": [
    "Ducati",
    "KTM",
    "Kawasaki",
    "Yamaha",
    "Honda",
    "Suzuki",
    "BMW",
    "Aprilia",
    "Triumph",
    "Husqvarna",
  ],
  "Pocket Bike": ["Honda", "Kawasaki", "Yamaha", "Blata", "Minimoto"],
  "Quad/ATV": [
    "Honda",
    "Yamaha",
    "Kawasaki",
    "Suzuki",
    "Can-Am",
    "Polaris",
    "Kymco",
    "CF Moto",
    "Linhai",
    "Arctic Cat",
  ],
  "Rally / Cross": [
    "KTM",
    "Honda",
    "Yamaha",
    "Husqvarna",
    "Gas Gas",
    "Beta",
    "Sherco",
    "TM Racing",
  ],
  Racing: [
    "Ducati",
    "Honda",
    "Yamaha",
    "Kawasaki",
    "Suzuki",
    "Aprilia",
    "BMW",
    "KTM",
  ],
  Roadster: [
    "Ducati",
    "Triumph",
    "BMW",
    "Yamaha",
    "Honda",
    "KTM",
    "Kawasaki",
    "Suzuki",
    "Aprilia",
  ],
  "Scooter / Roller": [
    "Honda",
    "Yamaha",
    "Piaggio",
    "Vespa",
    "Kymco",
    "Sym",
    "Aprilia",
    "Peugeot",
    "Suzuki",
    "Burgman",
  ],
  "Sportbike / Superbike": [
    "Honda",
    "Yamaha",
    "Kawasaki",
    "Suzuki",
    "Ducati",
    "Aprilia",
    "BMW",
    "KTM",
    "MV Agusta",
    "Triumph",
  ],
  "Sport Tourer": [
    "Honda",
    "Yamaha",
    "BMW",
    "Kawasaki",
    "Suzuki",
    "Ducati",
    "Aprilia",
    "Triumph",
    "Moto Guzzi",
  ],
  Streetfighter: [
    "Ducati",
    "Kawasaki",
    "Yamaha",
    "BMW",
    "Honda",
    "Aprilia",
    "KTM",
    "Triumph",
  ],
  "Super Moto": [
    "KTM",
    "Husqvarna",
    "Honda",
    "Yamaha",
    "Suzuki",
    "Gas Gas",
    "Beta",
    "Aprilia",
  ],
  Tourer: [
    "BMW",
    "Honda",
    "Yamaha",
    "Kawasaki",
    "Suzuki",
    "Harley-Davidson",
    "Indian",
    "Moto Guzzi",
    "Triumph",
  ],
  Trike: ["Can-Am", "Harley-Davidson", "Honda", "Yamaha", "Boom Trikes"],
  Ostalo: [
    "Honda",
    "Yamaha",
    "Kawasaki",
    "Suzuki",
    "BMW",
    "KTM",
    "Ducati",
    "Triumph",
    "Aprilia",
    "Ostalo",
  ],
};

const ALL_MOTO_MAKES = [
  ...new Set(Object.values(MOTO_MAKES_BY_CAT).flat()),
].sort();

const TRUCK_KAT = [
  { label: "Kombi vozila", value: "kombi" },
  { label: "Kamion do 7.5t", value: "kamion-do-7t" },
  { label: "Kamion preko 7.5t", value: "kamion-preko-7t" },
  { label: "Prikolica", value: "prikolica" },
  { label: "Autobus", value: "autobus" },
  { label: "Kamper", value: "kamper" },
];

const TRUCK_MAKES_BY_KAT = {
  kombi: [
    "Volkswagen",
    "Mercedes-Benz",
    "Renault",
    "Ford",
    "Fiat",
    "Citroën",
    "Opel",
    "Peugeot",
    "Iveco",
    "Toyota",
    "Kia",
    "Nissan",
    "Ostalo",
  ],
  "kamion-do-7t": [
    "Mercedes-Benz",
    "Iveco",
    "Ford",
    "Volkswagen",
    "Renault",
    "Fiat",
    "MAN",
    "DAF",
    "Ostalo",
  ],
  "kamion-preko-7t": [
    "Mercedes-Benz",
    "Volvo",
    "Scania",
    "MAN",
    "DAF",
    "Iveco",
    "Renault Trucks",
    "Ostalo",
  ],
  prikolica: [
    "Schmitz Cargobull",
    "Krone",
    "Kögel",
    "Stema",
    "Gorica",
    "Hoffmann",
    "Ostalo",
  ],
  autobus: [
    "Mercedes-Benz",
    "Setra",
    "MAN",
    "Iveco",
    "Neoplan",
    "Volvo",
    "Scania",
    "Solaris",
    "Ostalo",
  ],
  kamper: [
    "Fendt",
    "Hymer",
    "Knaus",
    "Bürstner",
    "Dethleffs",
    "Hobby",
    "LMC",
    "Carado",
    "Volkswagen",
    "Mercedes-Benz",
    "Ostalo",
  ],
};

const ALL_TRUCK_MAKES = [
  ...new Set(Object.values(TRUCK_MAKES_BY_KAT).flat()),
].sort();

const TABS = [
  {
    id: "auto",
    label: "Auto",
    icon: (
      <img
        src="/src/assets/icons/auto gray icon.png"
        alt="Auto"
        className="w-10 h-10 object-contain brightness-0 invert"
      />
    ),
  },
  {
    id: "moto",
    label: "Motori",
    icon: (
      <img
        src="/src/assets/icons/motor gray icon.png"
        alt="Motori"
        className="w-10 h-10 object-contain brightness-0 invert"
      />
    ),
  },
  {
    id: "nautika",
    label: "Nautika",
    icon: (
      <img
        src="/src/assets/icons/nautika gray icon.png"
        alt="Nautika"
        className="w-10 h-10 object-contain brightness-0 invert"
      />
    ),
  },
  {
    id: "truck",
    label: "Transport",
    icon: (
      <img
        src="/src/assets/icons/transport gray icon.png"
        alt="Transport"
        className="w-10 h-10 object-contain brightness-0 invert"
      />
    ),
  },
];

// ─── Select helper ────────────────────────────────────────────
function Sel({ value, onChange, placeholder, children, disabled }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white w-full ${disabled ? "text-gray-400 cursor-not-allowed bg-gray-50" : ""}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
}

// ─── ComboInput — unos s prijedlozima + custom broj ──────────
function ComboInput({ value, onChange, placeholder, options }) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef(null);
  const pendingValueRef = useRef("");

  const getLabel = (val) => {
    if (!val) return "";
    const opt = options.find(
      (o) => String(typeof o === "object" ? o.value : o) === String(val),
    );
    if (opt)
      return typeof opt === "object" ? opt.label : String(opt).toLocaleString();
    return String(val);
  };

  const displayValue = focused ? input : getLabel(value);

  const filtered =
    input.length > 0
      ? options.filter((o) => {
          const lbl = typeof o === "object" ? o.label : String(o);
          const val = typeof o === "object" ? String(o.value) : String(o);
          return (
            lbl.toLowerCase().startsWith(input.toLowerCase()) ||
            val.startsWith(input)
          );
        })
      : options;

  const saveInput = (raw) => {
    const trimmed = (raw ?? input).trim();
    if (trimmed && !isNaN(trimmed)) {
      onChange(trimmed);
      pendingValueRef.current = "";
    }
  };

  const handleFocus = () => {
    setFocused(true);
    setInput(value ? String(value) : "");
    setOpen(true);
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    pendingValueRef.current = e.target.value;
    setOpen(true);
  };

  const handleBlur = () => {
    saveInput(pendingValueRef.current);
    setTimeout(() => {
      setFocused(false);
      setOpen(false);
    }, 100);
  };

  const handleSelect = (opt) => {
    const val = typeof opt === "object" ? opt.value : opt;
    onChange(val);
    pendingValueRef.current = "";
    setInput("");
    setOpen(false);
    setFocused(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      saveInput(input);
      setOpen(false);
      setFocused(false);
      e.target.blur();
    }
    if (e.key === "Escape") {
      setOpen(false);
      e.target.blur();
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setInput("");
    pendingValueRef.current = "";
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
          ${value ? "border-[#FF0026]" : "border-gray-200"}`}
      />
      {value ? (
        <button
          onMouseDown={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF0026] text-xs"
        >
          ✕
        </button>
      ) : (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
          ▾
        </span>
      )}
      <PortalDropdown
        anchorRef={wrapRef}
        open={open && filtered.length > 0}
        onClose={() => setOpen(false)}
      >
        {filtered.slice(0, 60).map((opt) => {
          const val = typeof opt === "object" ? opt.value : opt;
          const lbl =
            typeof opt === "object" ? opt.label : String(opt).toLocaleString();
          return (
            <button
              key={val}
              onMouseDown={() => handleSelect(opt)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-red-50 hover:text-[#FF0026] transition
                ${String(value) === String(val) ? "bg-red-50 text-[#FF0026] font-semibold" : "text-gray-700"}`}
            >
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

  const selectedNames = makes
    .filter((m) => selectedIds.includes(m.id))
    .map((m) => m.name);
  const label =
    selectedNames.length === 0
      ? "Marka"
      : selectedNames.length === 1
        ? selectedNames[0]
        : `${selectedNames.length} marke`;

  const toggle = (id) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((p) => !p)}
        className={`border rounded-xl px-3 py-2.5 text-sm w-full text-left flex items-center justify-between transition
          ${selectedIds.length > 0 ? "border-[#FF0026] bg-red-50 text-[#FF0026] font-semibold" : "border-gray-200 bg-white text-gray-700"}`}
      >
        <span>{label}</span>
        <span className="text-gray-400 ml-2">▾</span>
      </button>
      <PortalDropdown
        anchorRef={btnRef}
        open={open}
        onClose={() => setOpen(false)}
      >
        {makes.map((m) => (
          <label
            key={m.id}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(m.id)}
              onChange={() => toggle(m.id)}
              className="accent-[#FF0026]"
            />
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
  const label =
    count === 0
      ? "Model"
      : count === 1
        ? (() => {
            for (const s of series) {
              if (selectedIds.includes(s.id)) return s.name;
              const child = s.children?.find((c) => selectedIds.includes(c.id));
              if (child) return child.name;
            }
            return `${count} modela`;
          })()
        : `${count} modela`;

  const toggle = (id) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  const toggleSeries = (id) =>
    setExpandedSeries((p) => ({ ...p, [id]: !p[id] }));

  if (!series.length) {
    return (
      <div className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-400 bg-gray-50 w-full">
        Model
      </div>
    );
  }

  const byMake = {};
  series.forEach((s) => {
    const makeName = s.make?.name || "Ostalo";
    if (!byMake[makeName]) byMake[makeName] = [];
    byMake[makeName].push(s);
  });
  const makeNames = Object.keys(byMake);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((p) => !p)}
        className={`border rounded-xl px-3 py-2.5 text-sm w-full text-left flex items-center justify-between transition
          ${count > 0 ? "border-[#FF0026] bg-red-50 text-[#FF0026] font-semibold" : "border-gray-200 bg-white text-gray-700"}`}
      >
        <span>{label}</span>
        <span className="text-gray-400 ml-2">▾</span>
      </button>

      <PortalDropdown
        anchorRef={btnRef}
        open={open}
        onClose={() => setOpen(false)}
      >
        {makeNames.map((makeName) => (
          <div key={makeName}>
            {makeNames.length > 1 && (
              <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 text-xs font-black text-[#12142D] uppercase tracking-wider sticky top-0">
                {makeName}
              </div>
            )}
            {byMake[makeName].map((s) => (
              <div key={s.id}>
                <div className="flex items-center gap-1 px-3 py-2 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={() => toggle(s.id)}
                    className="accent-[#FF0026] flex-shrink-0"
                  />
                  <span
                    className="flex-1 text-sm font-semibold text-[#12142D] cursor-pointer"
                    onClick={() => toggle(s.id)}
                  >
                    {s.name}
                  </span>
                  {s.children?.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSeries(s.id);
                      }}
                      className="text-gray-400 text-xs px-1 hover:text-[#FF0026] flex-shrink-0"
                    >
                      {expandedSeries[s.id] ? "▲" : "▼"}
                    </button>
                  )}
                </div>
                {expandedSeries[s.id] &&
                  s.children?.map((child) => (
                    <label
                      key={child.id}
                      className="flex items-center gap-2 pl-8 pr-3 py-1.5 hover:bg-gray-50 cursor-pointer text-xs text-gray-600"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(child.id)}
                        onChange={() => toggle(child.id)}
                        className="accent-[#FF0026]"
                      />
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

  const label =
    selectedCats.length === 0
      ? "Kategorija"
      : selectedCats.length === 1
        ? selectedCats[0]
        : `${selectedCats.length} kategorije`;

  const toggle = (cat) =>
    onChange(
      selectedCats.includes(cat)
        ? selectedCats.filter((c) => c !== cat)
        : [...selectedCats, cat],
    );

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((p) => !p)}
        className={`border rounded-xl px-3 py-2.5 text-sm w-full text-left flex items-center justify-between transition
          ${selectedCats.length > 0 ? "border-[#FF0026] bg-red-50 text-[#FF0026] font-semibold" : "border-gray-200 bg-white text-gray-700"}`}
      >
        <span>{label}</span>
        <span className="text-gray-400 ml-2">▾</span>
      </button>
      <PortalDropdown
        anchorRef={btnRef}
        open={open}
        onClose={() => setOpen(false)}
      >
        {MOTO_KAT.map((cat) => (
          <label
            key={cat}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
          >
            <input
              type="checkbox"
              checked={selectedCats.includes(cat)}
              onChange={() => toggle(cat)}
              className="accent-[#FF0026]"
            />
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

  const relevantMakes =
    selectedCats.length > 0
      ? [
          ...new Set(selectedCats.flatMap((c) => MOTO_MAKES_BY_CAT[c] ?? [])),
        ].sort()
      : ALL_MOTO_MAKES;

  const filteredSelected = selectedMakes.filter((m) =>
    relevantMakes.includes(m),
  );

  const label =
    filteredSelected.length === 0
      ? "Marka"
      : filteredSelected.length === 1
        ? filteredSelected[0]
        : `${filteredSelected.length} marke`;

  const toggle = (make) => {
    const current = filteredSelected;
    onChange(
      current.includes(make)
        ? current.filter((m) => m !== make)
        : [...current, make],
    );
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((p) => !p)}
        className={`border rounded-xl px-3 py-2.5 text-sm w-full text-left flex items-center justify-between transition
          ${filteredSelected.length > 0 ? "border-[#FF0026] bg-red-50 text-[#FF0026] font-semibold" : "border-gray-200 bg-white text-gray-700"}`}
      >
        <span>{label}</span>
        <span className="text-gray-400 ml-2">▾</span>
      </button>
      <PortalDropdown
        anchorRef={btnRef}
        open={open}
        onClose={() => setOpen(false)}
      >
        {selectedCats.length > 0 && (
          <div className="px-3 py-1.5 bg-gray-50 text-xs text-gray-400 border-b border-gray-100">
            Marke za odabrane kategorije
          </div>
        )}
        {relevantMakes.map((make) => (
          <label
            key={make}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
          >
            <input
              type="checkbox"
              checked={filteredSelected.includes(make)}
              onChange={() => toggle(make)}
              className="accent-[#FF0026]"
            />
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

  const label =
    selectedKats.length === 0
      ? "Kategorija"
      : selectedKats.length === 1
        ? TRUCK_KAT.find((k) => k.value === selectedKats[0])?.label ||
          selectedKats[0]
        : `${selectedKats.length} kategorije`;

  const toggle = (val) =>
    onChange(
      selectedKats.includes(val)
        ? selectedKats.filter((v) => v !== val)
        : [...selectedKats, val],
    );

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((p) => !p)}
        className={`border rounded-xl px-3 py-2.5 text-sm w-full text-left flex items-center justify-between transition
          ${selectedKats.length > 0 ? "border-[#FF0026] bg-red-50 text-[#FF0026] font-semibold" : "border-gray-200 bg-white text-gray-700"}`}
      >
        <span>{label}</span>
        <span className="text-gray-400 ml-2">▾</span>
      </button>
      <PortalDropdown
        anchorRef={btnRef}
        open={open}
        onClose={() => setOpen(false)}
      >
        {TRUCK_KAT.map((k) => (
          <label
            key={k.value}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
          >
            <input
              type="checkbox"
              checked={selectedKats.includes(k.value)}
              onChange={() => toggle(k.value)}
              className="accent-[#FF0026]"
            />
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

  const relevantMakes =
    selectedKats.length > 0
      ? [
          ...new Set(selectedKats.flatMap((k) => TRUCK_MAKES_BY_KAT[k] ?? [])),
        ].sort()
      : ALL_TRUCK_MAKES;

  const label =
    selectedMakes.length === 0
      ? "Marka"
      : selectedMakes.length === 1
        ? selectedMakes[0]
        : `${selectedMakes.length} marke`;

  const toggle = (make) =>
    onChange(
      selectedMakes.includes(make)
        ? selectedMakes.filter((m) => m !== make)
        : [...selectedMakes, make],
    );

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((p) => !p)}
        className={`border rounded-xl px-3 py-2.5 text-sm w-full text-left flex items-center justify-between transition
          ${selectedMakes.length > 0 ? "border-[#FF0026] bg-red-50 text-[#FF0026] font-semibold" : "border-gray-200 bg-white text-gray-700"}`}
      >
        <span>{label}</span>
        <span className="text-gray-400 ml-2">▾</span>
      </button>
      <PortalDropdown
        anchorRef={btnRef}
        open={open}
        onClose={() => setOpen(false)}
      >
        {selectedKats.length > 0 && (
          <div className="px-3 py-1.5 bg-gray-50 text-xs text-gray-400 border-b border-gray-100">
            Marke za odabrane kategorije
          </div>
        )}
        {relevantMakes.map((make) => (
          <label
            key={make}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
          >
            <input
              type="checkbox"
              checked={selectedMakes.includes(make)}
              onChange={() => toggle(make)}
              className="accent-[#FF0026]"
            />
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
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      {count} oglasa
    </button>
  );
}

// ═════════════════════════════════════════════════════════════
export default function Home() {
  const navigate = useNavigate();
  const dealersRef = useRef(null);
  const [activeTab, setActiveTab] = useState("auto");

  // Auto
  const [autoMakeIds, setAutoMakeIds] = useState([]);
  const [autoModelIds, setAutoModelIds] = useState([]);
  const [autoF, setAutoF] = useState({
    year_from: "",
    year_to: "",
    mileage_to: "",
    price_to: "",
    city_id: "",
  });

  // Moto
  const [motoCatIds, setMotoCatIds] = useState([]);
  const [motoMakeIds, setMotoMakeIds] = useState([]);
  const [motoF, setMotoF] = useState({
    year_from: "",
    mileage_to: "",
    price_to: "",
    city_id: "",
  });

  // Nautika
  const [nautikaKat, setNautikaKat] = useState("Nautika (sve)");
  const [nautikaF, setNautikaF] = useState({
    tip: "",
    make: "",
    model: "",
    price_to: "",
    year_to: "",
    city_id: "",
  });

  // Truck
  const [truckKatIds, setTruckKatIds] = useState([]);
  const [truckMakeIds, setTruckMakeIds] = useState([]);
  const [truckF, setTruckF] = useState({
    model: "",
    year_from: "",
    mileage_to: "",
    price_to: "",
    city_id: "",
  });

  // ─── API ─────────────────────────────────────────────────
  const { data: makesData } = useQuery({
    queryKey: ["makes"],
    queryFn: () => axios.get("/makes").then((r) => r.data),
  });
  const makes = makesData?.data ?? [];

  const { data: multiModelsData } = useQuery({
    queryKey: ["models-multi", autoMakeIds],
    queryFn: () =>
      axios
        .get(`/makes/models-multi?make_ids=${autoMakeIds.join(",")}`)
        .then((r) => r.data),
    enabled: autoMakeIds.length > 0,
  });
  const autoSeries = multiModelsData?.data ?? [];

  const { data: motoModelsData } = useQuery({
    queryKey: ["models", motoF.make_id],
    queryFn: () =>
      axios.get(`/makes/${motoF.make_id}/models`).then((r) => r.data),
    enabled: !!motoF.make_id,
  });
  const motoSeries = motoModelsData?.data ?? [];

  const { data: citiesData } = useQuery({
    queryKey: ["cities"],
    queryFn: () => axios.get("/cities").then((r) => r.data),
  });
  const cities = citiesData?.data ?? [];

  // Count za dugme pretrage
  const activeFilters =
    activeTab === "auto"
      ? {
          make_ids: autoMakeIds.join(","),
          model_ids: autoModelIds.join(","),
          ...autoF,
        }
      : activeTab === "moto"
        ? {
            kategorije: motoCatIds.join(","),
            moto_makes: motoMakeIds.join(","),
            ...motoF,
          }
        : activeTab === "nautika"
          ? nautikaF
          : {
              truck_kats: truckKatIds.join(","),
              truck_makes: truckMakeIds.join(","),
              ...truckF,
            };

  const { data: countData } = useQuery({
    queryKey: ["ads-count", activeTab, activeFilters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(activeFilters).forEach(([k, v]) => v && params.set(k, v));
      return axios.get(`/ads/count?${params.toString()}`).then((r) => r.data);
    },
    staleTime: 30000,
  });
  const adsCount = countData?.count ?? "...";

  // Ukupan broj oglasa za hero stats traku
  const { data: totalCountData } = useQuery({
    queryKey: ["total-ads-count"],
    queryFn: () => axios.get("/ads/count").then((r) => r.data),
    staleTime: 60000,
  });
  const totalAdsCount = totalCountData?.count ?? null;

  // Featured
  const { data: featuredData } = useQuery({
    queryKey: ["featured-ads"],
    queryFn: () => axios.get("/ads/featured").then((r) => r.data),
  });
  const featuredAds = featuredData?.data ?? [];

  // Popularne marke
  // Popularne marke — fiksna lista
  const POPULARNE_MARKE = [
    { name: "Audi", slug: "audi", logo: "/car_brand_logo/audi logo.png" },
    { name: "BMW", slug: "bmw", logo: "/car_brand_logo/BMW logo.png" },
    {
      name: "Mercedes",
      slug: "mercedes-benz",
      logo: "/car_brand_logo/mercedes logo.png",
    },
    {
      name: "Volkswagen",
      slug: "volkswagen",
      logo: "/car_brand_logo/Volkswagen logo.png",
    },
    { name: "Škoda", slug: "skoda", logo: "/car_brand_logo/skoda logo.png" },
    { name: "Toyota", slug: "toyota", logo: "/car_brand_logo/Toyota logo.png" },
    {
      name: "Renault",
      slug: "renault",
      logo: "/car_brand_logo/renault logo.png",
    },
    {
      name: "Citroën",
      slug: "citroen",
      logo: "/car_brand_logo/citroen logo.png",
    },
    { name: "Kia", slug: "kia", logo: "/car_brand_logo/kia logo.png" },
    { name: "Fiat", slug: "fiat", logo: "/car_brand_logo/fiat logo.png" },
    {
      name: "Alfa Romeo",
      slug: "alfa-romeo",
      logo: "/car_brand_logo/alfa romeo logo.svg",
    },
    {
      name: "Land Rover",
      slug: "land-rover",
      logo: "/car_brand_logo/land rover logo.png",
    },
  ];

  // Dileri
  const { data: dealersData } = useQuery({
    queryKey: ["dealers"],
    queryFn: () => axios.get("/dealers").then((r) => r.data),
  });
  const dealers = dealersData?.data ?? [];

  // Najnoviji
  const { data: latestData } = useQuery({
    queryKey: ["latest-ads"],
    queryFn: () =>
      axios.get("/ads?sort=created_at&dir=desc").then((r) => r.data),
  });
  const latestAds = latestData?.data ?? [];

  // Prosječna cijena iz latest auto oglasa
  const avgPrice =
    latestAds.length > 0
      ? latestAds
          .filter((a) => a.price > 0)
          .reduce((sum, a, _, arr) => sum + a.price / arr.length, 0)
      : null;

  // ─── Search ──────────────────────────────────────────────
  const buildAutoParams = () => {
    const params = new URLSearchParams();
    params.set("tab", "auto");
    if (autoMakeIds.length) params.set("make_ids", autoMakeIds.join(","));
    if (autoModelIds.length) params.set("model_ids", autoModelIds.join(","));
    Object.entries(autoF).forEach(([k, v]) => v && params.set(k, v));
    return params;
  };

  const handleSearch = () => {
    if (document.activeElement) document.activeElement.blur();
    setTimeout(() => {
      let params;
      if (activeTab === "auto") {
        params = buildAutoParams();
      } else if (activeTab === "moto") {
        params = new URLSearchParams();
        if (motoCatIds.length) params.set("kategorije", motoCatIds.join(","));
        if (motoMakeIds.length) params.set("moto_makes", motoMakeIds.join(","));
        Object.entries(motoF).forEach(([k, v]) => v && params.set(k, v));
        params.set("tab", "moto");
      } else if (activeTab === "nautika") {
        params = new URLSearchParams();
        Object.entries(nautikaF).forEach(([k, v]) => v && params.set(k, v));
        if (nautikaKat !== "Nautika (sve)")
          params.set("nautika_kat", nautikaKat);
        params.set("tab", "nautika");
      } else {
        params = new URLSearchParams();
        if (truckKatIds.length) params.set("truck_kats", truckKatIds.join(","));
        if (truckMakeIds.length)
          params.set("truck_makes", truckMakeIds.join(","));
        Object.entries(truckF).forEach(([k, v]) => v && params.set(k, v));
        params.set("tab", "truck");
      }
      navigate(`/search?${params.toString()}`);
    }, 50);
  };

  const handleReset = () => {
    if (activeTab === "auto") {
      setAutoMakeIds([]);
      setAutoModelIds([]);
      setAutoF({
        year_from: "",
        year_to: "",
        mileage_to: "",
        price_to: "",
        city_id: "",
      });
    } else if (activeTab === "moto") {
      setMotoCatIds([]);
      setMotoMakeIds([]);
      setMotoF({ year_from: "", mileage_to: "", price_to: "", city_id: "" });
    } else if (activeTab === "nautika") {
      setNautikaKat("Nautika (sve)");
      setNautikaF({
        tip: "",
        make: "",
        model: "",
        price_to: "",
        year_to: "",
        city_id: "",
      });
    } else {
      setTruckKatIds([]);
      setTruckMakeIds([]);
      setTruckF({
        model: "",
        year_from: "",
        mileage_to: "",
        price_to: "",
        city_id: "",
      });
    }
  };

  const nautikaTipOpcije =
    nautikaKat === "Plovila"
      ? PLOVILA_TIPOVI
      : nautikaKat === "Vodeni skuter"
        ? SKUTER_TIPOVI
        : null;
  const tipDisabled = nautikaKat === "Nautika (sve)" || !nautikaKat;

  // Dinamičan datum za hero (MM/YYYY)
  const heroDate = new Date()
    .toLocaleDateString("sr-Latn", { month: "2-digit", year: "numeric" })
    .replace(". ", "/")
    .replace(".", "");

  return (
    <div className="min-h-screen bg-white">
      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden min-h-[600px]">
        {/* 1. Pozadinska slika — najdolje */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero.jpg')" }}
        />
        {/* 2. Tamni overlay preko slike */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#12142D] via-[#12142D]/90 to-[#12142D]/60" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#12142D] via-transparent to-transparent" />
        {/* 3. Aurora animacija */}
        <div
          className="absolute inset-0 z-[2]"
          style={{ mixBlendMode: "screen" }}
        >
          <Aurora
            colorStops={["#FF0026", "#1B2B5A", "#12142D"]}
            blend={0.6}
            amplitude={1.2}
            speed={0.8}
          />
        </div>
        {/* 4. Sadržaj */}
        <div className="relative z-[2] max-w-6xl mx-auto px-4 pt-32 pb-40">
          {/* Hero tekst */}
          {/* Hero tekst */}
          <div className="mb-8">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <SplitText
                text="Pretraži"
                tag="span"
                className="text-5xl md:text-7xl font-light text-white leading-tight"
                delay={60}
                duration={0.8}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                textAlign="left"
                rootMargin="0px"
              />
              <SplitText
                text="i vozi."
                tag="span"
                className="text-5xl md:text-7xl font-light text-white leading-tight"
                delay={60}
                duration={0.8}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                textAlign="left"
                rootMargin="0px"
              />
            </div>
            <SplitText
              text="Od auta do nautike, sve na jednom mjestu."
              tag="div"
              className="text-2xl md:text-3xl font-light text-white/80 leading-tight mt-1"
              delay={20}
              duration={0.9}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              textAlign="left"
              rootMargin="0px"
            />
          </div>
          {/* ── Search box ── */}
          <BorderGlow
            backgroundColor="#1a1f3a"
            borderRadius={16}
            glowColor="3 90 50"
            colors={["#FF0026", "#FFEA00", "#1B2B5A"]}
            glowRadius={30}
            glowIntensity={0.9}
            coneSpread={22}
            fillOpacity={0}
            className="max-w-5xl rounded-2xl border border-white/20"
          >
            {/* Tabovi */}
            <div className="flex border-b border-white/15">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-base font-light transition
  ${activeTab === tab.id ? "bg-white/15 text-white border-b-2 border-white/60" : "text-white/50 hover:bg-white/8 hover:text-white/80"}`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="p-5">
              {/* ── AUTO ── */}
              {activeTab === "auto" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MakeMultiSelect
                    makes={makes}
                    selectedIds={autoMakeIds}
                    onChange={(ids) => {
                      setAutoMakeIds(ids);
                      setAutoModelIds([]);
                    }}
                  />
                  <ModelHierarchySelect
                    series={autoSeries}
                    selectedIds={autoModelIds}
                    onChange={setAutoModelIds}
                  />
                  <ComboInput
                    value={autoF.year_from}
                    onChange={(v) =>
                      setAutoF((p) => ({
                        ...p,
                        year_from: v,
                        year_to:
                          p.year_to && v && Number(p.year_to) < Number(v)
                            ? v
                            : p.year_to,
                      }))
                    }
                    placeholder="Godiste od"
                    options={YEARS.map((y) => ({ value: y, label: String(y) }))}
                  />
                  <ComboInput
                    value={autoF.year_to}
                    onChange={(v) => setAutoF((p) => ({ ...p, year_to: v }))}
                    placeholder="Godiste do"
                    options={YEARS.filter(
                      (y) => !autoF.year_from || y >= Number(autoF.year_from),
                    ).map((y) => ({ value: y, label: String(y) }))}
                  />
                  <ComboInput
                    value={autoF.mileage_to}
                    onChange={(v) => setAutoF((p) => ({ ...p, mileage_to: v }))}
                    placeholder="Kilometraza do"
                    options={MILEAGE_OPTIONS}
                  />
                  <ComboInput
                    value={autoF.price_to}
                    onChange={(v) => setAutoF((p) => ({ ...p, price_to: v }))}
                    placeholder="Cijena do"
                    options={PRICE_OPTIONS}
                  />
                  <Sel
                    value={autoF.city_id}
                    onChange={(v) => setAutoF((p) => ({ ...p, city_id: v }))}
                    placeholder="Grad"
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Sel>
                  <SearchBtn count={adsCount} onSearch={handleSearch} />
                </div>
              )}

              {/* ── MOTO ── */}
              {activeTab === "moto" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MotoCatSelect
                    selectedCats={motoCatIds}
                    onChange={(ids) => {
                      setMotoCatIds(ids);
                      setMotoMakeIds([]);
                    }}
                  />
                  <MotoMakeSelect
                    selectedCats={motoCatIds}
                    selectedMakes={motoMakeIds}
                    onChange={setMotoMakeIds}
                  />
                  <ComboInput
                    value={motoF.year_from}
                    onChange={(v) => setMotoF((p) => ({ ...p, year_from: v }))}
                    placeholder="Godiste"
                    options={YEARS.map((y) => ({ value: y, label: String(y) }))}
                  />
                  <ComboInput
                    value={motoF.mileage_to}
                    onChange={(v) => setMotoF((p) => ({ ...p, mileage_to: v }))}
                    placeholder="Kilometraza do"
                    options={MILEAGE_MOTO}
                  />
                  <ComboInput
                    value={motoF.price_to}
                    onChange={(v) => setMotoF((p) => ({ ...p, price_to: v }))}
                    placeholder="Cijena do"
                    options={PRICE_OPTIONS}
                  />
                  <Sel
                    value={motoF.city_id}
                    onChange={(v) => setMotoF((p) => ({ ...p, city_id: v }))}
                    placeholder="Grad"
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Sel>
                  <div />
                  <SearchBtn count={adsCount} onSearch={handleSearch} />
                </div>
              )}

              {/* ── NAUTIKA ── */}
              {activeTab === "nautika" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Sel
                    value={nautikaKat}
                    onChange={(v) => {
                      setNautikaKat(v);
                      setNautikaF((p) => ({ ...p, tip: "", make: "" }));
                    }}
                    placeholder=""
                  >
                    {NAUTIKA_KAT.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </Sel>
                  <Sel
                    value={nautikaF.tip}
                    onChange={(v) =>
                      setNautikaF((p) => ({ ...p, tip: v, make: "" }))
                    }
                    placeholder="Tip"
                    disabled={tipDisabled}
                  >
                    {nautikaTipOpcije?.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Sel>
                  <Sel
                    value={nautikaF.make}
                    onChange={(v) => setNautikaF((p) => ({ ...p, make: v }))}
                    placeholder="Marka"
                  >
                    {(nautikaF.tip && nautikaF.tip !== "Svi tipovi"
                      ? (NAUTIKA_MAKES_BY_TIP[nautikaF.tip] ??
                        ALL_NAUTIKA_MAKES)
                      : ALL_NAUTIKA_MAKES
                    ).map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </Sel>
                  <input
                    type="text"
                    value={nautikaF.model}
                    onChange={(e) =>
                      setNautikaF((p) => ({ ...p, model: e.target.value }))
                    }
                    placeholder="Model"
                    className="border border-white/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] w-full bg-white/90"
                  />
                  <ComboInput
                    value={nautikaF.price_to}
                    onChange={(v) =>
                      setNautikaF((p) => ({ ...p, price_to: v }))
                    }
                    placeholder="Cijena do"
                    options={PRICE_NAUTIKA}
                  />
                  <ComboInput
                    value={nautikaF.year_to}
                    onChange={(v) => setNautikaF((p) => ({ ...p, year_to: v }))}
                    placeholder="Godiste do"
                    options={YEARS.map((y) => ({ value: y, label: String(y) }))}
                  />
                  <Sel
                    value={nautikaF.city_id}
                    onChange={(v) => setNautikaF((p) => ({ ...p, city_id: v }))}
                    placeholder="Grad"
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Sel>
                  <SearchBtn count={adsCount} onSearch={handleSearch} />
                </div>
              )}

              {/* ── TRUCK ── */}
              {activeTab === "truck" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <TruckKatSelect
                    selectedKats={truckKatIds}
                    onChange={(ids) => {
                      setTruckKatIds(ids);
                      setTruckMakeIds([]);
                    }}
                  />
                  <TruckMakeSelect
                    selectedKats={truckKatIds}
                    selectedMakes={truckMakeIds}
                    onChange={setTruckMakeIds}
                  />
                  <ComboInput
                    value={truckF.year_from}
                    onChange={(v) => setTruckF((p) => ({ ...p, year_from: v }))}
                    placeholder="Godiste od"
                    options={YEARS.map((y) => ({ value: y, label: String(y) }))}
                  />
                  <ComboInput
                    value={truckF.mileage_to}
                    onChange={(v) =>
                      setTruckF((p) => ({ ...p, mileage_to: v }))
                    }
                    placeholder="Kilometraza do"
                    options={MILEAGE_TRUCK}
                  />
                  <ComboInput
                    value={truckF.price_to}
                    onChange={(v) => setTruckF((p) => ({ ...p, price_to: v }))}
                    placeholder="Cijena do"
                    options={PRICE_TRUCK}
                  />
                  <Sel
                    value={truckF.city_id}
                    onChange={(v) => setTruckF((p) => ({ ...p, city_id: v }))}
                    placeholder="Grad"
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Sel>
                  <div />
                  <SearchBtn count={adsCount} onSearch={handleSearch} />
                </div>
              )}

              {/* Reset + Više filtera */}
              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={handleReset}
                  className="text-xs text-white/50 hover:text-white flex items-center gap-1 transition"
                >
                  🔄 Resetuj filtere
                </button>

                <button
                  onClick={() => {
                    if (document.activeElement) document.activeElement.blur();
                    setTimeout(() => {
                      const params =
                        activeTab === "auto"
                          ? buildAutoParams()
                          : new URLSearchParams();
                      params.set("tab", activeTab);

                      if (activeTab === "moto") {
                        if (motoCatIds.length)
                          params.set("kategorije", motoCatIds.join(","));
                        if (motoMakeIds.length)
                          params.set("moto_makes", motoMakeIds.join(","));
                        Object.entries(motoF).forEach(
                          ([k, v]) => v && params.set(k, v),
                        );
                      } else if (activeTab === "nautika") {
                        Object.entries(nautikaF).forEach(
                          ([k, v]) => v && params.set(k, v),
                        );
                        if (nautikaKat !== "Nautika (sve)")
                          params.set("nautika_kat", nautikaKat);
                      } else if (activeTab === "truck") {
                        if (truckKatIds.length)
                          params.set("truck_kats", truckKatIds.join(","));
                        if (truckMakeIds.length)
                          params.set("truck_makes", truckMakeIds.join(","));
                        Object.entries(truckF).forEach(
                          ([k, v]) => v && params.set(k, v),
                        );
                      }

                      navigate(`/search/filters?${params.toString()}`);
                    }, 50);
                  }}
                  className="text-xs text-white/70 hover:text-white flex items-center gap-1 font-semibold transition"
                >
                  ⚙ Više filtera
                </button>
              </div>
            </div>{" "}
            {/* p-5 */}
          </BorderGlow>{" "}
          {/* glow box */}

          
          {/* ══ AI PRETRAGA ══ */}
<div className="mt-4 max-w-5xl">
  <BorderGlow
    backgroundColor="#1a1f3a"
    borderRadius={16}
    glowColor="3 90 50"
    colors={['#FF0026', '#FFEA00', '#1B2B5A']}
    glowRadius={30}
    glowIntensity={0.9}
    coneSpread={22}
    fillOpacity={0}
    className="rounded-2xl border border-white/20"
  >
    <div className="px-5 pt-5 pb-4">
      <p style={{
        fontFamily: "'Gomme Sans', sans-serif",
        fontSize: '18px',
        fontWeight: 300,
        letterSpacing: '0.18em',
        color: 'rgba(255,255,255,0.65)',
        textTransform: 'uppercase',
        marginBottom: 12,
      }}>
        AI PRETRAGA — Opiši šta želiš
      </p>
      <AISearchBar hideMeta />
    </div>
  </BorderGlow>
</div>
        </div>{" "}
        {/* HERO content wrapper */}
      </section>

      {/* ══ STATS TRAKA ══ */}
      <div className="relative -mt-36 z-10 max-w-6xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-3 divide-x divide-white/10 py-5">
          {[
            {
              value:
                totalAdsCount != null
                  ? totalAdsCount.toLocaleString("sr-Latn")
                  : "—",
              label: "AKTIVNIH OGLASA",
            },
            {
              value:
                dealers.length > 0
                  ? dealers.length.toLocaleString("sr-Latn")
                  : "—",
              label: "VERIFIKOVANIH PRODAVACA",
            },
            {
              value: avgPrice
                ? `€ ${Math.round(avgPrice).toLocaleString("sr-Latn")}`
                : "—",
              label: "PROSJEČNA CIJENA",
            },
          ].map((s) => (
            <div key={s.label} className="text-center px-4">
              <div className="text-2xl md:text-3xl font-light text-white">
                {s.value}
              </div>
              <div className="text-[#6674A3] text-xs font-medium tracking-widest mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ WRAPPER SA BANER KOLONAMA ══ */}
      <div className="flex items-start gap-0">
        {/* Lijevi baner */}
        <div className="hidden xl:block w-[160px] flex-shrink-0">
          <div className="sticky top-4 w-[160px] h-[600px] bg-gray-100 border border-dashed border-gray-300 rounded-r-xl flex items-center justify-center mt-10">
            <span className="text-xs text-gray-400 rotate-90 whitespace-nowrap">
              Reklama 160×600
            </span>
          </div>
        </div>


        {/* Srednji sadržaj */}
        <div className="flex-1 min-w-0">


{/* ══ NEDAVNO PREGLEDANO ══ */}
<RecentlyViewed />

          {/* ══ ISTAKNUTI ══ */}
          {featuredAds.length > 0 && (
            <div className="max-w-6xl mx-auto px-4 py-10">
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className="text-2xl font-semibold text-[#12142D]"
                    style={{ fontFamily: "'Gomme Sans', sans-serif" }}
                  >
                    Istaknuti oglasi
                  </h2>
                  <button
                    onClick={() => navigate("/search?featured=1")}
                    className="text-sm font-semibold text-[#FF0026] hover:underline whitespace-nowrap"
                    style={{ fontFamily: "'Gomme Sans', sans-serif" }}
                  >
                    Svi istaknuti →
                  </button>
                </div>
                <div
                  className={`grid gap-4 ${featuredAds.length < 3 ? "grid-cols-2 max-w-2xl mx-auto" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}
                >
                  {featuredAds.slice(0, 30).map((ad) => (
                    <AdCard key={ad.id} ad={ad} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ PO TIPU ══ */}
          <div className="max-w-6xl mx-auto px-4 py-10">
            <h2
              className="text-2xl font-semibold text-[#12142D] mb-6"
              style={{ fontFamily: "'Gomme Sans', sans-serif" }}
            >
              Pretraži po tipu karoserije
            </h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <GlassIcons
                items={[
                  {
                    icon: (
                      <img src="/src/assets/body-types/suv.png" alt="SUV" />
                    ),
                    color: "navy",
                    label: "SUV",
                    onClick: () => navigate("/search?body_type=suv"),
                  },
                  {
                    icon: (
                      <img src="/src/assets/body-types/sedan.png" alt="Sedan" />
                    ),
                    color: "indigo",
                    label: "Sedan",
                    onClick: () => navigate("/search?body_type=sedan"),
                  },
                  {
                    icon: (
                      <img
                        src="/src/assets/body-types/karavan.png"
                        alt="Karavan"
                      />
                    ),
                    color: "blue",
                    label: "Karavan",
                    onClick: () => navigate("/search?body_type=karavan"),
                  },
                  {
                    icon: (
                      <img
                        src="/src/assets/body-types/kabriolet.png"
                        alt="Kabriolet"
                      />
                    ),
                    color: "crimson",
                    label: "Kabriolet",
                    onClick: () => navigate("/search?body_type=kabriolet"),
                  },
                  {
                    icon: (
                      <img
                        src="/src/assets/body-types/hatchback.png"
                        alt="Hatchback"
                      />
                    ),
                    color: "purple",
                    label: "Hatchback",
                    onClick: () => navigate("/search?body_type=hatchback"),
                  },
                  {
                    icon: (
                      <img src="/src/assets/body-types/kupe.png" alt="Kupe" />
                    ),
                    color: "red",
                    label: "Kupe",
                    onClick: () => navigate("/search?body_type=kupe"),
                  },
                  {
                    icon: (
                      <img src="/src/assets/body-types/van.png" alt="Kombi" />
                    ),
                    color: "orange",
                    label: "Kombi",
                    onClick: () => navigate("/search?body_type=van"),
                  },
                  {
                    icon: (
                      <img
                        src="/src/assets/body-types/pickup.png"
                        alt="Pickup"
                      />
                    ),
                    color: "green",
                    label: "Pickup",
                    onClick: () => navigate("/search?body_type=pickup"),
                  },
                ]}
              />
            </div>
          </div>

          {/* ══ POPULARNE MARKE ══ */}
          <div className="max-w-6xl mx-auto px-4 py-10">
            <h2
              className="text-2xl font-semibold text-[#12142D] mb-6"
              style={{ fontFamily: "'Gomme Sans', sans-serif" }}
            >
              Popularne marke
            </h2>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-6 divide-x divide-y divide-gray-100">
                {POPULARNE_MARKE.map((make, i) => (
                  <button
                    key={make.slug}
                    onClick={() => navigate(`/search?make_slug=${make.slug}`)}
                    className={`flex flex-col items-center justify-center gap-3 py-7 px-4 hover:bg-gray-50 transition-colors group
            ${i >= 6 ? "" : "border-t-0"}
          `}
                  >
                    <img
                      src={make.logo}
                      alt={make.name}
                      className="h-10 w-20 object-contain grayscale group-hover:grayscale-0 transition-all duration-200"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <span
                      style={{ display: "none" }}
                      className="h-10 w-10 items-center justify-center text-lg font-black text-[#12142D]"
                    >
                      {make.name.substring(0, 2).toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#12142D]">
                      {make.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ══ DILERI ══ */}
          {dealers.length > 0 &&
            (() => {
              const CARD_W = 252; // minWidth (220) + gap (16) + malo margine
              const copies = Math.ceil(1800 / CARD_W / dealers.length) + 2;
              const items = Array.from({ length: copies }).flatMap((_, ci) =>
                dealers.map((d, di) => ({ ...d, _key: `${ci}-${di}` })),
              );
              const halfWidth =
                dealers.length * CARD_W * Math.floor(copies / 2);
              const duration =
                dealers.length === 1
                  ? 25
                  : dealers.length <= 3
                    ? 40
                    : dealers.length <= 6
                      ? 55
                      : 70;

              return (
                <>
                  <style>{`
        @keyframes dealerLoop {
          0%   { transform: translateX(0px); }
          100% { transform: translateX(-${halfWidth}px); }
        }
      `}</style>
                  <section className="py-10">
                    <div className="max-w-6xl mx-auto px-4 mb-6">
                      <h2
                        className="text-2xl font-semibold text-[#12142D]"
                        style={{ fontFamily: "'Gomme Sans', sans-serif" }}
                      >
                        Autoplacevi i dileri
                      </h2>
                    </div>
                    <div className="max-w-6xl mx-auto px-4">
                      <div className="bg-white border border-gray-200 rounded-2xl py-6 overflow-hidden">
                        <div className="relative w-full overflow-hidden">
                          <div
                            className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none"
                            style={{
                              background:
                                "linear-gradient(to right, white, transparent)",
                            }}
                          />
                          <div
                            className="absolute right-0 top-0 h-full w-20 z-10 pointer-events-none"
                            style={{
                              background:
                                "linear-gradient(to left, white, transparent)",
                            }}
                          />

                          <div
                            className="flex px-4"
                            style={{
                              gap: "16px",
                              width: "max-content",
                              animation: `dealerLoop ${duration}s linear infinite`,
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.animationPlayState =
                                "paused")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.animationPlayState =
                                "running")
                            }
                          >
                            {items.map((dealer) => (
                              <button
                                key={dealer._key}
                                onClick={() => navigate(`/users/${dealer.id}`)}
                                className="flex-shrink-0 flex items-center gap-3 bg-white border border-gray-200 hover:border-[#1B2B5A] hover:shadow-md rounded-2xl px-4 py-3 transition-all group"
                                style={{ minWidth: 220 }}
                              >
                                {dealer.logo ? (
                                  <img
                                    src={dealer.logo}
                                    alt={dealer.company_name}
                                    className="h-11 w-11 rounded-full object-contain flex-shrink-0 border border-gray-100"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="h-11 w-11 rounded-full bg-[#12142D] flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-base">
                                      {dealer.company_name?.substring(0, 1)}
                                    </span>
                                  </div>
                                )}
                                <div className="text-left">
                                  <p
                                    className="text-sm font-semibold text-[#12142D] group-hover:text-[#1B2B5A] line-clamp-1"
                                    style={{
                                      fontFamily: "'Gomme Sans', sans-serif",
                                    }}
                                  >
                                    {dealer.company_name}
                                  </p>
                                  {dealer.city && (
                                    <p className="text-xs text-gray-400">
                                      {dealer.city}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-400">
                                    {dealer.ads_count} oglasa
                                  </p>
                                </div>
                                {dealer.featured && (
                                  <span className="ml-2 text-yellow-400 flex-shrink-0">
                                    ★
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              );
            })()}

          {/* ══ NAJNOVIJI OGLASI ══ */}
          <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-2xl font-semibold text-[#12142D]"
                  style={{ fontFamily: "'Gomme Sans', sans-serif" }}
                >
                  Najnoviji oglasi
                </h2>
                <button
                  onClick={() => navigate("/search")}
                  className="text-sm font-semibold text-[#FF0026] hover:underline whitespace-nowrap"
                  style={{ fontFamily: "'Gomme Sans', sans-serif" }}
                >
                  Svi oglasi →
                </button>
              </div>
              {latestAds.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {latestAds.slice(0, 12).map((ad) => (
                      <AdCard key={ad.id} ad={ad} />
                    ))}
                  </div>
                  <div className="text-center mt-8">
                    <button
                      onClick={() => navigate("/search")}
                      className="bg-[#FF0026] hover:bg-red-700 text-white px-10 py-3 rounded-xl font-semibold transition"
                      style={{ fontFamily: "'Gomme Sans', sans-serif" }}
                    >
                      Pogledaj sve oglase →
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-lg">Nema aktivnih oglasa.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* kraj middle */}

        {/* Desni baner */}
        <div className="hidden xl:block w-[160px] flex-shrink-0">
          <div className="sticky top-4 w-[160px] h-[600px] bg-gray-100 border border-dashed border-gray-300 rounded-l-xl flex items-center justify-center mt-10">
            <span className="text-xs text-gray-400 rotate-90 whitespace-nowrap">
              Reklama 160×600
            </span>
          </div>
        </div>
      </div>
      {/* kraj flex wrapper */}

      {/* ══ ZASTO VOZIME ══ */}
      <section className="bg-[#12142D] py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-white mb-2">
            Zašto VozimeOglasi?
          </h2>
          <p className="text-[#6674A3] mb-8">
            Najpouzdaniji oglasnik vozila u Crnoj Gori
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🔒",
                title: "Sigurno",
                desc: "Verifikovani prodavci i zaštita od prevare",
              },
              {
                icon: "⚡",
                title: "Brzo",
                desc: "Objavi oglas za manje od 5 minuta",
              },
              {
                icon: "🎯",
                title: "Precizno",
                desc: "Napredni filteri za brže pronalaženje",
              },
            ].map((f) => (
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
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
            Prodaješ vozilo?
          </h2>
          <p className="text-red-100 mb-6">
            Objavi oglas besplatno i dođi do kupca za kratko vrijeme
          </p>
          <button
            onClick={() => navigate("/ads/create")}
            className="bg-[#FFEA00] hover:bg-yellow-300 text-[#12142D] font-black px-10 py-3.5 rounded-xl text-lg transition shadow-lg"
          >
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
              <img
                src="/images/bijeli.png"
                alt="VozimeOglasi"
                className="h-24 w-auto"
              />
            </div>
            <p className="text-[#6674A3] text-xs text-center">
              © {new Date().getFullYear()} VozimeOglasi – Oglasnik vozila za
              Crnu Goru
            </p>
            <div className="flex gap-4 text-xs text-[#6674A3]">
              <button className="hover:text-white transition">
                Uslovi korišćenja
              </button>
              <button className="hover:text-white transition">
                Privatnost
              </button>
              <button className="hover:text-white transition">Kontakt</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
