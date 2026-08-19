import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import useAuthStore from "../store/authStore";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import AdCard from "../components/AdCard";
import ShareButtons from "../components/ShareButtons";
import SidebarBanner from "../components/SidebarBanner";

// ── Leaflet mapa (lazy, da ne puca SSR) ─────────────────────────
function CityMap({ lat, lng, cityName }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!lat || !lng || instanceRef.current) return;
    import("leaflet").then((L) => {
      import("leaflet/dist/leaflet.css");
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([lat, lng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);
      L.marker([lat, lng]).addTo(map).bindPopup(cityName).openPopup();
      instanceRef.current = map;
    });
    return () => {
      if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; }
    };
  }, [lat, lng, cityName]);

  return <div ref={mapRef} style={{ height: 260, borderRadius: 16, overflow: "hidden" }} />;
}

// ── Ikonica check ────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-[#FF0026] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function AdDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeImg, setActiveImg] = useState(0);
  const [showAllEquip, setShowAllEquip] = useState(false);

  const { data: ad, isLoading } = useQuery({
    queryKey: ["ad", slug],
    queryFn: () => api.get(`/ads/${slug}`).then((r) => r.data.data),
  });

  // Oglasi prodavca (samo za dealere)
  const isSellerDealer = !!ad?.seller?.id && ad?.seller?.role === "dealer";
  const { data: sellerAdsData } = useQuery({
    queryKey: ["seller-ads", ad?.seller?.id],
    queryFn: () => api.get(`/ads?user_id=${ad.seller.id}&per_page=13`).then((r) => r.data),
    enabled: isSellerDealer,
  });
  const sellerAds = (sellerAdsData?.data ?? []).filter((a) => a.id !== ad?.id).slice(0, 12);

  // Slični oglasi po cijeni (±1000€) — samo kad znamo da nema (ili nece biti) oglasa istog prodavca
  const { data: similarData } = useQuery({
    queryKey: ["similar-price", ad?.id, ad?.price],
    queryFn: () => {
      const from = Math.max(0, Number(ad.price) - 1000);
      const to = Number(ad.price) + 1000;
      return api.get(`/ads?price_from=${from}&price_to=${to}&per_page=13`).then((r) => r.data);
    },
    enabled: !!ad?.price && (!isSellerDealer || (sellerAdsData !== undefined && sellerAds.length === 0)),
  });
  const similarAds = (similarData?.data ?? []).filter((a) => a.id !== ad?.id).slice(0, 12);
  const similarTotal = similarData?.meta?.total ?? 0;

  // Recently viewed
  useEffect(() => {
    if (!ad) return;
    const key = "recently_viewed";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const filtered = existing.filter((item) => item.id !== ad.id);
    const updated = [
      { id: ad.id, title: ad.title, price: ad.price, primary_image: ad.primary_image,
        year: ad.year, mileage: ad.mileage, fuel_type: ad.fuel_type, slug: ad.slug, city: ad.city },
      ...filtered,
    ].slice(0, 8);
    localStorage.setItem(key, JSON.stringify(updated));
  }, [ad?.id]);

  const favMutation = useMutation({
    mutationFn: () => api.post(`/favorites/${ad.id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["ad", slug]);
      toast.success(res.data.favorited ? "Dodano u omiljene" : "Uklonjeno iz omiljenih");
    },
    onError: () => toast.error("Prijavite se da biste sačuvali oglas"),
  });

  const reportMutation = useMutation({
    mutationFn: (reason) => api.post(`/ads/${ad.id}/report`, { reason }),
    onSuccess: () => toast.success("Oglas prijavljen"),
  });

  if (isLoading)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-96 bg-gray-200 rounded-2xl mb-6" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-6 bg-gray-200 rounded w-1/4" />
      </div>
    );

  if (!ad)
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl text-gray-400">Oglas nije pronađen</p>
        <Link to="/search" className="mt-4 inline-block text-[#FF0026] font-semibold">Nazad na oglase</Link>
      </div>
    );

  const images = ad.images?.length
    ? ad.images
    : [{ url: null }];

  const getImageSrc = (img) => {
    if (!img?.url) return null;
    if (img.url.startsWith("http")) return img.url;
    return `http://localhost:8000${img.url}`;
  };

  const isOwner = user?.id === ad.seller?.id;
  const isDealer = ad.seller?.role === "dealer";

  // Specifikacije — sve dostupne
  const kwToPs = (kw) => kw ? Math.round(kw * 1.3596) : null;

  const specs = [
    { label: "Godište",        value: ad.year },
    { label: "Kilometraža",    value: ad.mileage ? `${Number(ad.mileage).toLocaleString()} km` : null },
    { label: "Gorivo",         value: ad.fuel_type },
    { label: "Mjenjač",        value: ad.transmission },
    { label: "Karoserija",     value: ad.body_type },
    { label: "Snaga",          value: ad.power_kw ? `${ad.power_kw} kW (${kwToPs(ad.power_kw)} KS)` : null },
    { label: "Kubikaža",       value: ad.engine_cc ? `${Number(ad.engine_cc).toLocaleString()} cm³` : null },
    { label: "Pogon",          value: ad.drive_type },
    { label: "Broj vrata",     value: ad.doors },
    { label: "Broj sjedišta",  value: ad.seats },
    { label: "Boja eksterijera", value: ad.color_exterior },
    { label: "Boja interijera",  value: ad.color_interior },
    { label: "Stanje",         value: ad.condition },
    { label: "Oštećenje",      value: ad.damage },
    { label: "Emisiona klasa", value: ad.emission_class?.toUpperCase() },
    { label: "Broj vlasnika",  value: ad.owners_count },
    { label: "Registrovan do", value: ad.registered_until },
    { label: "VIN",            value: ad.vin },
  ].filter((s) => s.value != null && s.value !== "");

  const HISTORY_LABELS = {
    prvi_vlasnik: "Prvi vlasnik",
    kupljen_nov_cg: "Kupljen nov u Crnoj Gori",
    servisna_knjiga: "Servisna knjiga",
    restauriran: "Restauriran",
    oldtimer: "Oldtimer",
    u_garanciji: "Garancija",
    garaziran: "Garažiran",
    prilagodjen_invalidima: "Prilagođen invalidima",
    tuning: "Tuning",
  };

  const boolSpecs = [
    { label: "Servisna knjiga",  show: ad.has_service_book },
    { label: "Garancija",        show: ad.has_warranty },
    { label: "Prihvata zamjenu", show: ad.accepts_exchange },
    { label: "Uvoz",             show: ad.import },
    { label: "Kuka za prikolicu" + (ad.trailer_coupling ? ` (${ad.trailer_coupling})` : ""), show: !!ad.trailer_coupling },
    ...(ad.vehicle_history ?? []).map((v) => ({ label: HISTORY_LABELS[v] ?? v, show: true })),
  ].filter((s) => s.show)
   // ukloni duplikate (npr. servisna knjiga i kao boolean i u istoriji)
   .filter((s, i, arr) => arr.findIndex((x) => x.label === s.label) === i);

  // Oprema — flatten sve kategorije u jednu listu (abecedno)
  const allEquipment = ad.equipment && typeof ad.equipment === "object"
    ? Object.values(ad.equipment).flat().sort()
    : [];
  const equipmentByCategory = ad.equipment && typeof ad.equipment === "object"
    ? Object.entries(ad.equipment).filter(([, items]) => Array.isArray(items) && items.length > 0)
    : [];
  const EQUIP_SHOW_LIMIT = 24;
  const equipToShow = showAllEquip ? allEquipment : allEquipment.slice(0, EQUIP_SHOW_LIMIT);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-4 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-[#FF0026]">Početna</Link>
          <span>/</span>
          <Link to="/search" className="hover:text-[#FF0026]">Oglasi</Link>
          {ad.make && <><span>/</span><Link to={`/search?make_id=${ad.make.id}`} className="hover:text-[#FF0026]">{ad.make.name}</Link></>}
          {ad.model && <><span>/</span><span className="text-gray-500">{ad.model.name}</span></>}
          <span>/</span>
          <span className="text-gray-600 truncate max-w-xs">{ad.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ══ LIJEVA KOLONA ══ */}
          <div className="lg:col-span-2 space-y-5">

            {/* Galerija */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative bg-gray-100 aspect-video">
                {getImageSrc(images[activeImg]) ? (
                  <img
                    src={getImageSrc(images[activeImg])}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://placehold.co/800x500/e5e7eb/9ca3af?text=Nema+slike"; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-2xl font-bold">Nema slike</span>
                  </div>
                )}
                {ad.featured && (
                  <span className="absolute top-4 left-4 bg-[#FFEA00] text-[#12142D] text-xs font-black px-3 py-1 rounded-full">★ ISTAKNUTO</span>
                )}
                {ad.condition === "novo" && (
                  <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">NOVO</span>
                )}
                {images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImg((p) => Math.max(0, p - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition text-xl">‹</button>
                    <button onClick={() => setActiveImg((p) => Math.min(images.length - 1, p + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition text-xl">›</button>
                    <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {activeImg + 1} / {images.length}
                    </span>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition
                        ${activeImg === i ? "border-[#FF0026]" : "border-transparent opacity-60 hover:opacity-100"}`}>
                      {getImageSrc(img) ? (
                        <img src={getImageSrc(img)} className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = "https://placehold.co/80x56/e5e7eb/9ca3af?text=x"; }} />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Naslov + cijena */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  {ad.featured && (
                    <span className="inline-block bg-[#FFEA00] text-[#12142D] text-xs font-black px-2 py-0.5 rounded mb-2">ISTAKNUTO</span>
                  )}
                  <h1 className="text-2xl font-black text-[#12142D]">{ad.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-400">
                    <span>📍 {ad.city?.name}</span>
                    <span>👁 {ad.views_count} pregleda</span>
                    <span>📅 {ad.created_ago}</span>
                    {ad.ad_code && (
                      <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs font-mono">#{ad.ad_code}</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-3xl font-black text-[#FF0026]">{Number(ad.price).toLocaleString()} €</p>
                  {ad.price_negotiable && <p className="text-sm text-green-600 font-semibold">po dogovoru</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                {[
                  ad.year,
                  ad.mileage ? `${Number(ad.mileage).toLocaleString()} km` : null,
                  ad.fuel_type,
                  ad.transmission,
                  ad.body_type,
                  ad.power_kw ? `${ad.power_kw} kW` : null,
                ].filter(Boolean).map((s, i) => (
                  <span key={i} className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-lg capitalize">{s}</span>
                ))}
              </div>
            </div>

            {/* Tehnički podaci — tabela */}
            {specs.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#12142D] mb-4">Tehnički podaci</h2>
                <table className="w-full text-sm">
                  <tbody>
                    {specs.map((s, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="py-2.5 px-3 text-gray-500 w-1/2 rounded-l-lg">{s.label}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#12142D] capitalize rounded-r-lg">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {boolSpecs.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                    {boolSpecs.map((s, i) => (
                      <span key={i} className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1">
                        ✓ {s.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Oprema — grid sa checkmark */}
            {allEquipment.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#12142D] mb-4">Oprema</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5">
                  {equipToShow.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckIcon />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                {allEquipment.length > EQUIP_SHOW_LIMIT && (
                  <button
                    onClick={() => setShowAllEquip((p) => !p)}
                    className="mt-4 text-sm text-[#FF0026] hover:underline font-semibold"
                  >
                    {showAllEquip ? "Prikaži manje ▲" : `Prikaži sve (${allEquipment.length}) ▼`}
                  </button>
                )}
              </div>
            )}

            {/* Opis */}
            {ad.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#12142D] mb-4">Opis</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{ad.description}</p>
              </div>
            )}

            {/* Mapa / lokacija */}
            {ad.city && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#12142D] mb-4">Lokacija vozila</h2>
                {ad.city.latitude && ad.city.longitude && (
                  <CityMap lat={ad.city.latitude} lng={ad.city.longitude} cityName={ad.city.name} />
                )}
                <p className="text-sm text-gray-500 mt-3 flex items-center gap-1.5">
                  <span>📍</span>
                  <span>{ad.city.name}{ad.city.region ? `, ${ad.city.region}` : ""}</span>
                </p>
              </div>
            )}

            {/* Prijavi oglas */}
            {user && !isOwner && (
              <div className="text-right">
                <button onClick={() => reportMutation.mutate("neprimjereno")}
                  className="text-xs text-gray-400 hover:text-red-500 transition">
                  Prijavi oglas
                </button>
              </div>
            )}

            {/* Oglasi prodavca (dealer) */}
            {isDealer && sellerAds.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-[#FF0026] rounded-full" />
                    <h2 className="text-lg font-black text-[#12142D]">
                      Ostala vozila ovog prodavca
                    </h2>
                  </div>
                  <Link
                    to={`/users/${ad.seller.id}`}
                    className="text-sm text-[#FF0026] hover:underline font-semibold"
                  >
                    Svi oglasi →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {sellerAds.map((a) => <AdCard key={a.id} ad={a} />)}
                </div>
              </div>
            )}

            {/* Slični oglasi po cijeni */}
            {similarAds.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-[#1B2B5A] rounded-full" />
                    <h2 className="text-lg font-black text-[#12142D]">Slična vozila po cijeni</h2>
                  </div>
                  {similarTotal > 12 && (
                    <Link
                      to={`/search?price_from=${Math.max(0, Number(ad.price) - 1000)}&price_to=${Number(ad.price) + 1000}`}
                      className="text-sm text-[#FF0026] hover:underline font-semibold"
                    >
                      Pogledaj slična ({similarTotal}) →
                    </Link>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {similarAds.map((a) => <AdCard key={a.id} ad={a} />)}
                </div>
              </div>
            )}
          </div>

          {/* ══ DESNA KOLONA ══ */}
          <div className="space-y-4">

            {/* Kontakt prodavca */}
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Kontakt prodavca</h3>

              <Link to={`/users/${ad.seller?.id}`} className="flex items-center gap-3 group mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                  {ad.seller?.avatar ? (
                    <img src={ad.seller.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-gray-400">{ad.seller?.name?.[0]}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-[#12142D] group-hover:text-[#FF0026] transition">
                      {ad.seller?.company?.name ?? ad.seller?.name}
                    </p>
                    {ad.seller?.premium_seller && (
                      <span className="bg-[#1B2B5A] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">⭐ PREMIUM</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 capitalize">
                    {isDealer ? "Auto Plac / Diler" : "Privatni prodavac"}
                  </p>
                  <p className="text-xs text-gray-400">Član od {ad.seller?.member_since}.</p>
                </div>
              </Link>

              {ad.seller?.company?.logo && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <img src={ad.seller.company.logo} alt={ad.seller.company.name}
                    className="h-12 object-contain"
                    onError={(e) => { e.target.style.display = "none"; }} />
                </div>
              )}

              {ad.seller?.phone && (
                <a href={`tel:${ad.seller.phone}`}
                  className="flex items-center gap-2 w-full bg-[#12142D] hover:bg-[#1B2B5A] text-white font-bold py-3 rounded-xl transition text-sm mb-2 justify-center">
                  📞 {ad.seller.phone}
                </a>
              )}

              {!isOwner && (
                <button
                  onClick={() => {
                    if (!user) { toast.error("Prijavite se da biste sačuvali oglas"); return; }
                    favMutation.mutate();
                  }}
                  className={`w-full font-bold py-3 rounded-xl transition text-sm border-2 mb-2
                    ${ad.is_favorited
                      ? "border-[#FF0026] text-[#FF0026] bg-red-50"
                      : "border-gray-200 text-gray-600 hover:border-[#FF0026] hover:text-[#FF0026]"}`}>
                  {ad.is_favorited ? "❤ U omiljenim" : "♡ Sačuvaj oglas"}
                </button>
              )}

              <div className="mb-2">
                <ShareButtons title={ad.title} />
              </div>

              <button onClick={() => navigate(`/users/${ad.seller?.id}`)}
                className="w-full border border-gray-200 hover:border-[#12142D] text-gray-600 hover:text-[#12142D] font-semibold py-2.5 rounded-xl transition text-sm">
                Svi oglasi ovog prodavca →
              </button>

              {ad.seller?.company && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
                  {ad.seller.company.working_hours && (
                    <p className="text-xs text-gray-500">🕐 {ad.seller.company.working_hours}</p>
                  )}
                  {ad.seller.company.address && (
                    <p className="text-xs text-gray-500">📍 {ad.seller.company.address}</p>
                  )}
                  {ad.seller.company.website && (
                    <a href={ad.seller.company.website} target="_blank" rel="noreferrer"
                      className="text-xs text-[#FF0026] hover:underline block">🌐 Website</a>
                  )}
                </div>
              )}
            </div>

            {/* Info o vozilu */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Vozilo</h3>
              <div className="space-y-2">
                {[
                  { label: "Marka",      value: ad.make?.name },
                  { label: "Model",      value: ad.model?.name },
                  { label: "Kategorija", value: ad.category?.name },
                  { label: "Šifra",      value: ad.ad_code },
                ].filter((r) => r.value).map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{row.label}</span>
                    <span className="font-semibold text-[#12142D]">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vlasnik */}
            {isOwner && (
              <div className="bg-[#FFEA00] rounded-2xl p-4">
                <p className="text-xs font-bold text-[#12142D] mb-2">Ovo je vaš oglas</p>
                <button onClick={() => navigate(`/dashboard/ads/${ad.slug}/edit`)}
                  className="w-full bg-[#12142D] text-white font-bold py-2.5 rounded-xl text-sm transition hover:bg-[#1B2B5A]">
                  Uredi oglas
                </button>
              </div>
            )}

            {/* Reklame */}
            <SidebarBanner />
          </div>
        </div>
      </div>
    </div>
  );
}