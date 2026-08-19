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
import RecentlyViewed from "../components/RecentlyViewed";
import LogoLoop from "../components/LogoLoop";
import { useMakesByCategory } from "../hooks/useMakes";

// ─── Kartica autoplaca u rotirajućoj listi (PREMIUM 2) ────────
function DealerLoopCard({ dealer, onClick }) {
  const [logoError, setLogoError] = useState(false);
  const showLogo = dealer.logo && !logoError;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3.5 bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg rounded-2xl px-5 py-4 transition-all duration-200 group"
      style={{ minWidth: 280, fontSize: "1rem", lineHeight: 1.45 }}
    >
      {showLogo ? (
        <img
          src={dealer.logo}
          alt={dealer.company_name}
          className="rounded-full object-cover flex-shrink-0 ring-1 ring-gray-100 bg-gray-50"
          style={{ height: 46, width: 46 }}
          onError={() => setLogoError(true)}
        />
      ) : (
        <div
          className="rounded-full bg-[#12142D] flex items-center justify-center flex-shrink-0"
          style={{ height: 46, width: 46 }}
        >
          <span className="text-white font-bold text-base">
            {dealer.company_name?.substring(0, 1)?.toUpperCase()}
          </span>
        </div>
      )}

      <div className="text-left min-w-0">
        <div className="flex items-center gap-2">
          <p
            className="text-[15px] font-bold text-[#12142D] group-hover:text-[#1B2B5A] truncate"
            style={{ fontFamily: "'Gomme Sans', sans-serif" }}
          >
            {dealer.company_name}
          </p>
          <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
            Pro
          </span>
        </div>
        {(dealer.address || dealer.city) && (
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {[dealer.address, dealer.city].filter(Boolean).join(", ")}
          </p>
        )}
        {dealer.phone && (
          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
            <svg
              className="w-3 h-3 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            {dealer.phone}
          </p>
        )}
      </div>
    </button>
  );
}

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
  const makeNames = Object.keys(byMake).sort((a, b) => a.localeCompare(b));

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
  const makes = useMakesByCategory("automobili");

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
    queryFn: () => axios.get("/cities").then((r) => r.data.data ?? r.data),
  });
  const cities = Array.isArray(citiesData) ? citiesData : [];

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
      params.set("tab", activeTab);
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
  const dealers =
     (dealersData?.data ?? []).filter((d) => d.premium_addon === "premium2");

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
          <div className="mb-8 text-center">
            <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-2">
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
                textAlign="center"
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
                textAlign="center"
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
              textAlign="center"
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
            className="max-w-5xl mx-auto rounded-2xl border border-white/20"
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
          <div className="mt-4 max-w-5xl mx-auto">
            <BorderGlow
              backgroundColor="#1a1f3a"
              borderRadius={16}
              glowColor="3 90 50"
              colors={["#FF0026", "#FFEA00", "#1B2B5A"]}
              glowRadius={30}
              glowIntensity={0.9}
              coneSpread={22}
              fillOpacity={0}
              className="rounded-2xl border border-white/20"
            >
              <div className="px-5 pt-5 pb-4">
                <p
                  style={{
                    fontFamily: "'Gomme Sans', sans-serif",
                    fontSize: "18px",
                    fontWeight: 300,
                    letterSpacing: "0.18em",
                    color: "rgba(255,255,255,0.65)",
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
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

          {/* ══ DILERI — rotirajuća lista PREMIUM 2 autoplaceva ══ */}
          {dealers.length > 0 && (
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
                  <LogoLoop
                    logos={dealers.map((d) => ({ dealer: d }))}
                    speed={40}
                    direction="left"
                    logoHeight={72}
                    gap={16}
                    hoverSpeed={0}
                    fadeOut
                    fadeOutColor="#ffffff"
                    ariaLabel="Premium autoplacevi"
                    renderItem={({ dealer }) => (
                      <DealerLoopCard
                        dealer={dealer}
                        onClick={() => navigate(`/users/${dealer.id}`)}
                      />
                    )}
                  />
                </div>
              </div>
            </section>
          )}

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

      {/* ══ CTA ══ */}
      <section className="bg-[#12142D] py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl border border-[#1B2B5A] bg-gradient-to-r from-[#1B2B5A]/60 to-[#12142D] px-8 py-10 md:px-12">
            <div
              className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#FF0026]/10 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                  Prodaješ vozilo?
                </h2>
                <p className="text-[#6674A3]">
                  Objavi oglas besplatno i dođi do kupca za kratko vrijeme
                </p>
              </div>
              <button
                onClick={() => navigate("/ads/create")}
                className="shrink-0 bg-white hover:bg-gray-100 text-[#12142D] font-bold px-8 py-3 rounded-full transition"
              >
                Objavi oglas besplatno
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="bg-[#12142D] border-t border-[#1B2B5A] py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            {/* Left: logo + social */}
            <div className="lg:w-64 shrink-0">
              <img
                src="/images/bijeli.png"
                alt="VozimeOglasi"
                className="h-16 w-auto mb-5"
              />
              <div className="flex items-center gap-4 text-[#6674A3]">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="hover:text-white transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.9 3.78-3.9 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="hover:text-white transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="hover:text-white transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.88 5.88 0 0 0-2.13 1.38A5.88 5.88 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13a5.88 5.88 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.88 5.88 0 0 0 2.13-1.38 5.88 5.88 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.88 5.88 0 0 0-1.38-2.13A5.88 5.88 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84Zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="TikTok"
                  className="hover:text-white transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.9 2.9 0 1 1-2.89-2.9c.3 0 .59.05.86.13V9.4a6.33 6.33 0 0 0-.86-.06 6.34 6.34 0 1 0 6.34 6.33V8.69a8.22 8.22 0 0 0 4.77 1.52V6.77c-.34 0-.67-.03-1-.08Z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right: link columns */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-white font-bold text-sm mb-4">
                  Kompanija
                </h4>
                <ul className="space-y-3 text-sm text-[#6674A3]">
                  <li>
                    <button className="hover:text-white transition">
                      O nama
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/pitanja")}
                      className="hover:text-white transition"
                    >
                      Pitanja i odgovori
                    </button>
                  </li>
                  <li>
                    <button className="hover:text-white transition">
                      Kontakt
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-4">Pravno</h4>
                <ul className="space-y-3 text-sm text-[#6674A3]">
                  <li>
                    <button
                      onClick={() => navigate("/uslovi")}
                      className="hover:text-white transition"
                    >
                      Uslovi korišćenja
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/privatnost")}
                      className="hover:text-white transition"
                    >
                      Privatnost
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-4">Prodavci</h4>
                <ul className="space-y-3 text-sm text-[#6674A3]">
                  <li>
                    <button
                      onClick={() => navigate("/login")}
                      className="hover:text-white transition"
                    >
                      Prijava
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/register/dealer")}
                      className="hover:text-white transition"
                    >
                      Registracija
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/autoplaci")}
                      className="hover:text-white transition"
                    >
                      Auto placevi
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-4">
                  Aplikacija
                </h4>
                <ul className="space-y-3 text-sm text-[#6674A3]">
                  <li>
                    <button className="flex items-center gap-2 hover:text-white transition">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
                      </svg>
                      VozimeOglasi iOS
                    </button>
                  </li>
                  <li>
                    <button className="flex items-center gap-2 hover:text-white transition">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.52 15.81a1.04 1.04 0 1 1 0-2.08 1.04 1.04 0 0 1 0 2.08m-11.04 0a1.04 1.04 0 1 1 0-2.08 1.04 1.04 0 0 1 0 2.08m11.41-6.28 2.08-3.6a.43.43 0 1 0-.75-.43l-2.1 3.64a12.72 12.72 0 0 0-10.24 0L4.78 5.5a.43.43 0 1 0-.75.43l2.08 3.6C2.53 11.47.1 15.09-.26 19.33h24.52c-.36-4.24-2.79-7.86-6.37-9.8" />
                      </svg>
                      VozimeOglasi Android
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-[#1B2B5A] mt-10 pt-6">
            <p className="text-[#6674A3] text-xs text-center">
              © {new Date().getFullYear()} VozimeOglasi – Oglasnik vozila za
              Crnu Goru
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
