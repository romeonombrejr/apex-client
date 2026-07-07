<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Links an order to prior orders the client referenced when ordering.
     */
    public function up(): void
    {
        Schema::create('order_references', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('referenced_order_id')->constrained('orders')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['order_id', 'referenced_order_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_references');
    }
};
