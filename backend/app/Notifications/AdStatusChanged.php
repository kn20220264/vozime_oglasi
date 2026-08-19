<?php

namespace App\Notifications;

use App\Models\Ad;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AdStatusChanged extends Notification
{
    use Queueable;

    public function __construct(public Ad $ad, public string $status) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $message = match ($this->status) {
            'active'   => "Vaš oglas \"{$this->ad->title}\" je odobren i sada je aktivan.",
            'rejected' => "Vaš oglas \"{$this->ad->title}\" je odbijen. Kontaktirajte podršku za više informacija.",
            default    => "Status vašeg oglasa \"{$this->ad->title}\" je promijenjen u: {$this->status}.",
        };

        return [
            'message'  => $message,
            'ad_title' => $this->ad->title,
            'ad_id'    => $this->ad->id,
            'status'   => $this->status,
        ];
    }
}
