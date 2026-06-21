<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUsersSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['username' => 'clerk', 'full_name' => 'Maria Santos', 'role' => UserRole::AssessmentClerk, 'email' => 'maria@magarao.gov'],
            ['username' => 'assessor', 'full_name' => 'Juan Rodriguez', 'role' => UserRole::MunicipalAssessor, 'email' => 'juan@magarao.gov'],
            ['username' => 'admin', 'full_name' => 'Admin User', 'role' => UserRole::Administrator, 'email' => 'admin@magarao.gov'],
            ['username' => 'jsmith', 'full_name' => 'John Smith', 'role' => UserRole::AssessmentClerk, 'email' => 'john@magarao.gov', 'status' => UserStatus::Inactive],
            ['username' => 'sjohnson', 'full_name' => 'Sarah Johnson', 'role' => UserRole::AssessmentClerk, 'email' => 'sarah@magarao.gov'],
        ];

        foreach ($users as $data) {
            User::updateOrCreate(
                ['username' => $data['username']],
                [
                    'email' => $data['email'],
                    'password' => Hash::make('demo'),
                    'full_name' => $data['full_name'],
                    'role' => $data['role'],
                    'status' => $data['status'] ?? UserStatus::Active,
                    'last_login_at' => now()->subDays(1),
                ],
            );
        }
    }
}
