// Uslovi korišćenja — pravni podaci kompanije su označeni sa [ ... ] i treba ih
// zamijeniti stvarnim podacima firme prije puštanja u produkciju.
const COMPANY = {
    service:  'VozimeOglasi',
    name:     '[Naziv kompanije] d.o.o.',
    address:  '[Adresa], [Poštanski broj] [Grad], Crna Gora',
    pib:      '[PIB]',
    email:    'info@vozimeoglasi.me',
    court:    '[Grad sjedišta]',
    dateFrom: '19.08.2026.',
};

export default function Terms() {
    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-3xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
                    <h1 className="text-3xl font-black text-[#12142D] mb-8">Uslovi korišćenja</h1>

                    <Section title="Opšte odredbe">
                        <p>
                            Ovim Uslovima korišćenja se uređuju prava i obaveze u vezi sa korišćenjem {COMPANY.service} servisa
                            (u daljem tekstu: Servis). Servis predstavlja uslugu informacionog društva koju pruža privredno
                            društvo {COMPANY.name}, {COMPANY.address}, PIB: {COMPANY.pib} (u daljem tekstu: Kompanija).
                        </p>
                        <p>
                            Ovi Uslovi korišćenja čine sastavni dio Servisa i predstavljaju odredbe ugovora koji se zaključuje
                            između Kompanije i svakog pojedinog korisnika Servisa. Kompanija omogućava korišćenje Servisa
                            fizičkim i pravnim licima, isključivo na način i pod uslovima opisanim u ovim Uslovima korišćenja,
                            na način i pod uslovima pod kojima se pruža usluga informacionog društva.
                        </p>
                        <p>
                            Pristupom i korišćenjem Servisa Kompanije, korisnici pristaju na Uslove korišćenja, te na taj način
                            zaključuju ugovor po pristupu sa Kompanijom kao pružaocem usluge informacionog društva. Na svaki
                            pristup sadržajima Servisa, primjenjuju se ovi Uslovi korišćenja.
                        </p>
                        <p>
                            Poslovanje Kompanije putem ovog Servisa regulisano je Zakonom o elektronskoj trgovini, Zakonom o
                            obligacionim odnosima, Zakonom o oglašavanju, Zakonom o autorskom i srodnim pravima, Zakonom o
                            žigovima, Zakonom o zaštiti podataka o ličnosti, Zakonom o zaštiti potrošača, kao i drugim
                            propisima pravnog sistema Crne Gore.
                        </p>
                        <p>
                            Kompanija je posvećena očuvanju i primjeni prava o zaštiti podataka o ličnosti koja uživaju fizička
                            lica, kao i autorskih prava, a u svemu prema pravilima informacione struke, dobrim poslovnim
                            običajima i u skladu sa važećim propisima Crne Gore.
                        </p>
                    </Section>

                    <Section title="Integritet i opis servisa">
                        <p>
                            Servis je namijenjen oglašavanju širokog spektra proizvoda i usluga kao što su: vozila, plovila,
                            motocikli, transportna vozila i druge kategorije. Na Servisu je takođe dostupan i sadržaj koji je
                            namijenjen informisanju korisnika o temama iz različitih oblasti.
                        </p>
                        <p>
                            Svako korišćenje Servisa koje nije u skladu sa Uslovima korišćenja smatraće se zloupotrebom usluga
                            koje pruža Kompanija i kršenjem Uslova korišćenja.
                        </p>
                        <p>
                            Kompanija prenosi elektronske poruke koje su joj predate od strane korisnika usluga informacionog
                            društva, ali ni na koji način: ne inicira njihov prenos, ne vrši odabir podataka ili dokumenata
                            koji se prenose, ne izuzima ili mijenja podatke u sadržaju poruka ili dokumenata, niti odabira
                            primaoca prenosa.
                        </p>
                        <p>
                            Servis omogućava korisnicima pristup sadržaju koji je nastao agregiranjem javno dostupnih podataka,
                            kao i sadržaju postavljenom od strane korisnika, isključivo bez ikakve naplate.
                        </p>
                        <p>
                            Kompanija zadržava pravo izmjene, ukidanja (bilo privremeno, bilo trajno) bilo kog elementa
                            Servisa, usluga koje pruža, kao i sadržaja koji se na te elemente odnose, bez prethodnog odobrenja
                            ili obavještenja, uz primjenu dobrih poslovnih običaja.
                        </p>
                        <p>
                            Sve vremenske odrednice i rokovi prikazani kroz Servis, kao i vremenska zona i radni dani računaju
                            se prema važećim propisima Crne Gore.
                        </p>
                    </Section>

                    <Section title="Autorsko pravo">
                        <p>
                            Kompanija ima isključivo autorsko pravo i prava intelektualne svojine na Servisu, kao i na svim
                            pojedinim elementima koji ga čine, kao što su: tekst, vizuelni i audio elementi, vizuelni
                            identitet, podaci i baze podataka, programski kod i drugi elementi servisa, kojih je autor.
                        </p>
                        <p>
                            Neovlašćeno korišćenje bilo kog dijela Servisa, ili Servisa u cjelini, bez izričite prethodne
                            dozvole u pisanoj formi izdate od Kompanije kao nosioca isključivih autorskih prava, smatraće se
                            povredom autorskih prava Kompanije i podložno je pokretanju svih postupaka u punoj zakonskoj mjeri.
                        </p>
                        <p>
                            Servis može sadržati i elemente na kojima isključiva autorska, žigovna i druga prava intelektualne
                            svojine imaju druga lica, kao što su sadržaji korisnika Servisa, sadržaj poslovnih partnera,
                            oglašivača i slično. Druga lica imaju isključivu odgovornost za sadržaj na kojem su nosioci tih
                            prava, bez obzira na to što se takav sadržaj nalazi na Servisu Kompanije.
                        </p>
                    </Section>

                    <Section title="Korisnici">
                        <p>
                            Korisnicima usluga koje putem Servisa pruža Kompanija smatraju se kako posjetioci, tako i
                            registrovani korisnici.
                        </p>

                        <h3 className="text-base font-bold text-[#12142D] mt-5 mb-2">Posjetilac</h3>
                        <p>
                            Posjetilac je lice koje putem Interneta pristupi Servisu u smislu ovih Uslova korišćenja, bez
                            prijave ili registracije na Servis. Posjetilac može da se upozna sa dostupnim sadržajem na Servisu,
                            bez plaćanja bilo kakve naknade.
                        </p>

                        <h3 className="text-base font-bold text-[#12142D] mt-5 mb-2">Registrovani korisnik</h3>
                        <p>
                            Registrovani korisnik je pravno ili fizičko lice koje se registrovalo na Servisu pod uslovima i na
                            način iz ovih Uslova korišćenja. Registracija na Servis je besplatna i dostupna svim posjetiocima.
                        </p>
                        <p>
                            Prilikom registracije je potrebno da fizičko lice popuni formular sa ličnim podacima. Ovi podaci se
                            koriste u skladu sa Zakonom o zaštiti podataka o ličnosti kao i sa Obavještenjem o privatnosti koje
                            je istaknuto na Servisu.
                        </p>
                        <p>
                            Registracija na Servis za pravna lica i preduzetnike je dostupna svim uredno registrovanim
                            privrednim subjektima. Prilikom registracije je potrebno da privredni subjekt popuni formular sa
                            podacima o pravnom licu. Ovi podaci ostaju u evidenciji Kompanije i pravnih lica u kojima Kompanija
                            ima većinsko vlasništvo i neće biti korišćeni u druge svrhe, osim svrhe ostvarenja prava i obaveza
                            iz ovih Uslova korišćenja.
                        </p>
                        <p>
                            Registrovani korisnici prodaju mogu oglasiti kao prodavci sopstvenih proizvoda ili trgovci koji se
                            bave trgovinom različitim artiklima i uslugama.
                        </p>
                        <p>
                            Postavljanjem sadržaja na Servis, registrovani korisnik bezuslovno i neopozivo ovlašćuje Kompaniju
                            da sadržaj prenese neodređenom broju lica.
                        </p>
                        <p>Registracijom na Servisu korisnici dobijaju sljedeće mogućnosti:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Mogućnost postavljanja oglasne poruke</li>
                            <li>Mogućnost deaktivacije profila</li>
                            <li>Mogućnost brisanja profila</li>
                        </ul>
                        <p>
                            Servis omogućava registrovanom korisniku da, ukoliko smatra da neko zloupotrebljava podatke
                            korisnika i kontaktira korisnika drugim povodom, obavijesti Kompaniju o tome putem adrese:{' '}
                            <a href={`mailto:${COMPANY.email}`} className="text-[#FF0026] hover:underline">{COMPANY.email}</a>.
                        </p>
                    </Section>

                    <Section title="Oglašavanje i oglasna poruka">
                        <p>
                            Prenosilac oglasne poruke je Kompanija koja je pružalac usluge informacionog društva i pruža uslugu
                            oglašavanja isključivo putem Interneta.
                        </p>
                        <p>
                            Za sadržaj, tačnost i ispravnost, kao i validnost oglasne poruke odgovornost snosi isključivo lice
                            koje je oglasnu poruku unijelo. Za sve pravne posledice koje nastanu unosom oglasne poruke,
                            odgovara isključivo lice koje je oglasnu poruku na Servis unijelo.
                        </p>
                        <p>
                            Kompanija zadržava pravo da ne objavi sadržaj kojim se krše odredbe zakona Crne Gore, a naročito
                            Zakon o oglašavanju. Kompanija može u svakom trenutku da odbije postavljanje bilo koje oglasne
                            poruke kojom se krše odredbe Zakona ili ovih Uslova korišćenja.
                        </p>
                        <p>
                            Kompanija prenosom oglasnih poruka ne vrši posredovanje u prenosu vlasništva nad proizvodima ili
                            uslugama. Zaključenje ugovora kojim se prenosi neko pravo na proizvodu ili usluzi je u nadležnosti
                            lica koje takav pravni posao preduzimaju. Takođe, prenosom oglasnih poruka Kompanija ni na koji
                            način ne određuje niti utiče na sadržaj eventualnog ugovora o prenosu prava na proizvodu ili usluzi
                            koji zaključuju ugovorne strane samostalno.
                        </p>
                    </Section>

                    <Section title="Postavljanje oglasnih poruka — oglasa">
                        <p>
                            Registrovani korisnici koji oglašavaju proizvod ili uslugu, oglas dostavljaju putem formulara za
                            postavljanje oglasa na Servisu. Korisnik je dužan da prilikom postavke oglasne poruke pravilno
                            popuni sva obavezna polja iz formulara za postavljanje oglasa.
                        </p>
                        <p>
                            U slučaju da je prije objave oglasa potrebno dodatno usaglasiti tekst oglasa ili način plaćanja,
                            odnosno izvršiti određenu uplatu, oglasi će u tom slučaju biti objavljeni odmah nakon usaglašavanja
                            odnosno izvršenja uplate.
                        </p>
                        <p>
                            Lica koja eventualno imaju neizmirene novčane obaveze prema Kompaniji stiču pravo na objavljivanje
                            oglasa nakon evidentiranja izmirenja tih obaveza.
                        </p>
                        <p>
                            U slučaju da Korisnik Servisa tvrdi da proizvod ili usluga (koji se oglašavaju putem Servisa)
                            zadovoljavaju određene uslove, Kompanija ima pravo da u elektronskom obliku prikupi potrebne
                            dokaze, kako bi uvažila tvrdnju Korisnika Servisa. Ukoliko Korisnik Servisa nije u mogućnosti da
                            svoju tvrdnju dokumentuje, Kompanija zadržava pravo da mu uskrati besplatno oglašavanje na ovoj ili
                            svim platformama kojim Kompanija upravlja.
                        </p>
                        <p>
                            Kompanija, u skladu sa sopstvenom poslovnom politikom, koja se podjednako primjenjuje na sve
                            Korisnike, ograničava broj besplatnih oglasa koje svakom pojedinom Korisniku stoje na raspolaganju.
                        </p>
                        <p>
                            Ukoliko se dogodi da Korisnik zakupi paket usluga Servisa (koji namjerava da koristi tokom dužeg
                            vremenskog perioda), taj Korisnik je zaštićen od eventualnih promjena cijena oglasa za vrijeme
                            trajanja ugovora samo ukoliko je to navedeno u potpisanom ugovoru usluge oglašavanja.
                        </p>
                    </Section>

                    <Section title="Ocjene i komentari">
                        <p>Korisnici mogu da postavljaju i objavljuju sopstveni sadržaj, komentare i ocjene.</p>
                        <p>
                            Korisnici imaju mogućnost postavljanja ocjena od 1 do 5 zvjezdica. Kompanija zadržava diskreciono
                            pravo poništavanja dodijeljenih ocjena, kao i pravo da u svakoj pojedinačnoj situaciji ne poništi
                            ocjenu.
                        </p>
                        <p>
                            Registrovani korisnici imaju mogućnost postavljanja sadržaja prilikom korišćenja funkcionalnosti
                            ocjenjivanja prodavca, kao i u drugim rubrikama Servisa predviđenim za sadržaj korisnika.
                        </p>
                    </Section>

                    <Section title="Plaćanje cijene usluga i povrat sredstava">
                        <p>
                            Kompanija određene usluge informacionog društva pruža uz naknade prema Cjenovniku. Naknade
                            dospijevaju za plaćanje po dostavljanju odgovarajućeg obavještenja o plaćanju (računa, fakture) u
                            navedenim rokovima.
                        </p>
                        <p>
                            Cjenovnik Kompanije je sastavni dio ovih Uslova korišćenja. Kompanija zadržava pravo da izmijeni
                            Cjenovnik u bilo koje vrijeme.
                        </p>
                        <p>
                            Prilikom naručivanja oglasa, čije se plaćanje vrši platnim karticama, Korisniku koji nije dostavio
                            svu potrebnu dokumentaciju za objavu oglasa, ili isti nije u skladu sa Uslovima korišćenja, a
                            uplatu za isti je izvršio putem platne kartice, Kompanija će inicirati povrat rezervisanih
                            sredstava kod banke, ali ne može da garantuje za rok povrata ovih sredstava obzirom da je isti u
                            nadležnosti banke vlasnika platne kartice kojom je plaćanje izvršeno. Sigurnost podataka prilikom
                            kupovine garantuje procesor platnih kartica, pa se tako kompletni proces naplate obavlja na
                            stranicama banke.
                        </p>
                        <p>
                            Ukoliko nije došlo do saradnje između Kompanije i Korisnika, a sredstva sa kartice su povučena,
                            Kompanija će inicirati povrat naplaćenih sredstava kod svoje banke ali ne može da utiče na rok
                            povrata koji zavisi isključivo od banke vlasnika kartice kojom je oglas plaćen.
                        </p>
                        <p>
                            U slučajevima kada je potrebno izvršiti povrat uplaćenih sredstava Korisniku Servisa koji je
                            fizičko lice, neophodno je da Korisnik u navedenu svrhu dostavi Kompaniji broj lične karte.
                        </p>
                    </Section>

                    <Section title="Promocija oglasa">
                        <p>
                            Kada korisnik uplati promociju oglasa (isticanje, promovisani paket i slično), uplata se odnosi
                            isključivo na oglas za vozilo za koji je promocija aktivirana. Tokom trajanja promocije, korisnik
                            ne smije mijenjati fotografije, podatke, ili bilo koje druge informacije u oglasu za drugo vozilo.
                            U slučaju da korisnik izmijeni oglas i unese podatke o drugom vozilu, Administracija Servisa
                            zadržava pravo da ukine promociju bez povrata sredstava.
                        </p>
                    </Section>

                    <Section title="Obavještenje">
                        <p>
                            Korisnik se obavještava da mu Kompanija može periodično slati obavještenja koja se odnose na
                            sadržaj Servisa, obavještenja koja se tiču funkcionisanja Servisa, novosti Kompanije, kao i ostala
                            obavještenja i marketing promocije ove vrste putem uobičajenih kanala komunikacije poput, ali ne
                            ograničavajući se na: viber poruke, SMS poruke, e-mail poruke i slično.
                        </p>
                    </Section>

                    <Section title="Smjernice">
                        <p>Registrovani korisnici se obavezuju da prilikom izrade sadržaja poštuju ovdje navedene Smjernice.</p>
                        <p>
                            Kompanija ima pravo, ali ne i obavezu, da bez obavještenja ukloni ili ne objavi sadržaj koji bilo
                            koji registrovani korisnik postavi na Servis, a naročito ako taj sadržaj, prema diskrecionoj ocjeni
                            Kompanije, uključuje (ali nije ograničen na):
                        </p>
                        <ul className="list-disc pl-6 space-y-1.5">
                            <li>unošenje sadržaja u pogrešne rubrike (npr. navođenje broja telefona u polje koje nije predviđeno za to)</li>
                            <li>pogrešno kategorizovanje sadržaja (npr. postavljanje oglasa koji nisu relevantni za kategoriju u kojoj se oglašavaju)</li>
                            <li>ako se radi o duplom oglasu (identičan oglas objavljen više puta, oglašavanje istog proizvoda ili usluge samo pod izmijenjenim uslovima)</li>
                            <li>kada je predmet oglašavanja kupovina ili otkup</li>
                            <li>unošenje neispravnih fotografija u oglas (npr. lošeg kvaliteta; sa naknadno dodatim kontakt telefonom, logotipom drugog sajta ili firme, tekstom "prodato" i sl.)</li>
                            <li>kada jedan oglas sadrži više predmeta ili usluga oglašavanja</li>
                            <li>otvoreno uvredljiv sadržaj, ili sadržaj koji promoviše rasizam, netrpeljivost, mržnju, ili fizičko povređivanje bilo koje vrste, a koje je usmjereno na bilo koju grupu, ili pojedinca</li>
                            <li>uznemirava, ili promoviše uznemiravanje druge osobe</li>
                            <li>eksploatiše ljude na seksualni, ili nasilni način</li>
                            <li>sadrži nagost, pretjerano nasilje, ili uvredljiv sadržaj, ili sadrži vezu do web-sajtova za odrasle</li>
                            <li>traži lične informacije od osoba mlađih od 18 godina</li>
                            <li>javno objavljuje informacije koje predstavljaju, ili stvaraju rizik po privatnost, ili bezbjednost bilo koje osobe</li>
                            <li>sadrži, ili promoviše informacije za koje znate da su netačne, ili koje navode na pogrešan zaključak, ili promovišu nedozvoljene aktivnosti, ili čiji je sadržaj uvredljiv, zastrašujući, pun prijetnji, nepristojan, ili klevetnički</li>
                            <li>sadrži, ili promoviše nedozvoljenu, ili neovlašćenu kopiju zaštićenog rada druge osobe</li>
                            <li>uključuje prenos neželjene pošte, cirkularnih pisama, ili masovne pošte, instant poruka, odnosno "spam"</li>
                            <li>sadrži stranice sa ograničenim pristupom, ili stranice kojima je moguće pristupiti samo uz pomoć lozinke, ili skrivene stranice, ili fotografije (one koje nisu povezane sa drugim stranicama)</li>
                            <li>podstiče, ili promoviše kriminalne aktivnosti, ili poslove, ili pruža uputstva za obavljanje nedozvoljenih aktivnosti, uključujući, ali ne ograničavajući na izradu, ili kupovinu ilegalnog oružja, kršenje nečije privatnosti, ili pronalaženje, ili kreiranje računarskih virusa</li>
                            <li>traži lozinke, ili informacije koje vas lično identifikuju u komercijalne, ili nedozvoljene svrhe od drugih korisnika</li>
                            <li>uključuje druge komercijalne aktivnosti i/ili prodaju van svrhe Servisa, bez prethodne pisane saglasnosti Kompanije kao što su takmičenja, lutrija sa nagradama u robi i uslugama, ili piramidalne šeme</li>
                            <li>uključuje fotografiju, ili video zapis druge osobe koju ste objavili bez pristanka te osobe, ili</li>
                            <li>krši prava na privatnost, prava na javno objavljivanje, pravo na zaštitu od klevete, autorska prava, pravo na žig, prava iz ugovora, ili neka druga lična prava.</li>
                        </ul>
                    </Section>

                    <Section title="Ograničenje od odgovornosti">
                        <p>
                            Korisnici Servis koriste isključivo na svoju sopstvenu odgovornost. Korisnik izričito prihvata da
                            Kompanija ne može biti odgovorna za ponašanje drugih korisnika ili trećih lica, kao i da rizik od
                            moguće štete u cjelosti snose ta lica, a u skladu sa važećim zakonodavstvom Crne Gore.
                        </p>
                        <p>
                            Tekstovi (komentari), ocjene i drugi sadržaj koje korisnici postavljaju u za to predviđenim
                            rubrikama, moraju biti tačni i ispravni. Za tačnost na taj način unijetih podataka, odgovaraju
                            korisnici koji su ih unijeli. Tačnost unosa podrazumijeva da dolaze iz nekog kompetentnog izvora,
                            odnosno ličnog iskustva korisnika. Za svaki pojedini unos isključivu odgovornost snosi korisnik
                            koji je unos izvršio.
                        </p>
                        <p>
                            Kompanija ne garantuje za tačnost, pouzdanost, kao ni za sam sadržaj postavljen od strane
                            korisnika. Kompanija ne inicira prenos elektronske poruke koju mu je predao korisnik usluga, ne
                            vrši odabir podataka ili dokumenata koji se prenose, ne vrši izuzimanje ili izmjenu podataka u
                            sadržaju poruke ili dokumenta i ne vrši odabir primaoca prenosa.
                        </p>
                        <p>
                            Ova izjava o odgovornosti odnosi se na svu štetu (materijalnu i/ili nematerijalnu), ili povrede
                            koje bi mogle nastati iz skrivenih nedostataka, grešaka, prekida, brisanja, kvara, kašnjenja u radu
                            ili prenosu računarskih virusa, prekida u komunikacijama, krađe, uništenja ili neovlašćenog
                            pristupa podacima, promjene ili zloupotrebe podataka od strane trećih lica, raskida ugovora,
                            ponašanja suprotnog Uslovima korišćenja, nemara i dr.
                        </p>
                        <p>
                            Kompanija nije odgovorna za eventualnu privremenu nedostupnost Servisa, niti za djelimično ili
                            potpuno nefunkcionisanje ili pogrešno funkcionisanje istog. Kompanija nije odgovorna za tehničke
                            probleme koji mogu dovesti do kašnjenja i/ili pogrešne obrade elektronskih podataka, uključujući i
                            sistemski sat. Za prethodno navedeno odgovorni su davaoci Internet usluga.
                        </p>
                        <p>
                            Kao pružalac usluge informacionog društva, Kompanija nije odgovorna za bilo koji sadržaj koji je
                            postavilo drugo lice, korisnik, uključujući ali ne ograničavajući se na oglasnu poruku koju
                            prenosi, jer niti inicira prenos, niti vrši odabir sadržaja koji se prenose, niti je izuzela ili
                            izmijenila podatke u sadržaju koji se prenosi, niti je odabrala primaoca prenosa, odnosno primaoca
                            sadržaja.
                        </p>
                        <p>
                            Kompanija ne garantuje za ponašanje trećih lica, ni svojih korisnika. Kompanija, pored ostalog, ne
                            pruža nikakve garancije da će Korisnik koji je oglasio proizvod ili uslugu biti kontaktiran povodom
                            tog oglasa od strane trećih lica (odnosno da će zaključiti pravni posao koji je predmet oglasa),
                            kao ni da će dostupne informacije sadržati tačne i istinite podatke.
                        </p>
                        <p>
                            Servis može biti privremeno nedostupan ili dostupan u ograničenom obimu, kao rezultat redovnog ili
                            vanrednog održavanja sistema, ili u slučaju unapređenja sistema.
                        </p>
                    </Section>

                    <Section title="Prodaja na daljinu">
                        <p>
                            Kompanija ne snosi odgovornost za bilo kakve transakcije ili kupoprodajne ugovore koji su sklopljeni
                            između korisnika putem Servisa. Sve transakcije se odvijaju isključivo između prodavca i kupca, a
                            Kompanija ne preuzima nikakvu odgovornost za kvalitet, sigurnost, zakonitost, ili dostupnost
                            proizvoda ili usluga koje se oglašavaju. Svi artikli i usluge oglašeni putem Servisa su
                            odgovornost isključivo prodavca koji je postavio oglas.
                        </p>
                    </Section>

                    <Section title="Jurisdikcija i rešavanje sporova">
                        <p>Na sve što nije regulisano ovim Uslovima korišćenja primjenjuju se važeći propisi Crne Gore.</p>
                        <p>
                            Na sve sporove do kojih može doći između Kompanije i Korisnika u vezi sa korišćenjem Servisa
                            primjenjuju se važeći propisi Crne Gore. Kompanija i Korisnik se obavezuju da spor pokušaju da
                            riješe mirnim putem, a ukoliko u tome ne uspiju nadležan je sud u {COMPANY.court}.
                        </p>
                    </Section>

                    <Section title="Završne odredbe">
                        <p>
                            Kompanija ima pravo da u svako doba izmijeni ili dopuni ove Uslove korišćenja, tako što će izmjene
                            i dopune u prečišćenom tekstu objaviti na Internet prezentaciji Servisa.
                        </p>
                        <p>Ovi Uslovi korišćenja počinju da se primjenjuju {COMPANY.dateFrom} godine.</p>
                        <p>
                            Svaki odštampani primjerak ovih Korisničkih uslova proizvodi puno pravno dejstvo na osnovu odredbi
                            Zakona o elektronskom dokumentu, i ne može mu se osporiti punovažnost ili dokazna snaga.
                        </p>
                    </Section>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <section className="mb-8 last:mb-0">
            <h2 className="text-xl font-black text-[#12142D] mb-3">{title}</h2>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">{children}</div>
        </section>
    );
}
