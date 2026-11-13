<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Support\\Facades\\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("ALTER TABLE loads MODIFY applications ENUM('web','whatsapp','telegram') NOT NULL DEFAULT 'web'");
    }

    public function down(): void
    {
        DB::table('loads')->where('applications', 'telegram')->update(['applications' => 'web']);
        DB::statement("ALTER TABLE loads MODIFY applications ENUM('web','whatsapp') NOT NULL DEFAULT 'web'");
    }
};
