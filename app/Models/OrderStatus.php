<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'color', 'position', 'is_default', 'is_completed', 'is_protected'])]
class OrderStatus extends Model
{
    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'is_completed' => 'boolean',
            'is_protected' => 'boolean',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public static function default(): ?self
    {
        return self::where('is_default', true)->first() ?? self::orderBy('position')->first();
    }
}
