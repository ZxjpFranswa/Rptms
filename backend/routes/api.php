<?php

use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AssessmentController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\TaxpayerController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('reviews', [ApplicationController::class, 'reviews'])->name('reviews.index');

    Route::get('applications', [ApplicationController::class, 'index']);
    Route::post('applications', [ApplicationController::class, 'store'])
        ->middleware('role:Assessment Clerk');
    Route::get('applications/{application}', [ApplicationController::class, 'show']);
    Route::patch('applications/{application}', [ApplicationController::class, 'update'])
        ->middleware('role:Assessment Clerk');
    Route::post('applications/{application}/submit', [ApplicationController::class, 'submit'])
        ->middleware('role:Assessment Clerk');
    Route::post('applications/{application}/resubmit', [ApplicationController::class, 'resubmit'])
        ->middleware('role:Assessment Clerk');
    Route::post('applications/{application}/approve', [ApplicationController::class, 'approve'])
        ->middleware('role:Municipal Assessor');
    Route::post('applications/{application}/return', [ApplicationController::class, 'returnApplication'])
        ->middleware('role:Municipal Assessor');
    Route::post('applications/{application}/reject', [ApplicationController::class, 'reject'])
        ->middleware('role:Municipal Assessor');

    // Assessment & Appraisal Routes
    Route::get('assessments', [AssessmentController::class, 'index'])
        ->middleware('role:Assessment Clerk,Municipal Assessor');
    Route::post('assessments/calculate', [AssessmentController::class, 'calculate']);
    Route::get('assessments/smv', [AssessmentController::class, 'smvValues']);
    Route::get('assessments/review-queue', [AssessmentController::class, 'reviewQueue'])
        ->middleware('role:Municipal Assessor');

    Route::get('applications/{application}/assessment', [AssessmentController::class, 'show']);
    Route::post('applications/{application}/assessment', [AssessmentController::class, 'store'])
        ->middleware('role:Assessment Clerk');
    Route::post('applications/{application}/assessment/submit', [AssessmentController::class, 'submit'])
        ->middleware('role:Assessment Clerk');
    Route::post('applications/{application}/assessment/approve', [AssessmentController::class, 'approve'])
        ->middleware('role:Municipal Assessor');
    Route::post('applications/{application}/assessment/return', [AssessmentController::class, 'returnAssessment'])
        ->middleware('role:Municipal Assessor');
    Route::post('applications/{application}/assessment/reject', [AssessmentController::class, 'reject'])
        ->middleware('role:Municipal Assessor');
    Route::post('applications/{application}/assessment/authorize', [AssessmentController::class, 'authorizeAssessment'])
        ->middleware('role:Municipal Assessor');

    Route::post('applications/{application}/documents', [DocumentController::class, 'store'])
        ->middleware('role:Assessment Clerk');
    Route::get('applications/{application}/documents/{type}', [DocumentController::class, 'show'])
        ->where('type', '.*');
    Route::patch('applications/{application}/documents/{type}', [DocumentController::class, 'update'])
        ->middleware('role:Municipal Assessor')
        ->where('type', '.*');

    Route::get('taxpayers', [TaxpayerController::class, 'index']);
    Route::post('taxpayers', [TaxpayerController::class, 'store'])
        ->middleware('role:Assessment Clerk');

    Route::middleware('role:Administrator')->group(function () {
        Route::get('users', [UserController::class, 'index']);
        Route::post('users', [UserController::class, 'store']);
        Route::patch('users/{user}', [UserController::class, 'update']);
        Route::patch('users/{user}/status', [UserController::class, 'updateStatus']);
        Route::get('audit-logs', [AuditLogController::class, 'index']);
        Route::get('settings', [SettingController::class, 'show']);
        Route::patch('settings', [SettingController::class, 'update']);
    });

    // Billing & Collection Routes
    Route::prefix('billing')->group(function () {
        // Search & view dues
        Route::get('search', [\App\Http\Controllers\Api\BillingController::class, 'search']);
        Route::get('properties/{taxDeclaration}/dues', [\App\Http\Controllers\Api\BillingController::class, 'propertyDues']);
        Route::get('bills', [\App\Http\Controllers\Api\BillingController::class, 'listBills']);
        Route::get('soas', [\App\Http\Controllers\Api\BillingController::class, 'listSoas']);
        Route::get('soas/{soa}', [\App\Http\Controllers\Api\BillingController::class, 'showSoa']);
        Route::get('receipts/{payment}', [\App\Http\Controllers\Api\BillingController::class, 'showReceipt']);

        // Revenue Clerk operations
        Route::post('bills/generate', [\App\Http\Controllers\Api\BillingController::class, 'generateBill'])
            ->middleware('role:Revenue Clerk,Administrator');
        Route::post('soas', [\App\Http\Controllers\Api\BillingController::class, 'createSoa'])
            ->middleware('role:Revenue Clerk');
        Route::post('soas/{soa}/revise', [\App\Http\Controllers\Api\BillingController::class, 'reviseSoa'])
            ->middleware('role:Revenue Clerk');

        // Treasurer operations
        Route::post('soas/{soa}/approve', [\App\Http\Controllers\Api\BillingController::class, 'approveSoa'])
            ->middleware('role:Treasurer');
        Route::post('soas/{soa}/deny', [\App\Http\Controllers\Api\BillingController::class, 'denySoa'])
            ->middleware('role:Treasurer');
        Route::get('corrections', [\App\Http\Controllers\Api\BillingController::class, 'listCorrections'])
            ->middleware('role:Treasurer,Cashier');
        Route::post('corrections/{correctionRequest}/review', [\App\Http\Controllers\Api\BillingController::class, 'reviewCorrection'])
            ->middleware('role:Treasurer');

        // Cashier operations
        Route::post('soas/{soa}/preview-payment', [\App\Http\Controllers\Api\BillingController::class, 'previewPayment'])
            ->middleware('role:Cashier');
        Route::post('soas/{soa}/pay', [\App\Http\Controllers\Api\BillingController::class, 'recordPayment'])
            ->middleware('role:Cashier');
        Route::post('payments/{payment}/correct', [\App\Http\Controllers\Api\BillingController::class, 'requestCorrection'])
            ->middleware('role:Cashier');

        // Reports
        Route::get('reports/daily', [\App\Http\Controllers\Api\BillingController::class, 'dailyReport']);
        Route::get('reports/monthly', [\App\Http\Controllers\Api\BillingController::class, 'monthlyReport']);
        Route::get('reports/annual', [\App\Http\Controllers\Api\BillingController::class, 'annualReport']);
        Route::get('reports/by-barangay', [\App\Http\Controllers\Api\BillingController::class, 'collectionByBarangay']);
        Route::get('reports/by-tax-year', [\App\Http\Controllers\Api\BillingController::class, 'collectionByTaxYear']);
        Route::get('reports/delinquents', [\App\Http\Controllers\Api\BillingController::class, 'delinquentAccounts']);
        Route::get('reports/receipt-register', [\App\Http\Controllers\Api\BillingController::class, 'officialReceiptRegister']);

        // Billing Settings
        Route::get('settings', [\App\Http\Controllers\Api\BillingController::class, 'getSettings']);
        Route::patch('settings', [\App\Http\Controllers\Api\BillingController::class, 'updateSettings'])
            ->middleware('role:Administrator');
    });

    // Taxpayer Portal
    Route::prefix('portal')->middleware('role:Taxpayer')->group(function () {
        Route::get('dues', [\App\Http\Controllers\Api\TaxpayerPortalController::class, 'myDues']);
        Route::get('bills', [\App\Http\Controllers\Api\TaxpayerPortalController::class, 'myBills']);
        Route::get('soas', [\App\Http\Controllers\Api\TaxpayerPortalController::class, 'mySoas']);
        Route::get('payments', [\App\Http\Controllers\Api\TaxpayerPortalController::class, 'myPayments']);
        Route::get('receipts/{payment}', [\App\Http\Controllers\Api\TaxpayerPortalController::class, 'myReceipt']);
        Route::get('notifications', [\App\Http\Controllers\Api\TaxpayerPortalController::class, 'myNotifications']);
        Route::post('notifications/{notification}/read', [\App\Http\Controllers\Api\TaxpayerPortalController::class, 'markNotificationRead']);
    });
});
