<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Draft references a client attaches while the item is still in the cart;
     * snapshotted onto order_references at checkout.
     */
    public function up(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->json('referenced_order_ids')->nullable()->after('form_answers');
        });
    }

    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropColumn('referenced_order_ids');
        });
    }
};
