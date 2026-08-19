<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Make;
use App\Models\VehicleModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

/**
 * Uvoz oglasa sa autodiler.me — korisnik nalijepi link svog oglasa,
 * mi parsiramo stranicu i vratimo popunjena polja za formu.
 * Slike se NE prenose (imaju AutoDiler watermark) — korisnik dodaje svoje.
 */
class AdImportController extends Controller
{
    public function parse(Request $request): JsonResponse
    {
        $request->validate(['url' => ['required', 'url']]);

        $host = parse_url($request->url, PHP_URL_HOST) ?? '';
        if (!preg_match('/(^|\.)autodiler\.me$/i', $host)) {
            return response()->json(['message' => 'Link mora biti sa autodiler.me.'], 422);
        }

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
                'Accept-Language' => 'sr,hr;q=0.9,en;q=0.8',
            ])->timeout(20)->get($request->url);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Ne mogu da učitam stranicu oglasa. Pokušaj ponovo.'], 502);
        }

        if (!$response->ok()) {
            return response()->json(['message' => 'AutoDiler je vratio grešku (' . $response->status() . '). Provjeri da li je link ispravan.'], 422);
        }

        $html = $response->body();
        if (!str_contains($html, 'oglasi-headline-model')) {
            return response()->json(['message' => 'Ovo ne izgleda kao stranica oglasa. Nalijepi direktan link na oglas.'], 422);
        }

        $dom = new \DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="utf-8"?>' . $html, LIBXML_NOERROR | LIBXML_NOWARNING);
        libxml_clear_errors();
        $xp = new \DOMXPath($dom);

        // ─── Sirovi podaci sa stranice ────────────────────────────
        $title = $this->text($xp, '//h1[contains(@class,"oglasi-headline-model")]');
        $priceRaw = $this->text($xp, '//div[contains(@class,"cena")]/p');
        $priceType = $this->text($xp, '//div[contains(@class,"vrsta-cene")]/p');
        $description = $this->text($xp, '//p[contains(@class,"oglasi-opis-text")]');

        $breadcrumbs = [];
        foreach ($xp->query('//a[contains(@class,"ad-breadcrumbs__link")]') as $node) {
            $breadcrumbs[] = trim($node->textContent);
        }

        // Osnovne informacije: <li><p>Label:</p><span>Vrijednost</span></li>
        $specs = [];
        foreach ($xp->query('//div[contains(@class,"oglasi-osnovne-informacije")]//li') as $li) {
            $label = trim(str_replace(':', '', $this->nodeText($xp, './/p', $li)));
            $value = trim($this->nodeText($xp, './/span', $li));
            if ($label !== '' && $value !== '') {
                $specs[$this->norm($label)] = $value;
            }
        }

        // Lokacija (Država / Grad / Lokacija)
        foreach ($xp->query('//div[contains(@class,"oglasi-dodatne-informacije")]//li') as $li) {
            $label = trim($this->nodeText($xp, './/p', $li));
            $value = trim($this->nodeText($xp, './/span', $li));
            if ($label !== '' && $value !== '') {
                $specs[$this->norm($label)] = $value;
            }
        }

        // Oprema i istorija — sekcije sa naslovom + listom stavki
        $equipmentNames = [];
        $historyNames = [];
        foreach ($xp->query('//div[contains(@class,"oglasi-dodatna-oprema")]') as $section) {
            $heading = $this->norm($this->nodeText($xp, './/div[contains(@class,"oglasi-info-heading")]/p', $section));
            $items = [];
            foreach ($xp->query('.//li', $section) as $li) {
                $clone = $li->cloneNode(true);
                // Tooltip divovi sadrže <style> CSS — izbaci ih prije čitanja teksta
                foreach (['style', 'script'] as $tag) {
                    $junk = (new \DOMXPath($clone->ownerDocument))->query('.//' . $tag, $clone);
                    foreach (iterator_to_array($junk) as $j) {
                        $j->parentNode->removeChild($j);
                    }
                }
                $t = trim(preg_replace('/\s+/', ' ', $clone->textContent));
                if ($t !== '' && mb_strlen($t) < 80) {
                    $items[] = $t;
                }
            }
            if ($heading === 'istorija vozila') {
                $historyNames = array_merge($historyNames, $items);
            } elseif ($heading !== '' && $heading !== 'lokacija oglasa' && $heading !== 'opis oglasa' && $heading !== 'slicni oglasi') {
                $equipmentNames = array_merge($equipmentNames, $items);
            }
        }

        // ─── Mapiranje na naš šifarnik ────────────────────────────
        $form = [];
        $meta = ['unmapped' => [], 'unmatched_equipment' => []];

        // Kategorija iz breadcrumb-a (Početna, Kategorija, Marka, Model, Država, Grad)
        $adCategory = $this->norm($breadcrumbs[1] ?? 'automobili');
        $categorySlug = match (true) {
            str_contains($adCategory, 'automobil') => 'automobili',
            str_contains($adCategory, 'motocikl'), str_contains($adCategory, 'motori') => 'motocikli',
            str_contains($adCategory, 'plovil'), str_contains($adCategory, 'nautik') => 'nautika',
            default => 'transport',
        };
        // Sve osim automobila tretiraj oprezno — forma je pravljena za automobile
        $category = DB::table('vehicle_categories')->where('slug', $categorySlug)->whereNull('parent_id')->first();
        if ($category) {
            $form['category_id'] = $category->id;
        }

        // Marka i model
        $makeName = $breadcrumbs[2] ?? null;
        $modelName = $breadcrumbs[3] ?? null;
        $make = null;
        if ($makeName && $category) {
            $make = Make::where('category_id', $category->id)->get()
                ->first(fn($m) => $this->norm($m->name) === $this->norm($makeName)
                    || str_replace([' ', '-'], '', $this->norm($m->name)) === str_replace([' ', '-'], '', $this->norm($makeName)));
            if ($make) {
                $form['make_id'] = $make->id;
            } else {
                $meta['unmapped'][] = ['label' => 'Marka', 'value' => $makeName];
            }
        }
        if ($modelName && $make) {
            $models = VehicleModel::where('make_id', $make->id)->get();
            $target = str_replace([' ', '-'], '', $this->norm($modelName));
            $model = $models->first(fn($m) => str_replace([' ', '-'], '', $this->norm($m->name)) === $target)
                ?? $models->first(fn($m) => str_starts_with($target, str_replace([' ', '-'], '', $this->norm($m->name))));
            if ($model) {
                $form['model_id'] = $model->id;
            } else {
                $meta['unmapped'][] = ['label' => 'Model', 'value' => $modelName];
            }
        }

        // Grad
        $cityName = $specs['grad'] ?? ($breadcrumbs[5] ?? null);
        if ($cityName) {
            $city = DB::table('cities')->get()->first(fn($c) => $this->norm($c->name) === $this->norm($cityName));
            if ($city) {
                $form['city_id'] = $city->id;
            } else {
                $meta['unmapped'][] = ['label' => 'Grad', 'value' => $cityName];
            }
        }

        // Naslov: "Audi - A6 - 3.0 TDI QUATTRO 3XS-line" → "Audi A6 3.0 TDI QUATTRO 3XS-line"
        if ($title) {
            $clean = trim(preg_replace('/\s+/', ' ', str_replace(' - ', ' ', $title)));
            $form['title'] = mb_substr($clean, 0, 100);
        }

        if ($priceRaw && preg_match_all('/\d+/', $priceRaw, $m)) {
            $form['price'] = (int) implode('', $m[0]);
        }
        $form['price_negotiable'] = str_contains($this->norm($priceType ?? ''), 'dogovor');

        if ($description) {
            $form['description'] = trim($description);
        }

        // ─── Tehnička polja ───────────────────────────────────────
        // Prvo skini sufikse jedinica (cm3, km, kW…) da njihove cifre ne uđu u broj
        $numeric = function ($v) {
            $v = preg_replace('/(cm3|cm³|kwh|kw|km\/h|km|ks|ccm)/iu', '', (string) $v);
            return (int) preg_replace('/\D+/', '', $v);
        };

        if (isset($specs['kilometraza']))  $form['mileage'] = $numeric($specs['kilometraza']);
        if (isset($specs['kubikaza']))     $form['engine_cc'] = $numeric($specs['kubikaza']);
        if (isset($specs['kilovata']))     $form['power_kw'] = $numeric($specs['kilovata']);
        if (isset($specs['godiste']))      $form['year'] = $numeric($specs['godiste']);

        $enumMaps = [
            'gorivo' => ['fuel_type', [
                'benzin' => 'benzin', 'dizel' => 'dizel',
                'hibrid dizel' => 'hibrid_diz', 'hibrid benzin' => 'hibrid_benz', 'hibrid' => 'hibrid_benz',
                'elektro' => 'elektricno', 'elektricni pogon' => 'elektricno', 'struja' => 'elektricno',
                'benzin i gas' => 'benzin_plin', 'benzin i plin' => 'benzin_plin', 'benzin plin' => 'benzin_plin',
                'plin' => 'plin', 'tng' => 'plin', 'gas' => 'plin', 'metan' => 'metan', 'cng' => 'metan', 'vodik' => 'vodik',
            ]],
            'mjenjac' => ['transmission', [
                'automatski' => 'automatik', 'automatik' => 'automatik',
                'manuelni' => 'manuelni', 'mehanicki' => 'manuelni', 'rucni' => 'manuelni',
                'poluautomatski' => 'poluautomatik', 'poluautomatik' => 'poluautomatik',
                'cvt' => 'cvt', 'dsg' => 'dsg', 'tiptronic' => 'tiptronic',
            ]],
            'karoserija' => ['body_type', [
                'karavan' => 'karavan', 'limuzina' => 'limuzina', 'sedan' => 'sedan',
                'hecbek' => 'hatchback', 'hatchback' => 'hatchback',
                'kupe' => 'coupe', 'coupe' => 'coupe', 'kabriolet' => 'kabrio', 'kabrio' => 'kabrio',
                'dzip' => 'suv', 'suv' => 'suv', 'terenac' => 'terenac', 'crossover' => 'crossover',
                'pickup' => 'pickup', 'pik ap' => 'pickup', 'pik-ap' => 'pickup',
                'monovolumen' => 'van', 'minivan' => 'van', 'kombi' => 'van', 'kompakt' => 'kompakt',
                'roadster' => 'roadster', 'targa' => 'targa',
            ]],
            'pogon' => ['drive_type', [
                '4x4' => '4x4', 'prednji' => 'prednji', 'zadnji' => 'zadnji', 'awd' => 'awd',
                'sva cetiri' => '4x4', 'pogon na sva cetiri tocka' => '4x4',
            ]],
            'ostecenje' => ['damage', [
                'bez ostecenja' => 'neosteceno', 'nije osteceno' => 'neosteceno',
                'osteceno' => 'osteceno', 'osteceno u voznom stanju' => 'osteceno', 'osteceno - u voznom stanju' => 'osteceno', 'u voznom stanju' => 'osteceno',
                'osteceno nije u voznom stanju' => 'nije_vozno', 'osteceno - nije u voznom stanju' => 'nije_vozno', 'nije u voznom stanju' => 'nije_vozno',
                'udareno' => 'osteceno', 'havarisano' => 'nije_vozno',
            ]],
            'stanje' => ['condition', ['novo' => 'novo', 'polovno' => 'polovnjak', 'koristeno' => 'polovnjak']],
            'emisioni standard' => ['emission_class', [
                'euro 1' => 'euro1', 'euro 2' => 'euro2', 'euro 3' => 'euro3', 'euro 4' => 'euro4',
                'euro 5' => 'euro5', 'euro 6' => 'euro6', 'euro 7' => 'euro7',
            ]],
            'boja spoljasnosti' => ['color_exterior', [
                'bijela' => 'bijela', 'bela' => 'bijela', 'crna' => 'crna', 'siva' => 'siva', 'srebrna' => 'srebrna',
                'crvena' => 'crvena', 'plava' => 'plava', 'zelena' => 'zelena', 'zuta' => 'zuta',
                'narandzasta' => 'narandzasta', 'braon' => 'braon', 'bez' => 'bez', 'bordo' => 'bordo',
                'ljubicasta' => 'ljubicasta', 'zlatna' => 'zlatna',
            ]],
            'boja unutrasnjosti' => ['color_interior', [
                'crna' => 'crna', 'siva' => 'siva', 'bijela' => 'bijela', 'bela' => 'bijela',
                'bez' => 'bez', 'crvena' => 'crvena', 'braon' => 'braon', 'plava' => 'plava',
            ]],
        ];

        foreach ($enumMaps as $specKey => [$field, $map]) {
            if (!isset($specs[$specKey])) continue;
            $value = $this->norm($specs[$specKey]);
            if (isset($map[$value])) {
                $form[$field] = $map[$value];
            } else {
                // "ostale" boje i sl. — probaj djelimično poklapanje po ključu
                $hit = null;
                foreach ($map as $k => $v) {
                    if (str_contains($value, $k)) { $hit = $v; break; }
                }
                if ($hit) {
                    $form[$field] = $hit;
                } else {
                    $meta['unmapped'][] = ['label' => $specKey, 'value' => $specs[$specKey]];
                }
            }
        }

        // Broj vrata: "4/5" → 5, "2/3" → 3
        if (isset($specs['broj vrata'])) {
            $v = $specs['broj vrata'];
            if (str_contains($v, '5'))     $form['doors'] = 5;
            elseif (str_contains($v, '4')) $form['doors'] = 4;
            elseif (str_contains($v, '3')) $form['doors'] = 3;
            elseif (str_contains($v, '2')) $form['doors'] = 2;
        }
        if (isset($specs['broj sjedista'])) $form['seats'] = min(9, max(1, $numeric($specs['broj sjedista'])));

        // Registrovan do: "05/2027" → posljednji dan mjeseca
        if (isset($specs['registrovan do']) && preg_match('/(\d{1,2})\s*\/\s*(\d{4})/', $specs['registrovan do'], $m)) {
            $form['registered_until'] = \Carbon\Carbon::createFromDate((int)$m[2], (int)$m[1], 1)->endOfMonth()->toDateString();
        }

        // Porijeklo: strane tablice / uvoz → import
        if (isset($specs['porijeklo vozila'])) {
            $p = $this->norm($specs['porijeklo vozila']);
            $form['import'] = str_contains($p, 'stran') || str_contains($p, 'uvoz');
        }

        // Zamjena
        if (isset($specs['zamjena'])) {
            $form['accepts_exchange'] = $this->norm($specs['zamjena']) !== 'ne';
        }

        // ─── Istorija vozila ──────────────────────────────────────
        $historyMap = [
            'prvi vlasnik' => 'prvi_vlasnik', 'kupljen nov u crnoj gori' => 'kupljen_nov_cg', 'kupljen nov u cg' => 'kupljen_nov_cg',
            'servisna knjiga' => 'servisna_knjiga', 'restauriran' => 'restauriran', 'oldtimer' => 'oldtimer',
            'u garanciji' => 'u_garanciji', 'garancija' => 'u_garanciji', 'garaziran' => 'garaziran',
            'prilagodjen invalidima' => 'prilagodjen_invalidima', 'tuning' => 'tuning',
        ];
        $vehicleHistory = [];
        foreach ($historyNames as $h) {
            $n = $this->norm($h);
            if (isset($historyMap[$n])) {
                $vehicleHistory[] = $historyMap[$n];
            }
            if (str_contains($n, 'servisna')) $form['has_service_book'] = true;
            if (str_contains($n, 'garancij')) $form['has_warranty'] = true;
        }

        // ─── Oprema — uparivanje po nazivu ────────────────────────
        $ourEquipment = DB::table('equipment')->where('is_active', 1)->get(['id', 'name']);
        // Ključevi i vrijednosti su u normalizovanom obliku (norm() skida interpunkciju)
        $synonyms = [
            'klima' => 'klimatizacija', 'klima uredjaj' => 'klimatizacija',
            'kamera' => 'kamera za voznju unatrag', 'kamera za rikverc' => 'kamera za voznju unatrag',
            'kamera za voznju unazad' => 'kamera za voznju unatrag',
            'park senzori' => 'parking senzori zadnji', 'parking senzori' => 'parking senzori zadnji',
            'aluminijumske felne' => 'alu felge', 'alu felne' => 'alu felge',
            'kuka za vucu' => 'vuca kuka', 'kuka' => 'vuca kuka',
            'xenon farovi' => 'xenon led farovi', 'led farovi' => 'xenon led farovi', 'full led' => 'xenon led farovi',
            'xenon svjetla' => 'xenon led farovi', 'led prednja svjetla' => 'xenon led farovi',
            'sjedista sa grijacima' => 'grijanje sjedista',
            'elektricni podizaci' => 'elektricni prozori', 'el podizaci stakala' => 'elektricni prozori',
            'el retrovizori' => 'elektricna ogledala', 'elektricni retrovizori' => 'elektricna ogledala',
            'airbag za vozaca' => 'airbag vozac', 'airbag za suvozaca' => 'airbag suvozac',
            'bocni airbag' => 'bocni airbazi', 'bocni airbagovi' => 'bocni airbazi',
            'elektro podesiva sjedista' => 'elektro podesavanje sjedista',
            'krovni nosaci' => 'krovni nosac', 'panorama krov' => 'panoramski krov', 'panoramski otvor' => 'panoramski krov',
            'start stop' => 'start stop sistem',
            'keyless' => 'keyless start', 'keyless go' => 'keyless start', 'start bez kljuca' => 'keyless start',
            'drzac za telefon bezicno punjenje' => 'bezicno punjenje',
            'multimedija' => 'radio cd', 'radio' => 'radio cd', 'cd player' => 'radio cd',
            'head up display' => 'head up displej',
            'usb' => 'usb prikljucak',
        ];
        $equipmentIds = [];
        foreach (array_unique($equipmentNames) as $name) {
            $n = $this->norm($name);
            $n = $synonyms[$n] ?? $n;
            $match = $ourEquipment->first(fn($e) => $this->norm($e->name) === $n)
                ?? $ourEquipment->first(fn($e) => str_contains($n, $this->norm($e->name)) || str_contains($this->norm($e->name), $n));
            if ($match) {
                $equipmentIds[] = $match->id;
            } else {
                $meta['unmatched_equipment'][] = $name;
            }
        }

        $meta['source'] = [
            'title' => $title,
            'category' => $breadcrumbs[1] ?? null,
            'make' => $makeName,
            'model' => $modelName,
        ];

        return response()->json([
            'form' => $form,
            'vehicle_history' => array_values(array_unique($vehicleHistory)),
            'equipment' => array_values(array_unique($equipmentIds)),
            'meta' => $meta,
        ]);
    }

    // ─── Pomoćne ──────────────────────────────────────────────────
    private function text(\DOMXPath $xp, string $query): ?string
    {
        $node = $xp->query($query)->item(0);
        return $node ? trim(preg_replace('/\s+/', ' ', $node->textContent)) : null;
    }

    private function nodeText(\DOMXPath $xp, string $query, \DOMNode $context): string
    {
        $node = $xp->query($query, $context)->item(0);
        return $node ? trim(preg_replace('/\s+/', ' ', $node->textContent)) : '';
    }

    // Normalizacija za poređenje: mala slova, bez dijakritika, interpunkcija → razmak
    private function norm(?string $s): string
    {
        if ($s === null) return '';
        $s = mb_strtolower(trim($s));
        $s = strtr($s, ['č' => 'c', 'ć' => 'c', 'š' => 's', 'ž' => 'z', 'đ' => 'dj', 'dž' => 'dz']);
        $s = preg_replace('/[^a-z0-9]+/', ' ', $s);
        return trim(preg_replace('/\s+/', ' ', $s));
    }
}
