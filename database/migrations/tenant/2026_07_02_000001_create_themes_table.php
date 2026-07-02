<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Saved UI themes for the tenant (shadcn CSS variable sets).
     *
     * `light`/`dark` hold complete variable maps (all keys in ThemeCss::KEYS);
     * at most one theme is active at a time.
     */
    public function up(): void
    {
        Schema::create('themes', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->json('light');
            $table->json('dark');
            $table->string('radius', 20)->nullable();
            $table->json('fonts')->nullable();
            $table->boolean('is_active')->default(false)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('themes');
    }
};
