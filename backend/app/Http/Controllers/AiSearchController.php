<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiSearchController extends Controller
{
    private string $systemPrompt = <<<PROMPT
Ti si asistent za pretragu vozila na oglasnom portalu u Crnoj Gori.
Iz korisnikovog teksta izvuci filtere za pretragu i vrati SAMO validan JSON objekat, bez ikakvog dodatnog teksta.

Dostupni filteri i dozvoljene vrijednosti:

- category: "auto", "motocikl", "nautika", "transport"
- make: string (npr. "BMW", "Volkswagen", "Mercedes-Benz")
- model: string (npr. "X5", "Golf", "C-Class")
- price_from: integer (EUR)
- price_to: integer (EUR)
- year_from: integer (godina)
- year_to: integer (godina)
- mileage_to: integer (km)
- fuel: "Benzin", "Dizel", "Hibrid Benzin", "Hibrid Dizel", "Električno", "Benzin+Plin"
- transmission: "Automatik", "Manuelni"
- body_type: "Limuzina", "Karavan", "Hečbek", "SUV", "Kupe", "Kabriolet", "Pickup", "Minivan"
- condition: "novo", "polovno"

Pravila:
- Vrati samo filtere koje možeš pouzdano zaključiti iz teksta
- Ako korisnik kaže "mali gradski auto" ili "mali auto" — postavi body_type na "Hečbek", category na "auto"
- Ako korisnik kaže "ne troši mnogo" ili "štedljiv" — postavi fuel na "Benzin" ili "Hibrid Benzin"
- Ako korisnik kaže "familijski" — postavi body_type na "Karavan" ili "SUV"
- Ako korisnik kaže "jeftin" bez cijene — postavi price_to na 8000
- Nikad ne izmišljaj make ili model ako nije eksplicitno naveden
- Vrati prazan objekat {} ako ništa ne možeš zaključiti

Primjer ulaza: "tražim BMW X5 dizel do 25000 eura, ne stariji od 2019"
Primjer izlaza: {"category":"auto","make":"BMW","model":"X5","fuel":"Dizel","price_to":25000,"year_from":2019}
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
                'max_tokens' => 300,
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
            // Ukloni markdown code block ako postoji
            $content = preg_replace('/^```(?:json)?\s*/i', '', trim($content));
            $content = preg_replace('/\s*```$/', '', $content);
            $filters = json_decode(trim($content), true);

            if (!is_array($filters)) {
                $filters = [];
            }

            return response()->json([
                'filters'  => $filters,
                'fallback' => empty($filters),
            ]);
        } catch (\Exception $e) {
            Log::error('AI search exception', ['message' => $e->getMessage()]);
            return response()->json(['filters' => [], 'fallback' => true], 200);
        }
    }
}
