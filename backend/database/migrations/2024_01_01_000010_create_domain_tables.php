<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications_intake_seq', function (Blueprint $table) {
            $table->unsignedSmallInteger('year')->primary();
            $table->unsignedInteger('last_seq')->default(0);
        });

        Schema::create('taxpayers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('last_name');
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('tin')->nullable()->unique();
            $table->text('address');
            $table->string('contact');
            $table->string('email');
            $table->timestamps();
        });

        Schema::create('applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('intake_ref')->unique();
            $table->foreignUuid('taxpayer_id')->nullable()->constrained('taxpayers')->nullOnDelete();
            $table->string('taxpayer_name');
            $table->string('property_type');
            $table->string('barangay');
            $table->date('submission_date');
            $table->string('status');
            $table->string('verification_status')->default('Pending');
            $table->string('last_assessor_action')->nullable();
            $table->text('remarks')->nullable();
            $table->boolean('tax_exempt')->default(false);
            $table->text('exemption_notes')->nullable();
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('taxpayer_id');
        });

        Schema::create('application_property_details', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('application_id')->unique()->constrained('applications')->cascadeOnDelete();
            $table->string('pin');
            $table->string('arp_number');
            $table->string('land_classification');
            $table->string('actual_use');
            $table->decimal('total_area', 12, 2);
            $table->string('survey_number')->nullable();
            $table->timestamps();
        });

        Schema::create('application_locations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('application_id')->unique()->constrained('applications')->cascadeOnDelete();
            $table->string('street');
            $table->string('barangay');
            $table->string('municipality');
            $table->string('province');
            $table->string('zip');
            $table->timestamps();
        });

        Schema::create('application_technical_data', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('application_id')->unique()->constrained('applications')->cascadeOnDelete();
            $table->string('north_boundary')->nullable();
            $table->string('south_boundary')->nullable();
            $table->string('east_boundary')->nullable();
            $table->string('west_boundary')->nullable();
            $table->string('area_measurement')->nullable();
            $table->string('survey_reference')->nullable();
            $table->string('building_type')->nullable();
            $table->string('floors')->nullable();
            $table->string('building_area')->nullable();
            $table->timestamps();
        });

        Schema::create('application_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('application_id')->constrained('applications')->cascadeOnDelete();
            $table->string('type');
            $table->string('upload_status')->default('Pending');
            $table->string('file_name')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('storage_path')->nullable();
            $table->timestamp('uploaded_at')->nullable();
            $table->foreignUuid('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->unique(['application_id', 'type']);
        });

        Schema::create('application_status_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('application_id')->constrained('applications')->cascadeOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->foreignUuid('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name');
            $table->string('action');
            $table->string('status')->default('Success');
            $table->string('previous_value')->nullable();
            $table->string('new_value')->nullable();
            $table->timestamps();
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->json('value');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('application_status_history');
        Schema::dropIfExists('application_documents');
        Schema::dropIfExists('application_technical_data');
        Schema::dropIfExists('application_locations');
        Schema::dropIfExists('application_property_details');
        Schema::dropIfExists('applications');
        Schema::dropIfExists('taxpayers');
        Schema::dropIfExists('applications_intake_seq');
    }
};
