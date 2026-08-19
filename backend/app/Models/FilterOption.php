<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FilterOption extends Model
{
    protected $fillable = [
        'parent_id',
        'category',
        'filter_type',
        'value',
        'label',
        'sort_order',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'metadata'  => 'array',
    ];

    // Podvrijednosti (npr. SUV → Kompaktni SUV, Srednji SUV...)
    public function children(): HasMany
    {
        return $this->hasMany(FilterOption::class, 'parent_id')->orderBy('sort_order');
    }

    // Roditeljska vrijednost
    public function parent(): BelongsTo
    {
        return $this->belongsTo(FilterOption::class, 'parent_id');
    }

    // Scope: samo root opcije (bez roditelja)
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    // Scope: aktivne opcije
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope: po tipu filtera
    public function scopeOfType($query, string $type)
    {
        return $query->where('filter_type', $type);
    }

    // Scope: po kategoriji (ili "all")
    public function scopeForCategory($query, string $category)
    {
        return $query->where(function ($q) use ($category) {
            $q->where('category', $category)
              ->orWhereNull('category')
              ->orWhere('category', 'all');
        });
    }
}