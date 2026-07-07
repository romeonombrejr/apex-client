<?php

namespace App\Actions\Storefront;

use App\Models\Order;
use App\Models\OrderMessage;
use App\Models\User;
use App\Notifications\Storefront\StorefrontNotification;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class PostOrderMessage
{
    /**
     * Record a message on an order and notify the other party — staff/admins
     * when the client writes, the client when staff/admin write.
     */
    public function __invoke(Order $order, User $author, string $body, ?UploadedFile $attachment = null): OrderMessage
    {
        $data = [
            'order_id' => $order->id,
            'user_id' => $author->id,
            'body' => $body,
        ];

        if ($attachment) {
            $data['attachment_path'] = $attachment->store('storefront/messages', 'public');
            $data['attachment_name'] = $attachment->getClientOriginalName();
        }

        $message = OrderMessage::create($data);

        $authorIsClient = $order->user_id === $author->id;

        if ($authorIsClient) {
            $recipients = User::permission('storefront.manage')->where('id', '!=', $author->id)->get();
            $url = route('admin.storefront.orders.show', $order->id, false);
        } else {
            $recipients = User::where('id', $order->user_id)->get();
            $url = route('storefront.orders.show', $order->id, false);
        }

        Notification::send($recipients, new StorefrontNotification(
            title: __('New message on :number', ['number' => $order->number]),
            message: Str::limit($body, 60),
            url: $url,
        ));

        return $message;
    }
}
