<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id', 'service_id', 'order_id', 'status', 'interval', 'price',
    'current_period_start', 'current_period_end', 'next_renewal_at',
])]
class Subscription extends Model
{
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'current_period_start' => 'date',
            'current_period_end' => 'date',
            'next_renewal_at' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
