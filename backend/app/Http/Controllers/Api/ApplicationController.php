<?php

namespace App\Http\Controllers\Api;

use App\Enums\ApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Services\ApplicationService;
use App\Services\ApplicationWorkflowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function __construct(
        private readonly ApplicationService $applications,
        private readonly ApplicationWorkflowService $workflow,
    ) {}

    public function reviews(Request $request): JsonResponse
    {
        $request->merge(['review' => '1']);

        return $this->index($request);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Application::query()->with($this->applications->eagerRelations());

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($request->query('review') === '1' || $request->routeIs('reviews.index')) {
            $query->whereIn('status', [
                ApplicationStatus::UnderReview->value,
            ]);
        }

        $items = $query->orderByDesc('updated_at')->paginate(
            perPage: (int) $request->query('per_page', 50),
        );

        return ApplicationResource::collection($items)->response();
    }

    public function show(Application $application): JsonResponse
    {
        $application->load($this->applications->eagerRelations());

        return response()->json(new ApplicationResource($application));
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $request->all();
        $asDraft = (bool) ($payload['asDraft'] ?? false);

        $application = $this->applications->create($payload, $request->user(), $asDraft);

        return response()->json(new ApplicationResource($application), 201);
    }

    public function update(Request $request, Application $application): JsonResponse
    {
        $this->authorize('update', $application);

        $application = $this->applications->update($application, $request->all(), $request->user());

        return response()->json(new ApplicationResource($application));
    }

    public function submit(Request $request, Application $application): JsonResponse
    {
        $this->authorize('update', $application);

        $application = $this->workflow->submitDraft($application, $request->user());
        $application->load($this->applications->eagerRelations());

        return response()->json(new ApplicationResource($application));
    }

    public function resubmit(Request $request, Application $application): JsonResponse
    {
        $this->authorize('update', $application);

        $application = $this->workflow->resubmit($application, $request->user());
        $application->load($this->applications->eagerRelations());

        return response()->json(new ApplicationResource($application));
    }

    public function approve(Request $request, Application $application): JsonResponse
    {
        $this->authorize('review', Application::class);

        $data = $request->validate([
            'remarks' => ['nullable', 'string'],
        ]);

        $application = $this->workflow->approve(
            $application,
            $request->user(),
            $data['remarks'] ?? 'Application approved and activated',
        );
        $application->load($this->applications->eagerRelations());

        return response()->json(new ApplicationResource($application));
    }

    public function returnApplication(Request $request, Application $application): JsonResponse
    {
        $this->authorize('review', Application::class);

        $data = $request->validate([
            'reason' => ['required', 'string'],
        ]);

        $application = $this->workflow->return($application, $request->user(), $data['reason']);
        $application->load($this->applications->eagerRelations());

        return response()->json(new ApplicationResource($application));
    }

    public function reject(Request $request, Application $application): JsonResponse
    {
        $this->authorize('review', Application::class);

        $data = $request->validate([
            'reason' => ['required', 'string'],
        ]);

        $application = $this->workflow->reject($application, $request->user(), $data['reason']);
        $application->load($this->applications->eagerRelations());

        return response()->json(new ApplicationResource($application));
    }

}
