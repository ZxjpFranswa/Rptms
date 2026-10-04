<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

Illuminate\Support\Facades\DB::table('applications')->where('status', 'Approved')->update(['status' => 'Active', 'last_assessor_action' => 'Activated']);
Illuminate\Support\Facades\DB::table('application_status_history')->where('from_status', 'Approved')->update(['from_status' => 'Active']);
Illuminate\Support\Facades\DB::table('application_status_history')->where('to_status', 'Approved')->update(['to_status' => 'Active']);

echo "Done\n";
