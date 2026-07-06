<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A recurring subscription created at checkout for a subscription-type
     * service. The renewal engine (auto-bill from credits) lands in Phase 3;
     * this phase records the subscription and its first period.
     */
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('status')->default('active'); // active|paused|cancelled|past_due
            $table->string('interval'); // monthly|yearly
            $table->decimal('price', 12, 2)->default(0);
            $table->date('current_period_start');
            $table->date('current_period_end');
            $table->date('next_renewal_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
