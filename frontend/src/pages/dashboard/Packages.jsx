import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";

// ── Zajedničke ikonice i sitni elementi ───────────────────────

function CheckIcon() {
  return (
    <span className="w-5 h-5 rounded-full bg-[#FF0026]/10 flex items-center justify-center flex-shrink-0">
      <svg className="w-3 h-3 text-[#FF0026]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}

function KebabIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h.01M12 12h.01M19 12h.01" />
    </svg>
  );
}

function CardKebab({ onClick, title = "Opcije", disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || !onClick}
      title={title}
      className={`text-[#6674A3] transition flex-shrink-0 ${onClick && !disabled ? "hover:text-white" : "cursor-default opacity-60"}`}
    >
      <KebabIcon />
    </button>
  );
}

// ── Feature liste (dijele ih kartice paketa i pregled pogodnosti) ──

const accountFeatures = {
  FREE: ["3 aktivna oglasa", "5 slika po oglasu", "Standardni prikaz"],
  STANDARD: ["5 aktivnih oglasa", "10 slika po oglasu", "Standardni prikaz"],
  MAX: [
    "10 aktivnih oglasa",
    "20 slika po oglasu",
    "Premium prodavac oznaka",
  ],
};

const adBoostFeatures = {
  "Premium 5": [
    "Istaknuti oglas 6 dana",
    "Refresh svakih 3 dana",
    "Uvijek ispred besplatnih",
    "Na naslovnoj strani",
  ],
  "Premium 10": [
    "Istaknuti oglas 12 dana",
    "Refresh svakih 3 dana",
    "Uvijek ispred besplatnih",
    "Na naslovnoj strani",
  ],
};

const dealerFeatures = (p) => [
  "Listing u kategoriji autoplacevi",
  "Pretraga unutar profila",
  `${p.max_active_ads} aktivnih oglasa`,
  `${p.gratis_premium_ads} gratis plasiranih oglasa`,
  `Vrijednost gratis oglasa: ${p.gratis_premium_ads * 12}€`,
];

function featuresFor(pkg) {
  if (!pkg) return accountFeatures.FREE;
  if (pkg.type === "dealer") return dealerFeatures(pkg);
  if (pkg.type === "account") return accountFeatures[pkg.name] ?? [pkg.description];
  return adBoostFeatures[pkg.name] ?? [pkg.description];
}

function durationLabel(days) {
  if (!days) return "";
  if (days === 30) return "mjesečno";
  if (days === 365) return "godišnje";
  return `${days} dana`;
}

// ── Modali ────────────────────────────────────────────────────

function PaymentModal({ pkg, myAds, onClose, onConfirm, isPending }) {
  const [gateway, setGateway] = useState("wspay");
  const [selectedAdId, setSelectedAdId] = useState(myAds[0]?.id ?? "");
  const isAdBoost = pkg.type === "ad_boost";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[#1A1D3A] border border-white/[0.06] rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-black text-white mb-1">
          Potvrda kupovine
        </h3>
        <p className="text-sm text-[#6674A3] mb-5">
          Paket:{" "}
          <span className="font-semibold text-white">{pkg.name}</span>,{" "}
          <span className="text-[#FF0026] font-bold">
            {pkg.price === 0 ? "Besplatno" : `${pkg.price} €`}
          </span>
        </p>
        {isAdBoost && (
          <div className="mb-5">
            <p className="text-sm font-semibold text-white mb-2">
              Odaberite oglas za promociju:
            </p>
            {myAds.length === 0 ? (
              <p className="text-sm text-[#6674A3] bg-white/[0.04] rounded-xl p-3">
                Nemate aktivnih oglasa.
              </p>
            ) : (
              <select
                value={selectedAdId}
                onChange={(e) => setSelectedAdId(e.target.value)}
                className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF0026] bg-[#12142D] text-white"
              >
                <option value="">Odaberite oglas</option>
                {myAds.map((ad) => (
                  <option key={ad.id} value={ad.id}>
                    {ad.title} {ad.ad_code ? `(${ad.ad_code})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
        <p className="text-sm font-semibold text-white mb-3">
          Odaberite način plaćanja:
        </p>
        <div className="space-y-3 mb-6">
          <label
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${gateway === "wspay" ? "border-[#FF0026] bg-[#FF0026]/10" : "border-white/10 hover:border-white/25"}`}
          >
            <input
              type="radio"
              name="gateway"
              value="wspay"
              checked={gateway === "wspay"}
              onChange={() => setGateway("wspay")}
              className="accent-[#FF0026]"
            />
            <div>
              <p className="font-semibold text-sm text-white">
                Platite karticom
              </p>
              <p className="text-xs text-[#6674A3]">
                Visa, Mastercard i Maestro preko WSPay sistema
              </p>
            </div>
            <div className="ml-auto flex gap-1">
              <span className="text-xs bg-white/[0.08] text-white/80 px-2 py-0.5 rounded font-medium">
                VISA
              </span>
              <span className="text-xs bg-white/[0.08] text-white/80 px-2 py-0.5 rounded font-medium">
                MC
              </span>
            </div>
          </label>
          <label
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${gateway === "bank_transfer" ? "border-[#FF0026] bg-[#FF0026]/10" : "border-white/10 hover:border-white/25"}`}
          >
            <input
              type="radio"
              name="gateway"
              value="bank_transfer"
              checked={gateway === "bank_transfer"}
              onChange={() => setGateway("bank_transfer")}
              className="accent-[#FF0026]"
            />
            <div>
              <p className="font-semibold text-sm text-white">
                Uplata na žiro račun
              </p>
              <p className="text-xs text-[#6674A3]">
                Aktivacija nakon potvrde uplate (1 do 2 radna dana)
              </p>
            </div>
          </label>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-[#6674A3] hover:text-white hover:border-white/25 transition"
          >
            Odustani
          </button>
          <button
            onClick={() => onConfirm(gateway, isAdBoost ? selectedAdId : null)}
            disabled={isPending || (isAdBoost && !selectedAdId)}
            className="flex-1 py-2.5 rounded-xl bg-[#FF0026] text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition"
          >
            {isPending ? "Obrađuje se..." : "Potvrdi"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BankModal({ details, onClose }) {
  const qc2 = useQueryClient();
  const [cancelling, setCancelling] = useState(false);
  // _view = ponovni pregled uplatnice na čekanju (ne prva potvrda narudžbe)
  const isView = !!details._view;

  const handleCancel = async () => {
    if (isView && !window.confirm("Da li sigurno želite PONIŠTITI ovu narudžbu? Uplatnica se briše i moraćete napraviti novu narudžbu ako se predomislite.")) {
      return;
    }
    if (!details.payment_id) { onClose(); return; }
    setCancelling(true);
    try {
      await axios.post(`/payments/${details.payment_id}/cancel`);
      toast("Narudžba je poništena.");
      qc2.invalidateQueries(["my-packages"]);
      qc2.invalidateQueries(["pending-payments"]);
      onClose();
    } catch {
      toast.error("Greška pri poništavanju.");
      setCancelling(false);
    }
  };

  const rows = [
    ["Iznos za uplatu", details.iznos],
    ["Svrha uplate", details.svrha_uplate, true],
    ["Naziv korisnika", details.naziv_korisnika],
    ["Banka", details.banka],
    ["Žiro račun", details.ziro_racun],
  ].filter(([, v]) => v);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[#1A1D3A] border border-white/[0.06] rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isView ? "bg-white/[0.06]" : "bg-[#FF0026]/10"}`}>
            {isView ? (
              <svg className="w-5 h-5 text-[#6674A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-[#FF0026]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-black text-white">
              {isView ? "Uplatnica na čekanju" : "Narudžba primljena!"}
            </h3>
            <p className="text-xs text-[#6674A3]">
              {isView
                ? "Vaša narudžba čeka uplatu. Ovdje su podaci za plaćanje."
                : "Uplatite na žiro račun da aktivirate paket"}
            </p>
          </div>
          {isView && (
            <button
              onClick={onClose}
              title="Zatvori"
              className="text-[#6674A3] hover:text-white transition flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="bg-[#12142D] rounded-2xl p-4 mb-4 border border-white/[0.06]">
          <p className="text-xs font-bold text-[#6674A3] mb-3">
            Podaci za uplatu
          </p>
          <div className="space-y-2.5">
            {rows.map(([label, value, highlight]) => (
              <div
                key={label}
                className={`rounded-xl p-2.5 ${highlight ? "bg-[#FF0026]/10 border border-[#FF0026]/30" : "bg-white/[0.04]"}`}
              >
                <p className="text-xs text-[#6674A3] mb-0.5">{label}</p>
                <div className="flex items-center gap-1.5 justify-between">
                  <span
                    className={`font-bold text-sm text-white ${highlight ? "font-mono tracking-wider" : ""}`}
                  >
                    {value}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(value)}
                    title="Kopiraj"
                    className="text-[#6674A3] hover:text-[#FF0026] transition flex-shrink-0"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {isView ? (
          <div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-white text-[#12142D] text-sm font-bold hover:bg-white/90 transition"
            >
              Zatvori
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full mt-2 text-xs text-[#6674A3] hover:text-[#FF0026] transition py-1.5 disabled:opacity-50"
            >
              {cancelling ? "Poništavanje..." : "Poništi ovu narudžbu (briše uplatnicu)"}
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex-1 py-2.5 rounded-xl border border-white/10 hover:border-[#FF0026] text-[#6674A3] hover:text-[#FF0026] text-sm font-bold transition disabled:opacity-50"
            >
              {cancelling ? "Poništavanje..." : "Poništi"}
            </button>
            <button
              onClick={onClose}
              disabled={cancelling}
              className="flex-[1.4] py-2.5 rounded-xl bg-[#FF0026] text-white text-sm font-bold hover:bg-red-700 transition disabled:opacity-50"
            >
              Razumijem i prihvatam
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Kartica paketa u ponudi ───────────────────────────────────

function PackageCard({ pkg, onSelect, myActivePkg }) {
  const isCurrentPlan =
    myActivePkg?.package_id === pkg.id && myActivePkg?.is_active;

  const features = featuresFor(pkg);

  const isPopular =
    pkg.name === "MAX" || pkg.name === "Premium 10" || pkg.name === "Gold";

  return (
    <div
      className={`relative bg-[#1A1D3A] rounded-2xl border p-6 flex flex-col transition ${isPopular ? "border-[#FF0026]/60" : "border-white/[0.06] hover:border-white/[0.15]"}`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFEA00] text-[#12142D] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
          Najpopularnije
        </span>
      )}
      {isCurrentPlan && (
        <span className="absolute -top-3 right-4 bg-white text-[#12142D] text-xs font-bold px-3 py-1 rounded-full">
          Aktivan
        </span>
      )}
      <div className="mb-4">
        <h3 className="text-lg font-black text-white">{pkg.name}</h3>
        <div className="mt-2">
          {pkg.price === 0 ? (
            <span className="text-2xl font-black text-white">
              Besplatno
            </span>
          ) : (
            <>
              <span className="text-3xl font-black text-[#FF0026]">
                {pkg.price}€
              </span>
              <span className="text-sm text-[#6674A3] ml-1">
                / {pkg.duration_days} dana
              </span>
            </>
          )}
        </div>
      </div>
      <ul className="space-y-2.5 flex-1 mb-6">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm text-white/80">
            <CheckIcon />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => onSelect(pkg)}
        disabled={isCurrentPlan || pkg.price === 0}
        className={`w-full py-2.5 rounded-xl text-sm font-bold transition ${
          isCurrentPlan
            ? "bg-white/[0.08] text-white cursor-default"
            : pkg.price === 0
              ? "bg-white/[0.04] text-[#6674A3] cursor-default"
              : isPopular
                ? "bg-[#FF0026] text-white hover:bg-red-700"
                : "border border-white/15 text-white hover:border-[#FF0026] hover:text-[#FF0026]"
        }`}
      >
        {isCurrentPlan
          ? "Trenutni plan"
          : pkg.price === 0
            ? "Uključeno"
            : "Kupi paket"}
      </button>
    </div>
  );
}

// ── Dealer addon kartice ──────────────────────────────────────

function DealerAddonSection({ addonStatus, onPurchase, pendingAddon }) {
  const current = addonStatus?.current_addon ?? "none";
  const pending = addonStatus?.pending_addon;

  const addons = [
    {
      key: "premium1",
      title: "Premium 1",
      price: "10€",
      period: "/ mjesečno",
      desc: "PREMIUM Oznaka prodavca",
      features: [
        "PRO oznaka na kartici autoplaca",
        "Prikazan pri vrhu stranice autoplaceva",
        "Veća vidljivost u pretrazi",
      ],
    },
    {
      key: "premium2",
      title: "Premium 2",
      price: "20€",
      period: "/ mjesečno",
      desc: "Oznaka + Početna stranica",
      features: [
        "PRO oznaka na kartici autoplaca",
        "Prikazan pri vrhu stranice autoplaceva",
        "Prikazan u rotirajućoj listi na početnoj stranici",
        "Maksimalna vidljivost",
      ],
      popular: true,
    },
  ];

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-black text-white">Premium doplate</h2>
        <p className="text-sm text-[#6674A3] mt-1">
          Povećajte vidljivost vašeg auto placa
        </p>
      </div>

      {pending && (
        <div className="mb-4 bg-[#1A1D3A] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-3">
          <svg className="w-5 h-5 text-[#6674A3] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-bold text-white">
              Čeka se potvrda uplate
            </p>
            <p className="text-xs text-[#6674A3]">
              Narudžba za{" "}
              <strong className="text-white/80">
                {pending === "premium1" ? "Premium 1" : "Premium 2"}
              </strong>{" "}
              je na čekanju. Addon će biti aktiviran nakon što admin potvrdi
              uplatu.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
        {addons.map((addon) => {
          const isActive = current === addon.key;
          const isPending_ = pending === addon.key;

          return (
            <div
              key={addon.key}
              className={`relative bg-[#1A1D3A] rounded-2xl border p-6 flex flex-col transition ${
                addon.popular
                  ? "border-[#FF0026]/60"
                  : "border-white/[0.06]"
              }`}
            >
              {addon.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF0026] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  Preporučeno
                </span>
              )}
              {isActive && (
                <span className="absolute -top-3 right-4 bg-white text-[#12142D] text-xs font-bold px-3 py-1 rounded-full">
                  Aktivan
                </span>
              )}
              {isPending_ && (
                <span className="absolute -top-3 right-4 bg-[#6674A3] text-white text-xs font-bold px-3 py-1 rounded-full">
                  Na čekanju
                </span>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-black text-white">
                  {addon.title}
                </h3>
                <p className="text-xs text-[#6674A3] mt-0.5">{addon.desc}</p>
                <div className="mt-2">
                  <span className="text-3xl font-black text-[#FF0026]">
                    {addon.price}
                  </span>
                  <span className="text-sm text-[#6674A3] ml-1">
                    {addon.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {addon.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-sm text-white/80"
                  >
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onPurchase(addon.key)}
                disabled={isActive || isPending_ || pendingAddon === addon.key}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition ${
                  isActive
                    ? "bg-white/[0.08] text-white cursor-default"
                    : isPending_
                      ? "bg-white/[0.04] text-[#6674A3] cursor-default"
                      : addon.popular
                        ? "bg-[#FF0026] text-white hover:bg-red-700 disabled:opacity-50"
                        : "border border-white/15 text-white hover:border-[#FF0026] hover:text-[#FF0026] disabled:opacity-50"
                }`}
              >
                {isActive
                  ? "Aktivan"
                  : isPending_
                    ? "Na čekanju"
                    : pendingAddon === addon.key
                      ? "Obrađuje se..."
                      : "Kupi"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Status chip za uplate ─────────────────────────────────────

function StatusChip({ status, onView }) {
  if (status === "pending") {
    return (
      <button
        onClick={onView}
        title="Pogledaj uplatnicu"
        className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/[0.06] text-[#6674A3] hover:text-white transition"
      >
        Na čekanju
      </button>
    );
  }
  if (status === "paid") {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/[0.08] text-white">
        Plaćeno
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FF0026]/10 text-[#FF0026]">
      Odbijeno
    </span>
  );
}

// ── Glavna stranica ───────────────────────────────────────────

export default function Packages() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const isDealer = user?.role === "dealer";

  const [selectedPkg, setSelectedPkg] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);

  const { data: allPackages = [] } = useQuery({
    queryKey: ["packages"],
    queryFn: () => axios.get("/packages").then((r) => r.data),
  });

  const { data: myPackages = [] } = useQuery({
    queryKey: ["my-packages"],
    queryFn: () => axios.get("/my-packages").then((r) => r.data),
  });

  const { data: pendingPayments = [] } = useQuery({
    queryKey: ["pending-payments"],
    queryFn: () => axios.get("/my-pending-payments").then((r) => r.data.data),
    staleTime: 0,
  });

  const { data: myAdsData } = useQuery({
    queryKey: ["my-ads"],
    queryFn: () => axios.get("/my-ads").then((r) => r.data),
  });

  const { data: addonStatus } = useQuery({
    queryKey: ["dealer-addon-status"],
    queryFn: () => axios.get("/dealer/addon/status").then((r) => r.data),
    enabled: isDealer,
  });

  const myAds = myAdsData?.data ?? [];
  const accountPackages = allPackages.filter((p) => p.type === "account");
  const dealerPackages = allPackages.filter((p) => p.type === "dealer");
  const adBoostPackages = allPackages.filter((p) => p.type === "ad_boost");
  const refreshPackages = allPackages.filter((p) => p.type === "refresh");
  const galleryPackages = allPackages.filter((p) => p.type === "gallery");
  // "Trenutni paket" je account/dealer plan; ostali tipovi (gallery, refresh, ad_boost) su doplate
  const planTypes = ["account", "dealer"];
  const myActivePkg = myPackages.find(
    (p) => p.is_active && planTypes.includes(p.package?.type)
  );
  const activeAddons = myPackages.filter(
    (p) => p.is_active && !planTypes.includes(p.package?.type)
  );

  const purchase = useMutation({
    mutationFn: (payload) => axios.post("/packages/purchase", payload),
    onSuccess: (res) => {
      qc.invalidateQueries(["my-packages"]);
      qc.invalidateQueries(["pending-payments"]);
      setSelectedPkg(null);
      if (res.data.bank_details) setBankDetails(res.data.bank_details);
      else toast.success("Paket uspješno aktiviran!");
    },
    onError: () => toast.error("Greška pri kupovini paketa."),
  });

  const addonPurchase = useMutation({
    mutationFn: (addon) => axios.post("/dealer/addon", { addon }),
    onSuccess: (res) => {
      qc.invalidateQueries(["dealer-addon-status"]);
      if (res.data.bank_details) setBankDetails(res.data.bank_details);
      else toast.success("Addon aktiviran!");
    },
    onError: () => toast.error("Greška pri narudžbi addona."),
  });

  const handleConfirm = (gateway, adId) => {
    purchase.mutate({
      package_id: selectedPkg.id,
      gateway,
      ...(adId ? { ad_id: adId } : {}),
    });
  };

  // Izvedeni podaci za pregled pretplate (bez novih API poziva)
  const activePkgInfo = myActivePkg?.package;
  const benefits = featuresFor(activePkgInfo);
  const firstPending = pendingPayments[0];

  const openPendingSlip = (pp) =>
    setBankDetails({ ...pp.bank_details, _view: true });

  const scrollToPackages = () =>
    document.getElementById("dostupni-paketi")?.scrollIntoView({ behavior: "smooth" });

  const formatDate = (d) => new Date(d).toLocaleDateString("sr-Latn");

  const nextAmount =
    activePkgInfo && Number(activePkgInfo.price) > 0
      ? `${Number(activePkgInfo.price).toFixed(2)} €`
      : "0.00 €";

  const paymentRows = myPackages.map((up) => {
    const pp = pendingPayments.find((p) => p.user_package_id === up.id);
    const status = pp ? "pending" : up.paid_at ? "paid" : "rejected";
    return { up, pp, status };
  });

  return (
    <div className="space-y-6">

      {/* Red 1: trenutni paket */}
      <section className="bg-[#1A1D3A] border border-white/[0.06] rounded-2xl p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-[#6674A3]">Trenutni paket</p>
          <CardKebab />
        </div>
        <div className="mt-2 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
              {activePkgInfo?.name ?? "Besplatan probni"}
            </h1>
            <p className="text-sm text-[#6674A3] mt-3">
              {myActivePkg?.paid_at
                ? `Pretplata aktivna od: ${formatDate(myActivePkg.paid_at)}`
                : "Trenutno koristite besplatni paket bez mjesečne pretplate."}
            </p>
            {activeAddons.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#6674A3] uppercase tracking-wider mb-2">
                  Aktivne doplate
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeAddons.map((up) => (
                    <span
                      key={up.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-semibold text-white/80"
                    >
                      {up.package?.name}
                      {up.expires_at && (
                        <span className="text-[#6674A3] font-normal">
                          do {formatDate(up.expires_at)}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            {/* Plaćeni paket se ne otkazuje — samo ističe. Otkazati se može jedino neplaćena narudžba. */}
            {firstPending && (
              <button
                onClick={() => openPendingSlip(firstPending)}
                title="Pogledajte narudžbu na čekanju i poništite je po potrebi"
                className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-white hover:border-white/25 transition"
              >
                Otkaži narudžbu
              </button>
            )}
            <button
              onClick={scrollToPackages}
              className="px-5 py-2.5 rounded-xl bg-[#FF0026] hover:bg-red-700 text-white text-sm font-bold transition"
            >
              Nadogradi paket
            </button>
          </div>
        </div>
      </section>

      {/* Red 2: pogodnosti i naredna uplata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <section className="lg:col-span-2 bg-[#1A1D3A] border border-white/[0.06] rounded-2xl p-6 lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-base font-bold text-white">Pogodnosti paketa</h2>
            <CardKebab />
          </div>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {benefits.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/80">
                <CheckIcon />
                {f}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-[#1A1D3A] border border-white/[0.06] rounded-2xl p-6 lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-base font-bold text-white">Naredna uplata</h2>
            <span className="w-11 h-11 rounded-full bg-white/[0.06] flex items-center justify-center text-[#6674A3] flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-black text-white mt-4">{nextAmount}</p>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#6674A3]">Tip paketa:</dt>
              <dd className="text-white font-medium text-right">
                {activePkgInfo
                  ? `${activePkgInfo.name}${durationLabel(activePkgInfo.duration_days) ? ` (${durationLabel(activePkgInfo.duration_days)})` : ""}`
                  : "Besplatan probni"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#6674A3]">Datum sljedeće uplate:</dt>
              <dd className="text-white font-medium text-right">
                {myActivePkg?.expires_at && myActivePkg?.paid_at
                  ? formatDate(myActivePkg.expires_at)
                  : "Nema zakazane uplate"}
              </dd>
            </div>
          </dl>
        </section>

      </div>

      {/* Red 3: način plaćanja i nedavne uplate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <section className="bg-[#1A1D3A] border border-white/[0.06] rounded-2xl p-6 lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-base font-bold text-white">Način plaćanja</h2>
            <CardKebab />
          </div>
          <div className="mt-6 flex items-center gap-4">
            <span className="w-12 h-12 rounded-2xl bg-white/[0.06] flex items-center justify-center text-white flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm">
                {firstPending?.bank_details?.banka ?? "Uplata na žiro račun"}
              </p>
              <p className="text-xs text-[#6674A3] mt-0.5 truncate">
                {firstPending?.bank_details?.ziro_racun ??
                  "Podaci za uplatu stižu uz svaku narudžbu"}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={firstPending ? () => openPendingSlip(firstPending) : undefined}
              disabled={!firstPending}
              title={firstPending ? "Otvori uplatnicu" : "Trenutno nemate uplatnicu na čekanju"}
              className="w-full py-2.5 rounded-xl bg-[#FF0026] hover:bg-red-700 text-white text-sm font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Preuzmi uplatnicu
            </button>
            <button
              disabled
              title="Kartično plaćanje uskoro"
              className="w-full py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-[#6674A3] cursor-not-allowed opacity-60"
            >
              Promijeni način plaćanja
            </button>
          </div>
        </section>

        <section className="lg:col-span-2 bg-[#1A1D3A] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="flex items-start justify-between gap-4 p-6 lg:p-8 pb-0 lg:pb-0">
            <h2 className="text-base font-bold text-white">Nedavne uplate</h2>
            <CardKebab />
          </div>

          {paymentRows.length === 0 ? (
            <p className="text-sm text-[#6674A3] px-6 lg:px-8 py-6">
              Još nemate nijednu uplatu.
            </p>
          ) : (
            <>
              {/* Tabela (md i veće) */}
              <table className="hidden md:table w-full text-sm mt-2">
                <thead>
                  <tr className="text-left text-[#6674A3]">
                    <th className="font-medium px-6 lg:px-8 py-4">Datum</th>
                    <th className="font-medium px-4 py-4">Tip paketa</th>
                    <th className="font-medium px-4 py-4">Iznos</th>
                    <th className="w-16 px-4 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {paymentRows.map(({ up, pp, status }) => (
                    <tr key={up.id}>
                      <td className="px-6 lg:px-8 py-4 text-white/80">
                        {up.paid_at
                          ? formatDate(up.paid_at)
                          : up.created_at
                            ? formatDate(up.created_at)
                            : "U obradi"}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-white font-medium">{up.package?.name}</p>
                        <p className="text-xs text-[#6674A3] capitalize mt-0.5">
                          {up.package?.type}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-semibold">
                            {Number(up.package?.price ?? 0).toFixed(2)} €
                          </span>
                          <StatusChip
                            status={status}
                            onView={pp ? () => openPendingSlip(pp) : undefined}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <CardKebab
                          onClick={pp ? () => openPendingSlip(pp) : undefined}
                          title={pp ? "Pogledaj uplatnicu" : "Opcije"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Lista kartica (ispod md) */}
              <div className="md:hidden px-6 py-5 space-y-3">
                {paymentRows.map(({ up, pp, status }) => (
                  <div
                    key={up.id}
                    className="bg-[#12142D] border border-white/[0.06] rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-[#6674A3]">
                        {up.paid_at
                          ? formatDate(up.paid_at)
                          : up.created_at
                            ? formatDate(up.created_at)
                            : "U obradi"}
                      </p>
                      <StatusChip
                        status={status}
                        onView={pp ? () => openPendingSlip(pp) : undefined}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-2">
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {up.package?.name}
                        </p>
                        <p className="text-xs text-[#6674A3] capitalize">
                          {up.package?.type}
                        </p>
                      </div>
                      <p className="text-white font-semibold text-sm flex-shrink-0">
                        {Number(up.package?.price ?? 0).toFixed(2)} €
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

      </div>

      {/* Ponuda paketa */}
      <div id="dostupni-paketi" className="space-y-10 pt-6">

        {/* Dealer paketi */}
        {isDealer ? (
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-black text-white">
                Paketi za auto plac
              </h2>
              <p className="text-sm text-[#6674A3] mt-1">
                Odaberite paket koji odgovara vašim potrebama
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {dealerPackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onSelect={setSelectedPkg}
                  myActivePkg={myActivePkg}
                />
              ))}
            </div>
          </section>
        ) : (
          /* Obični user paketi */
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-black text-white">
                Paketi za nalog
              </h2>
              <p className="text-sm text-[#6674A3] mt-1">
                Odaberite plan koji odgovara vašim potrebama
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {accountPackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onSelect={setSelectedPkg}
                  myActivePkg={myActivePkg}
                />
              ))}
            </div>
          </section>
        )}

        {/* Ad boost, samo za obične korisnike */}
        {!isDealer && (
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-black text-white">
                Istaknuti oglasi
              </h2>
              <p className="text-sm text-[#6674A3] mt-1">
                Povećajte vidljivost vašeg oglasa
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
              {adBoostPackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onSelect={setSelectedPkg}
                  myActivePkg={null}
                />
              ))}
            </div>
          </section>
        )}

        {/* Dealer premium doplate */}
        {isDealer && (
          <DealerAddonSection
            addonStatus={addonStatus}
            onPurchase={(addon) => addonPurchase.mutate(addon)}
            pendingAddon={
              addonPurchase.isPending ? addonPurchase.variables : null
            }
          />
        )}

        {/* Refresh paketi */}
        {refreshPackages.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-black text-white">Refresh paketi</h2>
              <p className="text-sm text-[#6674A3] mt-1">
                Obnovite oglas i vratite ga na vrh pretrage svakih 48 sati
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {refreshPackages.map((pkg) => (
                <div key={pkg.id} className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/[0.15] transition flex flex-col">
                  <div className="bg-white/[0.04] border-b border-white/[0.06] px-4 py-3 text-center">
                    <span className="font-bold text-sm tracking-wide text-white">{pkg.name}</span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-3xl font-black text-white text-center mb-3">{Number(pkg.price).toFixed(0)}€</p>
                    <p className="text-xs text-[#6674A3] flex-1">{pkg.description}</p>
                    <button
                      onClick={() => setSelectedPkg(pkg)}
                      className="mt-4 w-full bg-[#FF0026] hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-lg transition"
                    >
                      Aktiviraj
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Galerija paketi */}
        {galleryPackages.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-black text-white">Galerija</h2>
              <p className="text-sm text-[#6674A3] mt-1">
                Više fotografija u vašim oglasima
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl">
              {galleryPackages.map((pkg) => (
                <div key={pkg.id} className="bg-[#1A1D3A] rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/[0.15] transition flex flex-col">
                  <div className="bg-white/[0.04] border-b border-white/[0.06] px-4 py-3 text-center">
                    <span className="font-bold text-sm tracking-wide text-white">{pkg.name}</span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-3xl font-black text-white text-center mb-3">{Number(pkg.price).toFixed(0)}€</p>
                    <p className="text-xs text-[#6674A3] flex-1">{pkg.description}</p>
                    <button
                      onClick={() => setSelectedPkg(pkg)}
                      className="mt-4 w-full bg-[#FF0026] hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-lg transition"
                    >
                      Aktiviraj
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {selectedPkg && (
        <PaymentModal
          pkg={selectedPkg}
          myAds={myAds}
          onClose={() => setSelectedPkg(null)}
          onConfirm={handleConfirm}
          isPending={purchase.isPending}
        />
      )}
      {bankDetails && (
        <BankModal details={bankDetails} onClose={() => setBankDetails(null)} />
      )}
    </div>
  );
}
