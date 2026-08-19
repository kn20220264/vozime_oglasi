import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

// Poređenje dva oglasa side-by-side: /compare?ads=slug1,slug2
export default function Compare() {
  const [searchParams] = useSearchParams();
  const slugs = (searchParams.get("ads") || "").split(",").filter(Boolean).slice(0, 2);

  const { data: ad1, isLoading: l1 } = useQuery({
    queryKey: ["ad", slugs[0]],
    queryFn: () => api.get(`/ads/${slugs[0]}`).then((r) => r.data.data),
    enabled: !!slugs[0],
  });

  const { data: ad2, isLoading: l2 } = useQuery({
    queryKey: ["ad", slugs[1]],
    queryFn: () => api.get(`/ads/${slugs[1]}`).then((r) => r.data.data),
    enabled: !!slugs[1],
  });

  if (slugs.length < 2) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">⚖️</div>
        <h1 className="text-2xl font-black text-[#12142D] mb-2">Poređenje oglasa</h1>
        <p className="text-gray-500 mb-6">
          Odaberite dva oglasa iz liste "Oglasi koje pratim" i kliknite "Uporedi".
        </p>
        <Link to="/dashboard/favorites" className="inline-block bg-[#FF0026] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-red-700 transition text-sm">
          Idi na sačuvane oglase
        </Link>
      </div>
    );
  }

  if (l1 || l2) {
    return <div className="max-w-6xl mx-auto px-4 py-20 text-center text-gray-400">Učitavanje poređenja...</div>;
  }

  if (!ad1 || !ad2) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-xl text-gray-400">Jedan od oglasa nije pronađen.</p>
        <Link to="/dashboard/favorites" className="mt-4 inline-block text-[#FF0026] font-semibold">← Nazad</Link>
      </div>
    );
  }

  const kwToPs = (kw) => (kw ? Math.round(kw * 1.3596) : null);
  const imgSrc = (ad) => {
    const img = ad.images?.[0];
    if (!img?.url) return null;
    return img.url.startsWith("http") ? img.url : `http://localhost:8000${img.url}`;
  };

  const rows = [
    { label: "Cijena", fmt: (a) => (a.price != null ? `${Number(a.price).toLocaleString()} €` : "—"), highlight: true, better: "min", num: (a) => Number(a.price) },
    { label: "Godište", fmt: (a) => a.year ?? "—", better: "max", num: (a) => Number(a.year) },
    { label: "Kilometraža", fmt: (a) => (a.mileage != null ? `${Number(a.mileage).toLocaleString()} km` : "—"), better: "min", num: (a) => Number(a.mileage) },
    { label: "Gorivo", fmt: (a) => a.fuel_type ?? "—" },
    { label: "Mjenjač", fmt: (a) => a.transmission ?? "—" },
    { label: "Karoserija", fmt: (a) => a.body_type ?? "—" },
    { label: "Snaga", fmt: (a) => (a.power_kw ? `${a.power_kw} kW (${kwToPs(a.power_kw)} KS)` : "—"), better: "max", num: (a) => Number(a.power_kw) },
    { label: "Kubikaža", fmt: (a) => (a.engine_cc ? `${Number(a.engine_cc).toLocaleString()} cm³` : "—") },
    { label: "Pogon", fmt: (a) => a.drive_type ?? "—" },
    { label: "Vrata", fmt: (a) => a.doors ?? "—" },
    { label: "Sjedišta", fmt: (a) => a.seats ?? "—" },
    { label: "Boja", fmt: (a) => a.color_exterior ?? "—" },
    { label: "Stanje", fmt: (a) => a.condition ?? "—" },
    { label: "Oštećenje", fmt: (a) => a.damage ?? "—" },
    { label: "Emisiona klasa", fmt: (a) => a.emission_class?.toUpperCase() ?? "—" },
    { label: "Broj vlasnika", fmt: (a) => a.owners_count ?? "—", better: "min", num: (a) => Number(a.owners_count) },
    { label: "Grad", fmt: (a) => a.city?.name ?? "—" },
    { label: "Prodavac", fmt: (a) => a.seller?.name ?? "—" },
  ];

  // Ko je "bolji" za numeričke redove (zeleno)
  const winner = (row) => {
    if (!row.better || !row.num) return null;
    const v1 = row.num(ad1);
    const v2 = row.num(ad2);
    if (!Number.isFinite(v1) || !Number.isFinite(v2) || v1 === v2) return null;
    if (row.better === "min") return v1 < v2 ? 1 : 2;
    return v1 > v2 ? 1 : 2;
  };

  const AdHeader = ({ ad }) => (
    <div>
      <Link to={`/ads/${ad.slug}`} className="block rounded-xl overflow-hidden bg-gray-100 aspect-[4/3] mb-3">
        {imgSrc(ad) ? (
          <img src={imgSrc(ad)} alt={ad.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🚗</div>
        )}
      </Link>
      <Link to={`/ads/${ad.slug}`} className="font-black text-[#12142D] hover:text-[#FF0026] transition text-sm md:text-base line-clamp-2">
        {ad.title}
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-7 bg-[#FF0026] rounded-full" />
          <h1 className="text-2xl font-black text-[#12142D]">Poređenje oglasa</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header sa slikama */}
          <div className="grid grid-cols-[120px_1fr_1fr] md:grid-cols-[180px_1fr_1fr] gap-4 p-4 md:p-6 border-b border-gray-100">
            <div />
            <AdHeader ad={ad1} />
            <AdHeader ad={ad2} />
          </div>

          {/* Tabela specifikacija */}
          <div className="divide-y divide-gray-50">
            {rows.map((row) => {
              const win = winner(row);
              const v1 = row.fmt(ad1);
              const v2 = row.fmt(ad2);
              if (v1 === "—" && v2 === "—") return null;
              return (
                <div key={row.label} className="grid grid-cols-[120px_1fr_1fr] md:grid-cols-[180px_1fr_1fr] gap-4 px-4 md:px-6 py-3 hover:bg-gray-50">
                  <div className="text-xs md:text-sm text-gray-500 font-semibold">{row.label}</div>
                  <div className={`text-xs md:text-sm ${row.highlight ? "font-black text-[#FF0026] text-base" : "text-[#12142D] font-medium"} ${win === 1 ? "text-green-600 font-bold" : ""}`}>
                    {v1} {win === 1 && "✓"}
                  </div>
                  <div className={`text-xs md:text-sm ${row.highlight ? "font-black text-[#FF0026] text-base" : "text-[#12142D] font-medium"} ${win === 2 ? "text-green-600 font-bold" : ""}`}>
                    {v2} {win === 2 && "✓"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="grid grid-cols-[120px_1fr_1fr] md:grid-cols-[180px_1fr_1fr] gap-4 p-4 md:p-6 border-t border-gray-100">
            <div />
            <Link to={`/ads/${ad1.slug}`} className="bg-[#FF0026] hover:bg-red-700 text-white text-center font-bold py-2.5 rounded-xl transition text-sm">
              Pogledaj oglas
            </Link>
            <Link to={`/ads/${ad2.slug}`} className="bg-[#FF0026] hover:bg-red-700 text-white text-center font-bold py-2.5 rounded-xl transition text-sm">
              Pogledaj oglas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
