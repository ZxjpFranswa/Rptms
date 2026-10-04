<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Locked counters for BILL-, SOA- and OR- numbers (key e.g. "OR-2026").
        Schema::create('billing_sequences', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->unsignedInteger('last_seq')->default(0);
        });

        // One bill per Tax Declaration per taxable year. Rates are snapshotted.
        Schema::create('tax_bills', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('bill_no')->unique();
            $table->foreignUuid('tax_declaration_id')->constrained('tax_declarations')->cascadeOnDelete();
            $table->foreignUuid('assessment_id')->nullable()->constrained('assessments')->nullOnDelete();
            $table->foreignUuid('taxpayer_id')->nullable()->constrained('taxpayers')->nullOnDelete();
            $table->string('owner_name');
            $table->string('pin')->nullable();
            $table->string('arp_number')->nullable();
            $table->string('td_number');
            $table->string('barangay');
            $table->unsignedSmallInteger('taxable_year');
            $table->decimal('assessed_value', 15, 2);
            $table->decimal('basic_rate_pct', 6, 3);
            $table->decimal('sef_rate_pct', 6, 3);
            $table->decimal('basic_tax', 15, 2);
            $table->decimal('sef_tax', 15, 2);
            $table->decimal('total_tax', 15, 2);
            $table->string('status')->default('Unpaid'); // Unpaid | Partial | Paid
            $table->foreignUuid('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['tax_declaration_id', 'taxable_year']);
            $table->index(['status', 'taxable_year']);
        });

        // Quarterly installments. *_paid columns are a cache recomputed from posted allocations.
        Schema::create('tax_bill_installments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tax_bill_id')->constrained('tax_bills')->cascadeOnDelete();
            $table->unsignedTinyInteger('quarter');
            $table->date('due_date');
            $table->decimal('basic_due', 15, 2);
            $table->decimal('sef_due', 15, 2);
            $table->decimal('total_due', 15, 2);
            $table->decimal('basic_paid', 15, 2)->default(0);
            $table->decimal('sef_paid', 15, 2)->default(0);
            $table->decimal('penalty_paid', 15, 2)->default(0);
            $table->decimal('discount_granted', 15, 2)->default(0);
            $table->string('status')->default('Unpaid'); // Unpaid | Partial | Paid
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->unique(['tax_bill_id', 'quarter']);
            $table->index(['status', 'due_date']);
        });

        // Statement of Account — one per property (TD); penalties need Treasurer approval.
        Schema::create('statements_of_account', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('soa_no')->unique();
            $table->foreignUuid('tax_declaration_id')->constrained('tax_declarations')->cascadeOnDelete();
            $table->foreignUuid('taxpayer_id')->nullable()->constrained('taxpayers')->nullOnDelete();
            $table->uuid('revision_of_id')->nullable()->index();
            $table->string('owner_name');
            $table->string('pin')->nullable();
            $table->string('td_number');
            $table->string('barangay');
            $table->date('as_of_date');
            $table->date('valid_until');
            $table->decimal('total_basic', 15, 2)->default(0);
            $table->decimal('total_sef', 15, 2)->default(0);
            $table->decimal('total_principal', 15, 2)->default(0);
            $table->decimal('computed_penalty', 15, 2)->default(0);
            $table->decimal('total_penalty', 15, 2)->default(0);
            $table->decimal('total_amount_due', 15, 2)->default(0);
            $table->boolean('has_penalty')->default(false);
            // PendingApproval | Issued | Denied | Superseded | Settled
            $table->string('status');
            $table->text('remarks')->nullable();
            $table->text('review_remarks')->nullable();
            $table->foreignUuid('prepared_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('notified_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'tax_declaration_id']);
        });

        Schema::create('soa_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('statement_of_account_id')->constrained('statements_of_account')->cascadeOnDelete();
            $table->foreignUuid('tax_bill_installment_id')->constrained('tax_bill_installments')->cascadeOnDelete();
            $table->unsignedSmallInteger('taxable_year');
            $table->unsignedTinyInteger('quarter');
            $table->date('due_date');
            $table->decimal('basic_balance', 15, 2);
            $table->decimal('sef_balance', 15, 2);
            $table->decimal('principal_balance', 15, 2);
            $table->unsignedSmallInteger('months_late')->default(0);
            $table->decimal('penalty_rate_pct', 6, 3)->default(0);
            $table->decimal('computed_penalty', 15, 2)->default(0);
            $table->decimal('penalty_amount', 15, 2)->default(0); // after clerk adjustment
            $table->string('adjustment_reason')->nullable();
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('or_number')->unique();
            $table->foreignUuid('statement_of_account_id')->constrained('statements_of_account');
            $table->foreignUuid('tax_declaration_id')->constrained('tax_declarations');
            $table->foreignUuid('taxpayer_id')->nullable()->constrained('taxpayers')->nullOnDelete();
            $table->string('payor_name');
            $table->string('barangay');
            $table->dateTime('payment_date');
            $table->decimal('amount_due', 15, 2);      // gross balance (principal + penalty) at payment time
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('amount_paid', 15, 2);     // cash applied to the account
            $table->decimal('amount_tendered', 15, 2);
            $table->decimal('change_amount', 15, 2)->default(0);
            $table->decimal('balance_after', 15, 2)->default(0);
            $table->string('payment_method')->default('Cash'); // Cash | Check
            $table->string('reference_no')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignUuid('cashier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('Posted'); // Posted | Cancelled
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignUuid('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('cancellation_reason')->nullable();
            $table->uuid('replaces_payment_id')->nullable()->index();
            $table->timestamps();

            $table->index(['status', 'payment_date']);
        });

        // Breakdown per installment — the OR payment breakdown. Never deleted.
        Schema::create('payment_allocations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->foreignUuid('tax_bill_installment_id')->constrained('tax_bill_installments');
            $table->unsignedSmallInteger('taxable_year');
            $table->unsignedTinyInteger('quarter');
            $table->decimal('basic_amount', 15, 2)->default(0);
            $table->decimal('sef_amount', 15, 2)->default(0);
            $table->decimal('penalty_amount', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->string('discount_type')->nullable(); // Advance | Prompt
            $table->decimal('total_amount', 15, 2)->default(0); // cash = basic + sef + penalty - discount
            $table->timestamps();
        });

        Schema::create('payment_correction_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('payment_id')->constrained('payments');
            $table->string('request_type')->default('Cancellation');
            $table->text('reason');
            $table->foreignUuid('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('Pending'); // Pending | Approved | Denied
            $table->foreignUuid('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_remarks')->nullable();
            $table->timestamps();

            $table->index('status');
        });

        Schema::create('taxpayer_notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('taxpayer_id')->nullable()->constrained('taxpayers')->nullOnDelete();
            $table->foreignUuid('tax_declaration_id')->nullable()->constrained('tax_declarations')->nullOnDelete();
            $table->uuid('statement_of_account_id')->nullable()->index();
            $table->uuid('payment_id')->nullable()->index();
            $table->string('channel')->default('in-app');
            $table->string('recipient_email')->nullable();
            $table->string('subject');
            $table->text('message');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('taxpayer_notifications');
        Schema::dropIfExists('payment_correction_requests');
        Schema::dropIfExists('payment_allocations');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('soa_items');
        Schema::dropIfExists('statements_of_account');
        Schema::dropIfExists('tax_bill_installments');
        Schema::dropIfExists('tax_bills');
        Schema::dropIfExists('billing_sequences');
    }
};
