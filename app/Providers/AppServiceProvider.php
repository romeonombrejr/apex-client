<?php

namespace App\Providers;

use App\Http\Responses\LoginResponse;
use App\Models\Setting;
use App\Models\Theme;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Spatie\Activitylog\Models\Activity;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(LoginResponseContract::class, LoginResponse::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        // Stamp the requester's IP + user agent onto every audit-log entry
        // (security/audit purposes only; disclosed in the privacy policy and
        // pruned by the scheduled activitylog:clean). CLI runs have no
        // request IP and are left unstamped.
        Activity::saving(function (Activity $activity): void {
            // Console runs (scheduler, sync commands) have no requester —
            // a synthetic 127.0.0.1 would only mislead.
            if (app()->runningInConsole()) {
                return;
            }

            $ip = request()->ip();

            if ($ip === null) {
                return;
            }

            $activity->properties = $activity->properties->merge([
                'ip' => $ip,
                'user_agent' => Str::limit((string) request()->userAgent(), 255),
            ]);
        });

        // Branding + active theme for the blade <head>. Only resolve from the
        // tenant tables when tenancy is initialized; central requests use defaults.
        View::composer('app', function ($view): void {
            $view->with('branding', tenant() ? Setting::branding() : [
                'app_name' => config('app.name'),
                'logo_path' => null,
                'favicon_path' => null,
                'primary_color' => null,
                'seo_title' => null,
                'seo_description' => null,
                'seo_keywords' => null,
            ]);

            $view->with('theme', tenant() ? Theme::activePayload() : null);
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
