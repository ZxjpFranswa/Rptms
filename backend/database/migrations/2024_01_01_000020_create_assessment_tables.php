<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('smv_unit_values', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('barangay');
            $table->string('classification');
            $table->string('actual_use');
            $table->decimal('unit_value', 12, 2);
            $table->integer('revision_year')->default(2024);
            $table->timestamps();

            $table->unique(['barangay', 'classification', 'actual_use', 'revision_year'], 'smv_unique_key');
        });

        Schema::create('assessments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('application_id')->unique()->constrained('applications')->cascadeOnDelete();
            $table->string('pin')->nullable();
            $table->string('arp_number')->nullable();
            $table->decimal('total_market_value', 15, 2)->default(0);
            $table->decimal('total_assessed_value', 15, 2)->default(0);
            $table->string('taxability_status')->default('Taxable'); // Taxable | Exempt
            $table->string('exemption_reason')->nullable();
            $table->integer('effective_year')->default(2024);
            $table->integer('effective_quarter')->default(1);
            $table->string('status')->default('Draft'); // Draft, UnderReview, Approved, Returned, Rejected, Authorized
            $table->text('remarks')->nullable();
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('submitted_at')->nullable();
            $table->foreignUuid('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignUuid('authorized_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('authorized_at')->nullable();
            $table->timestamps();
        });

        Schema::create('assessment_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('assessment_id')->constrained('assessments')->cascadeOnDelete();
            $table->string('item_type'); // Land, Building, Machinery
            $table->string('classification'); // Residential, Commercial, Agricultural, Industrial, Special
            $table->string('actual_use');
            $table->decimal('area_sqm', 12, 2)->default(0);
            $table->decimal('unit_value', 12, 2)->default(0);
            $table->decimal('base_market_value', 15, 2)->default(0);
            $table->decimal('adjustment_factor_pct', 8, 2)->default(0); // e.g. -10%, +5%
            $table->decimal('market_value', 15, 2)->default(0);
            $table->decimal('assessment_level_pct', 5, 2)->default(0); // e.g. 20.00%
            $table->decimal('assessed_value', 15, 2)->default(0);
            $table->json('details')->nullable();
            $table->timestamps();
        });

        Schema::create('tax_declarations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('assessment_id')->unique()->constrained('assessments')->cascadeOnDelete();
            $table->string('td_number')->unique();
            $table->string('previous_td_number')->nullable();
            $table->string('owner_name');
            $table->string('barangay');
            $table->decimal('total_market_value', 15, 2);
            $table->decimal('total_assessed_value', 15, 2);
            $table->date('effectivity_date');
            $table->string('status')->default('Active'); // Active, Superseded, Cancelled
            $table->timestamps();
        });

        Schema::create('assessment_status_histories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('assessment_id')->constrained('assessments')->cascadeOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->foreignUuid('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_status_histories');
        Schema::dropIfExists('tax_declarations');
        Schema::dropIfExists('assessment_items');
        Schema::dropIfExists('assessments');
        Schema::dropIfExists('smv_unit_values');
    }
};
