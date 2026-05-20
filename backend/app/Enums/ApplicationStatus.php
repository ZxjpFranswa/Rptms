<?php

namespace App\Enums;

enum ApplicationStatus: string
{
    case Draft = 'Draft';
    case UnderVerification = 'Under_Verification';
    case UnderReview = 'Under_Review';
    case Returned = 'Returned';
    case Approved = 'Approved';
    case Rejected = 'Rejected';
    case Active = 'Active';
}
