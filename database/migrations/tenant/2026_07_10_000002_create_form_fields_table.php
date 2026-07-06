<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The fields that make up a form. `key` is a stable slug used to key
     * responses, so rebuilding a form's fields never orphans draft answers.
     */
    public function up(): void
    {
        Schema::create('form_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained('forms')->cascadeOnDelete();
            $table->string('label');
            $table->string('key');
            $table->string('type'); // text|textarea|number|date|select|radio|checkbox|file
            $table->string('help')->nullable();
            $table->boolean('required')->default(false);
            $table->json('options')->nullable(); // choices for select|radio|checkbox
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_fields');
    }
};
