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
            'taxpayer_id' => $data['taxpayerId'] ?? null,
            'status' => $data['status'] ?? UserStatus::Active->value,
        ]);

        $this->audit->log($request->user(), 'Created User', '-', $user->username);

        return response()->json(new UserResource($user), 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $this->validatedUser($request, $user->id);

        if ($user->role === UserRole::Taxpayer && (! empty($data['password']) || ($data['username'] ?? '') !== $user->username)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'role' => ['Taxpayer account credentials cannot be altered by administrative staff. Taxpayers manage their credentials directly in the Taxpayer Portal.'],
            ]);
        }

        $user->fill([
            'username' => $data['username'] ?? $user->username,
            'email' => $data['email'] ?? $user->email,
            'full_name' => $data['fullName'] ?? $user->full_name,
            'role' => $data['role'] ?? $user->role,
            'taxpayer_id' => array_key_exists('taxpayerId', $data) ? $data['taxpayerId'] : $user->taxpayer_id,
            'status' => $data['status'] ?? $user->status,
        ]);

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        $this->audit->log($request->user(), 'Updated User', $user->username, $user->username);

        return response()->json(new UserResource($user));
    }

    public function resetPassword(Request $request, User $user): JsonResponse
    {
        if ($user->role === UserRole::Taxpayer) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'role' => ['Taxpayer credentials cannot be reset by administrative staff. Taxpayers manage their credentials directly in the Taxpayer Portal.'],
            ]);
        }

        $data = $request->validate([
            'username' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('users', 'username')->ignore($user->id)],
            'password' => ['required', 'string', 'min:6'],
        ]);

        if (! empty($data['username']) && $data['username'] !== $user->username) {
            $previousUsername = $user->username;
            $user->username = $data['username'];
            $this->audit->log($request->user(), 'Updated Staff Username', $previousUsername, $user->username);
        }

        $user->password = Hash::make($data['password']);
        $user->save();

        $this->audit->log(
            $request->user(),
            'Reset Staff Password',
            $user->username,
            "Password reset by administrator for staff member {$user->full_name} ({$user->role->value})"
        );

        return response()->json([
            'message' => "Credentials for {$user->full_name} ({$user->username}) updated successfully.",
            'user' => new UserResource($user),
        ]);
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
            'taxpayerId' => ['nullable', 'uuid', 'exists:taxpayers,id'],
            'status' => ['sometimes', Rule::in(array_column(UserStatus::cases(), 'value'))],
            'password' => [$userId ? 'nullable' : 'required', 'string', 'min:4'],
        ]);
    }
}
