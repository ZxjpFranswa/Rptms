<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Links a portal login (role = Taxpayer) to its taxpayer record.
     * Kept as a plain indexed column so the migration also runs on SQLite (tests).
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('taxpayer_id')->nullable()->after('role')->index();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['taxpayer_id']);
            $table->dropColumn('taxpayer_id');
        });
    }
};
