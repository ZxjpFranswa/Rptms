<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class IntakeRefGenerator
{
    public function next(): string
    {
        $year = (int) date('Y');

        return DB::transaction(function () use ($year) {
            $row = DB::table('applications_intake_seq')->lockForUpdate()->where('year', $year)->first();

            if (! $row) {
                DB::table('applications_intake_seq')->insert(['year' => $year, 'last_seq' => 1]);

                return sprintf('INT-%d-%03d', $year, 1);
            }

            $next = $row->last_seq + 1;
            DB::table('applications_intake_seq')->where('year', $year)->update(['last_seq' => $next]);

            return sprintf('INT-%d-%03d', $year, $next);
        });
    }
}
