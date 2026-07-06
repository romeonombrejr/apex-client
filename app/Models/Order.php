<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'number', 'user_id', 'service_id', 'invoice_id', 'order_status_id',
    'assigned_to', 'name', 'quantity', 'form_answers', 'completed_at',
])]
class Order extends Model
{
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'form_answers' => 'array',
            'completed_at' => 'datetime',
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

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(OrderStatus::class, 'order_status_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * @return array<string, mixed>
     */
    public function toRowArray(): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'name' => $this->name,
            'quantity' => $this->quantity,
            'status' => $this->status ? [
                'name' => $this->status->name,
                'color' => $this->status->color,
                'is_completed' => $this->status->is_completed,
            ] : null,
            'client' => $this->user?->name,
            'assignee' => $this->assignee?->name,
            'created_at' => $this->created_at?->toDateString(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDetailArray(): array
    {
        return array_merge($this->toRowArray(), [
            'status_id' => $this->order_status_id,
            'assigned_to' => $this->assigned_to,
            'completed_at' => $this->completed_at?->toDateTimeString(),
            'invoice' => $this->invoice ? [
                'id' => $this->invoice->id,
                'number' => $this->invoice->number,
            ] : null,
            'answers' => $this->form_answers ?? [],
            'form' => $this->service?->form?->toDefinition(),
        ]);
    }
}
