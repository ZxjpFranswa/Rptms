<?php

namespace App\Enums;

enum BillStatus: string
{
    case Unpaid = 'Unpaid';
    case Partial = 'Partial';
    case Paid = 'Paid';
}
