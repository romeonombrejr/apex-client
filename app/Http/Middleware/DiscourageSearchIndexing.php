<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ask crawlers to keep every page on this hostname out of their indexes.
 * Applied to the central (super-admin) domain: the console is invite-only
 * knowledge — nobody should stumble onto it via a search result. The header
 * covers all responses, so the login page never needs its own meta tag.
 */
class DiscourageSearchIndexing
{
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request)->withHeaders([
            'X-Robots-Tag' => 'noindex, nofollow',
        ]);
    }
}
