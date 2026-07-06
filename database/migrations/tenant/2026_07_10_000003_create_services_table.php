<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Storefront offerings. A single table covers both one-time services and
     * recurring subscriptions via the `type` discriminator.
     */
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->longText('description')->nullable();
            $table->string('type')->default('one_time'); // one_time|subscription
            $table->string('billing_interval')->nullable(); // monthly|yearly (subscription only)
            $table->decimal('price', 10, 2)->default(0);
            $table->foreignId('form_id')->nullable()->constrained('forms')->nullOnDelete();
            $table->string('image_path')->nullable();
            $table->string('image_disk')->default('public');
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
