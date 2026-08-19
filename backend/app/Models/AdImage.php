<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdImage extends Model
{
    protected $fillable = [
        'ad_id',
        'path',
        'is_primary',
        'order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    // Slika pripada jednom oglasu
    public function ad()
    {
        return $this->belongsTo(Ad::class);
    }
}


