<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_returns_token_and_user(): void
    {
        User::factory()->create([
            'username' => 'clerk',
            'password' => Hash::make('demo'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'username' => 'clerk',
            'password' => 'demo',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'username', 'fullName', 'role']]);
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }
}
