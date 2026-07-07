<?php

namespace App\Notifications\Storefront;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * A single in-app (database) notification for the storefront. Parametrized
 * rather than one class per event, since they all render the same shape.
 */
class StorefrontNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $title,
        public string $message,
        public ?string $url = null,
        public string $icon = 'bell',
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'url' => $this->url,
            'icon' => $this->icon,
        ];
    }
}
