import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function Favorites() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [compareSlugs, setCompareSlugs] = useState([]);

  const toggleCompare = (slug) => {
    setCompareSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 2) {
        toast("Možete porediti najviše 2 oglasa.", { icon: "⚖️" });
        return prev;
      }
      return [...prev, slug];
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["favorites", page],
    queryFn: () => api.get(`/favorites?page=${page}`).then((r) => r.data),
    staleTime: 0,
  });

  const removeMutation = useMutation({
    mutationFn: (adId) => api.post(`/favorites/${adId}`),
    onSuccess: () => {
      toast.success("Uklonjeno iz omiljenih.");
      qc.invalidateQueries(["favorites"]);
    },
  });

  // Backend vraca { data: [ { id, ad: {...} } ], ... }
  const favorites = data?.data ?? [];
  const meta = data?.meta ?? data?.last_page
    ? { current_page: data.current_page, last_page: data.last_page }
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-[#12142D]">Oglasi koje pratim</h1>
        <div className="flex items-center gap-3">
          {compareSlugs.length > 0 && (
            <button
              onClick={() => {
                if (compareSlugs.length !== 2) {
                  toast("Odaberite tačno 2 oglasa za poređenje.", { icon: "⚖️" });
                  return;
                }
                navigate(`/compare?ads=${compareSlugs.join(",")}`);
              }}
              className={`text-sm font-bold px-4 py-2 rounded-xl transition ${
                compareSlugs.length === 2
                  ? "bg-[#12142D] text-white hover:bg-[#1B2B5A]"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              ⚖️ Uporedi ({compareSlugs.length}/2)
            </button>
          )}
          <span className="text-sm text-gray-400">{data?.total ?? 0} oglasa</span>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-16 text-gray-400">Učitavanje...</div>
      )}

      {!isLoading && favorites.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="text-5xl mb-3">🤍</div>
          <p className="text-gray-500 mb-2 font-semibold">Nemate sačuvanih oglasa</p>
          <p className="text-gray-400 text-sm mb-5">
            Kliknite srce na oglas da ga sačuvate ovdje
          </p>
          <Link
            to="/search"
            className="inline-block bg-[#FF0026] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-red-700 transition text-sm"
          >
            Pregledaj oglase
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {favorites.map((fav) => {
          const ad = fav.ad;
          if (!ad) return null;

          const imgUrl = ad.primary_image
            ? `http://localhost:8000` + ad.primary_image
            : null;

          return (
            <div
              key={fav.id}
              className={`bg-white rounded-2xl shadow-sm border flex items-center gap-4 p-4 hover:shadow-md transition ${
                compareSlugs.includes(ad.slug) ? "border-[#12142D] ring-1 ring-[#12142D]" : "border-gray-100"
              }`}
            >
              {/* Checkbox za poređenje */}
              <input
                type="checkbox"
                title="Označи za poređenje"
                checked={compareSlugs.includes(ad.slug)}
                onChange={() => toggleCompare(ad.slug)}
                className="w-4 h-4 accent-[#12142D] flex-shrink-0 cursor-pointer"
              />

              {/* Slika */}
              <Link
                to={`/ads/${ad.slug}`}
                className="w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 block"
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    🚗
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link to={`/ads/${ad.slug}`}>
                  <p className="font-bold text-[#12142D] truncate hover:text-[#FF0026] transition">
                    {ad.title}
                  </p>
                </Link>
                <p className="text-sm text-gray-500 mt-0.5">
                  {ad.year} · {ad.mileage?.toLocaleString()} km ·{" "}
                  {ad.fuel_type} · {ad.city?.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Sačuvano {new Date(fav.created_at).toLocaleDateString("sr-Latn")}
                </p>
              </div>

              {/* Cijena + akcije */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <p className="font-black text-[#FF0026] text-lg">
                  {Number(ad.price).toLocaleString()} €
                </p>
                <div className="flex gap-2">
                  <Link
                    to={`/ads/${ad.slug}`}
                    className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                  >
                    Pogledaj
                  </Link>
                  <button
                    onClick={() => removeMutation.mutate(ad.id)}
                    disabled={removeMutation.isPending}
                    className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#FF0026] rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    ✕ Ukloni
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginacija */}
      {meta?.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition ${
                p === page
                  ? "bg-[#FF0026] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}