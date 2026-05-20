<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatus;
use App\Enums\UserRole;
use App\Models\Application;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApplicationWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_assessor_can_approve_application(): void
    {
        $assessor = User::factory()->create([
            'username' => 'assessor',
            'role' => UserRole::MunicipalAssessor,
            'password' => Hash::make('demo'),
        ]);

        $application = Application::factory()->create([
            'status' => ApplicationStatus::UnderReview,
        ]);

        Sanctum::actingAs($assessor);

        $this->postJson("/api/applications/{$application->id}/approve", [
            'remarks' => 'Looks good',
        ])->assertOk()
            ->assertJsonPath('status', ApplicationStatus::Approved->value);
    }
}
