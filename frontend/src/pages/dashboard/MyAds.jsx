import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import toast from "react-hot-toast";

const STATUS_LABELS = {
  active: { label: "Aktivan", cls: "bg-green-100 text-green-700" },
  pending: { label: "Na čekanju", cls: "bg-yellow-100 text-yellow-700" },
  inactive: { label: "Neaktivan", cls: "bg-gray-100 text-gray-500" },
  sold: { label: "Prodat", cls: "bg-blue-100 text-blue-700" },
  rejected: { label: "Odbijen", cls: "bg-red-100 text-red-600" },
  expired: { label: "Istekao", cls: "bg-orange-100 text-orange-600" },
};

export default function MyAds() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-ads", page],
    queryFn: async () => {
      const r = await axios.get(`/my-ads?page=${page}&per_page=10`);
      return r.data;
    },
    staleTime: 0,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`/ads/${id}`),
    onSuccess: () => {
      toast.success("Oglas obrisan.");
      setDeletingId(null);
      qc.invalidateQueries(["my-ads"]);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message ?? "Greška pri brisanju.";
      toast.error(msg);
      setDeletingId(null);
    },
  });

  const markSoldMutation = useMutation({
    mutationFn: (id) => axios.post(`/ads/${id}/mark-sold`),
    onSuccess: () => {
      toast.success("Oglas označen kao prodat.");
      qc.invalidateQueries(["my-ads"]);
    },
  });

  const handleDelete = (id) => {
    if (!window.confirm("Sigurno želiš obrisati ovaj oglas?")) return;
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const ads = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-[#12142D]">Moji oglasi</h1>
        <Link
          to="/dashboard/ads/create"
          className="bg-[#FF0026] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-red-700 transition"
        >
          + Novi oglas
        </Link>
      </div>

      {isLoading && (
        <div className="text-center py-16 text-gray-400">Učitavanje...</div>
      )}

      {!isLoading && ads.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="text-5xl mb-3">🚗</div>
          <p className="text-gray-500 mb-4">Nemate još nijedan oglas.</p>
          <Link
            to="/dashboard/ads/create"
            className="inline-block bg-[#FF0026] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-red-700 transition text-sm"
          >
            Objavi prvi oglas
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {ads.map((ad) => {
          const imgUrl = ad.primary_image
            ? `http://localhost:8000` + ad.primary_image
            : null;
          const status = STATUS_LABELS[ad.status] ?? {
            label: ad.status,
            cls: "bg-gray-100 text-gray-500",
          };
          const isDeleting = deletingId === ad.id;

          return (
            <div
              key={ad.id}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 p-4 hover:shadow-md transition ${
                isDeleting ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <div className="w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    🚗
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-[#12142D] truncate">
                    {ad.title}
                  </p>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${status.cls}`}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {ad.price?.toLocaleString()} € · {ad.city?.name} · {ad.year} ·{" "}
                  {ad.mileage?.toLocaleString()} km
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {ad.views_count ?? 0} pregleda · Objavljeno {ad.created_at}
                </p>
              </div>

              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <Link
                  to={`/ads/${ad.slug}`}
                  className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-center transition"
                >
                  Pregled
                </Link>
                {/* NOVO — Uredi */}
                <Link
                  to={`/dashboard/ads/${ad.slug}/edit`}
                  className="text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition text-center"
                >
                  Uredi
                </Link>
                {ad.status === "active" && (
                  <button
                    onClick={() => markSoldMutation.mutate(ad.id)}
                    className="text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition"
                  >
                    Označi prodat
                  </button>
                )}
                <button
                  onClick={() => handleDelete(ad.id)}
                  disabled={isDeleting}
                  className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#FF0026] rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {isDeleting ? "Briše se..." : "Obriši"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
