import { getDb } from "./sqlite";
import { migrate } from "./migrations";

const seedTaxpayers = [
  {
    pin: "001-2024-0267",
    taxpayerName: "Linda Bautista",
    taxpayerEmail: "linda.bautista@email.com",
    propertyAddress: "Lot 15, Barangay San Miguel, Magarao",
    assessedValue: 190000,
    basicRPT: 1900,
    sef: 1900,
  },
  {
    pin: "001-2024-0045",
    taxpayerName: "Juan Dela Cruz",
    taxpayerEmail: "juan.delacruz@email.com",
    propertyAddress: "Lot 5, Block 3, Magarao, Camarines Sur",
    assessedValue: 250000,
    basicRPT: 2500,
    sef: 2500,
  },
  {
    pin: "001-2024-0123",
    taxpayerName: "Maria Santos",
    taxpayerEmail: "maria.santos@email.com",
    propertyAddress: "Lot 12, Barangay San Juan, Magarao",
    assessedValue: 180000,
    basicRPT: 1800,
    sef: 1800,
  },
  {
    pin: "001-2024-0089",
    taxpayerName: "Pedro Reyes",
    taxpayerEmail: "pedro.reyes@email.com",
    propertyAddress: "Block 7, Poblacion, Magarao",
    assessedValue: 320000,
    basicRPT: 3200,
    sef: 3200,
  },
  {
    pin: "001-2024-0234",
    taxpayerName: "Ana Garcia",
    taxpayerEmail: "ana.garcia@email.com",
    propertyAddress: "Lot 23, Barangay Centro, Magarao",
    assessedValue: 320000,
    basicRPT: 3200,
    sef: 3200,
  },
  {
    pin: "001-2024-0156",
    taxpayerName: "Roberto Cruz",
    taxpayerEmail: "roberto.cruz@email.com",
    propertyAddress: "Lot 8, Barangay San Pantaleon, Magarao",
    assessedValue: 210000,
    basicRPT: 2100,
    sef: 2100,
  },
  {
    pin: "001-2024-0312",
    taxpayerName: "Carlos Mendoza",
    taxpayerEmail: "carlos.mendoza@email.com",
    propertyAddress: "Block 2, Barangay Norte, Magarao",
    assessedValue: 185000,
    basicRPT: 1850,
    sef: 1850,
  },
  {
    pin: "001-2024-0102",
    taxpayerName: "Elena Villanueva",
    taxpayerEmail: "elena.villanueva@email.com",
    propertyAddress: "Lot 2, Barangay Magsaysay, Magarao",
    assessedValue: 150000,
    basicRPT: 1500,
    sef: 1500,
  },
  {
    pin: "001-2024-0177",
    taxpayerName: "Miguel Torres",
    taxpayerEmail: "miguel.torres@email.com",
    propertyAddress: "Lot 19, Barangay San Isidro, Magarao",
    assessedValue: 210000,
    basicRPT: 2100,
    sef: 2100,
  },
  {
    pin: "001-2024-0205",
    taxpayerName: "Sofia Reyes",
    taxpayerEmail: "sofia.reyes@email.com",
    propertyAddress: "Block 6, Barangay Salvacion, Magarao",
    assessedValue: 240000,
    basicRPT: 2400,
    sef: 2400,
  },
  // Additional taxpayers (for better demo coverage)
  {
    pin: "001-2024-0301",
    taxpayerName: "Mark Anthony Castillo",
    taxpayerEmail: "mark.castillo@email.com",
    propertyAddress: "Lot 7, Brgy. San Roque, Magarao",
    assessedValue: 205000,
    basicRPT: 2050,
    sef: 2050,
  },
  {
    pin: "001-2024-0302",
    taxpayerName: "Grace Lim",
    taxpayerEmail: "grace.lim@email.com",
    propertyAddress: "Lot 11, Brgy. Cagsaan, Magarao",
    assessedValue: 170000,
    basicRPT: 1700,
    sef: 1700,
  },
  {
    pin: "001-2024-0303",
    taxpayerName: "Josephine Alvarez",
    taxpayerEmail: "josephine.alvarez@email.com",
    propertyAddress: "Block 4, Brgy. Trinidad, Magarao",
    assessedValue: 260000,
    basicRPT: 2600,
    sef: 2600,
  },
  {
    pin: "001-2024-0304",
    taxpayerName: "Edgar Navarro",
    taxpayerEmail: "edgar.navarro@email.com",
    propertyAddress: "Lot 3, Brgy. San Jose, Magarao",
    assessedValue: 140000,
    basicRPT: 1400,
    sef: 1400,
  },
  {
    pin: "001-2024-0305",
    taxpayerName: "Catherine Perez",
    taxpayerEmail: "catherine.perez@email.com",
    propertyAddress: "Lot 9, Brgy. Sta. Cruz, Magarao",
    assessedValue: 225000,
    basicRPT: 2250,
    sef: 2250,
  },
];


export function seedDbIfNeeded() {
  migrate();

  const db = getDb();

  const existing = db.prepare("SELECT COUNT(*) as c FROM taxpayers").get() as { c: number };
  if (existing.c > 0) return;

  const now = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO taxpayers (pin, taxpayerName, taxpayerEmail, propertyAddress, assessedValue, basicRPT, sef, createdAt)
    VALUES (@pin, @taxpayerName, @taxpayerEmail, @propertyAddress, @assessedValue, @basicRPT, @sef, @createdAt)
  `);

  const tx = db.transaction(() => {
    // 1) Seed taxpayers
    for (const t of seedTaxpayers) {
      insert.run({ ...t, createdAt: now });
    }

    // 2) Seed one initial SOA per taxpayer so Revenue Clerk/Cashier flows have data.
    //    Linda Bautista (PIN 001-2024-0267) starts as Partial.
    const soaInsert = db.prepare(`
      INSERT INTO soas (
        id, pin, taxpayer, taxpayerEmail, propertyAddress,
        assessedValue, basicRPT, sef,
        penalties, penaltyReason,
        discount, amountDueOriginal, balanceDue, amountPaidTotal,
        fiscalYear, status,
        generatedBy, generatedDate,
        approvalRequestId,
        sentToTaxpayer, sentDate
      ) VALUES (
        @id, @pin, @taxpayer, @taxpayerEmail, @propertyAddress,
        @assessedValue, @basicRPT, @sef,
        @penalties, @penaltyReason,
        @discount, @amountDueOriginal, @balanceDue, @amountPaidTotal,
        @fiscalYear, @status,
        @generatedBy, @generatedDate,
        @approvalRequestId,
        @sentToTaxpayer, @sentDate
      )
    `);

    const fiscalYear = "2026";
    const generatedBy = "Ana Lopez (Revenue Clerk)";
    const generatedDate = now;
    const sentToTaxpayer = 1;
    const sentDate = now;

    // Seed a simple initial approval request for one taxpayer with penalties,
    // so that "Treasurer approval" has something to display.
    // This avoids the demo scenario where Clerk shows Pending but Treasurer has no requests.
    // (Treasurer UI loads from approval_requests table.)
    const initialApprovalId = "REQ-2026-0001";

    db.prepare(`
      INSERT INTO approval_requests (
        id, pin, taxpayer, requestType,
        currentAmount, proposedAmount,
        reason, requestedBy, requestDate,
        status, treasurerNotes,
        reviewDate, finalizedAmount
      ) VALUES (
        @id, @pin, @taxpayer, @requestType,
        @currentAmount, @proposedAmount,
        @reason, @requestedBy, @requestDate,
        @status, @treasurerNotes,
        @reviewDate, @finalizedAmount
      )
    `).run({
      id: initialApprovalId,
      pin: "001-2024-0045",
      taxpayer: "Juan Dela Cruz",
      requestType: "Penalty Waiver",
      currentAmount: Math.round(((seedTaxpayers.find(t => t.pin === "001-2024-0045")?.basicRPT ?? 0) + (seedTaxpayers.find(t => t.pin === "001-2024-0045")?.sef ?? 0)) * 1.03),
      proposedAmount: Math.round(((seedTaxpayers.find(t => t.pin === "001-2024-0045")?.basicRPT ?? 0) + (seedTaxpayers.find(t => t.pin === "001-2024-0045")?.sef ?? 0)) * 1.01),
      reason: "Initial demo approval request (pre-seeded)",
      requestedBy: generatedBy,
      requestDate: now,
      status: "Pending",
      treasurerNotes: null,
      reviewDate: null,
      finalizedAmount: null,
    });


    for (const t of seedTaxpayers) {
      const penalties = t.pin === "001-2024-0267" ? 0 : Math.round((t.basicRPT + t.sef) * 0.03); // small penalties for some taxpayers
      const penaltyReason = penalties > 0 ? "Initial seeded delinquency/penalties" : "";
      const amountDueOriginal = t.basicRPT + t.sef + penalties;

      // Linda starts Partial (has something already paid)
      const status = t.pin === "001-2024-0267" ? "Partial" : "Unpaid";
      const amountPaidTotal = status === "Partial" ? Math.round(amountDueOriginal * 0.55) : 0;
      const balanceDue = Math.max(0, amountDueOriginal - amountPaidTotal);

      const id = `SOA-2026-${String(db.prepare("SELECT COUNT(*) as c FROM soas").get() as any).padStart(4, "0")}`;

      soaInsert.run({
        id,
        pin: t.pin,
        taxpayer: t.taxpayerName,
        taxpayerEmail: t.taxpayerEmail,
        propertyAddress: t.propertyAddress,
        assessedValue: t.assessedValue,
        basicRPT: t.basicRPT,
        sef: t.sef,
        penalties,
        penaltyReason,
        discount: 0,
        amountDueOriginal,
        balanceDue,
        amountPaidTotal,
        fiscalYear,
        status,
        generatedBy,
        generatedDate,
        approvalRequestId: null,
        sentToTaxpayer,
        sentDate,
      });
    }
  });

  tx();
}


