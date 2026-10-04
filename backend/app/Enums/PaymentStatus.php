<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Posted = 'Posted';
    case Cancelled = 'Cancelled';
}
