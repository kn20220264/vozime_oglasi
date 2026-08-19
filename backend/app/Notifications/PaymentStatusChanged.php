<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PaymentStatusChanged extends Notification
{
    use Queueable;

    public function __construct(
        public Payment $payment,
        public string $status,          // 'completed' ili 'failed'
        public ?string $packageName = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $label = $this->packageName ? " za paket \"{$this->packageName}\"" : '';

        $message = $this->status === 'completed'
            ? "Vaša uplata{$label} je potvrđena i paket je aktiviran."
            : "Vaša uplata{$label} je odbijena. Kontaktirajte podršku za više informacija.";

        return [
            'message'      => $message,
            'payment_id'   => $this->payment->id,
            'package_name' => $this->packageName,
            'status'       => $this->status,
        ];
    }
}
