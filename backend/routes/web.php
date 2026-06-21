<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'name' => 'RPTMS API',
    'version' => '1.0',
]));
