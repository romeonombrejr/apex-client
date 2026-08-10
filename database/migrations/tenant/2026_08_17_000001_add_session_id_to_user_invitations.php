<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The session a consumed link created, so revoking/rotating the link can
     * kill that session immediately (the enforcement middleware is the lazy
     * backstop).
     */
    public function up(): void
    {
        Schema::table('user_invitations', function (Blueprint $table) {
            $table->string('session_id', 100)->nullable()->after('accepted_at');
        });
    }

    public function down(): void
    {
        Schema::table('user_invitations', function (Blueprint $table) {
            $table->dropColumn('session_id');
        });
    }
};
