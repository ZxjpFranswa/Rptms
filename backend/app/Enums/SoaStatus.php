<?php

namespace App\Enums;

enum SoaStatus: string
{
    case PendingApproval = 'PendingApproval';
    case Issued = 'Issued';
    case Denied = 'Denied';
    case Superseded = 'Superseded';
    case Settled = 'Settled';
}
