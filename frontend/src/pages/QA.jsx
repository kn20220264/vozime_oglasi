import { useState } from "react";
import { Link } from "react-router-dom";

// Q&A / Česta pitanja — po uzoru na carwow i polovniautomobili
const SECTIONS = [
  {
    title: "Kupovina vozila",
    icon: "🚗",
    items: [
      {
        q: "Kako da pronađem vozilo koje mi odgovara?",
        a: "Koristite AI pretragu na početnoj stranici — opišite svojim riječima šta tražite (npr. \"dizel SUV do 20.000€, ne stariji od 2018\") i sistem će automatski postaviti filtere. Za preciznu pretragu koristite Detaljnu pretragu sa svim filterima: marka, model, cijena, godište, kilometraža, oprema i još mnogo toga.",
      },
      {
        q: "Kako da kontaktiram prodavca?",
        a: "Na stranici oglasa kliknite na broj telefona da pozovete prodavca direktno. Preporučujemo da prije kupovine uvijek pogledate vozilo uživo i uradite probnu vožnju.",
      },
      {
        q: "Kako da uporedim dva vozila?",
        a: "Sačuvajte oglase koji vam se sviđaju (kliknite srce), zatim u \"Oglasi koje pratim\" označite dva oglasa i kliknite \"Uporedi\" — dobićete preglednu tabelu svih specifikacija jedno pored drugog.",
      },
      {
        q: "Na šta da obratim pažnju pri kupovini polovnog vozila?",
        a: "Provjerite servisnu knjigu i istoriju vozila (na oglasu su oznake poput \"Prvi vlasnik\", \"Kupljen nov u Crnoj Gori\", \"Garažiran\"), broj prethodnih vlasnika, stanje karoserije i da li je vozilo bilo oštećeno. Uvijek tražite VIN broj i provjerite ga prije kupovine. Preporučujemo pregled kod nezavisnog majstora.",
      },
      {
        q: "Da li su cijene fiksne?",
        a: "Cijenu određuje prodavac. Ako je na oglasu oznaka \"Cijena po dogovoru\", prodavac je otvoren za pregovore. Slobodno kontaktirajte prodavca i dogovorite se.",
      },
    ],
  },
  {
    title: "Prodaja vozila",
    icon: "💰",
    items: [
      {
        q: "Kako da objavim oglas?",
        a: "Registrujte se besplatno, kliknite \"Postavi oglas\" i popunite podatke o vozilu kroz par jednostavnih koraka: osnovni podaci, specifikacije, oprema, fotografije. Oglas ide na kratku moderaciju i ubrzo je vidljiv svima.",
      },
      {
        q: "Koliko košta objavljivanje oglasa?",
        a: "Osnovni oglasi su besplatni (do 3 aktivna oglasa na FREE paketu). Za više oglasa, više slika i bolju vidljivost tu su STANDARD i MAX paketi, kao i paketi za promociju pojedinačnih oglasa.",
      },
      {
        q: "Kako da moj oglas bude na vrhu pretrage?",
        a: "Rezultati pretrage su poređani hronološki. Sa REFREŠ paketom možete obnoviti oglas svakih 48 sati — oglas skače na vrh kao da je tek objavljen. AUTO-REFRESH paket to radi automatski za odabrane oglase. Postoje i Premium paketi koji ističu oglas na početnoj stranici.",
      },
      {
        q: "Kako da privremeno sklonim oglas?",
        a: "U \"Moji oglasi\" kliknite \"Pauziraj\" — oglas se skida iz pretrage ali ostaje sačuvan. Kada poželite, kliknite \"Nastavi\" i oglas je ponovo aktivan. Korisno ako je vozilo privremeno rezervisano.",
      },
      {
        q: "Koliko fotografija mogu postaviti?",
        a: "Zavisi od paketa — osnovni paketi uključuju do 10 slika. Sa GALERIJA 20 paketom postavljate do 20 fotografija, a sa GALERIJA 50 do 50 fotografija po oglasu. Više kvalitetnih fotografija = brža prodaja.",
      },
      {
        q: "Šta pisati u opisu oglasa?",
        a: "Budite iskreni i detaljni: stanje vozila, servisna istorija, nedavno mijenjani djelovi, razlog prodaje. Popunite polje \"Istorija vozila\" (prvi vlasnik, servisna knjiga, garažiran...) — kupci filtriraju po tim oznakama.",
      },
    ],
  },
  {
    title: "Auto placevi i dileri",
    icon: "🏢",
    items: [
      {
        q: "Kako da registrujem auto plac?",
        a: "Idite na \"Postani auto plac\" i popunite registraciju: podaci o placu, kategorije vozila koje prodajete, podaci za obračun i kontakt. Nakon potvrde dobijate poseban dealer nalog sa statistikama i profilom autoplaca.",
      },
      {
        q: "Šta dobijam kao auto plac?",
        a: "Profil autoplaca na stranici \"Autoplaci\", veći broj aktivnih oglasa, statistike pregleda, i mogućnost Premium doplata: Premium 1 (oznaka na oglasima) i Premium 2 (oznaka + pozicija na početnoj stranici).",
      },
    ],
  },
  {
    title: "Plaćanje i paketi",
    icon: "💳",
    items: [
      {
        q: "Kako se plaćaju paketi?",
        a: "Trenutno podržavamo plaćanje uplatnicom (virman) — pri kupovini dobijate podatke za uplatu sa jedinstvenom svrhom uplate. Nakon što admin potvrdi uplatu (obično do 24h radnim danom), paket se automatski aktivira. Plaćanje karticom uskoro.",
      },
      {
        q: "Gdje vidim svoje pakete i uplate?",
        a: "U korisničkom panelu pod \"Krediti / Paketi\" — tu su svi vaši paketi, status aktivacije i istorija kupovina.",
      },
      {
        q: "Da li se paketi automatski produžavaju?",
        a: "Ne. Paketi važe do isteka i ne naplaćujemo ništa automatski. Kada paket istekne, možete kupiti novi.",
      },
    ],
  },
  {
    title: "Bezbjednost",
    icon: "🛡️",
    items: [
      {
        q: "Kako da prijavim sumnjiv oglas?",
        a: "Na dnu svakog oglasa nalazi se \"Prijavi oglas\". Naš tim pregleda svaku prijavu i uklanja oglase koji krše pravila.",
      },
      {
        q: "Kako da se zaštitim od prevare?",
        a: "Nikad ne šaljite novac unaprijed. Pogledajte vozilo uživo prije kupovine, provjerite dokumentaciju i VIN broj. Budite oprezni sa cijenama koje su značajno ispod tržišnih.",
      },
    ],
  },
];

function QAItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
      >
        <span className="font-semibold text-[#12142D] group-hover:text-[#FF0026] transition text-sm md:text-base">
          {q}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <p className="pb-4 text-sm text-gray-600 leading-relaxed pr-8">{a}</p>}
    </div>
  );
}

export default function QA() {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? SECTIONS.map((s) => ({
        ...s,
        items: s.items.filter(
          (i) =>
            i.q.toLowerCase().includes(query.toLowerCase()) ||
            i.a.toLowerCase().includes(query.toLowerCase())
        ),
      })).filter((s) => s.items.length > 0)
    : SECTIONS;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#12142D] py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            Kako možemo pomoći?
          </h1>
          <p className="text-[#6674A3] mb-6">
            Odgovori na najčešća pitanja o kupovini, prodaji i paketima
          </p>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pretraži pitanja... (npr. refresh, paket, oglas)"
            className="w-full max-w-xl rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-[#FF0026]/30"
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500">Nema rezultata za "{query}".</p>
          </div>
        )}

        <div className="space-y-6">
          {filtered.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="flex items-center gap-2 font-black text-[#12142D] text-lg mb-2">
                <span>{section.icon}</span> {section.title}
              </h2>
              {section.items.map((item) => (
                <QAItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-[#12142D] rounded-2xl p-8 text-center">
          <h3 className="text-white font-black text-xl mb-2">Niste našli odgovor?</h3>
          <p className="text-[#6674A3] text-sm mb-5">
            Pišite nam i odgovorićemo u najkraćem roku.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="mailto:podrska@vozimeoglasi.me"
              className="bg-[#FF0026] hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm"
            >
              ✉️ Kontaktiraj podršku
            </a>
            <Link
              to="/search"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm"
            >
              Pregledaj oglase
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
