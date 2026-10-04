<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentStatus;
use App\Enums\SoaStatus;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\StatementOfAccount;
use App\Models\TaxBill;
use App\Models\TaxDeclaration;
use App\Models\Taxpayer;
use App\Models\TaxpayerNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxpayerPortalController extends Controller
{
    private function resolveTaxpayer(Request $request): ?Taxpayer
    {
        $user = $request->user();
        if ($user->taxpayer_id) {
            return Taxpayer::find($user->taxpayer_id);
        }

        // Fallback: match by email
        return Taxpayer::where('email', $user->email)->first();
    }

    /**
     * Overview of dues across all properties owned by the authenticated taxpayer.
     */
    public function myDues(Request $request): JsonResponse
    {
        $taxpayer = $this->resolveTaxpayer($request);
        if (! $taxpayer) {
            return response()->json([
                'taxpayer' => null,
                'properties' => [],
                'total_outstanding' => 0.0,
            ]);
        }

        // Find TDs where owner name or email matches, or via applications
        $tdIds = TaxDeclaration::query()
            ->whereHas('assessment.application', fn ($q) => $q->where('taxpayer_id', $taxpayer->id))
            ->pluck('id');

        $tds = TaxDeclaration::query()
            ->whereIn('id', $tdIds)
            ->with(['taxBills.installments', 'statementsOfAccount' => fn ($q) => $q->latest()])
            ->get();

        $totalOutstanding = 0.0;
        $properties = $tds->map(function (TaxDeclaration $td) use (&$totalOutstanding) {
            $propBalance = 0.0;
            foreach ($td->taxBills as $b) {
                foreach ($b->installments as $i) {
                    $propBalance += $i->principal_balance;
                }
            }
            $totalOutstanding += $propBalance;

            $activeSoa = $td->statementsOfAccount
                ->first(fn ($s) => in_array($s->status, [SoaStatus::Issued, SoaStatus::PendingApproval]));

            return [
                'tax_declaration_id' => $td->id,
                'td_number' => $td->td_number,
                'owner_name' => $td->owner_name,
                'barangay' => $td->barangay,
                'total_assessed_value' => (float) $td->total_assessed_value,
                'outstanding_balance' => round($propBalance, 2),
                'active_soa' => $activeSoa ? [
                    'id' => $activeSoa->id,
                    'soa_no' => $activeSoa->soa_no,
                    'status' => $activeSoa->status->value,
                    'total_amount_due' => (float) $activeSoa->total_amount_due,
                    'valid_until' => $activeSoa->valid_until,
                    'has_penalty' => $activeSoa->has_penalty,
                ] : null,
            ];
        });

        return response()->json([
            'taxpayer' => [
                'id' => $taxpayer->id,
                'name' => $taxpayer->full_name,
                'tin' => $taxpayer->tin,
                'email' => $taxpayer->email,
                'contact' => $taxpayer->contact,
                'address' => $taxpayer->address,
            ],
            'total_outstanding' => round($totalOutstanding, 2),
            'properties' => $properties,
        ]);
    }

    /**
     * All tax bills for the taxpayer's properties.
     */
    public function myBills(Request $request): JsonResponse
    {
        $taxpayer = $this->resolveTaxpayer($request);
        if (! $taxpayer) {
            return response()->json([]);
        }

        $bills = TaxBill::query()
            ->where(function ($q) use ($taxpayer) {
                $q->where('taxpayer_id', $taxpayer->id)
                    ->orWhereHas('taxDeclaration.assessment.application', fn ($app) => $app->where('taxpayer_id', $taxpayer->id));
            })
            ->with(['taxDeclaration', 'installments'])
            ->orderByDesc('taxable_year')
            ->get();

        return response()->json($bills);
    }

    /**
     * All issued Statements of Account for the taxpayer.
     */
    public function mySoas(Request $request): JsonResponse
    {
        $taxpayer = $this->resolveTaxpayer($request);
        if (! $taxpayer) {
            return response()->json([]);
        }

        $soas = StatementOfAccount::query()
            ->where(function ($q) use ($taxpayer) {
                $q->where('taxpayer_id', $taxpayer->id)
                    ->orWhereHas('taxDeclaration.assessment.application', fn ($app) => $app->where('taxpayer_id', $taxpayer->id));
            })
            ->with(['items.installment.taxBill', 'taxDeclaration'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($soas);
    }

    /**
     * Payment history and official receipts for the taxpayer.
     */
    public function myPayments(Request $request): JsonResponse
    {
        $taxpayer = $this->resolveTaxpayer($request);
        if (! $taxpayer) {
            return response()->json([]);
        }

        $payments = Payment::query()
            ->where(function ($q) use ($taxpayer) {
                $q->where('taxpayer_id', $taxpayer->id)
                    ->orWhereHas('taxDeclaration.assessment.application', fn ($app) => $app->where('taxpayer_id', $taxpayer->id));
            })
            ->with(['allocations', 'taxDeclaration'])
            ->orderByDesc('payment_date')
            ->get();

        return response()->json($payments);
    }

    /**
     * View single Official Receipt with ownership check.
     */
    public function myReceipt(Request $request, Payment $payment): JsonResponse
    {
        $taxpayer = $this->resolveTaxpayer($request);
        if (! $taxpayer || ($payment->taxpayer_id !== $taxpayer->id && $payment->taxDeclaration?->assessment?->application?->taxpayer_id !== $taxpayer->id)) {
            return response()->json(['message' => 'Unauthorized access to this receipt.'], 403);
        }

        $payment->load([
            'allocations.installment.taxBill',
            'taxDeclaration.assessment.application',
            'statementOfAccount',
            'cashier',
        ]);

        return response()->json($payment);
    }

    /**
     * In-app notifications for the taxpayer.
     */
    public function myNotifications(Request $request): JsonResponse
    {
        $taxpayer = $this->resolveTaxpayer($request);
        if (! $taxpayer) {
            return response()->json([]);
        }

        $notifs = TaxpayerNotification::query()
            ->where('taxpayer_id', $taxpayer->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return response()->json($notifs);
    }

    /**
     * Mark a notification as read.
     */
    public function markNotificationRead(Request $request, TaxpayerNotification $notification): JsonResponse
    {
        $taxpayer = $this->resolveTaxpayer($request);
        if (! $taxpayer || $notification->taxpayer_id !== $taxpayer->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $notification->update(['read_at' => now()]);

        return response()->json($notification);
    }
}
