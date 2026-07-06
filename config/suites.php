<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Suites Registry
|--------------------------------------------------------------------------
|
| The single source of truth for the optional feature "suites" a tenant can
| run. A suite a tenant actually gets = registered here ∩ entitled by its
| plan (Plan.features['suites']) ∩ enabled on the tenant (Tenant.enabled_suites).
|
| Each entry:
|   name        Human label shown in super-admin UI and the sidebar.
|   description Short blurb for the super-admin entitlement/enablement UIs.
|   icon        lucide-react icon name, mapped to a component on the frontend.
|   permission  Tenant permission that also gates the suite's routes/nav.
|
*/

return [
    'storefront' => [
        'name' => 'Storefront',
        'description' => 'Client-facing catalog and ordering portal.',
        'icon' => 'store',
        'permission' => 'storefront.view',
    ],
];
