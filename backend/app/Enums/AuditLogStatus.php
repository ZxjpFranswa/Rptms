<?php

namespace App\Enums;

enum AuditLogStatus: string
{
    case Success = 'Success';
    case Failed = 'Failed';
}
