<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add annual tax increase escalation to assessments
        Schema::table('assessments', function (Blueprint $table) {
            $table->decimal('annual_tax_increase_pct', 5, 2)->default(0.00)->after('effective_quarter');
            $table->boolean('annual_tax_increase_enabled')->default(false)->after('annual_tax_increase_pct');
        });

        // 2. Reassessments table for price changes (increase or decrease)
        Schema::create('reassessments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('assessment_id')->constrained('assessments')->cascadeOnDelete();
            $table->foreignUuid('application_id')->constrained('applications')->cascadeOnDelete();
            $table->string('reassessment_type')->default('Increase'); // Increase, Decrease, GeneralRevision, Calamity, ZoningChange
            $table->string('adjustment_mode')->default('percentage'); // percentage, fixed_amount, itemized
            $table->decimal('adjustment_pct', 8, 2)->default(0.00); // e.g. +10.00 or -5.50
            $table->decimal('previous_market_value', 15, 2)->default(0.00);
            $table->decimal('new_market_value', 15, 2)->default(0.00);
            $table->decimal('previous_assessed_value', 15, 2)->default(0.00);
            $table->decimal('new_assessed_value', 15, 2)->default(0.00);
            $table->integer('effective_year')->default(2025);
            $table->integer('effective_quarter')->default(1);
            $table->string('reason');
            $table->text('remarks')->nullable();
            $table->json('item_adjustments')->nullable();
            $table->string('status')->default('Pending'); // Pending, Approved, Rejected, Applied
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        // 3. Land Photos / Pictures of the Land table
        Schema::create('application_land_photos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('application_id')->constrained('applications')->cascadeOnDelete();
            $table->string('title');
            $table->string('category')->default('Ground View'); // Ground View, Frontage / Road, Boundary Marker, Plants / Crops, Aerial / Vicinity
            $table->string('file_name');
            $table->unsignedBigInteger('file_size')->default(0);
            $table->string('mime_type')->default('image/jpeg');
            $table->string('storage_path');
            $table->text('caption')->nullable();
            $table->foreignUuid('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_land_photos');
        Schema::dropIfExists('reassessments');

        Schema::table('assessments', function (Blueprint $table) {
            $table->dropColumn(['annual_tax_increase_pct', 'annual_tax_increase_enabled']);
        });
    }
};
