<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('load_source_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('load_id')->constrained('loads')->cascadeOnDelete();
            $table->enum('platform', ['web', 'whatsapp', 'telegram']);
            $table->string('source_name', 190)->nullable();
            $table->string('source_chat_id', 190)->nullable();
            $table->string('source_message_id', 190)->nullable();
            $table->text('source_url')->nullable();
            $table->text('source_profile_url')->nullable();
            $table->string('contact_name', 150)->nullable();
            $table->string('contact_phone', 30)->nullable();
            $table->boolean('contact_visible')->default(false);
            $table->timestamp('contact_consent_at')->nullable();
            $table->timestamps();

            $table->unique(
                ['platform', 'source_chat_id', 'source_message_id'],
                'load_source_message_unique'
            );
            $table->index(['load_id', 'platform']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('load_source_details');
    }
};
