<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Make;
use App\Models\VehicleModel;

class AiSearchController extends Controller
{
    // Grupe po porijeklu → ISO country kod iz makes.country (vidi MakesSeeder)
    private array $makeGroupCountries = [
        'njemacke'   => ['DE'],
        'japanske'   => ['JP'],
        'francuske'  => ['FR'],
        'italijanske'=> ['IT'],
        'americke'   => ['US'],
        'korejske'   => ['KR'],
        'svedske'    => ['SE'],
        'britanske'  => ['GB'],
        'ceske'      => ['CZ'],
        'rumunske'   => ['RO'],
    ];

    // Prevodi AI vokabular (system prompt enumi) u vokabular koji Search.jsx/AdController stvarno razumiju
    private array $fuelMap = [
        'benzin' => 'benzin', 'dizel' => 'dizel', 'elektricno' => 'elektro',
        'hibrid_benz' => 'hibrid', 'hibrid_diz' => 'hibrid',
        'plin' => 'plin', 'benzin_plin' => 'benzin+plin',
    ];
    private array $transmissionMap = [
        'manuelni' => 'manuelni', 'automatik' => 'automatik', 'poluautomatik' => 'poluautomatik',
        'cvt' => 'automatik', 'dsg' => 'automatik',
    ];
    private array $bodyTypeMap = [
        'Cabrio/Roadster'    => 'kabrio',
        'SUV/Pickup/Offroad' => 'suv',
        'Mali auto'          => 'hatchback',
        'Karavan'            => 'karavan',
        'Limuzina/Sedan'     => 'sedan',
        'Sportski/Kupe'      => 'coupe',
        'Kombi/Minibus'      => 'van',
    ];

    private string $systemPrompt = <<<PROMPT
Ti si napredni asistent za pretragu vozila na oglasnom portalu VozimeOglasi u Crnoj Gori.
Korisnici pisu slobodnim tekstom na bosanskom, srpskom, crnogorskom ili engleskom jeziku.
Tvoj zadatak: iz teksta izvuci filtere i vrati SAMO validan JSON, bez ikakvog dodatnog teksta.

VAZNO: Uvijek postavi "category". Default je "auto" ako nije jasno.
VAZNO: Smijеs koristiti opste znanje o vozilima da zakljucis filtere koji nisu eksplicitno navedeni.
VAZNO: Nikad ne izmisljaj make ili model koji nije jasno naveden ili zakljuciv.

══════════════════════════════════════════════════════════════
DOSTUPNA POLJA PO KATEGORIJI
══════════════════════════════════════════════════════════════

[KATEGORIJA: auto]
  make: string — naziv marke
  make_group: "njemacke"|"japanske"|"francuske"|"italijanske"|"americke"|"korejske"|"svedske"|"britanske"|"ceske"|"rumunske"
  model: string — naziv modela
  vehicle_type: "Cabrio/Roadster"|"SUV/Pickup/Offroad"|"Mali auto"|"Karavan"|"Limuzina/Sedan"|"Sportski/Kupe"|"Kombi/Minibus"
  fuel: "benzin"|"dizel"|"elektricno"|"hibrid_benz"|"hibrid_diz"|"plin"|"benzin_plin"
  transmission: "manuelni"|"automatik"|"poluautomatik"|"cvt"|"dsg"
  drive_type: "prednji"|"zadnji"|"4x4"
  condition: "novo"|"polovnjak"
  damage: "neosteceno"|"osteceno"|"nije_vozno"
  color_exterior: "bijela"|"crna"|"siva"|"srebrna"|"crvena"|"plava"|"zelena"|"zuta"|"narandzasta"|"braon"|"bez"|"bordo"|"ljubicasta"|"zlatna"
  color_interior: "crna"|"siva"|"bijela"|"bez"|"crvena"|"braon"|"plava"
  interior_material: "tkanina"|"koza"|"alcantara"|"kombinovano"
  emission: "euro3"|"euro4"|"euro5"|"euro6"|"euro7"
  seller: "Auto plac"|"Privatni"
  seats_from: integer
  seats_to: integer
  doors: "2/3"|"4/5"|"6/7"
  power_from: integer (ks)
  power_to: integer (ks)
  power_unit: "ks" (default) ili "kw"
  cc_from: integer (ccm)
  cc_to: integer (ccm)
  price_from: integer (EUR)
  price_to: integer (EUR)
  year_from: integer
  year_to: integer
  mileage_from: integer (km)
  mileage_to: integer (km)

[KATEGORIJA: moto]
  make: string
  moto_category: "Chopper / Cruiser"|"Dirt Bike"|"Enduro / Touring Enduro"|"Sidecar"|"Small / Lightweight"|"Moped / Mokick"|"Motocikl"|"Naked Bike"|"Pocket Bike"|"Quad/ATV"|"Rally / Cross"|"Racing"|"Roadster"|"Scooter / Roller"|"Sportbike / Superbike"|"Sport Tourer"|"Streetfighter"|"Super Moto"|"Tourer"|"Trike"
  color_exterior: iste vrijednosti kao za auto
  condition: "novo"|"polovnjak"
  cc_from, cc_to: integer (ccm)
  power_from, power_to: integer (ks)
  price_from, price_to: integer (EUR)
  year_from, year_to: integer
  mileage_to: integer (km)

[KATEGORIJA: nautika]
  boat_type: "Camac"|"Gliser"|"Jedrilica"|"Jahta"|"Katamaran"|"Gumenjak / RIB"
  make: string
  model: string
  hull_material: "Fibreglas/Plastika"|"Aluminijum"|"Celik"|"Drvo"|"Guma/PVC"
  engine_type: "Vanbrodski (Outboard)"|"Unutrasnji (Inboard)"|"I/O (Sterndrive)"|"Elektricni"|"Bez motora (jedra)"
  length: "do 5m"|"5-8m"|"8-12m"|"12-20m"|"20m+"
  cabins: integer
  berths: integer
  extras: array of strings from ["GPS/Chartplotter","VHF Radio","Autopilot","Dubinomjer/Fishfinder","Radar","Bimini/Tenda","Platforma za kupanje","Solarni panel","Generator","Oprema za ribolov","Oprema za ronjenje","Navigacijska svjetla"]
  hp_from, hp_to: integer
  price_from, price_to: integer (EUR)
  year_from, year_to: integer
  condition: "novo"|"polovnjak"

[KATEGORIJA: transport]
  truck_category: "kombi"|"kamion-do-7t"|"kamion-preko-7t"|"prikolica"|"autobus"|"kamper"
  make: string
  model: string
  price_from, price_to: integer (EUR)
  year_from, year_to: integer
  mileage_to: integer (km)
  condition: "novo"|"polovnjak"

══════════════════════════════════════════════════════════════
PRAVILA ZA DIREKTNO MAPIRANJE (eksplicitni unos)
══════════════════════════════════════════════════════════════

// Tip karoserije
"mali auto","mali gradski","city car" → vehicle_type:"Mali auto"
"karavan","combination","kombi karavan" → vehicle_type:"Karavan"
"terenac","dzip","jeep","SUV","offroad","4x4 auto" → vehicle_type:"SUV/Pickup/Offroad"
"kabriolet","kabrio","convertible","roadster" → vehicle_type:"Cabrio/Roadster"
"limuzina","sedan","limuzine" → vehicle_type:"Limuzina/Sedan"
"sportski","kupe","coupe" → vehicle_type:"Sportski/Kupe"
"kombi","minibus","minivan","van" → vehicle_type:"Kombi/Minibus"

// Gorivo
"benzin","benzinac" → fuel:"benzin"
"dizel","dizelas","nafta" → fuel:"dizel"
"elektricni","struja","EV","elektro","baterija" → fuel:"elektricno"
"hibrid","hybrid" → fuel:"hibrid_benz"
"dizel hibrid" → fuel:"hibrid_diz"
"plin","LPG","gas" → fuel:"plin"
"benzin plin","biplivo" → fuel:"benzin_plin"

// Mjenjac
"automat","automatska","automatic","DSG","S tronic","CVT","Tiptronic","torque converter" → transmission:"automatik"
"manuelni","rucni","manual","steptronic na rucno" → transmission:"manuelni"
"poluautomat","sekvencijalni" → transmission:"poluautomatik"

// Pogon
"prednji pogon","FWD","prednjak" → drive_type:"prednji"
"zadnji pogon","RWD","zadnjak" → drive_type:"zadnji"
"4x4","AWD","quattro","xDrive","4Motion","4MATIC","all wheel","pogon na sva 4" → drive_type:"4x4"

// Boja
"crna","crni","crno","black" → color_exterior:"crna"
"bijela","bijeli","bijelo","white" → color_exterior:"bijela"
"siva","sivi","sivo","grey","gray" → color_exterior:"siva"
"srebrna","srebrni","silver" → color_exterior:"srebrna"
"crvena","crveni","crveno","red" → color_exterior:"crvena"
"plava","plavi","plavo","blue" → color_exterior:"plava"
"zelena","zeleni","zeleno","green" → color_exterior:"zelena"
"zuta","zuti","zuto","yellow" → color_exterior:"zuta"
"narandzasta","orange" → color_exterior:"narandzasta"
"braon","smedja","brown" → color_exterior:"braon"
"bez","krem","beze","beige" → color_exterior:"bez"
"bordo","tamnocrvena","burgundy","wine" → color_exterior:"bordo"
"ljubicasta","purple","violet" → color_exterior:"ljubicasta"
"zlatna","zlatni","gold" → color_exterior:"zlatna"

// Enterijer
"kozna sjedista","koza","leather","koža" → interior_material:"koza"
"tkanina","fabric","platno" → interior_material:"tkanina"
"alcantara" → interior_material:"alcantara"

// Stanje / ostecenje
"nov","novo","new","0km","nula km","nekoristen" → condition:"novo"
"polovan","rabljeni","polovnjak","second hand","used" → condition:"polovnjak"
"neostecen","ispravno","u odlicnom stanju","nije bocan" → damage:"neosteceno"
"ostecen","bocan","havarisan","uvoz za dijelove" → damage:"osteceno"
"nije vozno","kvar","na dijelove","ne radi" → damage:"nije_vozno"

// Prodavac
"auto plac","salon","diler","dealer","zastupnik" → seller:"Auto plac"
"privatni","privatno","od vlasnika","fizicko lice" → seller:"Privatni"

// Emisija
"Euro 3","Euro3","E3" → emission:"euro3"
"Euro 4","Euro4","E4" → emission:"euro4"
"Euro 5","Euro5","E5" → emission:"euro5"
"Euro 6","Euro6","E6" → emission:"euro6"
"Euro 7","Euro7","E7" → emission:"euro7"

// Moto kategorije
"skuter","roller","scooter" → moto_category:"Scooter / Roller"
"chopper","cruiser","harley","bobber" → moto_category:"Chopper / Cruiser"
"enduro","adventure","GS" → moto_category:"Enduro / Touring Enduro"
"quad","ATV","cetverotockas" → moto_category:"Quad/ATV"
"superbike","sportbike","supersport" → moto_category:"Sportbike / Superbike"
"naked","streetfighter" → moto_category:"Naked Bike"
"touring","tourer","grand tour" → moto_category:"Tourer"
"moped","mokick","50cc" → moto_category:"Moped / Mokick"
"cross","dirt","motocross","enduro cross" → moto_category:"Dirt Bike"
"pistas","staza","track","racing","trkacki" → moto_category:"Racing"
"trike" → moto_category:"Trike"

// Nautika
"jahta","motorna jahta","mega jahta" → boat_type:"Jahta"
"jedrilica","jedriličar","sailboat" → boat_type:"Jedrilica"
"gliser","motorni camac","speedboat" → boat_type:"Gliser"
"camac","ribarski camac","rowboat" → boat_type:"Camac"
"gumenjak","RIB","pneumatik" → boat_type:"Gumenjak / RIB"
"katamaran","catamaran" → boat_type:"Katamaran"

// Transport
"kombi","transporter","dostavno","van za posao" → truck_category:"kombi"
"kamion","sleper","tegljac","TIR" → truck_category:"kamion-preko-7t"
"mali kamion","laki kamion","dostavnjak" → truck_category:"kamion-do-7t"
"prikolica","poluprikolica","trailer" → truck_category:"prikolica"
"autobus","bus","turisticki autobus" → truck_category:"autobus"
"kamper","motorhome","kamp prikolica","kucica na tocovima" → truck_category:"kamper"

// Jeftino bez cijene
"jeftin","jeftino","povoljno" (bez navedene cijene) → price_to:8000

══════════════════════════════════════════════════════════════
IMPLICITNI ZAKLJUCCI (opste znanje — koristi slobodno)
══════════════════════════════════════════════════════════════

// Namjena i zivotni stil
"za penzionera","lagan za voziti","udoban" → transmission:"automatik", fuel:"benzin", price_to:12000
"za studenta","studentski budzet","student" → price_to:6000, condition:"polovnjak"
"za grad","gradska voznja","parking","uska ulica" → vehicle_type:"Mali auto"
"za more","plazu","ljetovanje","ljeto" → vehicle_type:"Cabrio/Roadster"
"za planinu","planinski put","snijeg","zimski teren" → vehicle_type:"SUV/Pickup/Offroad", drive_type:"4x4"
"za posao","dnevna migracija","puno vozim" → fuel:"dizel", transmission:"automatik"
"za vikend","nedjeljna voznja","hobby" → condition:"polovnjak"
"za izlaske","prestige","status","luksuz" → vehicle_type:"Limuzina/Sedan" ili "Sportski/Kupe"
"za gradiliste","grade","teret","posao na terenu" → category:"transport", truck_category:"kombi"
"dostavna sluzba","kuriri","transport robe" → category:"transport", truck_category:"kombi" ili "kamion-do-7t"

// Porodica i putnici
"za familiju","porodicni","za djecu","familija" (auto) → vehicle_type:"Karavan", seats_from:5
"za familiju","porodicni","za djecu" (nautika) → cabins:2, berths:4
"7 mjesta","7 sjedista","7 putnika" → seats_from:7
"8 mjesta","8 sjedista","minibus" → vehicle_type:"Kombi/Minibus", seats_from:8

// Bezbijednost
"siguran auto","bezbjedan","za djecu","family safe" → seats_from:5, doors:"4/5"
"novi sigurnosni standardi" → emission:"euro6"

// Snaga i performanse
"jak","snazан","brz","sport" → power_from:150 (ks)
"ekonomican","stedljiv","ne trosi" → fuel:"benzin" ili "hibrid_benz", power_to:120 (ks)
"mali motor","slabiji motor" → cc_to:1400
"veliki motor","jaki motor","V8","V6" → cc_from:2500

// Porijeklo marke — make_group (backend ce da ih prevede u ID-eve)
"njemac","njemacko","deutsches auto","aus Deutschland" → make_group:"njemacke"
"japanac","japansko","japanese" → make_group:"japanske"
"francuz","francusko","french" → make_group:"francuske"
"talijan","italijansko","italian" → make_group:"italijanske"
"amerikanac","americko","american" → make_group:"americke"
"korejac","korejsko","korean" → make_group:"korejske"
"svedjanin","svedsko","swedish" → make_group:"svedske"
"englez","britanac","britansko","british" → make_group:"britanske"
"skoda" → make:"Skoda" (direktno, ne grupa)
"dacia","dacija" → make:"Dacia"
"tesla" → make:"Tesla"

// Moto — iskustvo vozaca
"pocetnik","prvi motocikl","bez iskustva","A2 kategorija" → cc_to:400, power_to:47 (ks)
"iskusan vozac","A kategorija","za napredne" → cc_from:600
"mali moto","lagan" → moto_category:"Small / Lightweight", cc_to:300

// Moto — stil voznje
"za ture","putovanje motorom","duge relacije" → moto_category:"Tourer"
"gradski moto","za grad","za parking" → moto_category:"Scooter / Roller"
"off road moto","planinski","za blato" → moto_category:"Enduro / Touring Enduro"

// Nautika — namjena
"pecanje","ribolov","ribolovni" → extras:["Oprema za ribolov","Dubinomjer/Fishfinder"]
"ronjenje","diving","podvodni" → extras:["Oprema za ronjenje"]
"krstarenje","more","odmor na moru" → boat_type:"Jahta", cabins:1
"jedrenje","jedra","bez motora" → boat_type:"Jedrilica", engine_type:"Bez motora (jedra)"
"brzina","brzi camac","powerboat" → boat_type:"Gliser"
"porodica + more","familija na moru" → boat_type:"Jahta", cabins:2, berths:4, extras:["Platforma za kupanje","Bimini/Tenda"]

// Transport — specifican posao
"pizzerija","restoran","catering","dostava hrane" → truck_category:"kombi"
"selidba","preseljenje" → truck_category:"kombi" ili "kamion-do-7t"
"gradjevina","beton","materijal" → truck_category:"kamion-do-7t" ili "kamion-preko-7t"
"turizam","izleti","ekskurzija" → truck_category:"autobus"
"kampovanje","putovanje","zivot u pokretu" → truck_category:"kamper"

══════════════════════════════════════════════════════════════
VAZNE NAPOMENE
══════════════════════════════════════════════════════════════
- Uvijek ukljuci "category" u odgovor
- Nikad ne vracaj objasnjenja, samo JSON
- Ako korisnik pita nesto sto nije vozilo — vrati {"category":"auto"}
- Ako imas make_group I make u istoj poruci — uzmi make (specificniji)
- Kombinuj vise zakljucaka slobodno: "njemacki SUV za planinu" → make_group + vehicle_type + drive_type
- Cijene su uvijek u EUR
- Kilometraza je uvijek u km
- Kubikaza je uvijek ccm

══════════════════════════════════════════════════════════════
PRIMJERI
══════════════════════════════════════════════════════════════
Ulaz: "sva crna vozila"
Izlaz: {"category":"auto","color_exterior":"crna"}

Ulaz: "njemac ispod 30 hiljada, auto, familija"
Izlaz: {"category":"auto","make_group":"njemacke","vehicle_type":"Karavan","seats_from":5,"price_to":30000}

Ulaz: "BMW X5 dizel 4x4 do 30000, ne stariji od 2018"
Izlaz: {"category":"auto","make":"BMW","model":"X5","fuel":"dizel","drive_type":"4x4","price_to":30000,"year_from":2018}

Ulaz: "siguran auto za djecu, automatik, do 15000"
Izlaz: {"category":"auto","transmission":"automatik","seats_from":5,"doors":"4/5","price_to":15000}

Ulaz: "auto za penzionera, udoban, ne trosi mnogo"
Izlaz: {"category":"auto","transmission":"automatik","fuel":"benzin","price_to":12000}

Ulaz: "japanski SUV 4x4 Euro 6, koza, do 25000"
Izlaz: {"category":"auto","make_group":"japanske","vehicle_type":"SUV/Pickup/Offroad","drive_type":"4x4","emission":"euro6","interior_material":"koza","price_to":25000}

Ulaz: "Honda skuter crni do 3000"
Izlaz: {"category":"moto","make":"Honda","moto_category":"Scooter / Roller","color_exterior":"crna","price_to":3000}

Ulaz: "pistas za ispod 5 hiljada"
Izlaz: {"category":"moto","moto_category":"Racing","price_to":5000}

Ulaz: "prvi motocikl za pocetnika, do 4000"
Izlaz: {"category":"moto","cc_to":400,"power_to":47,"price_to":4000}

Ulaz: "jahta za familiju i ljude koji pecaju"
Izlaz: {"category":"nautika","boat_type":"Jahta","cabins":2,"berths":4,"extras":["Oprema za ribolov","Dubinomjer/Fishfinder"]}

Ulaz: "jedrilica bez motora, do 50000"
Izlaz: {"category":"nautika","boat_type":"Jedrilica","engine_type":"Bez motora (jedra)","price_to":50000}

Ulaz: "Mercedes Sprinter kombi za pizzeriju, 2018+"
Izlaz: {"category":"transport","truck_category":"kombi","make":"Mercedes-Benz","year_from":2018}

Ulaz: "kamper za putovanje po Evropi, do 40000"
Izlaz: {"category":"transport","truck_category":"kamper","price_to":40000}

Ulaz: "auto za more, ljeto, kabrio, do 12000"
Izlaz: {"category":"auto","vehicle_type":"Cabrio/Roadster","price_to":12000}
PROMPT;

    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:3|max:300',
        ]);

        $query = trim($request->input('query'));

        Log::info('AI search start', ['query' => $query]);

        try {
            $response = Http::withHeaders([
                'x-api-key'         => config('services.anthropic.key'),
                'anthropic-version' => '2023-06-01',
                'content-type'      => 'application/json',
            ])->timeout(15)->post('https://api.anthropic.com/v1/messages', [
                'model'      => 'claude-haiku-4-5-20251001',
                'max_tokens' => 600,
                'system'     => $this->systemPrompt,
                'messages'   => [
                    ['role' => 'user', 'content' => $query],
                ],
            ]);

            Log::info('AI search response', ['status' => $response->status(), 'body' => $response->body()]);

            if (!$response->successful()) {
                Log::error('Anthropic API error', ['status' => $response->status(), 'body' => $response->body()]);
                return response()->json(['filters' => [], 'fallback' => true], 200);
            }

            $content = $response->json('content.0.text', '{}');
            $content  = preg_replace('/^```(?:json)?\s*/i', '', trim($content));
            $content  = preg_replace('/\s*```$/', '', $content);
            $aiFilters = json_decode(trim($content), true);

            if (!is_array($aiFilters)) {
                return response()->json(['filters' => [], 'fallback' => true]);
            }

            $category = $aiFilters['category'] ?? 'auto';
            $filters  = $this->resolveFilters($aiFilters, $category);

            Log::info('AI search resolved', ['category' => $category, 'filters' => $filters]);

            return response()->json([
                'filters'  => $filters,
                'fallback' => empty($filters),
            ]);

        } catch (\Exception $e) {
            Log::error('AI search exception', ['message' => $e->getMessage()]);
            return response()->json(['filters' => [], 'fallback' => true], 200);
        }
    }

    private function resolveFilters(array $ai, string $category): array
    {
        $tabMap  = ['auto' => 'auto', 'moto' => 'moto', 'nautika' => 'nautika', 'transport' => 'truck'];
        $filters = ['tab' => $tabMap[$category] ?? 'auto'];

        // Zajednicki numericko/string filteri
        foreach (['price_from','price_to','year_from','year_to'] as $key) {
            if (isset($ai[$key]) && is_numeric($ai[$key])) $filters[$key] = (int) $ai[$key];
        }

        switch ($category) {

            // ══════════════════════════════════════
            case 'auto':

                // make_group → svi make_ids iz grupe, na osnovu makes.country (samo ako nemamo tacan make)
                $groupIds = [];
                if (!empty($ai['make_group']) && empty($ai['make'])) {
                    $countries = $this->makeGroupCountries[$ai['make_group']] ?? [];
                    if (!empty($countries)) {
                        $groupIds = Make::where('is_active', true)
                            ->whereIn('country', $countries)
                            ->pluck('id')
                            ->toArray();
                    }
                }

                // make string → make_id (DB resolve), ima prioritet nad grupom
                // NAPOMENA: Search.jsx prihvata samo jedan make_id — grupa se ne moze reprezentovati na toj stranici.
                if (!empty($ai['make'])) {
                    $makeId = $this->resolveMakeId($ai['make']);
                    if ($makeId) {
                        $filters['make_id'] = $makeId;
                        if (!empty($ai['model'])) {
                            $modelId = $this->resolveModelId($makeId, $ai['model']);
                            if ($modelId) $filters['model_id'] = $modelId;
                        }
                    }
                } elseif (count($groupIds) === 1) {
                    $filters['make_id'] = (string) $groupIds[0];
                }

                if (!empty($ai['vehicle_type']) && isset($this->bodyTypeMap[$ai['vehicle_type']])) {
                    $filters['body_type'] = $this->bodyTypeMap[$ai['vehicle_type']];
                }
                if (!empty($ai['fuel']) && isset($this->fuelMap[$ai['fuel']])) {
                    $filters['fuel_type'] = $this->fuelMap[$ai['fuel']];
                }
                if (!empty($ai['transmission']) && isset($this->transmissionMap[$ai['transmission']])) {
                    $filters['transmission'] = $this->transmissionMap[$ai['transmission']];
                }
                if (!empty($ai['drive_type']))        $filters['drive_type']         = $ai['drive_type'];
                if (!empty($ai['condition']))         $filters['condition']          = $ai['condition'];
                if (!empty($ai['damage']))            $filters['damage']             = $ai['damage'];
                if (isset($ai['mileage_to']) && is_numeric($ai['mileage_to']))     $filters['mileage_to']   = (int) $ai['mileage_to'];
                if (isset($ai['power_from']) && is_numeric($ai['power_from'])) {
                    $filters['power_kw_from'] = ($ai['power_unit'] ?? 'ks') === 'kw' ? (int) $ai['power_from'] : (int) round($ai['power_from'] * 0.7355);
                }
                if (isset($ai['power_to']) && is_numeric($ai['power_to'])) {
                    $filters['power_kw_to'] = ($ai['power_unit'] ?? 'ks') === 'kw' ? (int) $ai['power_to'] : (int) round($ai['power_to'] * 0.7355);
                }
                break;

            // ══════════════════════════════════════
            case 'moto':
                if (!empty($ai['make'])) {
                    $makeId = $this->resolveMakeId($ai['make']);
                    if ($makeId) $filters['moto_makes'] = $makeId;
                }
                if (!empty($ai['moto_category']))     $filters['kategorije']         = $ai['moto_category'];
                if (!empty($ai['condition']))         $filters['condition']          = $ai['condition'];
                if (!empty($ai['color_exterior']))    $filters['color_exterior']     = $ai['color_exterior'];
                if (isset($ai['mileage_to']) && is_numeric($ai['mileage_to'])) $filters['mileage_to'] = (int) $ai['mileage_to'];
                if (isset($ai['cc_from']) && is_numeric($ai['cc_from']))       $filters['cc_from']     = (int) $ai['cc_from'];
                if (isset($ai['cc_to']) && is_numeric($ai['cc_to']))           $filters['cc_to']       = (int) $ai['cc_to'];
                if (isset($ai['power_from']) && is_numeric($ai['power_from'])) $filters['power_from']  = (int) $ai['power_from'];
                if (isset($ai['power_to']) && is_numeric($ai['power_to']))     $filters['power_to']    = (int) $ai['power_to'];
                if (isset($filters['power_from']) || isset($filters['power_to'])) {
                    $filters['power_unit'] = $ai['power_unit'] ?? 'ks';
                }
                break;

            // ══════════════════════════════════════
            case 'nautika':
                if (!empty($ai['boat_type']))         $filters['tip']               = $ai['boat_type'];
                if (!empty($ai['make']))              $filters['make']              = $ai['make'];
                if (!empty($ai['model']))             $filters['model']             = $ai['model'];
                if (!empty($ai['hull_material']))     $filters['hull_material']     = $ai['hull_material'];
                if (!empty($ai['engine_type']))       $filters['engine_type']       = $ai['engine_type'];
                if (!empty($ai['length']))            $filters['length']            = $ai['length'];
                if (isset($ai['cabins']) && is_numeric($ai['cabins']))   $filters['cabins']  = (int) $ai['cabins'];
                if (isset($ai['berths']) && is_numeric($ai['berths']))   $filters['berths']  = (int) $ai['berths'];
                if (isset($ai['hp_from']) && is_numeric($ai['hp_from'])) $filters['hp_from'] = (int) $ai['hp_from'];
                if (isset($ai['hp_to']) && is_numeric($ai['hp_to']))     $filters['hp_to']   = (int) $ai['hp_to'];
                if (!empty($ai['condition']))         $filters['condition']         = $ai['condition'];
                // extras je array — joinamo sa zarezom za URL
                if (!empty($ai['extras']) && is_array($ai['extras'])) {
                    $filters['extras'] = implode(',', $ai['extras']);
                }
                break;

            // ══════════════════════════════════════
            case 'transport':
                if (!empty($ai['truck_category']))    $filters['truck_kats']        = $ai['truck_category'];
                if (!empty($ai['make']))              $filters['truck_makes']       = $ai['make'];
                if (!empty($ai['model']))             $filters['model']             = $ai['model'];
                if (isset($ai['mileage_to']) && is_numeric($ai['mileage_to'])) $filters['mileage_to'] = (int) $ai['mileage_to'];
                if (!empty($ai['condition']))         $filters['condition']         = $ai['condition'];
                break;
        }

        return $filters;
    }

    // Skida dijakritike (š→s, č→c, ë→e...) da "skoda" nadje "Škoda", "citroen" nadje "Citroën" itd.
    private function normalize(string $value): string
    {
        $map = [
            'š'=>'s','č'=>'c','ć'=>'c','ž'=>'z','đ'=>'d',
            'Š'=>'S','Č'=>'C','Ć'=>'C','Ž'=>'Z','Đ'=>'D',
            'ë'=>'e','é'=>'e','è'=>'e','ê'=>'e','ï'=>'i','î'=>'i',
            'ö'=>'o','ô'=>'o','ü'=>'u','û'=>'u','ñ'=>'n','ç'=>'c',
        ];
        return strtolower(strtr($value, $map));
    }

    private function resolveMakeId(string $makeName): ?string
    {
        $needle = $this->normalize($makeName);
        $makes  = Make::where('is_active', true)->get(['id', 'name']);

        $exact = null;
        $partial = null;
        foreach ($makes as $make) {
            $candidate = $this->normalize($make->name);
            if ($candidate === $needle) {
                $exact = $make;
                break;
            }
            if ($partial === null && (str_contains($candidate, $needle) || str_contains($needle, $candidate))) {
                $partial = $make;
            }
        }

        $match = $exact ?? $partial;
        return $match ? (string) $match->id : null;
    }

    private function resolveModelId(string $makeId, string $modelName): ?string
    {
        $needle = $this->normalize($modelName);
        $models = VehicleModel::where('make_id', (int) $makeId)->get(['id', 'name']);

        $exact = null;
        $partial = null;
        foreach ($models as $model) {
            $candidate = $this->normalize($model->name);
            if ($candidate === $needle) {
                $exact = $model;
                break;
            }
            if ($partial === null && (str_contains($candidate, $needle) || str_contains($needle, $candidate))) {
                $partial = $model;
            }
        }

        $match = $exact ?? $partial;
        return $match ? (string) $match->id : null;
    }
}