<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'reviewer_id',
        'reviewed_id',
        'rating',
        'comment',
    ];

    // Ko je dao ocjenu
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    // Ko je dobio ocjenu
    public function reviewed()
    {
        return $this->belongsTo(User::class, 'reviewed_id');
    }
}