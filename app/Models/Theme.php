<?php

namespace App\Models;

use App\Support\ThemeCss;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

#[Fillable(['name', 'light', 'dark', 'radius', 'button_size', 'fonts', 'is_active'])]
class Theme extends Model
{
    use HasFactory;

    public const ACTIVE_CACHE_KEY = 'themes.active';

    protected function casts(): array
    {
        return [
            'light' => 'array',
            'dark' => 'array',
            'fonts' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * The active theme payload shared across the app (compiled CSS + font links).
     *
     * Cached because it is resolved on every request via shared Inertia/blade
     * data; the cache is flushed on save/delete, and explicitly by the controller
     * on bulk activate/reset (which bypass model events).
     *
     * @return array{id: int, name: string, css: string, fontLinks: array<int, string>}|null
     */
    public static function activePayload(): ?array
    {
        return Cache::rememberForever(self::ACTIVE_CACHE_KEY, function (): ?array {
            $theme = self::where('is_active', true)->first();

            if (! $theme) {
                return null;
            }

            return [
                'id' => $theme->id,
                'name' => $theme->name,
                'css' => ThemeCss::compile($theme),
                'fontLinks' => ThemeCss::fontLinks($theme),
            ];
        });
    }

    public static function flushActiveCache(): void
    {
        Cache::forget(self::ACTIVE_CACHE_KEY);
    }

    protected static function booted(): void
    {
        static::saved(fn () => self::flushActiveCache());
        static::deleted(fn () => self::flushActiveCache());
    }
}
