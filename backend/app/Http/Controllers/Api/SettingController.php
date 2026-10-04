<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    private const KEY = 'rptms';

    public function show(): JsonResponse
    {
        $setting = Setting::query()->find(self::KEY);

        return response()->json($setting?->value ?? $this->defaults());
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'municipalityName' => ['sometimes', 'string'],
            'officeName' => ['sometimes', 'string'],
            'fiscalYear' => ['sometimes', 'integer'],
            'sessionTimeout' => ['sometimes', 'integer'],
            'emailNotifications' => ['sometimes', 'boolean'],
        ]);

        $current = Setting::query()->find(self::KEY)?->value ?? $this->defaults();
        $merged = array_merge($current, $data);

        Setting::query()->updateOrCreate(['key' => self::KEY], ['value' => $merged]);

        return response()->json($merged);
    }

    private function defaults(): array
    {
        return [
            'municipalityName' => 'Municipality of Magarao',
            'officeName' => "Municipal Assessor's Office",
            'fiscalYear' => (int) date('Y'),
            'sessionTimeout' => 30,
            'emailNotifications' => true,
        ];
    }
}
