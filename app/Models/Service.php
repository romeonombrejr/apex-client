<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name', 'slug', 'description', 'type', 'billing_interval',
    'price', 'form_id', 'image_path', 'image_disk', 'is_active', 'position',
])]
class Service extends Model
{
    /** Offering types. */
    public const TYPES = ['one_time', 'subscription'];

    /** Billing intervals (subscriptions only). */
    public const INTERVALS = ['monthly', 'yearly'];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Public URL for the service image. Uploaded files live on the tenant's
     * suffix-isolated public disk, so they are served through stancl's tenant
     * asset route (a relative URL, matching Setting::branding()).
     */
    public function imageUrl(): ?string
    {
        if (! $this->image_path) {
            return null;
        }

        return route('stancl.tenancy.asset', ['path' => $this->image_path], false);
    }

    /**
     * The shape consumed by the client catalog + service modal (includes the
     * attached form definition so the modal renders without another request).
     *
     * @return array<string, mixed>
     */
    public function toCatalogArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'type' => $this->type,
            'billing_interval' => $this->billing_interval,
            'price' => (float) $this->price,
            'image_url' => $this->imageUrl(),
            'form' => $this->form?->toDefinition(),
        ];
    }
}
