<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Two-factor (TOTP) columns and a dedicated passkeys table for super admins.
     *
     * Super admins can't reuse the tenant passkey plumbing (laravel/passkeys is
     * bound to a single global model/guard), so they get their own table.
     */
    public function up(): void
    {
        Schema::table('super_admins', function (Blueprint $table) {
            $table->text('two_factor_secret')->nullable()->after('password');
            $table->text('two_factor_recovery_codes')->nullable()->after('two_factor_secret');
            $table->timestamp('two_factor_confirmed_at')->nullable()->after('two_factor_recovery_codes');
        });

        Schema::create('super_admin_passkeys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('super_admin_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('credential_id');
            $table->json('credential');
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('super_admin_passkeys');

        Schema::table('super_admins', function (Blueprint $table) {
            $table->dropColumn(['two_factor_secret', 'two_factor_recovery_codes', 'two_factor_confirmed_at']);
        });
    }
};
