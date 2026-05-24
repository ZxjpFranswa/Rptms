import { useState, useEffect } from "react";
import { Search, Edit2, Save, Mail, CheckCircle, AlertTriangle, Info, Clock, XCircle, X } from "lucide-react";
import {
  type ApprovalRequest,
  createApprovalRequest,
  getApprovalRequestById,
  getLatestApprovalForPIN,
  getLatestApprovedApprovalForPIN,
  getEffectivePenaltyAmount,
  penaltyPercentageFromAmount,
  subscribeToApprovalUpdates,
} from "../utils/approvalRequests";
import {
  createSOA,
  markSOAasSent,
} from "../utils/soaManagement";
import { getAllTaxpayers, type Taxpayer, taxpayerTotalDue } from "../utils/taxpayers";

interface TaxBilling {
  pin: string;
  taxpayer: string;
  taxpayerEmail: string;
  propertyAddress: string;
  assessedValue: number;
  basicRPT: number;
  sef: number;
  penaltyPercentage: number; // Penalty as percentage (e.g., 4 for 4%)
  penaltyReason: string;
  totalDue: number;
  fiscalYear: string;
  status: "Unpaid" | "Paid" | "Partial" | "Delinquent";
  approvalStatus?: "none" | "pending" | "approved" | "rejected";
}

interface TaxpayerListItem {
  pin: string;
  taxpayer: string;
  propertyAddress: string;
  status: "Unpaid" | "Paid" | "Partial" | "Delinquent";
  totalDue: number;
}

interface ClerkSOAProps {
  prefillApprovalId?: string | null;
  onPrefillConsumed?: () => void;
}

export default function ClerkSOA({ prefillApprovalId, onPrefillConsumed }: ClerkSOAProps) {
  const [searchPIN, setSearchPIN] = useState("");
  const [selectedBilling, setSelectedBilling] = useState<TaxBilling | null>(null);
  const [penaltyPercentage, setPenaltyPercentage] = useState(""); // Penalty as percentage
  const [penaltyReason, setPenaltyReason] = useState("");
  const [totalDue, setTotalDue] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRequestApproval, setShowRequestApproval] = useState(false);
  const [earlyPaymentNote, setEarlyPaymentNote] = useState("");

  const [currentApprovalStatus, setCurrentApprovalStatus] = useState<"none" | "pending" | "approved" | "rejected">("none");
  const [linkedApprovalId, setLinkedApprovalId] = useState<string | null>(null);
  const [taxpayers, setTaxpayers] = useState<Taxpayer[]>([]);

  useEffect(() => {
    getAllTaxpayers().then(setTaxpayers).catch(console.error);
  }, []);

  const toTaxBilling = (t: Taxpayer): TaxBilling => ({
    pin: t.pin,
    taxpayer: t.taxpayerName,
    taxpayerEmail: t.taxpayerEmail ?? "",
    propertyAddress: t.propertyAddress ?? "",
    assessedValue: t.assessedValue,
    basicRPT: t.basicRPT,
    sef: t.sef,
    penaltyPercentage: t.penaltyPercentage,
    penaltyReason: t.penaltyReason,
    totalDue: taxpayerTotalDue(t),
    fiscalYear: t.fiscalYear,
    status: t.status,
    approvalStatus: "none",
  });

  const syncPenaltyFromApproval = (billing: TaxBilling, approval: ApprovalRequest) => {
    const penaltyAmount = getEffectivePenaltyAmount(approval);
    const percentage = penaltyPercentageFromAmount(
      billing.basicRPT,
      billing.sef,
      penaltyAmount
    );
    const percentStr = percentage > 0 ? percentage.toString() : "0";
    setPenaltyPercentage(percentStr);
    setPenaltyReason(approval.reason);
    calculateTotal(billing, percentStr);
    setEarlyPaymentNote(percentage > 0 ? "" : "Eligible for early payment discount at cashier");
  };

  const applyApprovalToForm = async (approval: ApprovalRequest) => {
    const found = taxpayers.find(t => t.pin === approval.pin);
    if (!found) {
      alert(`Taxpayer with PIN ${approval.pin} was not found.`);
      return;
    }

    const billing = toTaxBilling(found);
    setSearchPIN(approval.pin);
    setSelectedBilling(billing);
    syncPenaltyFromApproval(billing, approval);

    if (approval.status === "Approved") {
      setCurrentApprovalStatus("approved");
      setLinkedApprovalId(approval.id);
    } else if (approval.status === "Rejected") {
      setCurrentApprovalStatus("rejected");
      setLinkedApprovalId(null);
    } else {
      setCurrentApprovalStatus("pending");
      setLinkedApprovalId(null);
    }
  };

  const checkApprovalStatus = async (billing: TaxBilling, percentage: number, approvalId?: string) => {
    const penaltyAmount = calculatePenaltyAmount(billing, percentage);
    let existingApproval = await getLatestApprovalForPIN(billing.pin, penaltyAmount, approvalId);

    // Form may still show the taxpayer's default % while a different approved amount exists.
    if (!existingApproval) {
      const latestApproved = await getLatestApprovedApprovalForPIN(billing.pin);
      if (latestApproved) {
        existingApproval = latestApproved;
        syncPenaltyFromApproval(billing, latestApproved);
      }
    }

    if (existingApproval) {
      if (existingApproval.status === "Approved") {
        setCurrentApprovalStatus("approved");
        setLinkedApprovalId(existingApproval.id);
      } else if (existingApproval.status === "Rejected") {
        setCurrentApprovalStatus("rejected");
        setLinkedApprovalId(null);
      } else {
        setCurrentApprovalStatus("pending");
        setLinkedApprovalId(null);
      }
    } else {
      setCurrentApprovalStatus("none");
      setLinkedApprovalId(null);
    }
  };

  useEffect(() => {
    if (!prefillApprovalId || taxpayers.length === 0) return;

    let cancelled = false;

    const loadFromApproval = async () => {
      const approval = await getApprovalRequestById(prefillApprovalId);
      if (cancelled) return;

      if (!approval) {
        alert("Approval request not found.");
        onPrefillConsumed?.();
        return;
      }

      if (approval.status !== "Approved") {
        alert("Only approved requests can be opened in Generate SOA.");
        onPrefillConsumed?.();
        return;
      }

      await applyApprovalToForm(approval);
      onPrefillConsumed?.();
    };

    void loadFromApproval();

    return () => {
      cancelled = true;
    };
  }, [prefillApprovalId, taxpayers]);

  const refreshApprovalFromServer = async (billing: TaxBilling, approvalId?: string | null) => {
    if (approvalId) {
      const byId = await getApprovalRequestById(approvalId);
      if (byId?.status === "Approved") {
        syncPenaltyFromApproval(billing, byId);
        setCurrentApprovalStatus("approved");
        setLinkedApprovalId(byId.id);
        return;
      }
      if (byId?.status === "Rejected") {
        setCurrentApprovalStatus("rejected");
        setLinkedApprovalId(null);
        return;
      }
    }

    const approved = await getLatestApprovedApprovalForPIN(billing.pin);
    if (approved) {
      syncPenaltyFromApproval(billing, approved);
      setCurrentApprovalStatus("approved");
      setLinkedApprovalId(approved.id);
      return;
    }

    const percentage = parseFloat(penaltyPercentage) || 0;
    if (percentage > 0) {
      await checkApprovalStatus(billing, percentage, approvalId ?? undefined);
    }
  };

  useEffect(() => {
    if (!selectedBilling) return;
    const unsubscribe = subscribeToApprovalUpdates(() => {
      void refreshApprovalFromServer(selectedBilling, linkedApprovalId);
    });
    return unsubscribe;
  }, [selectedBilling, penaltyPercentage, linkedApprovalId]);

  useEffect(() => {
    if (currentApprovalStatus !== "pending" || !linkedApprovalId || !selectedBilling) return;

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      await refreshApprovalFromServer(selectedBilling, linkedApprovalId);
    };

    void poll();
    const interval = setInterval(() => {
      void poll();
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [currentApprovalStatus, linkedApprovalId, selectedBilling]);

  const allTaxpayers: TaxpayerListItem[] = taxpayers.map(t => ({
    pin: t.pin,
    taxpayer: t.taxpayerName,
    propertyAddress: t.propertyAddress ?? "",
    status: t.status,
    totalDue: taxpayerTotalDue(t),
  }));

  // Helper function to calculate penalty amount from percentage
  const calculatePenaltyAmount = (billing: TaxBilling, percentage: number): number => {
    const baseTax = billing.basicRPT + billing.sef;
    return baseTax * (percentage / 100);
  };

  const loadTaxpayerIntoForm = async (found: Taxpayer) => {
    const billing = toTaxBilling(found);
    const approved = await getLatestApprovedApprovalForPIN(found.pin);

    setSelectedBilling(billing);

    if (approved) {
      syncPenaltyFromApproval(billing, approved);
      setCurrentApprovalStatus("approved");
      setLinkedApprovalId(approved.id);
      return;
    }

    setPenaltyPercentage(found.penaltyPercentage.toString());
    setPenaltyReason(found.penaltyReason);
    await checkApprovalStatus(billing, found.penaltyPercentage);
    calculateTotal(billing, found.penaltyPercentage.toString());
    setEarlyPaymentNote(
      found.penaltyPercentage > 0 ? "" : "Eligible for early payment discount at cashier"
    );
  };

  const handleSearch = async () => {
    const found = taxpayers.find(t => t.pin === searchPIN);
    if (found) {
      await loadTaxpayerIntoForm(found);
    } else {
      alert("Property ID not found");
      setSelectedBilling(null);
    }
  };

  const handleSelectTaxpayer = async (pin: string) => {
    setSearchPIN(pin);
    const found = taxpayers.find(t => t.pin === pin);
    if (found) {
      await loadTaxpayerIntoForm(found);
    }
  };

  const calculateTotal = (billing: TaxBilling, penaltyPercent: string) => {
    const percentage = parseFloat(penaltyPercent) || 0;
    const penaltyAmount = calculatePenaltyAmount(billing, percentage);
    const total = billing.basicRPT + billing.sef + penaltyAmount;
    setTotalDue(total.toFixed(2));
  };

  const handlePenaltyChange = (value: string) => {
    setPenaltyPercentage(value);
    if (selectedBilling) {
      calculateTotal(selectedBilling, value);
      if (currentApprovalStatus === "approved") {
        setCurrentApprovalStatus("none");
        setLinkedApprovalId(null);
      }
    }
  };

  const needsApproval = () => {
    const percentage = parseFloat(penaltyPercentage) || 0;
    return percentage > 0;
  };

  const canSendEmail = () => {
    if (!needsApproval()) {
      return true;
    }
    return currentApprovalStatus === "approved";
  };

  const handleSaveAndEmail = async () => {
    if (!selectedBilling) return;

    const percentage = parseFloat(penaltyPercentage) || 0;
    const penaltyAmount = calculatePenaltyAmount(selectedBilling, percentage);

    if (percentage > 0 && !penaltyReason.trim()) {
      alert("Please provide a reason for the penalty");
      return;
    }

    if (needsApproval() && currentApprovalStatus !== "approved") {
      alert("This SOA requires Treasurer approval before sending. Please request approval first.");
      return;
    }

    let approvalRequestId: string | undefined;
    if (percentage > 0 && currentApprovalStatus === "approved") {
      if (linkedApprovalId) {
        approvalRequestId = linkedApprovalId;
      } else {
        const approval = await getLatestApprovalForPIN(
          selectedBilling.pin,
          penaltyAmount,
          linkedApprovalId ?? undefined
        );
        approvalRequestId = approval?.id;
      }
    }

    const newSOA = await createSOA(
      selectedBilling.pin,
      selectedBilling.taxpayer,
      selectedBilling.taxpayerEmail,
      selectedBilling.propertyAddress,
      selectedBilling.assessedValue,
      selectedBilling.basicRPT,
      selectedBilling.sef,
      penaltyAmount,
      penaltyReason,
      selectedBilling.fiscalYear,
      selectedBilling.status,
      "Ana Lopez (Revenue Clerk)",
      approvalRequestId
    );

    await markSOAasSent(newSOA.id);

    alert(`SOA ${newSOA.id} has been generated and sent to ${selectedBilling.taxpayer} (${selectedBilling.taxpayerEmail}). This SOA is now available for the Cashier to process payments.`);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleRequestApproval = async () => {
    if (!selectedBilling) return;

    const percentage = parseFloat(penaltyPercentage) || 0;
    const penaltyAmount = calculatePenaltyAmount(selectedBilling, percentage);
    const originalPenaltyAmount = calculatePenaltyAmount(selectedBilling, selectedBilling.penaltyPercentage);

    if (percentage > 0 && !penaltyReason.trim()) {
      alert("Please provide a reason for the penalty waiver request");
      return;
    }

    if (!needsApproval()) {
      alert("No adjustments detected. Approval is only needed for penalties.");
      return;
    }

    const newRequest = await createApprovalRequest(
      selectedBilling.pin,
      selectedBilling.taxpayer,
      "Penalty Waiver",
      originalPenaltyAmount,
      penaltyAmount,
      penaltyReason,
      "Ana Lopez (Revenue Clerk)"
    );

    setCurrentApprovalStatus("pending");
    setLinkedApprovalId(newRequest.id);
    setShowRequestApproval(false);
    alert(`Approval request ${newRequest.id} submitted to Municipal Treasurer. You will be notified when it's reviewed.`);
  };

  const filteredTaxpayers = allTaxpayers.filter(tp =>
    tp.pin.toLowerCase().includes(searchPIN.toLowerCase()) ||
    tp.taxpayer.toLowerCase().includes(searchPIN.toLowerCase())
  );

  const getApprovalStatusBadge = () => {
    switch (currentApprovalStatus) {
      case "pending":
        return (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="font-['Poppins'] text-[14px] text-amber-800">
              <span className="font-semibold">Pending Approval:</span> Waiting for Treasurer to review this request
            </span>
          </div>
        );
      case "approved":
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-['Poppins'] text-[14px] text-green-800">
              <span className="font-semibold">Treasurer Approved:</span> Penalty of ₱
              {calculatePenaltyAmount(selectedBilling!, parseFloat(penaltyPercentage) || 0).toLocaleString(
                "en-PH",
                { minimumFractionDigits: 2 }
              )}{" "}
              applied — you can now send this SOA to the taxpayer
            </span>
          </div>
        );
      case "rejected":
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="font-['Poppins'] text-[14px] text-red-800">
              <span className="font-semibold">Rejected:</span> Treasurer rejected this request. Please revise the adjustments.
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-['Poppins'] font-semibold text-[14px] text-blue-800 mb-1">
              Revenue Clerk Responsibilities
            </p>
            <p className="font-['Poppins'] text-[13px] text-blue-700">
              Generate SOAs and request <span className="font-semibold">Municipal Treasurer approval</span> for penalty waivers.
              <span className="font-semibold"> Note: Discounts are applied by the Cashier during payment, not in the SOA.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
        <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900 mb-4">
          Generate Statement of Account
        </h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="font-['Poppins'] text-[14px] text-gray-700 mb-2 block">
              Property Identification Number (PIN)
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchPIN}
                onChange={(e) => setSearchPIN(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., 001-2024-0045"
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg font-['Poppins'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#059467] focus:border-transparent"
              />
              {searchPIN && (
                <button
                  onClick={() => setSearchPIN("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="bg-[#059467] text-white py-3 px-6 rounded-lg font-['Poppins'] font-medium text-[16px] hover:bg-[#048358] transition-colors flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Taxpayers List */}
      <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
        <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900 mb-4">
          All Taxpayers ({filteredTaxpayers.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">PIN</th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">Taxpayer Name</th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">Property Address</th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">Status</th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">Amount Due</th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTaxpayers.map((taxpayer) => (
                <tr
                  key={taxpayer.pin}
                  className={`border-b border-gray-100 ${
                    selectedBilling?.pin === taxpayer.pin ? 'bg-green-50' : ''
                  }`}
                >
                  <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">{taxpayer.pin}</td>
                  <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">{taxpayer.taxpayer}</td>
                  <td className="font-['Poppins'] text-[14px] text-gray-600 py-4">{taxpayer.propertyAddress}</td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-['Poppins'] font-medium ${
                        taxpayer.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : taxpayer.status === "Partial"
                          ? "bg-amber-100 text-amber-800"
                          : taxpayer.status === "Delinquent"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {taxpayer.status}
                    </span>
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">
                    ₱{taxpayer.totalDue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => handleSelectTaxpayer(taxpayer.pin)}
                      className={`px-4 py-2 rounded-lg text-[14px] font-['Poppins'] transition-colors ${
                        selectedBilling?.pin === taxpayer.pin
                          ? 'bg-green-600 text-white'
                          : 'bg-[#059467] text-white hover:bg-[#048358]'
                      }`}
                    >
                      {selectedBilling?.pin === taxpayer.pin ? 'Selected' : 'Select'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SOA Details */}
      {selectedBilling && (
        <>
          {getApprovalStatusBadge()}

          <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
            <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900 mb-4">
              Property & Taxpayer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Taxpayer Name</p>
                <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">{selectedBilling.taxpayer}</p>
              </div>
              <div>
                <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Email Address</p>
                <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">{selectedBilling.taxpayerEmail}</p>
              </div>
              <div>
                <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">PIN</p>
                <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">{selectedBilling.pin}</p>
              </div>
              <div>
                <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Fiscal Year</p>
                <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">{selectedBilling.fiscalYear}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Property Address</p>
                <p className="font-['Poppins'] text-[14px] text-gray-900">{selectedBilling.propertyAddress}</p>
              </div>
              <div>
                <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Assessed Value</p>
                <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">
                  ₱{selectedBilling.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Tax Computation */}
          <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
            <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900 mb-4">
              Tax Computation & Adjustments
            </h3>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between">
                <span className="font-['Poppins'] text-[14px] text-gray-700">Basic RPT (1%)</span>
                <span className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                  ₱{selectedBilling.basicRPT.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-['Poppins'] text-[14px] text-gray-700">SEF Tax (1%)</span>
                <span className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                  ₱{selectedBilling.sef.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="h-px bg-gray-300 my-3" />

              {/* Penalty Input */}
              <div className="bg-white rounded-lg p-4 border-2 border-red-200">
                <div className="flex items-center gap-2 mb-3">
                  <Edit2 className="w-5 h-5 text-red-600" />
                  <span className="font-['Poppins'] font-semibold text-[16px] text-red-600">
                    Penalties & Interest (2% per month)
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="font-['Poppins'] text-[12px] text-gray-600 mb-1 block">
                      Penalty Percentage (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={penaltyPercentage}
                        onChange={(e) => handlePenaltyChange(e.target.value)}
                        step="0.1"
                        min="0"
                        max="100"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded font-['Poppins'] text-[14px] focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="0"
                        disabled={currentApprovalStatus === "pending"}
                      />
                      <span className="font-['Poppins'] text-[14px] text-gray-700">%</span>
                    </div>
                    {parseFloat(penaltyPercentage) > 0 && (
                      <p className="font-['Poppins'] text-[12px] text-red-600 mt-1">
                        Calculated Amount: ₱{calculatePenaltyAmount(selectedBilling, parseFloat(penaltyPercentage)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="font-['Poppins'] text-[12px] text-gray-600 mb-1 block">
                      Reason for Penalty * {parseFloat(penaltyPercentage) > 0 && "(Requires Treasurer Approval)"}
                    </label>
                    <textarea
                      value={penaltyReason}
                      onChange={(e) => setPenaltyReason(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded font-['Poppins'] text-[14px] focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., Late payment - 2 months overdue (2% interest per month)"
                      disabled={currentApprovalStatus === "pending"}
                    />
                  </div>
                </div>
              </div>

              {/* Early Payment Note */}
              {parseFloat(penaltyPercentage) === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-['Poppins'] font-semibold text-[14px] text-green-800 mb-1">
                        Early Payment Discount Available
                      </p>
                      <p className="font-['Poppins'] text-[13px] text-green-700">
                        • <span className="font-semibold">10% discount</span> - Payment before Q1 due date (March 31)<br/>
                        • <span className="font-semibold">20% discount</span> - Payment before Q2 due date (June 30)<br/>
                        <span className="italic text-[12px]">Note: Discount will be applied by the Cashier during payment</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="h-px bg-gray-300 my-3" />

              {/* Total */}
              <div className="bg-[#059467]/10 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-['Poppins'] font-bold text-[18px] text-gray-900">Total Amount Due</span>
                  <span className="font-['Poppins'] font-bold text-[24px] text-[#059467]">
                    ₱{parseFloat(totalDue || "0").toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleSaveAndEmail}
                disabled={!canSendEmail()}
                className={`py-3 px-6 rounded-lg font-['Poppins'] font-medium text-[16px] transition-colors flex items-center justify-center gap-2 ${
                  canSendEmail()
                    ? 'bg-[#059467] text-white hover:bg-[#048358]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-5 h-5" />
                <Mail className="w-5 h-5" />
                Save & Email SOA
              </button>
              <button
                onClick={() => setShowRequestApproval(true)}
                disabled={!needsApproval() || currentApprovalStatus === "pending"}
                className={`py-3 px-6 rounded-lg font-['Poppins'] font-medium text-[16px] transition-colors flex items-center justify-center gap-2 ${
                  needsApproval() && currentApprovalStatus !== "pending"
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
                {currentApprovalStatus === "pending" ? "Request Pending" : "Request Treasurer Approval"}
              </button>
            </div>
            <div className="mt-3 space-y-1">
              {needsApproval() && currentApprovalStatus !== "approved" && (
                <p className="font-['Poppins'] text-[12px] text-amber-600 text-center font-semibold">
                  ⚠️ This SOA requires Treasurer approval before you can email it to the taxpayer.
                </p>
              )}
              {!needsApproval() && (
                <p className="font-['Poppins'] text-[12px] text-green-600 text-center font-semibold">
                  ✓ No penalties - You can send this SOA directly without approval.
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Success Message */}
      {showSuccess && selectedBilling && (
        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in z-50">
          <CheckCircle className="w-6 h-6" />
          <div>
            <p className="font-['Poppins'] font-semibold text-[16px]">SOA Saved Successfully!</p>
            <p className="font-['Poppins'] text-[14px]">Email sent to {selectedBilling.taxpayerEmail}</p>
          </div>
        </div>
      )}

      {/* Request Approval Modal */}
      {showRequestApproval && selectedBilling && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <h3 className="font-['Poppins'] font-bold text-[20px] text-gray-900">
                Request Treasurer Approval
              </h3>
            </div>
            <p className="font-['Poppins'] text-[14px] text-gray-700 mb-4">
              Submit this penalty adjustment for <span className="font-semibold">Municipal Treasurer approval</span>?
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="font-['Poppins'] text-[12px] text-gray-600 mb-2">Request Details</p>
              <p className="font-['Poppins'] text-[14px] text-gray-900 font-medium mb-1">
                {selectedBilling.taxpayer} ({selectedBilling.pin})
              </p>
              <p className="font-['Poppins'] text-[12px] text-red-600">
                Penalty: {parseFloat(penaltyPercentage)}% = ₱{calculatePenaltyAmount(selectedBilling, parseFloat(penaltyPercentage)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleRequestApproval}
                className="flex-1 bg-amber-500 text-white py-3 px-6 rounded-lg font-['Poppins'] font-medium text-[16px] hover:bg-amber-600 transition-colors"
              >
                Submit Request
              </button>
              <button
                onClick={() => setShowRequestApproval(false)}
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-['Poppins'] font-medium text-[16px] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
