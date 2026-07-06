<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

class Plan extends Model
{
    use CentralConnection;

    protected $fillable = [
        'name',
        'slug',
        'price',
        'max_users',
        'max_storage_mb',
        'features',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'max_users' => 'integer',
        'max_storage_mb' => 'integer',
        'features' => 'array',
        'is_active' => 'boolean',
    ];

    public function tenants()
    {
        return $this->hasMany(Tenant::class);
    }

    /**
     * Suite slugs this plan unlocks (entitlement). Stored inside the
     * `features` JSON so no schema change is needed.
     *
     * @return array<int, string>
     */
    public function allowedSuites(): array
    {
        return $this->features['suites'] ?? [];
    }
}
