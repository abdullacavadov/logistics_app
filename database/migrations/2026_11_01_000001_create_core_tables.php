<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('countries', function (Blueprint $t) {
            $t->id();
            $t->char('iso2', 2)->unique();
            $t->string('name', 100);
            $t->char('default_currency', 3)->nullable();
            $t->boolean('is_active')->default(true);
        });
        Schema::create('locations', function (Blueprint $t) {
            $t->id();
            $t->foreignId('country_id')->constrained();
            $t->string('name', 120);
            $t->decimal('lat', 9, 6)->nullable();
            $t->decimal('lng', 9, 6)->nullable();
            $t->boolean('is_active')->default(true);
            $t->index(['country_id', 'name']);
        });
        // Laravel-in default users cədvəlini əvəz edir (TS §4)
        Schema::dropIfExists('users');
        Schema::create('users', function (Blueprint $t) {
            $t->id();
            $t->string('name', 150);
            $t->string('phone', 30)->nullable()->unique();
            $t->string('email', 190)->nullable()->unique();
            $t->string('password')->nullable();           // Google OAuth üçün null ola bilər
            $t->string('google_id', 64)->nullable()->unique();
            $t->foreignId('country_id')->nullable()->constrained();
            $t->timestamp('phone_verified_at')->nullable();
            $t->timestamp('email_verified_at')->nullable();
            $t->boolean('is_blocked')->default(false);
            $t->timestamp('terms_accepted_at')->nullable();
            $t->rememberToken();
            $t->timestamps();
            $t->softDeletes();
        });
        Schema::create('user_roles', function (Blueprint $t) {
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->enum('role', ['shipper', 'carrier', 'business_owner', 'admin']);
            $t->primary(['user_id', 'role']);
        });
        Schema::create('companies', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained();
            $t->string('legal_name', 200);
            $t->foreignId('country_id')->constrained();
            $t->string('tax_id', 40)->nullable();
            $t->string('contact_person', 150)->nullable();
            $t->string('phone', 30)->nullable();
            $t->string('email', 190)->nullable();
            $t->string('address')->nullable();
            $t->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending'); // avtomatik təsdiq YOXDUR
            $t->timestamps();
        });
        Schema::create('audit_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('actor_id')->nullable();
            $t->string('action', 60);
            $t->string('entity', 40)->nullable();
            $t->unsignedBigInteger('entity_id')->nullable();
            $t->string('reason', 500)->nullable();
            $t->json('old_values')->nullable();
            $t->json('new_values')->nullable();
            $t->string('ip', 45)->nullable();
            $t->timestamp('created_at')->useCurrent();
            $t->index(['entity', 'entity_id']);
        });
    }
    public function down(): void
    {
        foreach (['audit_logs', 'companies', 'user_roles', 'users', 'locations', 'countries'] as $tb) Schema::dropIfExists($tb);
    }
};
