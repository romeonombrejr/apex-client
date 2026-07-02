<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

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
                // Uploaded files live in the tenant's own (suffixed) public disk, which
                // isn't reachable via the central /storage symlink. Serve them through
                // stancl's tenant asset route. A relative URL is used deliberately: this
                // value is cached, so it must not bake in a host (it resolves against
                // whichever tenant domain the page is loaded on).
                'logo_path' => $setting->logo_path ? route('stancl.tenancy.asset', ['path' => $setting->logo_path], false) : null,
                'favicon_path' => $setting->favicon_path ? route('stancl.tenancy.asset', ['path' => $setting->favicon_path], false) : null,
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
