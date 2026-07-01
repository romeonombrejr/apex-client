<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantIsActive
{
    /**
     * Block access to a tenant whose account has been suspended.
     *
     * Runs after tenancy is initialized (the current tenant is available via
     * the tenant() helper). Returns 503 so suspended tenants see a clear state.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = tenant();

        if ($tenant && $tenant->isSuspended()) {
            abort(503, 'This account is currently suspended.');
        }

        return $next($request);
    }
}
