<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_invitations', function (Blueprint $table) {
            // A null expiry means the link never expires (still single-use).
            $table->timestamp('expires_at')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('user_invitations', function (Blueprint $table) {
            $table->timestamp('expires_at')->nullable(false)->change();
        });
    }
};
