<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['order_id', 'user_id', 'body', 'attachment_path', 'attachment_name'])]
class OrderMessage extends Model
{
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Public URL for the attachment, served through the tenant asset route.
     */
    public function attachmentUrl(): ?string
    {
        if (! $this->attachment_path) {
            return null;
        }

        return route('stancl.tenancy.asset', ['path' => $this->attachment_path], false);
    }
}
