// Shared SOA (Statement of Account) management system
// Connects Treasurer approvals → Revenue Clerk SOA generation → Cashier payment processing

export interface SOARecord {
  id: string;
  pin: string;
  taxpayer: string;
  taxpayerEmail: string;
  propertyAddress: string;
  assessedValue: number;
  basicRPT: number;
  sef: number;
  penalties: number;
  penaltyReason: string;
  discount: number;
  totalDue: number;
  fiscalYear: string;
  status: "Unpaid" | "Paid" | "Partial" | "Delinquent";
  generatedBy: string;
  generatedDate: string;
  approvalRequestId?: string; // Links to approval request if penalties were adjusted
  sentToTaxpayer: boolean;
  sentDate?: string;
}

// In-memory storage for SOA records (simulates a database)
let soaRecords: SOARecord[] = [
  {
    id: "SOA-2026-0001",
    pin: "001-2024-0045",
    taxpayer: "Juan Dela Cruz",
    taxpayerEmail: "juan.delacruz@email.com",
    propertyAddress: "Lot 5, Block 3, Magarao, Camarines Sur",
    assessedValue: 250000,
    basicRPT: 2500,
    sef: 2500,
    penalties: 250,
    penaltyReason: "Late payment - 2 months overdue (2% interest per month)",
    discount: 0,
    totalDue: 5250,
    fiscalYear: "2026",
    status: "Unpaid",
    generatedBy: "Ana Lopez (Revenue Clerk)",
    generatedDate: "2026-05-10T10:00:00",
    sentToTaxpayer: true,
    sentDate: "2026-05-10T10:05:00",
  },
  {
    id: "SOA-2026-0002",
    pin: "001-2024-0123",
    taxpayer: "Maria Santos",
    taxpayerEmail: "maria.santos@email.com",
    propertyAddress: "Lot 12, Barangay San Juan, Magarao",
    assessedValue: 180000,
    basicRPT: 1800,
    sef: 1800,
    penalties: 0,
    penaltyReason: "",
    discount: 0,
    totalDue: 3600,
    fiscalYear: "2026",
    status: "Unpaid",
    generatedBy: "Ana Lopez (Revenue Clerk)",
    generatedDate: "2026-05-09T14:30:00",
    sentToTaxpayer: true,
    sentDate: "2026-05-09T14:35:00",
  },
  {
    id: "SOA-2026-0003",
    pin: "001-2024-0089",
    taxpayer: "Pedro Reyes",
    taxpayerEmail: "pedro.reyes@email.com",
    propertyAddress: "Block 7, Poblacion, Magarao",
    assessedValue: 320000,
    basicRPT: 3200,
    sef: 3200,
    penalties: 100, // Approved reduced penalty (was 450)
    penaltyReason: "Reduced penalty - Approved by Treasurer (Medical documentation provided)",
    discount: 0,
    totalDue: 6500,
    fiscalYear: "2026",
    status: "Delinquent",
    generatedBy: "Ana Lopez (Revenue Clerk)",
    generatedDate: "2026-05-12T16:20:00",
    approvalRequestId: "REQ-2026-0012",
    sentToTaxpayer: true,
    sentDate: "2026-05-12T16:25:00",
  },
  {
    id: "SOA-2026-0004",
    pin: "001-2024-0234",
    taxpayer: "Ana Garcia",
    taxpayerEmail: "ana.garcia@email.com",
    propertyAddress: "Lot 23, Barangay Centro, Magarao",
    assessedValue: 320000,
    basicRPT: 3200,
    sef: 3200,
    penalties: 350,
    penaltyReason: "Late payment - 3 months overdue (2% interest per month)",
    discount: 0,
    totalDue: 6750,
    fiscalYear: "2026",
    status: "Unpaid",
    generatedBy: "Ana Lopez (Revenue Clerk)",
    generatedDate: "2026-05-11T09:00:00",
    sentToTaxpayer: true,
    sentDate: "2026-05-11T09:10:00",
  },
  {
    id: "SOA-2026-0005",
    pin: "001-2024-0156",
    taxpayer: "Roberto Cruz",
    taxpayerEmail: "roberto.cruz@email.com",
    propertyAddress: "Lot 8, Barangay San Pantaleon, Magarao",
    assessedValue: 210000,
    basicRPT: 2100,
    sef: 2100,
    penalties: 0,
    penaltyReason: "",
    discount: 0,
    totalDue: 4200,
    fiscalYear: "2026",
    status: "Unpaid",
    generatedBy: "Ana Lopez (Revenue Clerk)",
    generatedDate: "2026-05-08T11:00:00",
    sentToTaxpayer: true,
    sentDate: "2026-05-08T11:05:00",
  },
  {
    id: "SOA-2026-0006",
    pin: "001-2024-0312",
    taxpayer: "Carlos Mendoza",
    taxpayerEmail: "carlos.mendoza@email.com",
    propertyAddress: "Block 2, Barangay Norte, Magarao",
    assessedValue: 185000,
    basicRPT: 1850,
    sef: 1850,
    penalties: 50, // Approved reduced penalty (was 200)
    penaltyReason: "Reduced penalty - Calamity zone discount per Ordinance 2026-08",
    discount: 0,
    totalDue: 3750,
    fiscalYear: "2026",
    status: "Unpaid",
    generatedBy: "Ana Lopez (Revenue Clerk)",
    generatedDate: "2026-05-12T17:00:00",
    approvalRequestId: "REQ-2026-0018",
    sentToTaxpayer: true,
    sentDate: "2026-05-12T17:05:00",
  },
];

// Event listeners for real-time updates
type SOAUpdateListener = () => void;
const listeners: SOAUpdateListener[] = [];

export function subscribeToSOAUpdates(listener: SOAUpdateListener) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

function notifyListeners() {
  listeners.forEach(listener => listener());
}

// Get all SOA records
export function getAllSOAs(): SOARecord[] {
  return [...soaRecords];
}

// Get SOA by ID
export function getSOAById(id: string): SOARecord | undefined {
  return soaRecords.find(soa => soa.id === id);
}

// Get SOAs by PIN
export function getSOAsByPIN(pin: string): SOARecord[] {
  return soaRecords.filter(soa => soa.pin === pin);
}

// Get latest SOA for a PIN
export function getLatestSOAForPIN(pin: string): SOARecord | null {
  const soas = soaRecords
    .filter(soa => soa.pin === pin)
    .sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime());

  return soas.length > 0 ? soas[0] : null;
}

// Get SOAs by status
export function getSOAsByStatus(status: "Unpaid" | "Paid" | "Partial" | "Delinquent"): SOARecord[] {
  return soaRecords.filter(soa => soa.status === status);
}

// Get SOAs that have been sent to taxpayers (for Cashier to process)
export function getSentSOAs(): SOARecord[] {
  return soaRecords.filter(soa => soa.sentToTaxpayer);
}

// Create a new SOA (used by Revenue Clerk)
export function createSOA(
  pin: string,
  taxpayer: string,
  taxpayerEmail: string,
  propertyAddress: string,
  assessedValue: number,
  basicRPT: number,
  sef: number,
  penalties: number,
  penaltyReason: string,
  fiscalYear: string,
  status: "Unpaid" | "Paid" | "Partial" | "Delinquent",
  generatedBy: string,
  approvalRequestId?: string
): SOARecord {
  const newSOA: SOARecord = {
    id: `SOA-2026-${String(soaRecords.length + 1).padStart(4, '0')}`,
    pin,
    taxpayer,
    taxpayerEmail,
    propertyAddress,
    assessedValue,
    basicRPT,
    sef,
    penalties,
    penaltyReason,
    discount: 0,
    totalDue: basicRPT + sef + penalties,
    fiscalYear,
    status,
    generatedBy,
    generatedDate: new Date().toISOString(),
    approvalRequestId,
    sentToTaxpayer: false,
  };

  soaRecords.push(newSOA);
  notifyListeners();
  return newSOA;
}

// Mark SOA as sent to taxpayer (used by Revenue Clerk)
export function markSOAasSent(soaId: string): SOARecord | null {
  const soa = soaRecords.find(s => s.id === soaId);
  if (!soa) {
    return null;
  }

  soa.sentToTaxpayer = true;
  soa.sentDate = new Date().toISOString();

  notifyListeners();
  return soa;
}

// Update SOA status after payment (used by Cashier)
export function updateSOAStatus(
  soaId: string,
  status: "Paid" | "Partial",
  discount?: number
): SOARecord | null {
  const soa = soaRecords.find(s => s.id === soaId);
  if (!soa) {
    return null;
  }

  soa.status = status;
  if (discount !== undefined) {
    soa.discount = discount;
    soa.totalDue = soa.basicRPT + soa.sef + soa.penalties - discount;
  }

  notifyListeners();
  return soa;
}

// Find SOA for payment processing (used by Cashier)
// This retrieves the most recent sent SOA for a taxpayer
export function getSOAForPayment(pin: string): SOARecord | null {
  const soas = soaRecords
    .filter(soa => soa.pin === pin && soa.sentToTaxpayer && soa.status !== "Paid")
    .sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime());

  return soas.length > 0 ? soas[0] : null;
}
