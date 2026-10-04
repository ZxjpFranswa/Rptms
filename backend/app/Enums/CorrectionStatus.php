<?php

namespace App\Enums;

enum CorrectionStatus: string
{
    case Pending = 'Pending';
    case Approved = 'Approved';
    case Denied = 'Denied';
}
