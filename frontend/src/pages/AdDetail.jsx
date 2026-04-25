import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import useAuthStore from "../store/authStore";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AdCard from "../components/AdCard";

export default function AdDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeImg, setActiveImg] = useState(0);

  const { data: ad, isLoading } = useQuery({
    queryKey: ["ad", slug],
    queryFn: () => api.get(`/ads/${slug}`).then((r) => r.data.data),
  });

  // Slični oglasi — ista marka, isključi trenutni
  const { data: similarData } = useQuery({
    queryKey: ["similar-ads", ad?.make?.id, ad?.id],
    queryFn: () => api.get(`/ads?make_id=${ad.make.id}&per_page=4`).then((r) => r.data),
    enabled: !!ad?.make?.id,
  });
  const similarAds = (similarData?.data ?? []).filter((a) => a.id !== ad?.id).slice(0, 3);

  // Sačuvaj u recently viewed
  useEffect(() => {
    if (!ad) return;
    const key = 'recently_viewed';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = existing.filter(item => item.id !== ad.id);
    const updated = [
      {
        id: ad.id,
        title: ad.title,
        price: ad.price,
        primary_image: ad.primary_image,
        year: ad.year,
        mileage: ad.mileage,
        fuel_type: ad.fuel_type,
        slug: ad.slug,
        city: ad.city,
      },
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
        <Link to="/search" className="mt-4 inline-block text-[#FF0026] font-semibold">
          Nazad na oglase
        </Link>
      </div>
    );

  const images = ad.images?.length
    ? ad.images
    : [{ url: "https://placehold.co/800x500/e5e7eb/9ca3af?text=Nema+slike" }];

  const getImageSrc = (img) => {
    if (!img?.url) return "https://placehold.co/800x500/e5e7eb/9ca3af?text=Nema+slike";
    if (img.url.startsWith("http")) return img.url;
    return `http://localhost:8000${img.url}`;
  };

  const specs = [
    { label: "Godište",        value: ad.year },
    { label: "Kilometraža",    value: ad.mileage ? `${Number(ad.mileage).toLocaleString()} km` : null },
    { label: "Gorivo",         value: ad.fuel_type },
    { label: "Mjenjač",        value: ad.transmission },
    { label: "Karoserija",     value: ad.body_type },
    { label: "Snaga",          value: ad.power_kw ? `${ad.power_kw} kW` : null },
    { label: "Kubikaža",       value: ad.engine_cc ? `${ad.engine_cc} cc` : null },
    { label: "Pogon",          value: ad.drive_type },
    { label: "Vrata",          value: ad.doors },
    { label: "Sjedišta",       value: ad.seats },
    { label: "Boja (ext)",     value: ad.color_exterior },
    { label: "Boja (int)",     value: ad.color_interior },
    { label: "Stanje",         value: ad.condition },
    { label: "Oštećenje",      value: ad.damage },
    { label: "Emisija",        value: ad.emission_class?.toUpperCase() },
    { label: "Vlasnici",       value: ad.owners_count },
    { label: "Registrovan do", value: ad.registered_until },
    { label: "VIN",            value: ad.vin },
  ].filter((s) => s.value != null && s.value !== "");

  const boolSpecs = [
    { label: "Servisna knjiga",  show: ad.has_service_book },
    { label: "Garancija",        show: ad.has_warranty },
    { label: "Prihvata zamjenu", show: ad.accepts_exchange },
    { label: "Uvoz",             show: ad.import },
  ].filter((s) => s.show);

  const hasEquipment =
    ad.equipment &&
    typeof ad.equipment === "object" &&
    Object.keys(ad.equipment).length > 0;

  const isOwner = user?.id === ad.seller?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-4 flex items-center gap-2">
          <Link to="/" className="hover:text-[#FF0026]">Početna</Link>
          <span>/</span>
          <Link to="/search" className="hover:text-[#FF0026]">Oglasi</Link>
          <span>/</span>
          <span className="text-gray-600 truncate">{ad.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ══ LIJEVA KOLONA ══ */}
          <div className="lg:col-span-2 space-y-5">

            {/* Galerija */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative bg-gray-100 aspect-video">
                <img
                  src={getImageSrc(images[activeImg])}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/800x500/e5e7eb/9ca3af?text=Nema+slike";
                  }}
                />
                {ad.featured && (
                  <span className="absolute top-4 left-4 bg-[#FFEA00] text-[#12142D] text-xs font-black px-3 py-1 rounded-full">
                    ★ ISTAKNUTO
                  </span>
                )}
                {ad.condition === 'novo' && (
                  <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    NOVO
                  </span>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg(p => Math.max(0, p - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition"
                    >‹</button>
                    <button
                      onClick={() => setActiveImg(p => Math.min(images.length - 1, p + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition"
                    >›</button>
                    <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {activeImg + 1} / {images.length}
                    </span>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition
                        ${activeImg === i ? "border-[#FF0026]" : "border-transparent opacity-60 hover:opacity-100"}`}
                    >
                      <img
                        src={getImageSrc(img)}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "https://placehold.co/80x56/e5e7eb/9ca3af?text=x"; }}
                      />
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
                    <span className="inline-block bg-[#FFEA00] text-[#12142D] text-xs font-black px-2 py-0.5 rounded mb-2">
                      ISTAKNUTO
                    </span>
                  )}
                  <h1 className="text-2xl font-black text-[#12142D]">{ad.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-400">
                    <span>📍 {ad.city?.name}</span>
                    <span>👁 {ad.views_count} pregleda</span>
                    <span>📅 {ad.created_ago}</span>
                    {ad.ad_code && (
                      <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs font-mono">
                        #{ad.ad_code}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-3xl font-black text-[#FF0026]">
                    {Number(ad.price).toLocaleString()} €
                  </p>
                  {ad.price_negotiable && (
                    <p className="text-sm text-green-600 font-semibold">po dogovoru</p>
                  )}
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
                  <span key={i} className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-lg capitalize">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Specifikacije */}
            {specs.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#12142D] mb-4">Specifikacije</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {specs.map((s, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
                      <p className="font-semibold text-[#12142D] text-sm capitalize">{s.value}</p>
                    </div>
                  ))}
                </div>
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

            {/* Oprema */}
            {hasEquipment && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#12142D] mb-4">Oprema</h2>
                {Object.entries(ad.equipment).map(([category, items]) =>
                  Array.isArray(items) && items.length > 0 ? (
                    <div key={category} className="mb-4 last:mb-0">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{category}</p>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item, i) => (
                          <span key={i} className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null
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

            {/* Prijavi oglas */}
            {user && !isOwner && (
              <div className="text-right">
                <button
                  onClick={() => reportMutation.mutate("neprimjereno")}
                  className="text-xs text-gray-400 hover:text-red-500 transition"
                >
                  Prijavi oglas
                </button>
              </div>
            )}

            {/* Slični oglasi */}
            {similarAds.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 bg-[#FF0026] rounded-full" />
                  <h2 className="text-lg font-black text-[#12142D]">Slični oglasi</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {similarAds.map(a => <AdCard key={a.id} ad={a} />)}
                </div>
              </div>
            )}
          </div>

          {/* ══ DESNA KOLONA ══ */}
          <div className="space-y-4">

            {/* Kontakt prodavca */}
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Kontakt prodavca
              </h3>

              <Link to={`/users/${ad.seller?.id}`} className="flex items-center gap-3 group mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                  {ad.seller?.avatar ? (
                    <img src={ad.seller.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-gray-400">{ad.seller?.name?.[0]}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#12142D] group-hover:text-[#FF0026] transition">
                      {ad.seller?.company?.name ?? ad.seller?.name}
                    </p>
                    {ad.seller?.premium_seller && (
                      <span className="bg-[#1B2B5A] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                        ⭐ PREMIUM
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 capitalize">
                    {ad.seller?.role === 'dealer' ? 'Auto plac / Diler' : 'Privatni prodavac'}
                  </p>
                  <p className="text-xs text-gray-400">Član od {ad.seller?.member_since}.</p>
                </div>
              </Link>

              {ad.seller?.company?.logo && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <img
                    src={ad.seller.company.logo}
                    alt={ad.seller.company.name}
                    className="h-12 object-contain"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              {ad.seller?.phone && (
                <a
                  href={`tel:${ad.seller.phone}`}
                  className="flex items-center gap-2 w-full bg-[#12142D] hover:bg-[#1B2B5A] text-white font-bold py-3 rounded-xl transition text-sm mb-2 justify-center"
                >
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
                      : "border-gray-200 text-gray-600 hover:border-[#FF0026] hover:text-[#FF0026]"}`}
                >
                  {ad.is_favorited ? "❤ U omiljenim" : "♡ Sačuvaj oglas"}
                </button>
              )}

              <button
                onClick={() => navigate(`/users/${ad.seller?.id}`)}
                className="w-full border border-gray-200 hover:border-[#12142D] text-gray-600 hover:text-[#12142D] font-semibold py-2.5 rounded-xl transition text-sm"
              >
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
                      className="text-xs text-[#FF0026] hover:underline block">
                      🌐 Website
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Lokacija */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Lokacija</h3>
              <p className="font-semibold text-[#12142D]">📍 {ad.city?.name}</p>
              {ad.city?.region && <p className="text-xs text-gray-400 mt-0.5">{ad.city.region}</p>}
            </div>

            {/* Info o vozilu */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Vozilo</h3>
              <div className="space-y-2">
                {[
                  { label: 'Marka',      value: ad.make?.name },
                  { label: 'Model',      value: ad.model?.name },
                  { label: 'Kategorija', value: ad.category?.name },
                  { label: 'Šifra',      value: ad.ad_code },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{row.label}</span>
                    <span className="font-semibold font-mono text-[#12142D]">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vlasnik */}
            {isOwner && (
              <div className="bg-[#FFEA00] rounded-2xl p-4">
                <p className="text-xs font-bold text-[#12142D] mb-2">Ovo je vaš oglas</p>
                <button
                  onClick={() => navigate(`/dashboard/ads/${ad.slug}/edit`)}
                  className="w-full bg-[#12142D] text-white font-bold py-2.5 rounded-xl text-sm transition hover:bg-[#1B2B5A]"
                >
                  Uredi oglas
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}