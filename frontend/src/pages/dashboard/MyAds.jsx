import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import PromoteModal, { BankInstructionsModal } from "../../components/PromoteModal";

const STATUS_LABELS = {
  active: { label: "Aktivan", cls: "bg-green-100 text-green-700" },
  pending: { label: "Na čekanju", cls: "bg-yellow-100 text-yellow-700" },
  paused: { label: "Pauziran", cls: "bg-purple-100 text-purple-700" },
  inactive: { label: "Neaktivan", cls: "bg-gray-100 text-gray-500" },
  sold: { label: "Prodat", cls: "bg-blue-100 text-blue-700" },
  rejected: { label: "Odbijen", cls: "bg-red-100 text-red-600" },
  expired: { label: "Istekao", cls: "bg-orange-100 text-orange-600" },
};

// Preostalo vrijeme do sljedećeg dozvoljenog refresh-a (48h cooldown)
function refreshCooldown(lastRefreshedAt) {
  if (!lastRefreshedAt) return null;
  const next = new Date(lastRefreshedAt).getTime() + 48 * 3600 * 1000;
  const diff = next - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

export default function MyAds() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [promoteAd, setPromoteAd] = useState(null); // { id, title }
  const [refreshShopOpen, setRefreshShopOpen] = useState(false); // false | 'refresh' | 'auto'
  const [invoiceView, setInvoiceView] = useState(null); // uplatnica na čekanju za ponovni pregled

  const { data, isLoading } = useQuery({
    queryKey: ["my-ads", page],
    queryFn: async () => {
      const r = await axios.get(`/my-ads?page=${page}&per_page=10`);
      return r.data;
    },
    staleTime: 0,
  });

  const { data: credits } = useQuery({
    queryKey: ["refresh-credits"],
    queryFn: () => axios.get("/refresh-credits").then((r) => r.data),
    staleTime: 30000,
  });

  // Uplatnice na čekanju — da korisnik ne pravi duple narudžbe i uvijek može vidjeti podatke
  const { data: pendingPayments = [] } = useQuery({
    queryKey: ["pending-payments"],
    queryFn: () => axios.get("/my-pending-payments").then((r) => r.data.data),
    staleTime: 0,
  });
  const pendingRefreshPayment = pendingPayments.find((p) => p.package_type === "refresh");

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

  const refreshMutation = useMutation({
    mutationFn: (id) => axios.post(`/ads/${id}/refresh`),
    onSuccess: (r) => {
      toast.success(r.data?.message ?? "Oglas obnovljen!");
      qc.invalidateQueries(["my-ads"]);
      qc.invalidateQueries(["refresh-credits"]);
    },
    onError: (err) => {
      const data = err?.response?.data;
      toast.error(data?.message ?? "Greška pri obnavljanju.");
      if (data?.needs_package) setRefreshShopOpen("refresh");
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (id) => axios.post(`/ads/${id}/pause`),
    onSuccess: (r) => {
      toast.success(r.data?.message ?? "Oglas pauziran.");
      qc.invalidateQueries(["my-ads"]);
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Greška."),
  });

  const resumeMutation = useMutation({
    mutationFn: (id) => axios.post(`/ads/${id}/resume`),
    onSuccess: (r) => {
      toast.success(r.data?.message ?? "Oglas ponovo aktivan.");
      qc.invalidateQueries(["my-ads"]);
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Greška."),
  });

  const autoRefreshMutation = useMutation({
    mutationFn: (id) => axios.post(`/ads/${id}/auto-refresh`),
    onSuccess: (r) => {
      toast.success(r.data?.message ?? "Sačuvano.");
      qc.invalidateQueries(["my-ads"]);
      qc.invalidateQueries(["refresh-credits"]);
    },
    onError: (err) => {
      const data = err?.response?.data;
      toast.error(data?.message ?? "Greška.");
      if (data?.needs_package) setRefreshShopOpen("auto");
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
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              pendingRefreshPayment
                ? setInvoiceView(pendingRefreshPayment)
                : setRefreshShopOpen("refresh")
            }
            className="bg-[#1B2B5A] hover:bg-[#243570] text-white text-sm font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            🔄 Refresh paketi
            {pendingRefreshPayment ? (
              <span className="bg-orange-400 text-white text-xs font-black px-1.5 py-0.5 rounded-full" title="Imate uplatnicu na čekanju — kliknite da je pogledate">
                📄
              </span>
            ) : credits?.has_package && (
              <span className="bg-[#FFEA00] text-[#12142D] text-xs font-black px-1.5 py-0.5 rounded-full" title="Preostalo obnavljanja u tekućih 48h">
                {credits.remaining}/{credits.limit}
              </span>
            )}
          </button>
          <Link
            to="/dashboard/ads/create"
            className="bg-[#FF0026] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-red-700 transition"
          >
            + Novi oglas
          </Link>
        </div>
      </div>

      {credits?.has_auto_refresh && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-4 text-sm text-green-700 flex items-center gap-2">
          <span>⚡</span>
          <span>AUTO-REFRESH paket aktivan — uključite automatsko obnavljanje na željenim oglasima dugmetom "Auto".</span>
        </div>
      )}

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
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-bold text-[#12142D] truncate">
                    {ad.title}
                  </p>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${status.cls}`}
                  >
                    {status.label}
                  </span>
                  {ad.featured && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 bg-[#FFEA00] text-[#12142D]"
                      title="Oglas je promovisan — istaknut je na početnoj stranici i u pretrazi"
                    >
                      ⭐ Promovisan
                      {ad.featured_until
                        ? ` do ${new Date(ad.featured_until).toLocaleDateString("sr-Latn")}`
                        : ""}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {ad.price?.toLocaleString()} € · {ad.city?.name} · {ad.year} ·{" "}
                  {ad.mileage?.toLocaleString()} km
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {ad.views_count ?? 0} pregleda · Objavljeno{" "}
                  {ad.created_at ? new Date(ad.created_at).toLocaleDateString("sr-Latn") : ""}
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
                  <>
                    {(() => {
                      const adPending = pendingPayments.find((p) => p.ad_id === ad.id);
                      if (adPending) {
                        return (
                          <button
                            onClick={() => setInvoiceView(adPending)}
                            title={`Uplatnica na čekanju: ${adPending.package_name} (${adPending.reference})`}
                            className="text-xs px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg font-semibold transition"
                          >
                            📄 Uplatnica
                          </button>
                        );
                      }
                      if (!ad.featured) {
                        return (
                          <button
                            onClick={() => setPromoteAd({ id: ad.id, title: ad.title })}
                            className="text-xs px-3 py-1.5 bg-[#FFEA00]/30 hover:bg-[#FFEA00]/50 text-[#12142D] rounded-lg font-semibold transition"
                          >
                            ⭐ Promoviši
                          </button>
                        );
                      }
                      return null;
                    })()}
                    {(() => {
                      const cooldown = refreshCooldown(ad.last_refreshed_at);
                      return (
                        <button
                          onClick={() => refreshMutation.mutate(ad.id)}
                          disabled={!!cooldown || refreshMutation.isLoading}
                          title={cooldown ? `Sljedeći refresh za ${cooldown}` : "Obnovi oglas — skače na vrh pretrage"}
                          className="text-xs px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {cooldown ? `🔄 za ${cooldown}` : "🔄 Refresh"}
                        </button>
                      );
                    })()}
                    <button
                      onClick={() => autoRefreshMutation.mutate(ad.id)}
                      title="Automatsko obnavljanje svakih 48h (AUTO-REFRESH paket)"
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                        ad.auto_refresh
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-500"
                      }`}
                    >
                      ⚡ Auto {ad.auto_refresh ? "ON" : "OFF"}
                    </button>
                    <button
                      onClick={() => pauseMutation.mutate(ad.id)}
                      className="text-xs px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-semibold transition"
                    >
                      ⏸ Pauziraj
                    </button>
                    <button
                      onClick={() => markSoldMutation.mutate(ad.id)}
                      className="text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition"
                    >
                      Označi prodat
                    </button>
                  </>
                )}
                {ad.status === "paused" && (
                  <button
                    onClick={() => resumeMutation.mutate(ad.id)}
                    className="text-xs px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-semibold transition"
                  >
                    ▶ Nastavi
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

      {promoteAd && (
        <PromoteModal
          adId={promoteAd.id}
          adTitle={promoteAd.title}
          packageType="ad_boost"
          onClose={() => { setPromoteAd(null); qc.invalidateQueries(["pending-payments"]); }}
          onSuccess={() => { setPromoteAd(null); qc.invalidateQueries(["my-ads"]); qc.invalidateQueries(["pending-payments"]); }}
        />
      )}

      {refreshShopOpen && (
        <PromoteModal
          packageType="refresh"
          highlightAuto={refreshShopOpen === "auto"}
          note={
            refreshShopOpen === "auto"
              ? "⚡ Za automatsko obnavljanje (Auto ON) potreban je AUTO-REFRESH paket — REFREŠ paketi pokrivaju samo ručno obnavljanje."
              : null
          }
          onClose={() => { setRefreshShopOpen(false); qc.invalidateQueries(["pending-payments"]); }}
          onSuccess={() => { setRefreshShopOpen(false); qc.invalidateQueries(["refresh-credits"]); qc.invalidateQueries(["pending-payments"]); }}
        />
      )}

      {/* Ponovni pregled uplatnice na čekanju */}
      {invoiceView && (
        <BankInstructionsModal
          mode="view"
          payment={{ bank_details: invoiceView.bank_details, reference: invoiceView.reference }}
          onAccept={() => setInvoiceView(null)}
          onCancelled={() => {
            setInvoiceView(null);
            qc.invalidateQueries(["pending-payments"]);
            qc.invalidateQueries(["my-ads"]);
          }}
        />
      )}

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
