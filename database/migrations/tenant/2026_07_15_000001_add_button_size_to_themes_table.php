<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Button size preset for the theme (key into ThemeCss::BUTTON_SIZES).
     */
    public function up(): void
    {
        Schema::table('themes', function (Blueprint $table) {
            $table->string('button_size', 10)->nullable()->after('radius');
        });
    }

    public function down(): void
    {
        Schema::table('themes', function (Blueprint $table) {
            $table->dropColumn('button_size');
        });
    }
};
