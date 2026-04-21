<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'user_id',
        'user_package_id',
        'amount',
        'currency',
        'gateway',
        'payment_method',
        'reference',
        'status',
        'admin_note',
        'confirmed_by',
        'confirmed_at',
    ];

    protected $casts = [
        'confirmed_at' => 'datetime',
    ];

    // ─── Relacije ────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function userPackage()
    {
        return $this->belongsTo(UserPackage::class)->with(['user:id,name,email', 'package:id,name,type']);
    }

    public function confirmedBy()
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    // ─── Helper metode ───────────────────────────────────

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isBankTransfer(): bool
    {
        return $this->payment_method === 'bank_transfer'
            || $this->gateway === 'cash'; // backwards compat
    }
}