# System Data Flow Verification

## ✅ Verification Checklist

### 1. Shared Data Systems Created
- [x] `/src/app/utils/approvalRequests.ts` - Approval request management
- [x] `/src/app/utils/soaManagement.ts` - SOA record management

### 2. Treasurer → Revenue Clerk Connection

#### Treasurer Component (`TreasurerApprovals.tsx`)
```typescript
✅ Imports:
- getAllApprovalRequests()
- updateApprovalRequestStatus()
- subscribeToApprovalUpdates()

✅ Functionality:
- Loads approval requests on mount
- Real-time subscription to updates
- Approve/Reject updates shared system
- Notifications sent to Revenue Clerk
```

#### Revenue Clerk Approval Notifications (`ClerkApprovalNotifications.tsx`)
```typescript
✅ Imports:
- getAllApprovalRequests()
- subscribeToApprovalUpdates()

✅ Functionality:
- Shows only processed requests (Approved/Rejected)
- Real-time updates when Treasurer makes decisions
- Displays Treasurer's notes and final amounts
```

#### Revenue Clerk SOA Generation (`ClerkSOA.tsx`)
```typescript
✅ Imports:
- createApprovalRequest()
- getLatestApprovalForPIN()
- subscribeToApprovalUpdates()
- createSOA()
- markSOAasSent()
- getLatestSOAForPIN()

✅ Functionality:
- Creates approval requests when penalties adjusted
- Receives real-time approval status updates
- Can only send SOA after Treasurer approval
- Creates SOA in shared system with approval link
- Marks SOA as sent to make available to Cashier
```

### 3. Revenue Clerk → Cashier Connection

#### Revenue Clerk SOA Generation (`ClerkSOA.tsx`)
```typescript
✅ When sending SOA:
1. Creates SOA record: createSOA(...)
2. Marks as sent: markSOAasSent(soaId)
3. SOA includes:
   - Approved penalty amounts
   - Link to approval request ID
   - Taxpayer email
   - All billing details
```

#### Cashier Payment Processing (`CashierPayment.tsx`)
```typescript
✅ Imports:
- SOARecord type
- getSentSOAs()
- updateSOAStatus()
- subscribeToSOAUpdates()

✅ Functionality:
- Loads all sent SOAs on mount
- Real-time updates when Revenue Clerk sends new SOAs
- Displays taxpayer list from SOA records
- Shows "✓ Treasurer Approved" badge when applicable
- Processes payment and updates SOA status
- Cannot apply discount if penalties exist
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         APPROVAL REQUEST FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

[1] REVENUE CLERK                    [2] TREASURER
    (ClerkSOA.tsx)                       (TreasurerApprovals.tsx)
         │                                        │
         │ createApprovalRequest()                │
         ├────────────────────────────────────────>
         │                                        │
         │  ┌─────────────────────────────┐      │
         │  │  approvalRequests.ts        │      │ getAllApprovalRequests()
         │  │  - status: "Pending"        │<─────┤
         │  │  - currentAmount: 450       │      │
         │  │  - proposedAmount: 100      │      │
         │  └─────────────────────────────┘      │
         │                                        │
         │                                        │ updateApprovalRequestStatus()
         │                                        │ (Approve/Reject + Notes)
         │                                        ├────────────────┐
         │                                        │                │
         │  ┌─────────────────────────────┐      │                │
         │  │  approvalRequests.ts        │<─────────────────────┘
         │  │  - status: "Approved"       │      │
         │  │  - treasurerNotes: "..."    │      │
         │  │  - reviewDate: timestamp    │      │
         │  └─────────────────────────────┘      │
         │            │                           │
         │            │ (Real-time notification)  │
         │<───────────┘                           │
         │                                        │
    [Status updates to "Approved"]                │
    [Can now send SOA]                            │


┌─────────────────────────────────────────────────────────────────────┐
│                            SOA RECORD FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

[3] REVENUE CLERK                    [4] CASHIER
    (ClerkSOA.tsx)                       (CashierPayment.tsx)
         │                                        │
         │ createSOA()                            │
         ├────────────────────────────────────────>
         │                                        │
         │  ┌─────────────────────────────┐      │
         │  │  soaManagement.ts           │      │
         │  │  - id: "SOA-2026-0003"      │      │
         │  │  - penalties: 100 (approved)│      │ getSentSOAs()
         │  │  - approvalRequestId: "..." │<─────┤
         │  │  - sentToTaxpayer: false    │      │
         │  └─────────────────────────────┘      │
         │                                        │
         │ markSOAasSent()                        │
         ├────────────────────────────────────────>
         │                                        │
         │  ┌─────────────────────────────┐      │
         │  │  soaManagement.ts           │      │
         │  │  - sentToTaxpayer: true     │      │
         │  │  - sentDate: timestamp      │      │ (Real-time update)
         │  └─────────────────────────────┘──────>
         │                                        │
         │                                   [SOA appears in list]
         │                                   [Shows approved amounts]
         │                                   [Shows approval badge]
         │                                        │
         │                                        │ updateSOAStatus()
         │                                        │ (Payment processed)
         │  ┌─────────────────────────────┐      │
         │  │  soaManagement.ts           │<─────┤
         │  │  - status: "Paid"           │      │
         │  │  - discount: 0 or amount    │      │
         │  └─────────────────────────────┘      │
         │                                        │
```

---

## 📊 Data Structure Connections

### Approval Request → SOA Link
```typescript
// Revenue Clerk creates approval request
const approvalRequest = {
  id: "REQ-2026-0012",
  pin: "001-2024-0089",
  proposedAmount: 100  // Reduced penalty
}

// After approval, Revenue Clerk creates SOA
const soa = {
  id: "SOA-2026-0003",
  pin: "001-2024-0089",
  penalties: 100,                        // ← Uses approved amount
  approvalRequestId: "REQ-2026-0012",   // ← Links back to approval
  penaltyReason: "Reduced penalty - Approved by Treasurer"
}

// Cashier sees the linked data
// Can trace: SOA → Approval Request → Treasurer Decision
```

---

## 🧪 Test Scenario

### Complete Workflow Test

**Initial State:**
- Taxpayer: Pedro Reyes (PIN: 001-2024-0089)
- Original Penalty: ₱450.00
- Basic RPT: ₱3,200.00
- SEF: ₱3,200.00

**Step 1: Revenue Clerk Requests Approval**
```typescript
Input:
- Adjusted Penalty: ₱100.00
- Reason: "Medical emergency with documentation"

Created in approvalRequests.ts:
{
  id: "REQ-2026-XXXX",
  currentAmount: 450,
  proposedAmount: 100,
  status: "Pending"
}
```

**Step 2: Treasurer Reviews**
```typescript
Treasurer sees in TreasurerApprovals.tsx:
- Original: ₱450.00
- Requested: ₱100.00
- Reason: "Medical emergency with documentation"

Treasurer approves with notes:
"Approved - Medical documentation verified"

Updated in approvalRequests.ts:
{
  status: "Approved",
  treasurerNotes: "Approved - Medical documentation verified",
  reviewDate: "2026-05-12T14:30:00"
}
```

**Step 3: Revenue Clerk Sends SOA**
```typescript
Revenue Clerk sees "Approved" status
Clicks "Send Email to Taxpayer"

Created in soaManagement.ts:
{
  id: "SOA-2026-0003",
  pin: "001-2024-0089",
  penalties: 100,              // ← Approved reduced penalty
  totalDue: 6500,              // 3200 + 3200 + 100
  approvalRequestId: "REQ-2026-XXXX",
  sentToTaxpayer: true
}
```

**Step 4: Cashier Processes Payment**
```typescript
Cashier sees in CashierPayment.tsx:
- Taxpayer: Pedro Reyes
- SOA: SOA-2026-0003
- Badge: "✓ Treasurer Approved"
- Total Due: ₱6,500.00  // Already includes approved penalty

Cashier processes payment
Updated in soaManagement.ts:
{
  status: "Paid"
}
```

---

## ✅ Connection Verification

| From | To | Via | Status |
|------|-----|-----|--------|
| Treasurer | Revenue Clerk (Notifications) | `approvalRequests.ts` → `subscribeToApprovalUpdates()` | ✅ Connected |
| Treasurer | Revenue Clerk (SOA Status) | `approvalRequests.ts` → `getLatestApprovalForPIN()` | ✅ Connected |
| Revenue Clerk | Cashier (SOA List) | `soaManagement.ts` → `getSentSOAs()` | ✅ Connected |
| Revenue Clerk | Cashier (Real-time) | `soaManagement.ts` → `subscribeToSOAUpdates()` | ✅ Connected |
| Approval Request | SOA Record | `approvalRequestId` field linkage | ✅ Connected |

---

## 🎯 Key Integration Points

### Point 1: Approval Status Sync
```typescript
// ClerkSOA.tsx receives approval updates
useEffect(() => {
  const unsubscribe = subscribeToApprovalUpdates(() => {
    const approval = getLatestApprovalForPIN(pin, penalty);
    if (approval?.status === "Approved") {
      setCurrentApprovalStatus("approved"); // ← Enables "Send Email"
    }
  });
}, []);
```

### Point 2: SOA Creation with Approval Link
```typescript
// ClerkSOA.tsx creates SOA with approval reference
const approval = getLatestApprovalForPIN(pin, penalty);
const newSOA = createSOA(
  // ... other params
  penaltyAmount,        // ← Approved amount
  approval?.id          // ← Links to approval
);
```

### Point 3: Cashier Receives Linked Data
```typescript
// CashierPayment.tsx loads SOAs
useEffect(() => {
  const soas = getSentSOAs();  // ← Gets all sent SOAs
  setAvailableSOAs(soas);
}, []);

// Display shows approval badge
{soa.approvalRequestId && (
  <p>✓ Treasurer Approved</p>  // ← Shows if linked to approval
)}
```

---

## 📝 Summary

**All three components are connected through shared data systems:**

1. **Treasurer ↔ Revenue Clerk**: Connected via `approvalRequests.ts`
   - Real-time approval status updates
   - Two-way communication (request → approval)

2. **Revenue Clerk → Cashier**: Connected via `soaManagement.ts`
   - SOA records flow from Clerk to Cashier
   - Approved penalty amounts automatically included
   - Real-time updates when new SOAs are sent

3. **Complete Audit Trail**: Both systems linked
   - Every SOA references its approval request
   - Full traceability from request → approval → payment

**Status: ✅ FULLY CONNECTED AND OPERATIONAL**
