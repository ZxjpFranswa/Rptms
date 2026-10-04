<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Assessment;
use App\Models\SmvUnitValue;
use App\Services\AppraisalCalculationService;
use App\Services\AssessmentWorkflowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
    public function __construct(
        private readonly AppraisalCalculationService $calculator,
        private readonly AssessmentWorkflowService $workflow,
    ) {}

    /**
     * Role-scoped assessment workspace list.
     *
     * Clerks see every property (with or without an assessment yet);
     * assessors only see assessments that have been submitted for review.
     */
    public function index(Request $request): JsonResponse
    {
        $isAssessor = $request->user()->role === UserRole::MunicipalAssessor;

        $base = Application::query()->with(['assessment.taxDeclaration', 'propertyDetail']);

        if ($isAssessor) {
            $base->whereHas('assessment', fn ($q) => $q->whereNotIn('status', ['Draft', 'Returned']));
        }

        // Stats ignore search/filter so the header cards stay stable.
        $all = (clone $base)->get();
        $count = fn (string $status) => $all->filter(fn ($a) => $a->assessment?->status === $status)->count();
        $stats = [
            'not_started' => $all->whereNull('assessment')->count(),
            'draft' => $count('Draft'),
            'under_review' => $count('UnderReview'),
            'returned' => $count('Returned'),
            'approved' => $count('Approved'),
            'authorized' => $count('Authorized'),
            'rejected' => $count('Rejected'),
            'total_market_value' => round((float) $all->sum(fn ($a) => (float) ($a->assessment?->total_market_value ?? 0)), 2),
            'total_assessed_value' => round((float) $all->sum(fn ($a) => (float) ($a->assessment?->total_assessed_value ?? 0)), 2),
        ];

        if ($status = $request->query('status')) {
            if ($status === 'NotStarted') {
                $base->whereDoesntHave('assessment');
            } else {
                $base->whereHas('assessment', fn ($q) => $q->where('status', $status));
            }
        }

        if ($barangay = $request->query('barangay')) {
            $base->where('barangay', $barangay);
        }

        if ($class = $request->query('classification')) {
            $base->where('property_type', $class);
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $base->where(function ($q) use ($search) {
                $q->where('intake_ref', 'like', "%{$search}%")
                    ->orWhere('taxpayer_name', 'like', "%{$search}%")
                    ->orWhere('barangay', 'like', "%{$search}%")
                    ->orWhereHas('propertyDetail', fn ($p) => $p->where('pin', 'like', "%{$search}%"));
            });
        }

        $page = $base->orderByDesc('updated_at')->paginate((int) $request->query('per_page', 15));

        $rows = $page->getCollection()->map(function (Application $app) {
            $a = $app->assessment;

            return [
                'application_id' => $app->id,
                'intake_ref' => $app->intake_ref,
                'taxpayer_name' => $app->taxpayer_name,
                'barangay' => $app->barangay,
                'property_type' => $app->property_type,
                'pin' => $app->propertyDetail?->pin,
                'arp_number' => $app->propertyDetail?->arp_number,
                'land_classification' => $app->propertyDetail?->land_classification,
                'total_area' => (float) ($app->propertyDetail?->total_area ?? 0),
                'tax_exempt' => (bool) $app->tax_exempt,
                'exemption_notes' => $app->exemption_notes,
                'application_status' => $app->status->value,
                'assessment' => $a ? [
                    'id' => $a->id,
                    'status' => $a->status,
                    'total_market_value' => $a->total_market_value,
                    'total_assessed_value' => $a->total_assessed_value,
                    'submitted_at' => $a->submitted_at,
                    'updated_at' => $a->updated_at,
                    'td_number' => $a->taxDeclaration?->td_number,
                ] : null,
            ];
        });

        return response()->json([
            'data' => $rows,
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
                'total' => $page->total(),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Calculate appraisal preview dynamically without saving.
     */
    public function calculate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'barangay' => ['nullable', 'string'],
            'is_taxable' => ['nullable', 'boolean'],
            'items' => ['required', 'array'],
            'items.*.item_type' => ['required', 'string'],
            'items.*.classification' => ['required', 'string'],
            'items.*.actual_use' => ['required', 'string'],
            'items.*.area_sqm' => ['numeric', 'min:0'],
            'items.*.unit_value' => ['nullable', 'numeric', 'min:0'],
            'items.*.adjustment_factor_pct' => ['nullable', 'numeric'],
            'items.*.assessment_level_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'items.*.details' => ['nullable', 'array'],
        ]);

        $barangay = $data['barangay'] ?? '';
        $isTaxable = $data['is_taxable'] ?? true;
        $calculated = $this->calculator->computeTotals($data['items'], $isTaxable);

        return response()->json($calculated);
    }

    /**
     * Fetch SMV base unit value recommendations.
     */
    public function smvValues(Request $request): JsonResponse
    {
        $barangay = $request->query('barangay');
        $classification = $request->query('classification');

        $query = SmvUnitValue::query();
        if ($barangay) {
            $query->where('barangay', $barangay);
        }
        if ($classification) {
            $query->where('classification', $classification);
        }

        return response()->json($query->get());
    }

    /**
     * Get assessment for a given application.
     */
    public function show(Application $application): JsonResponse
    {
        $assessment = $application->assessment()
            ->with(['items', 'taxDeclaration', 'statusHistories.actor', 'creator', 'reviewer', 'authorizer'])
            ->first();

        if (!$assessment) {
            return response()->json(['message' => 'No assessment record found.'], 404);
        }

        return response()->json($assessment);
    }

    /**
     * Save/Update draft assessment record (Clerk).
     */
    public function store(Request $request, Application $application): JsonResponse
    {
        $data = $request->validate([
            'pin' => ['nullable', 'string'],
            'arp_number' => ['nullable', 'string'],
            'is_taxable' => ['nullable', 'boolean'],
            'exemption_reason' => ['nullable', 'string'],
            'effective_year' => ['nullable', 'integer'],
            'effective_quarter' => ['nullable', 'integer'],
            'remarks' => ['nullable', 'string'],
            'items' => ['required', 'array'],
        ]);

        $assessment = $this->workflow->saveDraft($application, $data, $request->user());

        return response()->json($assessment, 200);
    }

    /**
     * Submit assessment for Municipal Assessor review (Clerk).
     */
    public function submit(Request $request, Application $application): JsonResponse
    {
        $assessment = $application->assessment;
        if (!$assessment) {
            return response()->json(['message' => 'Please save assessment draft before submitting.'], 422);
        }

        $submitted = $this->workflow->submitForReview($assessment, $request->user());

        return response()->json($submitted);
    }

    /**
     * Pending assessments review queue for Municipal Assessor.
     */
    public function reviewQueue(Request $request): JsonResponse
    {
        $assessments = Assessment::query()
            ->whereIn('status', ['UnderReview', 'Approved'])
            ->with(['application.taxpayer', 'application.propertyDetail', 'application.location', 'items'])
            ->orderByDesc('updated_at')
            ->paginate((int) $request->query('per_page', 50));

        return response()->json($assessments);
    }

    /**
     * Approve assessment decision (Assessor).
     */
    public function approve(Request $request, Application $application): JsonResponse
    {
        $assessment = $application->assessment;
        if (!$assessment) {
            return response()->json(['message' => 'Assessment record not found.'], 404);
        }

        $data = $request->validate(['remarks' => ['nullable', 'string']]);
        $approved = $this->workflow->approve($assessment, $request->user(), $data['remarks'] ?? '');

        return response()->json($approved);
    }

    /**
     * Return assessment back to clerk (Assessor).
     */
    public function returnAssessment(Request $request, Application $application): JsonResponse
    {
        $assessment = $application->assessment;
        if (!$assessment) {
            return response()->json(['message' => 'Assessment record not found.'], 404);
        }

        $data = $request->validate(['reason' => ['required', 'string']]);
        $returned = $this->workflow->returnToClerk($assessment, $request->user(), $data['reason']);

        return response()->json($returned);
    }

    /**
     * Reject assessment (Assessor).
     */
    public function reject(Request $request, Application $application): JsonResponse
    {
        $assessment = $application->assessment;
        if (!$assessment) {
            return response()->json(['message' => 'Assessment record not found.'], 404);
        }

        $data = $request->validate(['reason' => ['required', 'string']]);
        $rejected = $this->workflow->reject($assessment, $request->user(), $data['reason']);

        return response()->json($rejected);
    }

    /**
     * Authorize final assessment & generate Tax Declaration (Assessor).
     */
    public function authorizeAssessment(Request $request, Application $application): JsonResponse
    {
        $assessment = $application->assessment;
        if (!$assessment) {
            return response()->json(['message' => 'Assessment record not found.'], 404);
        }

        $taxDeclaration = $this->workflow->authorize($assessment, $request->user());

        return response()->json($taxDeclaration);
    }
}
