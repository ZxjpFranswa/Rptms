<?php

namespace App\Enums;

enum UserRole: string
{
    case AssessmentClerk = 'Assessment Clerk';
    case MunicipalAssessor = 'Municipal Assessor';
    case Administrator = 'Administrator';
    case RevenueClerk = 'Revenue Clerk';
    case Treasurer = 'Treasurer';
    case Cashier = 'Cashier';
    case Taxpayer = 'Taxpayer';
}
