<?php

namespace App\Enums;

enum ApplicationStatus: string
{
    case Draft = 'Draft';
    case UnderReview = 'Under_Review';
    case Returned = 'Returned';
    case Rejected = 'Rejected';
    case Active = 'Active';
}
