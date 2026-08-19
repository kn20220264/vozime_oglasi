import { Link } from "react-router-dom";

const UPDATED = "19. avgust 2026.";

function Section({ title, children }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
      <h2 className="font-black text-[#12142D] text-lg mb-3">{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

function List({ items }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5">
      {items.map((it) => (
        <li key={it}>{it}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-[#12142D] py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            Politika privatnosti
          </h1>
          <p className="text-[#6674A3]">
            Kako prikupljamo, koristimo i štitimo vaše lične podatke na
            platformi VozimeOglasi.
          </p>
          <p className="text-xs text-[#6674A3] mt-4">
            Posljednja izmjena: {UPDATED}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        <Section title="Uvod">
          <p>
            Zaštita privatnosti naših korisnika prilikom korišćenja platforme
            VozimeOglasi (www.vozimeoglasi.me) od izuzetnog je značaja za
            društvo BEBOLD DOO BAR, koje upravlja ovom platformom.
          </p>
          <p>
            Sve korisnike smatramo partnerima sa kojima sarađujemo u skladu sa
            dobrim poslovnim običajima i uz puno poštovanje domaćih propisa o
            zaštiti podataka o ličnosti, kao i standarda evropske Opšte uredbe
            o zaštiti podataka (GDPR).
          </p>
          <p>
            Ovom politikom vas informišemo o tome koje podatke prikupljamo,
            kako ih koristimo, kome ih otkrivamo, te kako im možete
            pristupiti, izmijeniti ih ili ukloniti.
          </p>
        </Section>

        <Section title="Podaci koje prikupljamo">
          <p>
            Prikupljamo i na svojim serverima čuvamo samo one podatke koji su
            potrebni za korišćenje platforme VozimeOglasi — za objavljivanje i
            pregledanje oglasa, komunikaciju među korisnicima i pružanje
            naših usluga. U skladu sa Zakonom o zaštiti podataka o ličnosti i
            GDPR-om, ličnim podacima smatraju se:
          </p>
          <List
            items={[
              "ime i prezime",
              "e-mail adresa",
              "broj telefona",
              "grad / lokacija koju navedete u oglasu ili profilu",
              "profilna fotografija (ako je postavite)",
              "podaci o autoplacu (naziv, adresa, kontakt) — za registrovane prodavce",
              "IP adresa i tehnički podaci o pristupu",
            ]}
          />
          <p>
            Podatke unosite isključivo dobrovoljno — prilikom registracije,
            objave oglasa, slanja poruke ili registracije autoplaca. Obim
            unesenih podataka zavisi isključivo od vas: nikada vas nećemo
            prisiljavati da unesete adresu, broj telefona ili druge lične
            podatke koji nisu neophodni za funkcionisanje naloga.
          </p>
        </Section>

        <Section title="Svrha obrade podataka">
          <p>Vaše podatke koristimo isključivo da bismo:</p>
          <List
            items={[
              "omogućili registraciju, prijavu i upravljanje nalogom",
              "objavili vaše oglase i prikazali kontakt podatke koje ste sami naveli",
              "omogućili razmjenu poruka između kupaca i prodavaca",
              "obradili kupovinu paketa i evidentirali uplate",
              "slali obavještenja vezana za vaš nalog i oglase (isteci, poruke, statusi uplata)",
              "održavali bezbjednost platforme i sprječavali zloupotrebe",
            ]}
          />
          <p>
            Podatke ne obrađujemo u druge svrhe niti ih koristimo radi
            ostvarivanja dobiti prodajom trećim licima.
          </p>
        </Section>

        <Section title="Zaštita podataka">
          <p>
            Za zaštitu podataka svih korisnika — i privatnih i komercijalnih —
            preduzeli smo tehničke i organizacione mjere, posebno protiv
            gubitka, manipulacije i neovlašćenog pristupa. Postupke zaštite
            kontinuirano prilagođavamo tehničkom razvoju.
          </p>
          <p>
            Komunikacija sa platformom zaštićena je enkripcijom (SSL/TLS), a
            lozinke se čuvaju isključivo u kriptovanom obliku — ni mi ih ne
            možemo pročitati. Važno je da svoju lozinku nikome ne otkrivate.
          </p>
        </Section>

        <Section title="Registracija i prijava">
          <p>
            Prilikom registracije potrebno je unijeti e-mail adresu, koja je
            ključni podatak vašeg naloga. Nakon registracije dobijate svoj
            korisnički panel kojem pristupate pomoću e-mail adrese i lozinke.
          </p>
          <p>
            Ako se prijavite putem Google naloga, od Google-a dobijamo samo
            osnovne podatke (ime, e-mail adresu i profilnu fotografiju) koje
            koristimo isključivo za kreiranje i prijavu na vaš nalog. Nemamo
            pristup vašoj Google lozinci niti drugim podacima sa Google
            naloga.
          </p>
        </Section>

        <Section title="Plaćanja">
          <p>
            Prilikom kupovine paketa evidentiramo podatke o narudžbi i uplati
            (paket, iznos, referenca uplate, status). Ako plaćate uplatnicom
            na žiro račun, podaci o uplati obrađuju se preko banke. Ako
            plaćate karticom, podatke o kartici obrađuje ovlašćeni platni
            procesor — mi nikada ne vidimo niti čuvamo broj vaše kartice.
          </p>
        </Section>

        <Section title="Kolačići (Cookies) i lokalna pohrana">
          <p>
            Radi održavanja stranice i obezbjeđivanja njenog funkcionisanja
            koristimo kolačiće i lokalnu pohranu pregledača (localStorage).
            Kolačić je mala tekstualna datoteka koja u sebi čuva postavke —
            gotovo svaka internet stranica koristi ovu tehnologiju.
          </p>
          <p>Podaci koji se pri tome obrađuju su:</p>
          <List
            items={[
              "podatak o prijavi (token sesije) — da ostanete prijavljeni",
              "anonimizovana IP adresa uređaja koji šalje zahtjev",
              "datum i vrijeme učitavanja stranice",
              "naziv učitane stranice odnosno datoteke",
              "pregledač i operativni sistem koje koristite",
              "nedavno pregledani oglasi (čuvaju se samo na vašem uređaju)",
            ]}
          />
          <p>
            Većina ovih podataka briše se automatski po završetku sesije, a
            podaci koji ostaju na vašem uređaju služe isključivo tome da vam
            poboljšaju iskustvo (npr. da ne morate da se prijavljujete svaki
            put). Njih možete obrisati u bilo kom trenutku kroz podešavanja
            svog pregledača (brisanje kolačića i podataka stranice).
          </p>
          <p>
            Pregledač možete podesiti i tako da kolačiće prihvata samo uz
            izričitu saglasnost ili da ih u potpunosti odbije — ali u tom
            slučaju pojedini djelovi platforme (npr. prijava) mogu
            funkcionisati ograničeno ili nikako.
          </p>
        </Section>

        <Section title="Treće strane">
          <p>
            Podatke naših korisnika nikada ne prosljeđujemo trećim licima bez
            izričite saglasnosti korisnika, osim u zakonom propisanim
            slučajevima (na zahtjev ovlašćenih državnih organa i sl.).
          </p>
          <p>
            Ako na platformu budu integrisani sadržaji trećih strana (npr.
            mape, analitički alati ili društvene mreže), te treće strane mogu
            postaviti sopstvene kolačiće. U tom slučaju ova politika biće
            ažurirana, a korisnicima preporučujemo da pogledaju i politike
            privatnosti tih servisa.
          </p>
          <p>
            VozimeOglasi ima svoje stranice na društvenim mrežama. Praćenjem
            tih stranica podatke obrađuje odgovarajuća društvena mreža prema
            sopstvenoj politici privatnosti — mi vaše lične podatke nikada ne
            prosljeđujemo društvenim mrežama.
          </p>
        </Section>

        <Section title="Vaša prava i povlačenje saglasnosti">
          <p>Kao korisnik u svakom trenutku imate pravo da:</p>
          <List
            items={[
              "pristupite podacima koje čuvamo o vama",
              "izmijenite svoje podatke — kroz podešavanja naloga",
              "obrišete svoje oglase ili kompletan nalog",
              "povučete ranije datu saglasnost, bez roka i sa trenutnim dejstvom",
              "zatražite od nas da vaše podatke obrišemo ili ograničimo obradu",
            ]}
          />
          <p>
            Podatke možete izmijeniti ili obrisati direktno u{" "}
            <Link
              to="/dashboard/profile"
              className="text-[#FF0026] font-semibold hover:underline"
            >
              podešavanjima naloga
            </Link>
            , a za sve zahtjeve u vezi sa ličnim podacima možete nam pisati na{" "}
            <a
              href="mailto:podrska@vozimeoglasi.me"
              className="text-[#FF0026] font-semibold hover:underline"
            >
              podrska@vozimeoglasi.me
            </a>
            . Svaki takav zahtjev obrađujemo prioritetno.
          </p>
        </Section>

        <Section title="Izmjene ove politike">
          <p>
            Politiku privatnosti možemo povremeno ažurirati — na primjer, ako
            uvedemo nove funkcionalnosti koje utiču na obradu podataka. Važeća
            verzija je uvijek objavljena na ovoj stranici, sa datumom
            posljednje izmjene.
          </p>
        </Section>

        <Section title="Za kraj">
          <p>
            Želimo još jednom da istaknemo tri osnovna pravila: sve podatke
            unosite dobrovoljno; imate pravo da ih obrišete sami ili da to
            zatražite od nas; i možete biti sigurni da vaše podatke ne
            obrađujemo radi postizanja dobiti.
          </p>
          <p>
            Nadamo se da je to dovoljno za uspješnu i dugotrajnu saradnju i
            prijatno korišćenje platforme VozimeOglasi.
          </p>
        </Section>

      </div>
    </div>
  );
}
