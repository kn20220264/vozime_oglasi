import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '../api/axios';
import toast from 'react-hot-toast';

// ─── Uplatnica popup ────────────────────────────────────────────
// mode="new"  → prva potvrda narudžbe: korisnik MORA izabrati PONIŠTI
//               (briše narudžbu) ili RAZUMIJEM I PRIHVATAM (čeka potvrdu).
// mode="view" → ponovni pregled uplatnice koja čeka uplatu: X i "Zatvori"
//               za izlaz, poništavanje je mala odvojena opcija sa potvrdom.
export function BankInstructionsModal({ payment, onAccept, onCancelled, mode = 'new' }) {
  const [cancelling, setCancelling] = useState(false);
  const isView = mode === 'view';

  const { data: bank } = useQuery({
    queryKey: ['bank-settings'],
    queryFn: () => axios.get('/bank-settings').then(r => r.data),
    staleTime: Infinity,
  });

  const details = payment?.bank_details ?? {};
  const reference = payment?.reference ?? '';
  const iznos = details.iznos ?? payment?.payment?.amount + ' EUR' ?? '—';
  const paymentId = details.payment_id ?? payment?.payment?.id;

  const rows = [
    { label: 'Iznos za uplatu',  value: iznos },
    { label: 'Svrha uplate',     value: details.svrha_uplate ?? reference, mono: true, highlight: true },
    { label: 'Naziv korisnika',  value: details.naziv_korisnika ?? bank?.naziv ?? '—' },
    { label: 'Banka',            value: details.banka ?? bank?.banka ?? '—' },
    { label: 'Žiro račun',       value: details.ziro_racun ?? bank?.racun ?? '—', mono: true },
  ];

  const handleCancel = async () => {
    if (isView && !window.confirm('Da li sigurno želite PONIŠTITI ovu narudžbu? Uplatnica se briše i moraćete napraviti novu narudžbu ako se predomislite.')) {
      return;
    }
    if (!paymentId) { onCancelled(); return; }
    setCancelling(true);
    try {
      await axios.post(`/payments/${paymentId}/cancel`);
      toast('Narudžba je poništena.', { icon: '🗑️' });
      onCancelled();
    } catch {
      toast.error('Greška pri poništavanju.');
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={isView ? onAccept : undefined} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className={`rounded-t-2xl px-6 py-5 ${isView ? 'bg-orange-500' : 'bg-[#12142D]'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-black text-lg">
                {isView ? '📄 Uplatnica na čekanju' : 'Plaćanje uplatnicom'}
              </h3>
              <p className={`text-xs mt-0.5 ${isView ? 'text-orange-100' : 'text-[#6674A3]'}`}>
                {isView
                  ? 'Vaša narudžba čeka uplatu — evo podataka za plaćanje'
                  : 'Podaci za plaćanje u banci ili pošti'}
              </p>
            </div>
            {isView && (
              <button onClick={onAccept} title="Zatvori"
                className="text-white/70 hover:text-white transition text-2xl leading-none flex-shrink-0 ml-3">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tabela podataka */}
        <div className="p-6 space-y-3">
          {rows.map(row => (
            <div key={row.label} className={`rounded-xl p-3 ${row.highlight ? 'bg-[#FFEA00]/20 border border-[#FFEA00]' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-500 mb-1">{row.label}</p>
              <p className={`font-bold text-[#12142D] ${row.mono ? 'font-mono tracking-wider text-lg' : 'text-base'}`}>
                {row.value}
              </p>
            </div>
          ))}

          {/* Info */}
          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            {details.info ?? bank?.info ?? 'Navedite svrhu uplate kako bismo identifikovali vašu uplatu.'}
          </div>

          {/* Napomena */}
          <div className="bg-[#FF0026]/5 border border-[#FF0026]/20 rounded-xl p-3 text-xs text-gray-600">
            <strong className="text-[#FF0026]">Važno:</strong> Nakon što izvršite uplatu, admin će potvrditi vašu uplatu
            i aktivirati paket. Ovo može potrajati do 24h radnim danom.
          </div>
        </div>

        {isView ? (
          <div className="px-6 pb-6">
            <button onClick={onAccept}
              className="w-full bg-[#12142D] hover:bg-[#1B2B5A] text-white rounded-xl py-3 font-bold text-sm transition">
              Zatvori
            </button>
            <button onClick={handleCancel} disabled={cancelling}
              className="w-full mt-2 text-xs text-gray-400 hover:text-[#FF0026] transition py-1.5 disabled:opacity-50">
              {cancelling ? 'Poništavanje...' : '🗑 Poništi ovu narudžbu (briše uplatnicu)'}
            </button>
          </div>
        ) : (
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={handleCancel} disabled={cancelling}
              className="flex-1 border-2 border-gray-200 hover:border-[#FF0026] text-gray-500 hover:text-[#FF0026] rounded-xl py-3 font-bold text-sm transition disabled:opacity-50">
              {cancelling ? 'Poništavanje...' : 'PONIŠTI'}
            </button>
            <button onClick={onAccept} disabled={cancelling}
              className="flex-[1.4] bg-[#12142D] hover:bg-[#1B2B5A] text-white rounded-xl py-3 font-bold text-sm transition disabled:opacity-50">
              RAZUMIJEM I PRIHVATAM
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Glavni modal za promociju ───────────────────────────────────
// Props:
//   adId         - ID oglasa (za ad_boost), null za account pakete
//   adTitle      - naziv oglasa (za prikaz)
//   packageType  - 'ad_boost' | 'account'
//   onClose      - callback
//   onSuccess    - callback nakon uspješne kupovine
export default function PromoteModal({ adId = null, adTitle = '', packageType = 'ad_boost', note = null, highlightAuto = false, onClose, onSuccess }) {
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState('select'); // 'select' | 'payment' | 'bank'
  const [paymentResult, setPaymentResult] = useState(null);

  const { data: packagesRaw = [], isLoading } = useQuery({
    queryKey: ['packages', packageType],
    queryFn: () => axios.get('/packages', { params: { type: packageType } }).then(r => r.data),
    staleTime: 1000 * 60 * 5,
  });

  // Kad je modal otvoren zbog Auto dugmeta — AUTO-REFRESH paket ide na vrh
  const packages = highlightAuto
    ? [...packagesRaw].sort((a, b) => (b.auto_refresh === true) - (a.auto_refresh === true))
    : packagesRaw;

  const purchase = useMutation({
    mutationFn: (data) => axios.post('/packages/purchase', data).then(r => r.data),
    onSuccess: (data) => {
      setPaymentResult(data);
      if (data.payment?.status === 'completed') {
        toast.success('Paket aktiviran!');
        onSuccess?.();
        onClose();
      } else {
        setStep('bank');
      }
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Greška pri kupovini.'),
  });

  const handleBankTransfer = () => {
    if (!selected) return;
    purchase.mutate({
      package_id: selected.id,
      ad_id: adId ?? undefined,
      gateway: 'bank_transfer',
    });
  };

  const handleCard = () => {
    toast('Plaćanje karticom uskoro dostupno.', { icon: '🔜' });
  };

  if (step === 'bank' && paymentResult) {
    return (
      <BankInstructionsModal
        payment={paymentResult}
        onAccept={() => { onClose(); onSuccess?.(); }}
        onCancelled={() => { onClose(); }}
      />
    );
  }

  const isAdBoost = packageType === 'ad_boost';
  const MODAL_TITLES = {
    ad_boost: 'Promoviši oglas',
    account:  'Nadogradi nalog',
    refresh:  'Refresh paketi',
    gallery:  'Galerija paketi',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-[#12142D] text-lg">
                {MODAL_TITLES[packageType] ?? 'Paketi'}
              </h3>
              {adTitle && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{adTitle}</p>}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
          </div>
        </div>

        <div className="p-6">
          {note && (
            <div className="bg-[#FFEA00]/20 border border-[#FFEA00] rounded-xl px-4 py-3 mb-4 text-sm text-[#12142D]">
              {note}
            </div>
          )}

          {isLoading && <div className="text-center py-8 text-gray-400">Učitavanje paketa...</div>}

          {/* Paketi */}
          {!isLoading && (
            <div className="space-y-3 mb-6">
              {packages.map(pkg => (
                <button
                  key={pkg.id}
                  onClick={() => setSelected(pkg)}
                  className={`w-full text-left rounded-2xl border-2 p-4 transition ${
                    selected?.id === pkg.id
                      ? 'border-[#FF0026] bg-[#FF0026]/5'
                      : 'border-gray-200 hover:border-[#FF0026]/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#12142D]">{pkg.name}</span>
                        {pkg.featured && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFEA00] text-[#12142D]">
                            PROMO
                          </span>
                        )}
                        {pkg.premium_seller && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            PREMIUM
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{pkg.description}</p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {pkg.duration_days && (
                          <span className="text-xs text-gray-600">
                            ⏱ {pkg.duration_days} {pkg.duration_days === 30 ? 'dana' : 'dana'}
                          </span>
                        )}
                        {pkg.refresh_days && (
                          <span className="text-xs text-gray-600">
                            🔄 Refresh svakih {pkg.refresh_days} dana
                          </span>
                        )}
                        {pkg.refresh_count && (
                          <span className="text-xs text-gray-600">
                            🔄 {pkg.refresh_count} oglasa svakih 48h
                          </span>
                        )}
                        {pkg.auto_refresh && (
                          <span className="text-xs text-gray-600">
                            ⚡ Automatski svakih 48h
                          </span>
                        )}
                        {packageType === 'gallery' && pkg.max_images > 0 && (
                          <span className="text-xs text-gray-600">
                            📷 Do {pkg.max_images} slika po oglasu
                          </span>
                        )}
                        {pkg.max_active_ads && (
                          <span className="text-xs text-gray-600">
                            📋 Do {pkg.max_active_ads} aktivnih oglasa
                          </span>
                        )}
                        {isAdBoost && pkg.featured && (
                          <span className="text-xs text-gray-600">
                            🏠 Naslovna stranica
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 text-right flex-shrink-0">
                      {pkg.price > 0 ? (
                        <>
                          <span className="text-2xl font-black text-[#FF0026]">{pkg.price}€</span>
                          {!isAdBoost && <p className="text-[10px] text-gray-400">/ 30 dana</p>}
                        </>
                      ) : (
                        <span className="text-lg font-black text-green-600">Besplatno</span>
                      )}
                    </div>
                  </div>

                  {/* Radio indikator */}
                  <div className={`w-4 h-4 rounded-full border-2 mt-3 ml-auto ${
                    selected?.id === pkg.id ? 'border-[#FF0026] bg-[#FF0026]' : 'border-gray-300'
                  }`} />
                </button>
              ))}
            </div>
          )}

          {/* Metode plaćanja */}
          {selected && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Način plaćanja</p>

              {/* Uplatnica */}
              <button
                onClick={handleBankTransfer}
                disabled={purchase.isPending}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[#12142D] bg-[#12142D] text-white hover:bg-[#1B2B5A] transition disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
                  🏦
                </div>
                <div className="text-left">
                  <p className="font-bold">Uplatnica (banka / pošta)</p>
                  <p className="text-xs text-[#6674A3]">Dobijate instrukcije za uplatu</p>
                </div>
                {purchase.isPending && <span className="ml-auto text-sm opacity-70">...</span>}
              </button>

              {/* Kartica — placeholder */}
              <button
                onClick={handleCard}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 text-gray-400 cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                  💳
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-400">Platna kartica</p>
                  <p className="text-xs text-gray-400">Uskoro dostupno</p>
                </div>
                <span className="ml-auto text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-lg font-semibold">
                  Uskoro
                </span>
              </button>
            </div>
          )}

          {!selected && !isLoading && packages.length > 0 && (
            <p className="text-center text-sm text-gray-400 mt-2">Odaberi paket da nastaviš</p>
          )}
        </div>
      </div>
    </div>
  );
}
