<?php

namespace App\Enums;

enum DocumentUploadStatus: string
{
    case Pending = 'Pending';
    case Uploaded = 'Uploaded';
    case Verified = 'Verified';
    case Rejected = 'Rejected';
}
