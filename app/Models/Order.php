<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function messages(): HasMany
    {
        return $this->hasMany(OrderMessage::class)->oldest();
    }

    public function references(): BelongsToMany
    {
        return $this->belongsToMany(Order::class, 'order_references', 'order_id', 'referenced_order_id');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function messagesArray(): array
    {
        return $this->messages->map(fn (OrderMessage $message) => [
            'id' => $message->id,
            'author_id' => $message->user_id,
            'author' => $message->author?->name,
            'body' => $message->body,
            'attachment_url' => $message->attachmentUrl(),
            'attachment_name' => $message->attachment_name,
            'created_at' => $message->created_at?->toDateTimeString(),
        ])->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function referencesArray(): array
    {
        return $this->references->map(fn (Order $order) => [
            'id' => $order->id,
            'number' => $order->number,
            'name' => $order->name,
        ])->all();
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
            'messages' => $this->relationLoaded('messages') ? $this->messagesArray() : [],
            'references' => $this->relationLoaded('references') ? $this->referencesArray() : [],
        ]);
    }
}
