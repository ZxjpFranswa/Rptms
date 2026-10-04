<?php

namespace App\Constants;

class DocumentTypes
{
    public const ALL = [
        'Title',
        'Tax Declaration',
        'Survey Plan',
        'Building Permit',
        'Government ID',
        'Deed of Sale',
        'Affidavit',
        'Exemption Document',
    ];

    public const REQUIRED = [
        'Title',
        'Tax Declaration',
        'Government ID',
    ];

    public const MAX_BYTES = 10 * 1024 * 1024;

    public const MIME_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',  // Some browsers/OS report JPEG as image/jpg
        'image/png',
        'image/webp', // Occasionally reported for PNG files on some systems
    ];
}
