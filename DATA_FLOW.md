# Tax Collection System - Data Flow Documentation

This document explains how data flows between the Municipal Treasurer, Revenue Clerk, and Cashier roles in the Real Property Tax Management System (RPTMS).

## System Architecture

The system uses two shared data management modules:
1. **Approval Requests** (`/src/app/utils/approvalRequests.ts`) - Manages penalty waiver/adjustment approvals
2. **SOA Management** (`/src/app/utils/soaManagement.ts`) - Manages Statement of Account records

## Complete Workflow

### Step 1: Revenue Clerk Generates SOA with Penalty Adjustment

**Component:** `ClerkSOA.tsx`

1. Revenue Clerk searches for a taxpayer by PIN
2. System displays property details with calculated penalties
3. Clerk adjusts penalties if needed (e.g., reducing penalties due to valid reasons)
4. Clerk provides a reason for the penalty adjustment
5. Clerk clicks "Request Treasurer Approval"
6. System creates an approval request using `createApprovalRequest()`:
   ```typescript
   {
     id: "REQ-2026-XXXX",
     pin: "001-2024-0089",
     taxpayer: "Pedro Reyes",
     requestType: "Penalty Waiver",
     currentAmount: 450,      // Original penalty
     proposedAmount: 100,     // Requested reduced penalty
     reason: "Medical emergency...",
     status: "Pending"
   }
   ```
7. Clerk sees "Pending Approval" status badge
8. Clerk CANNOT send the SOA to the taxpayer yet

---

### Step 2: Municipal Treasurer Reviews and Approves/Rejects

**Component:** `TreasurerApprovals.tsx`

1. Treasurer sees all pending approval requests from Revenue Clerks
2. For each request, Treasurer reviews:
   - Taxpayer information
   - Original vs. proposed penalty amounts
   - Reason provided by Revenue Clerk
3. Treasurer decides to approve or reject
4. Treasurer adds decision notes
5. System updates the approval request using `updateApprovalRequestStatus()`:
   ```typescript
   {
     status: "Approved",
     treasurerNotes: "Approved - Medical documentation verified",
     reviewDate: "2026-05-12T14:30:00"
   }
   ```
6. **Real-time Update:** Revenue Clerk's screen automatically updates via subscription

---

### Step 3: Revenue Clerk Receives Approval Notification

**Components:** `ClerkSOA.tsx` + `ClerkApprovalNotifications.tsx`

1. In `ClerkSOA.tsx`:
   - Status badge changes from "Pending" to "Approved"
   - "Send Email to Taxpayer" button becomes enabled
   - Clerk can now send the SOA

2. In `ClerkApprovalNotifications.tsx`:
   - Clerk sees detailed approval notification
   - Shows Treasurer's notes
   - Shows approved vs. rejected amounts

---

### Step 4: Revenue Clerk Sends SOA to Taxpayer

**Component:** `ClerkSOA.tsx`

1. Clerk clicks "Send Email to Taxpayer"
2. System creates SOA record using `createSOA()`:
   ```typescript
   {
     id: "SOA-2026-0003",
     pin: "001-2024-0089",
     taxpayer: "Pedro Reyes",
     basicRPT: 3200,
     sef: 3200,
     penalties: 100,          // APPROVED reduced penalty (was 450)
     penaltyReason: "Reduced penalty - Approved by Treasurer",
     totalDue: 6500,          // Calculated with approved penalty
     approvalRequestId: "REQ-2026-0012",  // Links to approval
     sentToTaxpayer: true,
     sentDate: "2026-05-12T16:25:00"
   }
   ```
3. SOA is marked as "sent" using `markSOAasSent()`
4. **SOA is now available to the Cashier**
5. Email notification sent to taxpayer (simulated in console)

---

### Step 5: Cashier Processes Payment

**Component:** `CashierPayment.tsx`

1. Cashier's screen loads all sent SOAs using `getSentSOAs()`
2. Cashier sees taxpayer list with:
   - Taxpayer name and PIN
   - SOA ID (e.g., "SOA-2026-0003")
   - Total due with **approved penalties already applied**
   - Badge showing "✓ Treasurer Approved" if penalties were adjusted

3. Cashier selects a taxpayer
4. System displays SOA with:
   - All amounts already reflecting Treasurer-approved adjustments
   - Note: "Treasurer Approved: This SOA contains penalty adjustments approved by the Municipal Treasurer (REQ-2026-0012)"

5. Cashier applies early payment discount (if eligible):
   - 10% discount if no penalties
   - 20% discount if no penalties
   - **Cannot apply discount if penalties exist**

6. Cashier processes payment
7. System updates SOA status using `updateSOAStatus()`:
   ```typescript
   {
     status: "Paid",
     discount: 640,  // If discount was applied
     totalDue: 5860  // Updated with discount
   }
   ```
8. Official Receipt generated and printed

---

## Data Synchronization

All components subscribe to real-time updates:

```typescript
// Revenue Clerk sees approval updates immediately
useEffect(() => {
  const unsubscribe = subscribeToApprovalUpdates(() => {
    // Refresh approval status
  });
  return unsubscribe;
}, []);

// Cashier sees new SOAs immediately when Revenue Clerk sends them
useEffect(() => {
  const unsubscribe = subscribeToSOAUpdates(() => {
    // Refresh SOA list
  });
  return unsubscribe;
}, []);
```

---

## Key Design Principles

1. **Single Source of Truth**: All data stored in shared management modules
2. **Real-time Updates**: Components subscribe to changes and update automatically
3. **Audit Trail**: Every SOA includes:
   - Who generated it
   - When it was generated
   - Approval request ID (if applicable)
   - Treasurer's notes (via approval link)
4. **Data Integrity**: 
   - Cashier always sees Treasurer-approved amounts
   - No manual data entry needed - amounts flow automatically
   - Cannot bypass approval workflow
5. **Traceability**: Every penalty adjustment is linked to:
   - Original approval request
   - Treasurer's decision
   - Revenue Clerk who requested it

---

## Example Flow with Approved Penalty

| Step | Actor | Action | Data Created/Updated |
|------|-------|--------|---------------------|
| 1 | Revenue Clerk | Requests penalty waiver (450 → 100) | `ApprovalRequest` created with status "Pending" |
| 2 | Treasurer | Reviews and approves | `ApprovalRequest` updated to "Approved" + notes |
| 3 | Revenue Clerk | Sends SOA to taxpayer | `SOARecord` created with penalties=100, linked to approval |
| 4 | Cashier | Processes payment | `SOARecord` updated to status="Paid" |

---

## Database Simulation

In a production system, these would be database tables:
- `approval_requests` table (currently in memory via `approvalRequests.ts`)
- `soa_records` table (currently in memory via `soaManagement.ts`)
- `payment_transactions` table (to be implemented)

The current implementation uses in-memory arrays with subscription-based updates to simulate real-time database synchronization.
