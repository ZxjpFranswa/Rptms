<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::query()->orderByDesc('created_at');

        if ($action = $request->query('action')) {
            $query->where('action', $action);
        }

        if ($user = $request->query('user')) {
            $query->where('user_name', 'like', "%{$user}%");
        }

        return AuditLogResource::collection(
            $query->paginate((int) $request->query('per_page', 100)),
        )->response();
    }
}
