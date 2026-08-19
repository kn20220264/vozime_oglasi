import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "../api/axios";

const CATEGORIES = [
  {
    id: null,
    label: "Sve kategorije",
    icon: <img src="/src/assets/icons/auto gray icon.png" alt="" className="w-5 h-5 object-contain brightness-0 invert" />,
    iconInactive: <img src="/src/assets/icons/auto gray icon.png" alt="" className="w-5 h-5 object-contain" />,
  },
  {
    id: 1,
    label: "Automobili",
    icon: <img src="/src/assets/icons/auto gray icon.png" alt="Auto" className="w-5 h-5 object-contain brightness-0 invert" />,
    iconInactive: <img src="/src/assets/icons/auto gray icon.png" alt="Auto" className="w-5 h-5 object-contain" />,
  },
  {
    id: 2,
    label: "Motocikli",
    icon: <img src="/src/assets/icons/motor gray icon.png" alt="Motori" className="w-5 h-5 object-contain brightness-0 invert" />,
    iconInactive: <img src="/src/assets/icons/motor gray icon.png" alt="Motori" className="w-5 h-5 object-contain" />,
  },
  {
    id: 3,
    label: "Nautika",
    icon: <img src="/src/assets/icons/nautika gray icon.png" alt="Nautika" className="w-5 h-5 object-contain brightness-0 invert" />,
    iconInactive: <img src="/src/assets/icons/nautika gray icon.png" alt="Nautika" className="w-5 h-5 object-contain" />,
  },
  {
    id: 4,
    label: "Transport",
    icon: <img src="/src/assets/icons/transport gray icon.png" alt="Transport" className="w-5 h-5 object-contain brightness-0 invert" />,
    iconInactive: <img src="/src/assets/icons/transport gray icon.png" alt="Transport" className="w-5 h-5 object-contain" />,
  },
];

function getInitials(name = "") {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function hueFromName(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

const PinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

function premiumOrder(d) {
  if (d.premium_addon === "premium2") return 0;
  if (d.premium_addon === "premium1") return 1;
  return 2;
}

export default function Dealers() {
  const [categoryId, setCategoryId]           = useState(null);
  const [cityId, setCityId]                   = useState("");
  const [search, setSearch]                   = useState("");
  const [selectedBrands, setSelectedBrands]   = useState([]);
  const [showBrandFilter, setShowBrandFilter] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["dealers"],
    queryFn: () => axios.get("/dealers").then((r) => r.data),
    staleTime: 0,
  });

  const { data: citiesData } = useQuery({
    queryKey: ["cities"],
    queryFn: () => axios.get("/cities").then((r) => r.data.data ?? r.data),
  });

  const { data: makesData } = useQuery({
    queryKey: ["makes"],
    queryFn: () => axios.get("/makes").then((r) => r.data.data ?? r.data),
  });

  const allDealers = data?.data ?? [];
  const cities     = citiesData?.data ?? citiesData ?? [];
  const makes      = makesData?.data ?? makesData ?? [];

  const filtered = useMemo(() => {
    return allDealers
      .filter((d) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          if (
            !(d.company_name || "").toLowerCase().includes(q) &&
            !(d.city || "").toLowerCase().includes(q)
          ) return false;
        }
        if (cityId && d.city_id !== parseInt(cityId)) return false;
        if (categoryId && !d.category_ids?.includes(categoryId)) return false;
        if (selectedBrands.length > 0) {
          const dealerBrandIds = (d.brands_represented || []).map((b) => b.id);
          if (!selectedBrands.some((bid) => dealerBrandIds.includes(bid))) return false;
        }
        return true;
      })
      .sort((a, b) => premiumOrder(a) - premiumOrder(b));
  }, [allDealers, search, cityId, categoryId, selectedBrands]);

  const toggleBrand = (id) =>
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );

  return (
    <div className="min-h-screen bg-[#f0f2f5]" style={{ fontFamily: "'Gomme Sans', sans-serif" }}>

      {/* Header */}
      <div className="bg-[#12142D] py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-black text-white mb-1">Auto Placevi & Dileri</h1>
          <p className="text-white/60 text-sm">
            Pronađite ovlašćene auto placeve i zastupnike brendova u Crnoj Gori
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Kategorije */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const isActive = categoryId === cat.id;
            return (
              <button
                key={cat.id ?? "all"}
                onClick={() => setCategoryId(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition flex-shrink-0 ${
                  isActive
                    ? "bg-[#FF0026] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {isActive ? cat.icon : cat.iconInactive}
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Filteri */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pretraži po imenu ili gradu..."
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026]"
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <select
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] min-w-[160px]"
          >
            <option value="">Svi gradovi</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="relative">
            <button
              onClick={() => setShowBrandFilter((p) => !p)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${
                selectedBrands.length > 0
                  ? "bg-[#FF0026] text-white border-[#FF0026]"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Brendovi
              {selectedBrands.length > 0 && (
                <span className="bg-white text-[#FF0026] text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedBrands.length}
                </span>
              )}
            </button>

            {showBrandFilter && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4 w-72">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-[#12142D]">Filtriraj po brendu</p>
                  {selectedBrands.length > 0 && (
                    <button onClick={() => setSelectedBrands([])} className="text-xs text-[#FF0026] font-semibold">Očisti</button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {makes.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => toggleBrand(m.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        selectedBrands.includes(m.id)
                          ? "bg-[#FF0026] text-white border-[#FF0026]"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#FF0026]"
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowBrandFilter(false)}
                  className="w-full mt-3 py-2 bg-[#12142D] text-white text-xs font-bold rounded-xl"
                >
                  Primijeni
                </button>
              </div>
            )}
          </div>

          {(search || cityId || categoryId || selectedBrands.length > 0) && (
            <button
              onClick={() => { setSearch(""); setCityId(""); setCategoryId(null); setSelectedBrands([]); }}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 border border-gray-300 bg-white hover:bg-gray-50 transition"
            >
              Reset
            </button>
          )}
        </div>

        {/* Rezultati */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🏢</p>
            <p className="font-semibold">Nema pronađenih autoplaceva</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">{filtered.length} autoplaceva</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((dealer) => (
                <DealerCard key={dealer.id} dealer={dealer} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DealerCard({ dealer }) {
  const isPremium2 = dealer.premium_addon === "premium2";
  const isPremium1 = dealer.premium_addon === "premium1";
  const [imgError, setImgError] = useState(false);

  const initials = getInitials(dealer.company_name);
  const hue      = hueFromName(dealer.company_name);
  const showLogo = dealer.logo && !imgError;

  const bg     = `oklch(22% 0.07 ${hue})`;
  const accent = `oklch(32% 0.10 ${hue})`;
  const shadow = `oklch(14% 0.05 ${hue})`;

  return (
    <Link
      to={`/users/${dealer.id}`}
      className={`group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col ${
        isPremium2 ? "ring-2 ring-[#FF0026]" : isPremium1 ? "ring-2 ring-amber-400" : ""
      }`}
      style={{ fontFamily: "'Gomme Sans', sans-serif" }}
    >
      {/* Medija — 16/9 */}
      <div className="relative overflow-hidden rounded-t-2xl" style={{ aspectRatio: "16/9" }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${bg} 0%, ${shadow} 100%)` }} />
        <div className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent 0 18px, ${accent}33 18px 19px)` }} />

        <div className="absolute inset-0 flex items-center justify-center">
          {showLogo ? (
            <img
              src={dealer.logo}
              alt={dealer.company_name}
              className="w-20 h-20 object-contain rounded-2xl"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg"
              style={{ background: `oklch(40% 0.14 ${hue})` }}
            >
              {initials}
            </div>
          )}
        </div>

        {(isPremium2 || isPremium1) && (
          <span className={`absolute top-3 left-3 text-[10px] font-black px-2 py-1 rounded-lg shadow ${
            isPremium2 ? "bg-[#FF0026] text-white" : "bg-amber-500 text-white"
          }`}>
            ISTAKNUTO
          </span>
        )}

        {dealer.is_brand_representative && (
          <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded-lg border border-white/30">
            ZASTUPNIK
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="text-[#12142D] text-sm leading-snug line-clamp-2 group-hover:text-[#1B2B5A] transition-colors" style={{ fontWeight: 700 }}>
          {dealer.company_name}
        </h3>

        {dealer.city && (
          <p className="flex items-center gap-1 text-xs text-gray-400">
            <PinIcon /> {dealer.city}
          </p>
        )}

        {dealer.is_brand_representative && dealer.brands_represented?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            {dealer.brands_represented.slice(0, 4).map((brand) =>
              brand.logo ? (
                <img key={brand.id} src={brand.logo} alt={brand.name}
                  className="h-4 w-auto object-contain opacity-60"
                  onError={(e) => { e.target.style.display = "none"; }} />
              ) : (
                <span key={brand.id} className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  {brand.name}
                </span>
              )
            )}
            {dealer.brands_represented.length > 4 && (
              <span className="text-[10px] text-gray-400">+{dealer.brands_represented.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-[#FF0026] text-xl font-black leading-none">{dealer.ads_count}</span>
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">oglasa</span>
        </div>
        {dealer.phone && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `tel:${dealer.phone}`; }}
            className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-[#FF0026] transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {dealer.phone}
          </button>
        )}
      </div>
    </Link>
  );
}