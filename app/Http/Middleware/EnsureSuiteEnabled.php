<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuiteEnabled
{
    /**
     * Gate a route behind an active suite for the current tenant.
     *
     * Runs after tenancy is initialized. A suite is "active" only when it is
     * registered, entitled by the tenant's plan, and enabled on the tenant
     * (see Tenant::activeSuites()). Returns 404 so a disabled suite is
     * indistinguishable from a route that does not exist.
     *
     * Usage: ->middleware('suite:storefront')
     */
    public function handle(Request $request, Closure $next, string $suite): Response
    {
        $tenant = tenant();

        abort_unless($tenant instanceof Tenant && $tenant->hasSuite($suite), 404);

        return $next($request);
    }
}
