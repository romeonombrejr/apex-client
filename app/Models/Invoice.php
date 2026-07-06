<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['number', 'user_id', 'status', 'subtotal', 'total', 'note', 'paid_at'])]
class Invoice extends Model
{
    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'total' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function toRowArray(): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'status' => $this->status,
            'total' => (float) $this->total,
            'client' => $this->user?->name,
            'created_at' => $this->created_at?->toDateString(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDetailArray(): array
    {
        return array_merge($this->toRowArray(), [
            'subtotal' => (float) $this->subtotal,
            'paid_at' => $this->paid_at?->toDateTimeString(),
            'note' => $this->note,
            'items' => $this->items->map(fn (InvoiceItem $item) => [
                'id' => $item->id,
                'name' => $item->name,
                'unit_price' => (float) $item->unit_price,
                'quantity' => $item->quantity,
                'total' => (float) $item->total,
                'order' => $item->order ? [
                    'id' => $item->order->id,
                    'number' => $item->order->number,
                ] : null,
            ])->values(),
        ]);
    }
}
