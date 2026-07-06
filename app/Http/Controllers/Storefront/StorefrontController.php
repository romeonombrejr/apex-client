<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('storefront/index', [
            'suite' => config('suites.storefront'),
        ]);
    }
}
