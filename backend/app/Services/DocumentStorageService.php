<?php

namespace App\Services;

use App\Constants\DocumentTypes;
use App\Enums\DocumentUploadStatus;
use App\Models\Application;
use App\Models\ApplicationDocument;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class DocumentStorageService
{
    public function store(Application $application, string $type, UploadedFile $file): ApplicationDocument
    {
        if (! in_array($type, DocumentTypes::ALL, true)) {
            throw ValidationException::withMessages(['type' => 'Invalid document type.']);
        }

        $this->validateFile($file);

        $path = $file->store("applications/{$application->id}", 'local');

        $document = ApplicationDocument::query()->firstOrNew([
            'application_id' => $application->id,
            'type' => $type,
        ]);

        if ($document->storage_path) {
            Storage::disk('local')->delete($document->storage_path);
        }

        $document->fill([
            'upload_status' => DocumentUploadStatus::Uploaded,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'storage_path' => $path,
            'uploaded_at' => now(),
            'verified_by' => null,
            'verified_at' => null,
        ]);
        $document->save();

        return $document->fresh();
    }

    public function updateStatus(
        Application $application,
        string $type,
        DocumentUploadStatus $status,
        ?User $verifier = null,
    ): ApplicationDocument {
        $document = ApplicationDocument::query()
            ->where('application_id', $application->id)
            ->where('type', $type)
            ->firstOrFail();

        if ($status === DocumentUploadStatus::Verified || $status === DocumentUploadStatus::Rejected) {
            $document->verified_by = $verifier?->id;
            $document->verified_at = now();
        }

        $document->upload_status = $status;
        $document->save();

        return $document->fresh();
    }

    public function ensureSlots(Application $application): void
    {
        foreach (DocumentTypes::ALL as $type) {
            ApplicationDocument::query()->firstOrCreate(
                ['application_id' => $application->id, 'type' => $type],
                ['upload_status' => DocumentUploadStatus::Pending],
            );
        }
    }

    public function missingRequired(Application $application): array
    {
        $missing = [];
        foreach (DocumentTypes::REQUIRED as $type) {
            $doc = $application->documents()->where('type', $type)->first();
            if (! $doc || $doc->upload_status === DocumentUploadStatus::Pending) {
                $missing[] = $type;
            }
        }

        return $missing;
    }

    private function validateFile(UploadedFile $file): void
    {
        if ($file->getSize() > DocumentTypes::MAX_BYTES) {
            throw ValidationException::withMessages(['file' => 'File must be 10MB or smaller.']);
        }

        $mime = $file->getMimeType();
        if (! in_array($mime, DocumentTypes::MIME_TYPES, true)) {
            throw ValidationException::withMessages(['file' => 'Only PDF, JPG, and PNG files are allowed.']);
        }
    }
}
