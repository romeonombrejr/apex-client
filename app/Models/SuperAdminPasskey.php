<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

class SuperAdminPasskey extends Model
{
    use CentralConnection;

    protected $fillable = [
        'super_admin_id',
        'name',
        'credential_id',
        'credential',
        'last_used_at',
    ];

    protected $casts = [
        'credential' => 'array',
        'last_used_at' => 'datetime',
    ];

    public function superAdmin(): BelongsTo
    {
        return $this->belongsTo(SuperAdmin::class);
    }
}
