<?php

namespace App\Http\Controllers\Api;

use App\Enums\DocumentUploadStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationDocumentResource;
use App\Models\Application;
use App\Models\ApplicationDocument;
use App\Services\AuditService;
use App\Services\DocumentStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function __construct(
        private readonly DocumentStorageService $storage,
        private readonly AuditService $audit,
    ) {}

    public function store(Request $request, Application $application): JsonResponse
    {
        $this->authorize('update', $application);

        $data = $request->validate([
            'type' => ['required', 'string'],
            'file' => ['required', 'file'],
        ]);

        $document = $this->storage->store($application, $data['type'], $data['file']);

        $this->audit->log($request->user(), 'Uploaded Document', $application->intake_ref, $data['type']);

        return response()->json(new ApplicationDocumentResource($document), 201);
    }

    public function show(Request $request, Application $application, string $type): StreamedResponse|JsonResponse
    {
        $document = ApplicationDocument::query()
            ->where('application_id', $application->id)
            ->where('type', $type)
            ->firstOrFail();

        if (! $document->storage_path || ! Storage::disk('local')->exists($document->storage_path)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        return Storage::disk('local')->response(
            $document->storage_path,
            $document->file_name,
            ['Content-Type' => $document->mime_type ?? 'application/octet-stream'],
        );
    }

    public function update(Request $request, Application $application, string $type): JsonResponse
    {
        $this->authorize('review', Application::class);

        $data = $request->validate([
            'uploadStatus' => ['required', 'in:Verified,Rejected'],
        ]);

        $status = DocumentUploadStatus::from($data['uploadStatus']);
        $document = $this->storage->updateStatus($application, $type, $status, $request->user());

        $this->audit->log(
            $request->user(),
            'Verified Document',
            $application->intake_ref,
            "{$type}: {$status->value}",
        );

        return response()->json(new ApplicationDocumentResource($document));
    }
}
