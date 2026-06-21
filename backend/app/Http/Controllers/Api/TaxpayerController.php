<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaxpayerResource;
use App\Models\Taxpayer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxpayerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Taxpayer::query();

        if ($tin = $request->query('tin')) {
            $query->where('tin', $tin);
        }

        if ($request->query('lastName') && $request->query('firstName')) {
            $query->where('last_name', $request->query('lastName'))
                ->where('first_name', $request->query('firstName'));
        }

        $results = $query->limit(10)->get();

        return response()->json(TaxpayerResource::collection($results));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'lastName' => ['required', 'string'],
            'firstName' => ['required', 'string'],
            'middleName' => ['nullable', 'string'],
            'tin' => ['nullable', 'string'],
            'address' => ['required', 'string'],
            'contact' => ['required', 'string'],
            'email' => ['required', 'email'],
        ]);

        $taxpayer = Taxpayer::create([
            'last_name' => $data['lastName'],
            'first_name' => $data['firstName'],
            'middle_name' => $data['middleName'] ?? null,
            'tin' => $data['tin'] ?? null,
            'address' => $data['address'],
            'contact' => $data['contact'],
            'email' => $data['email'],
        ]);

        return response()->json(new TaxpayerResource($taxpayer), 201);
    }
}
