<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Seed the default subscription plans (central).
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free',
                'slug' => 'free',
                'price' => 0,
                'max_users' => 3,
                'max_storage_mb' => 100,
                'features' => ['backups' => false, 'suites' => []],
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'price' => 29,
                'max_users' => 25,
                'max_storage_mb' => 5000,
                'features' => ['backups' => true, 'suites' => ['storefront']],
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'price' => 99,
                'max_users' => null,
                'max_storage_mb' => null,
                'features' => ['backups' => true, 'suites' => ['storefront']],
            ],
        ];

        foreach ($plans as $plan) {
            Plan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
