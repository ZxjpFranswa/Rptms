<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function __construct(private readonly AuditService $audit) {}

    public function index(): JsonResponse
    {
        return response()->json(UserResource::collection(User::query()->orderBy('username')->get()));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validatedUser($request);

        $user = User::create([
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => Hash::make($data['password'] ?? 'demo'),
            'full_name' => $data['fullName'],
            'role' => $data['role'],
            'status' => $data['status'] ?? UserStatus::Active->value,
        ]);

        $this->audit->log($request->user(), 'Created User', '-', $user->username);

        return response()->json(new UserResource($user), 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $this->validatedUser($request, $user->id);

        $user->fill([
            'username' => $data['username'] ?? $user->username,
            'email' => $data['email'] ?? $user->email,
            'full_name' => $data['fullName'] ?? $user->full_name,
            'role' => $data['role'] ?? $user->role,
            'status' => $data['status'] ?? $user->status,
        ]);

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        $this->audit->log($request->user(), 'Updated User', $user->username, $user->username);

        return response()->json(new UserResource($user));
    }

    public function updateStatus(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(array_column(UserStatus::cases(), 'value'))],
        ]);

        $previous = $user->status->value;
        $user->status = UserStatus::from($data['status']);
        $user->save();

        $this->audit->log($request->user(), 'Updated User Status', $previous, $user->status->value);

        return response()->json(new UserResource($user));
    }

    private function validatedUser(Request $request, ?string $userId = null): array
    {
        return $request->validate([
            'username' => ['required', 'string', Rule::unique('users', 'username')->ignore($userId)],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'fullName' => ['required', 'string'],
            'role' => ['required', Rule::in(array_column(UserRole::cases(), 'value'))],
            'status' => ['sometimes', Rule::in(array_column(UserStatus::cases(), 'value'))],
            'password' => [$userId ? 'nullable' : 'required', 'string', 'min:4'],
        ]);
    }
}
