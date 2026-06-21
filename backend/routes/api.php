<?php

use App\Http\Controllers\Api\ApplicationController;
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
});
