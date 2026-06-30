<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

#[Fillable(['app_name', 'logo_path', 'favicon_path', 'primary_color', 'seo_title', 'seo_description', 'seo_keywords'])]
class Setting extends Model
{
    public const BRANDING_CACHE_KEY = 'settings.branding';

    public static function current(): self
    {
        return self::firstOrCreate(['id' => 1], ['app_name' => config('app.name')]);
    }

    /**
     * The branding payload shared across the app, with resolved asset URLs.
     *
     * Cached because it is resolved on every request via shared Inertia data;
     * the cache is flushed automatically whenever a setting is saved.
     *
     * @return array<string, string|null>
     */
    public static function branding(): array
    {
        return Cache::rememberForever(self::BRANDING_CACHE_KEY, function (): array {
            $setting = self::current();

            return [
                'app_name' => $setting->app_name,
                'logo_path' => $setting->logo_path ? Storage::disk('public')->url($setting->logo_path) : null,
                'favicon_path' => $setting->favicon_path ? Storage::disk('public')->url($setting->favicon_path) : null,
                'primary_color' => $setting->primary_color,
                'seo_title' => $setting->seo_title,
                'seo_description' => $setting->seo_description,
                'seo_keywords' => $setting->seo_keywords,
            ];
        });
    }

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget(self::BRANDING_CACHE_KEY));
        static::deleted(fn () => Cache::forget(self::BRANDING_CACHE_KEY));
    }
}
