<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Keep the plaintext token encrypted-at-rest (app key) alongside the
     * lookup hash, so admins can re-copy an active link from the roster
     * after closing the mint dialog. Links issued before this column exist
     * have no recoverable URL — re-mint to get one.
     */
    public function up(): void
    {
        Schema::table('user_invitations', function (Blueprint $table) {
            $table->text('plain_token')->nullable()->after('token');
        });
    }

    public function down(): void
    {
        Schema::table('user_invitations', function (Blueprint $table) {
            $table->dropColumn('plain_token');
        });
    }
};
