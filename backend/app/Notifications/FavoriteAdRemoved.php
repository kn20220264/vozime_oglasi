<?php

namespace App\Notifications;

use App\Models\Ad;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FavoriteAdRemoved extends Notification
{
    use Queueable;

    public function __construct(public Ad $ad) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'message' => "Oglas \"{$this->ad->title}\" koji ste sačuvali u omiljene je uklonjen.",
            'ad_title' => $this->ad->title,
            'ad_id'    => $this->ad->id,
        ];
    }
}