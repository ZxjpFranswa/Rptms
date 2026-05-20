<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $applicationId = $this->application_id;
        $hasFile = (bool) $this->storage_path;

        return [
            'type' => $this->type,
            'fileName' => $this->file_name,
            'fileSize' => $this->file_size,
            'mimeType' => $this->mime_type,
            'uploadedAt' => $this->uploaded_at?->toIso8601String(),
            'uploadStatus' => $this->upload_status instanceof \BackedEnum
                ? $this->upload_status->value
                : $this->upload_status,
            'downloadUrl' => $hasFile
                ? url("/api/applications/{$applicationId}/documents/".rawurlencode($this->type))
                : null,
        ];
    }
}
