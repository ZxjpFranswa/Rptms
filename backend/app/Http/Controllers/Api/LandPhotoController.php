<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\ApplicationLandPhoto;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LandPhotoController extends Controller
{
    public function __construct(
        private readonly AuditService $audit,
    ) {}

    /**
     * Get all land photos for an application.
     */
    public function index(Application $application): JsonResponse
    {
        $photos = $application->landPhotos()
            ->with('uploader:id,full_name')
            ->get()
            ->map(function (ApplicationLandPhoto $photo) use ($application) {
                return [
                    'id' => $photo->id,
                    'application_id' => $photo->application_id,
                    'title' => $photo->title,
                    'category' => $photo->category,
                    'file_name' => $photo->file_name,
                    'file_size' => $photo->file_size,
                    'mime_type' => $photo->mime_type,
                    'caption' => $photo->caption,
                    'uploader' => $photo->uploader?->full_name,
                    'created_at' => $photo->created_at,
                    'url' => url("/api/applications/{$application->id}/land-photos/{$photo->id}"),
                ];
            });

        return response()->json($photos);
    }

    /**
     * Upload a new picture/image of the land.
     */
    public function store(Request $request, Application $application): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:50'],
            'caption' => ['nullable', 'string', 'max:500'],
            'file' => ['required', 'file', 'mimes:jpeg,jpg,png,webp', 'max:12288'], // up to 12MB image
        ]);

        $file = $request->file('file');
        $path = $file->store("applications/{$application->id}/land-photos", 'local');

        $photo = ApplicationLandPhoto::create([
            'application_id' => $application->id,
            'title' => $data['title'],
            'category' => $data['category'] ?? 'Ground View',
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType() ?: 'image/jpeg',
            'storage_path' => $path,
            'caption' => $data['caption'] ?? null,
            'uploaded_by' => $request->user()->id,
        ]);

        $this->audit->log(
            $request->user(),
            'Uploaded Land Photo',
            $application->intake_ref,
            "{$photo->title} ({$photo->category})"
        );

        return response()->json([
            'id' => $photo->id,
            'application_id' => $photo->application_id,
            'title' => $photo->title,
            'category' => $photo->category,
            'file_name' => $photo->file_name,
            'file_size' => $photo->file_size,
            'mime_type' => $photo->mime_type,
            'caption' => $photo->caption,
            'uploader' => $request->user()->full_name,
            'created_at' => $photo->created_at,
            'url' => url("/api/applications/{$application->id}/land-photos/{$photo->id}"),
        ], 201);
    }

    /**
     * Stream the land photo image.
     */
    public function show(Application $application, ApplicationLandPhoto $photo): StreamedResponse|JsonResponse
    {
        if ($photo->application_id !== $application->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if (!$photo->storage_path || !Storage::disk('local')->exists($photo->storage_path)) {
            return response()->json(['message' => 'Image file not found.'], 404);
        }

        return Storage::disk('local')->response(
            $photo->storage_path,
            $photo->file_name,
            ['Content-Type' => $photo->mime_type ?: 'image/jpeg']
        );
    }

    /**
     * Delete a land photo.
     */
    public function destroy(Request $request, Application $application, ApplicationLandPhoto $photo): JsonResponse
    {
        if ($photo->application_id !== $application->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if ($photo->storage_path && Storage::disk('local')->exists($photo->storage_path)) {
            Storage::disk('local')->delete($photo->storage_path);
        }

        $photo->delete();

        $this->audit->log(
            $request->user(),
            'Deleted Land Photo',
            $application->intake_ref,
            $photo->title
        );

        return response()->json(['message' => 'Land photo deleted successfully.']);
    }
}
