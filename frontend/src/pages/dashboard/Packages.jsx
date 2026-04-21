import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios";
import toast from "react-hot-toast";

// ── Ikone ──────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ── Modal za odabir načina plaćanja ───────────────────────────
function PaymentModal({ pkg, myAds, onClose, onConfirm, isPending }) {
  const [gateway, setGateway] = useState("wspay");
  const [selectedAdId, setSelectedAdId] = useState(myAds[0]?.id ?? "");

  const isAdBoost = pkg.type === "ad_boost";
  const selectedAd = myAds.find(a => a.id === Number(selectedAdId));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-black text-[#12142D] mb-1">Potvrda kupovine</h3>
        <p className="text-sm text-gray-500 mb-5">
          Paket: <span className="font-semibold text-[#12142D]">{pkg.name}</span> —{" "}
          <span className="text-[#FF0026] font-bold">{pkg.price === 0 ? "Besplatno" : `${pkg.price} €`}</span>
        </p>

        {/* Odabir oglasa za ad_boost */}
        {isAdBoost && (
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-2">Odaberite oglas za promociju:</p>
            {myAds.length === 0 ? (
              <p className="text-sm text-gray-400 bg-gray-50 rounded-xl p-3">Nemate aktivnih oglasa.</p>
            ) : (
              <select
                value={selectedAdId}
                onChange={e => setSelectedAdId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0026] bg-white"
              >
                <option value="">— Odaberite oglas —</option>
                {myAds.map(ad => (
                  <option key={ad.id} value={ad.id}>
                    {ad.title} {ad.ad_code ? `(${ad.ad_code})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <p className="text-sm font-semibold text-gray-700 mb-3">Odaberite način plaćanja:</p>

        <div className="space-y-3 mb-6">
          {/* WSPay kartica */}
          <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${gateway === "wspay" ? "border-[#FF0026] bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
            <input type="radio" name="gateway" value="wspay" checked={gateway === "wspay"} onChange={() => setGateway("wspay")} className="accent-[#FF0026]" />
            <div>
              <p className="font-semibold text-sm text-[#12142D]">Platite karticom</p>
              <p className="text-xs text-gray-400">Visa, Mastercard, Maestro — WSPay</p>
            </div>
            <div className="ml-auto flex gap-1">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">VISA</span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">MC</span>
            </div>
          </label>

          {/* Žiro račun */}
          <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${gateway === "bank_transfer" ? "border-[#FF0026] bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
            <input type="radio" name="gateway" value="bank_transfer" checked={gateway === "bank_transfer"} onChange={() => setGateway("bank_transfer")} className="accent-[#FF0026]" />
            <div>
              <p className="font-semibold text-sm text-[#12142D]">Uplata na žiro račun</p>
              <p className="text-xs text-gray-400">Aktivacija nakon potvrde uplate (1–2 radna dana)</p>
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
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

// ── Modal za žiro instrukcije ─────────────────────────────────
function BankModal({ details, onClose }) {
  const rows = [
    ["Iznos za uplatu",  details.iznos],
    ["Svrha uplate",     details.svrha_uplate, true],
    ["Naziv korisnika",  details.naziv_korisnika],
    ["Banka",            details.banka],
    ["Žiro račun",       details.ziro_racun],
  ].filter(([, v]) => v);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // kratki feedback bez toast importa ovdje
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-[#12142D]">Narudžba primljena!</h3>
            <p className="text-xs text-gray-400">Uplatite na žiro račun da aktivirate paket</p>
          </div>
        </div>

        {/* Nalog za plaćanje */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Podaci za uplatu</p>
          <div className="space-y-2.5">
            {rows.map(([label, value, highlight]) => (
              <div key={label} className={`rounded-xl p-2.5 ${highlight ? 'bg-[#FFEA00]/20 border border-[#FFEA00]/40' : 'bg-white'}`}>
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <div className="flex items-center gap-1.5 justify-between">
                  <span className={`font-bold text-sm text-[#12142D] ${highlight ? 'font-mono tracking-wider' : ''}`}>{value}</span>
                  <button
                    onClick={() => handleCopy(value)}
                    title="Kopiraj"
                    className="text-gray-300 hover:text-[#FF0026] transition flex-shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {details.napomena && (
          <p className="text-xs text-gray-400 bg-yellow-50 border border-yellow-100 rounded-xl p-3 mb-4">
            ⚠️ {details.napomena}
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#12142D] text-white text-sm font-bold hover:bg-[#1B2B5A] transition"
        >
          Razumijem
        </button>
      </div>
    </div>
  );
}

// ── Kartica paketa ────────────────────────────────────────────
function PackageCard({ pkg, onSelect, myAccountPackage }) {
  const isCurrentPlan = myAccountPackage?.package_id === pkg.id && myAccountPackage?.is_active;

  const accountFeatures = {
    FREE:     ["3 aktivna oglasa", "5 slika po oglasu", "Standardni prikaz"],
    STANDARD: ["5 aktivnih oglasa", "10 slika po oglasu", "Standardni prikaz"],
    MAX:      ["10 aktivnih oglasa", "20 slika po oglasu", "Premium prodavac oznaka"],
  };

  const adFeatures = {
    "Premium 5":  ["Istaknuti oglas 6 dana", "Refresh svakih 3 dana", "Uvijek ispred besplatnih", "Na naslovnoj strani"],
    "Premium 10": ["Istaknuti oglas 12 dana", "Refresh svakih 3 dana", "Uvijek ispred besplatnih", "Na naslovnoj strani"],
  };

  const features = pkg.type === "account"
    ? (accountFeatures[pkg.name] ?? [pkg.description])
    : (adFeatures[pkg.name] ?? [pkg.description]);

  const isPopular = pkg.name === "MAX" || pkg.name === "Premium 10";

  return (
    <div className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col transition ${isPopular ? "border-[#FF0026] shadow-lg" : "border-gray-100 shadow-sm hover:border-gray-200"}`}>
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF0026] text-white text-xs font-bold px-3 py-1 rounded-full">
          NAJPOPULARNIJE
        </span>
      )}
      {isCurrentPlan && (
        <span className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          AKTIVAN
        </span>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-black text-[#12142D]">{pkg.name}</h3>
        <div className="mt-2">
          {pkg.price === 0 ? (
            <span className="text-2xl font-black text-[#12142D]">Besplatno</span>
          ) : (
            <>
              <span className="text-3xl font-black text-[#FF0026]">{pkg.price}€</span>
              <span className="text-sm text-gray-400 ml-1">/ {pkg.duration_days} dana</span>
            </>
          )}
        </div>
      </div>

      <ul className="space-y-2 flex-1 mb-6">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
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
            ? "bg-green-100 text-green-600 cursor-default"
            : pkg.price === 0
            ? "bg-gray-100 text-gray-400 cursor-default"
            : isPopular
            ? "bg-[#FF0026] text-white hover:bg-red-700"
            : "bg-[#12142D] text-white hover:bg-[#1B2B5A]"
        }`}
      >
        {isCurrentPlan ? "Trenutni plan" : pkg.price === 0 ? "Uključeno" : "Kupi paket"}
      </button>
    </div>
  );
}

// ── Glavna stranica ───────────────────────────────────────────
export default function Packages() {
  const qc = useQueryClient();
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);

  // Dohvati sve pakete
  const { data: allPackages = [] } = useQuery({
    queryKey: ["packages"],
    queryFn: () => axios.get("/packages").then((r) => r.data),
  });

  // Dohvati moje pakete
  const { data: myPackages = [] } = useQuery({
    queryKey: ["my-packages"],
    queryFn: () => axios.get("/my-packages").then((r) => r.data),
  });

  // Dohvati moje oglase (za ad_boost)
  const { data: myAdsData } = useQuery({
    queryKey: ["my-ads"],
    queryFn: () => axios.get("/my-ads").then((r) => r.data),
  });

  const myAds = myAdsData?.data ?? [];

  const accountPackages = allPackages.filter((p) => p.type === "account");
  const adBoostPackages = allPackages.filter((p) => p.type === "ad_boost");

  const myActiveAccountPkg = myPackages.find(
    (p) => p.package?.type === "account" && p.is_active
  );

  const purchase = useMutation({
    mutationFn: (payload) => axios.post("/packages/purchase", payload),
    onSuccess: (res) => {
      qc.invalidateQueries(["my-packages"]);
      setSelectedPkg(null);
      if (res.data.bank_details) {
        setBankDetails(res.data.bank_details);
      } else {
        toast.success("Paket uspješno aktiviran!");
      }
    },
    onError: () => toast.error("Greška pri kupovini paketa."),
  });

  const handleConfirm = (gateway, adId) => {
    const payload = {
      package_id: selectedPkg.id,
      gateway,
      ...(adId ? { ad_id: adId } : {}),
    };
    purchase.mutate(payload);
  };

  return (
    <div className="space-y-10">

      {/* Paketi za nalog */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-black text-[#12142D]">Paketi za nalog</h2>
          <p className="text-sm text-gray-500 mt-1">Odaberite plan koji odgovara vašim potrebama</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {accountPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onSelect={setSelectedPkg}
              myAccountPackage={myActiveAccountPkg}
            />
          ))}
        </div>
      </section>

      {/* Paketi za oglas */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-black text-[#12142D]">Istaknuti oglasi</h2>
          <p className="text-sm text-gray-500 mt-1">Povećajte vidljivost vašeg oglasa</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
          {adBoostPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onSelect={setSelectedPkg}
              myAccountPackage={null}
            />
          ))}
        </div>
      </section>

      {/* Istorija kupovina */}
      {myPackages.length > 0 && (
        <section>
          <h2 className="text-xl font-black text-[#12142D] mb-4">Moji paketi</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold">Paket</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold">Tip</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold">Ističe</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {myPackages.map((up) => (
                  <tr key={up.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-[#12142D]">{up.package?.name}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {up.package?.type === "account" ? "Nalog" : "Oglas"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {up.expires_at
                        ? new Date(up.expires_at).toLocaleDateString("sr-Latn")
                        : "Čeka potvrdu"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${up.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {up.is_active ? "Aktivan" : "Neaktivan"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Modali */}
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
        <BankModal
          details={bankDetails}
          onClose={() => setBankDetails(null)}
        />
      )}
    </div>
  );
}