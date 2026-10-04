<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class BillingSequence extends Model
{
    public $timestamps = false;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'key';

    protected $fillable = ['key', 'last_seq'];

    /**
     * Atomically increment and return the next formatted sequence number.
     * E.g. nextNumber('BILL-2026', 'BILL-2026-%05d') -> BILL-2026-00001
     */
    public static function nextNumber(string $key, string $format = '%s-%05d'): string
    {
        return DB::transaction(function () use ($key, $format) {
            $row = static::query()->lockForUpdate()->find($key);
            if (! $row) {
                $row = static::create(['key' => $key, 'last_seq' => 0]);
            }
            $row->last_seq += 1;
            $row->save();

            return sprintf($format, $key, $row->last_seq);
        });
    }
}
