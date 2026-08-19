<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'label', 'value'];

    /**
     * Dohvati vrijednost po ključu.
     */
    public static function get(string $key, ?string $default = null): ?string
    {
        return static::where('key', $key)->value('value') ?? $default;
    }

    /**
     * Postavi vrijednost po ključu (upsert).
     */
    public static function set(string $key, string $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    /**
     * Vrati sve settings kao key => value mapu.
     */
    public static function allMap(): array
    {
        return static::all()->pluck('value', 'key')->toArray();
    }
}
