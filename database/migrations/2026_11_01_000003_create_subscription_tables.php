<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $t) {
            $t->id();
            $t->enum('kind', ['carrier', 'business_place']);
            $t->foreignId('country_id')->constrained();
            $t->decimal('price', 12, 2);
            $t->char('currency', 3);
            $t->unsignedTinyInteger('duration_months')->default(1);
            $t->boolean('is_active')->default(true);
            $t->timestamp('effective_from');
            $t->timestamps();
            $t->index(['kind', 'country_id', 'is_active']);
        });
        Schema::create('subscriptions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained();
            $t->enum('kind', ['carrier', 'business_place']);
            $t->unsignedBigInteger('place_id')->nullable();
            $t->foreignId('country_id')->constrained();
            $t->foreignId('plan_id')->constrained('subscription_plans');
            $t->enum('status', ['active','expired','cancelled','payment_pending','payment_failed','grace'])->default('payment_pending');
            $t->timestamp('starts_at')->nullable();
            $t->timestamp('ends_at')->nullable();
            $t->timestamp('next_payment_at')->nullable();
            $t->boolean('auto_renew')->default(false);
            $t->string('last_payment_status', 20)->nullable();
            $t->timestamp('cancelled_at')->nullable();
            $t->string('cancel_reason')->nullable();
            $t->timestamps();
            $t->index(['user_id', 'kind', 'status']);
        });
        Schema::create('payments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('subscription_id')->constrained();
            $t->foreignId('user_id')->constrained();
            $t->string('order_id', 64)->unique();
            $t->string('provider_txn_id', 100)->nullable()->unique();
            $t->decimal('amount', 12, 2);          // həmin andakı qiymət — tarif dəyişsə də toxunulmur
            $t->char('currency', 3);
            $t->enum('status', ['initiated','processing','success','failed','cancelled','refunded'])->default('initiated');
            $t->boolean('period_applied')->default(false); // təkrar bildiriş qoruması (TS §9.5)
            $t->timestamps();
        });
        Schema::create('payment_events', function (Blueprint $t) {
            $t->id();
            $t->foreignId('payment_id')->nullable();
            $t->string('event_key', 120)->unique();
            $t->json('payload')->nullable();
            $t->boolean('signature_valid')->nullable();
            $t->timestamp('received_at');
        });
    }
    public function down(): void
    {
        foreach (['payment_events','payments','subscriptions','subscription_plans'] as $tb) Schema::dropIfExists($tb);
    }
};
