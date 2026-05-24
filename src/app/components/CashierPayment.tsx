import { useState, useEffect } from "react";
import { Search, Printer, CheckCircle, X } from "lucide-react";
import {
  SOARecord,
  getSentSOAs,
  updateSOAStatus,
  subscribeToSOAUpdates,
} from "../utils/soaManagement";

export default function CashierPayment() {
  const [searchPIN, setSearchPIN] = useState("");
  const [selectedBilling, setSelectedBilling] = useState<SOARecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [orNumber, setOrNumber] = useState("");
  const [discountType, setDiscountType] = useState<"none" | "10" | "20">("none");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState("");
  const [availableSOAs, setAvailableSOAs] = useState<SOARecord[]>([]);

  // Load SOAs from the shared system
  useEffect(() => {
    const load = async () => {
      const soas = await getSentSOAs();
      setAvailableSOAs(soas);
    };
    load();

    const unsubscribe = subscribeToSOAUpdates(() => {
      load();
    });

    return unsubscribe;
  }, []);


  const selectSOA = (soa: SOARecord) => {
    setSearchPIN(soa.pin);
    setSelectedBilling(soa);
    setPaymentAmount(soa.balanceDue.toString());
    setDiscountType("none");
    setDiscountAmount(0);
    setDiscountError("");
  };

  const handleSearch = () => {
    const query = searchPIN.trim().toLowerCase();
    const found = availableSOAs.find(
      soa =>
        soa.status !== "Paid" &&
        (soa.pin.toLowerCase() === query ||
          soa.taxpayer.toLowerCase().includes(query))
    );
    if (found) {
      selectSOA(found);
    } else {
      alert("Property ID not found or SOA not available. Please check if the Revenue Clerk has sent the SOA.");
      setSelectedBilling(null);
    }
  };

  const handleSelectSOA = (soa: SOARecord) => {
    selectSOA(soa);
  };

  const handleDiscountChange = (type: "none" | "10" | "20") => {
    if (!selectedBilling) return;

    // Check if there are penalties
    if (selectedBilling.penalties > 0 && type !== "none") {
      setDiscountError("Cannot apply discount when there are penalties");
      setDiscountType("none");
      setDiscountAmount(0);
      return;
    }

    setDiscountError("");
    setDiscountType(type);

    if (type === "none") {
      setDiscountAmount(0);
      setPaymentAmount(selectedBilling.balanceDue.toString());
    } else {

      const baseAmount = selectedBilling.basicRPT + selectedBilling.sef;
      const discountPercentage = parseInt(type);
      const calculatedDiscount = baseAmount * (discountPercentage / 100);
      setDiscountAmount(calculatedDiscount);
      const newTotal = Math.max(0, selectedBilling.balanceDue - calculatedDiscount);
      setPaymentAmount(newTotal.toString());

    }
  };

  const handleProcessPayment = async () => {
    if (!selectedBilling) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    const newORNumber = `OR-2026-${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`;

    await updateSOAStatus(selectedBilling.id, amount, discountAmount, {
      orNumber: newORNumber,
      paymentMethod: "Cash",
      cashier: "Maria Santos (Cashier)",
    });

    setOrNumber(newORNumber);
    setShowReceipt(true);
  };

const handlePrintReceipt = () => {
    // Ensure print-only DOM is applied before opening the print dialog.
    // This avoids cases where some users see the full UI instead of the receipt.
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const resetForm = () => {
    setSearchPIN("");
    setSelectedBilling(null);
    setPaymentAmount("");
    setShowReceipt(false);
    setOrNumber("");
    setDiscountType("none");
    setDiscountAmount(0);
    setDiscountError("");
  };

if (showReceipt && selectedBilling) {
    return (
      <div className="max-w-4xl mx-auto bb-print-root">
        <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-8 bb-print-surface">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-[#059467]" />
            </div>
            <h2 className="font-['Poppins'] font-bold text-[28px] text-gray-900 mb-2">
              Payment Successful
            </h2>
            <p className="font-['Poppins'] text-[16px] text-gray-600">
              Official Receipt Generated
            </p>
          </div>

          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <div className="text-center mb-6">
              <h3 className="font-['Poppins'] font-bold text-[20px] text-gray-900">
                MUNICIPALITY OF MAGARAO
              </h3>
              <p className="font-['Poppins'] text-[14px] text-gray-600">
                Office of the Municipal Treasurer
              </p>
              <p className="font-['Poppins'] font-bold text-[18px] text-gray-900 mt-4">
                OFFICIAL RECEIPT
              </p>
              <p className="font-['Poppins'] text-[16px] text-[#059467] font-semibold">
                {orNumber}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="font-['Poppins'] text-[12px] text-gray-600">Date Issued</p>
                <p className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                  {new Date().toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="font-['Poppins'] text-[12px] text-gray-600">Payment Method</p>
                <p className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                  Cash
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Taxpayer Name</p>
              <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">
                {selectedBilling.taxpayer}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Property ID Number (PIN)</p>
                <p className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                  {selectedBilling.pin}
                </p>
              </div>
              <div>
                <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">SOA Reference</p>
                <p className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                  {selectedBilling.id}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Property Address</p>
              <p className="font-['Poppins'] text-[14px] text-gray-900">
                {selectedBilling.propertyAddress}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-['Poppins'] text-[14px] text-gray-600">Basic RPT</span>
                <span className="font-['Poppins'] text-[14px] text-gray-900">
                  ₱{selectedBilling.basicRPT.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-['Poppins'] text-[14px] text-gray-600">SEF Tax</span>
                <span className="font-['Poppins'] text-[14px] text-gray-900">
                  ₱{selectedBilling.sef.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {selectedBilling.penalties > 0 && (
                <div className="flex justify-between">
                  <span className="font-['Poppins'] text-[14px] text-gray-600">Penalties</span>
                  <span className="font-['Poppins'] text-[14px] text-gray-900">
                    ₱{selectedBilling.penalties.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="font-['Poppins'] text-[14px] text-green-600">
                    Early Payment Discount ({discountType}%)
                  </span>
                  <span className="font-['Poppins'] text-[14px] text-green-600">
                    -₱{discountAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="h-px bg-gray-300 my-2" />
              <div className="flex justify-between">
                <span className="font-['Poppins'] font-bold text-[16px] text-gray-900">Amount Paid</span>
                <span className="font-['Poppins'] font-bold text-[18px] text-[#059467]">
                  ₱{parseFloat(paymentAmount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
              <button
                type="button"
                onClick={handlePrintReceipt}
                aria-label="Print receipt"
                className="flex-1 bg-[#059467] text-white py-3 px-6 rounded-lg font-['Poppins'] font-medium text-[16px] hover:bg-[#048358] transition-colors flex items-center justify-center gap-2"
              >
              <Printer className="w-5 h-5" />
              Print Receipt
            </button>
              <button
                type="button"
                onClick={resetForm}
                aria-label="Start new transaction"
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-['Poppins'] font-medium text-[16px] hover:bg-gray-50 transition-colors"
              >
              New Transaction
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter SOAs that haven't been fully paid yet
  const filteredTaxpayers = availableSOAs
    .filter(soa => soa.status !== "Paid")
    .filter(soa =>
      soa.pin.toLowerCase().includes(searchPIN.toLowerCase()) ||
      soa.taxpayer.toLowerCase().includes(searchPIN.toLowerCase())
    );

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="font-['Poppins'] text-[14px] text-blue-800">
          <span className="font-semibold">Payment Processing:</span> Process payments for SOAs generated and sent by Revenue Clerks. Approved penalty adjustments are already reflected in the amounts below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Taxpayer List */}
        <div className="space-y-4">
          {/* Search */}
          <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-4">
          <label className="font-['Poppins'] text-[14px] text-gray-700 mb-2 block">
            Search by PIN or Name
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchPIN}
                onChange={(e) => setSearchPIN(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search taxpayer..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg font-['Poppins'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#059467] focus:border-transparent"
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
            <button
              onClick={handleSearch}
              className="bg-[#059467] text-white py-2 px-4 rounded-lg font-['Poppins'] font-medium text-[14px] hover:bg-[#048358] transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Taxpayers List */}
        <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-['Poppins'] font-semibold text-[16px] text-gray-900">
              Bills Ready for Payment ({filteredTaxpayers.length})
            </h3>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {filteredTaxpayers.map((soa) => (
              <div
                key={soa.id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedBilling?.id === soa.id ? 'bg-[#059467]/10 border-l-4 border-l-[#059467]' : ''
                }`}
                onClick={() => handleSelectSOA(soa)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-['Poppins'] font-semibold text-[14px] text-gray-900">
                      {soa.taxpayer}
                    </p>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">
                      PIN: {soa.pin}
                    </p>
                    <p className="font-['Poppins'] text-[10px] text-gray-500">
                      SOA: {soa.id}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-['Poppins'] font-medium ${
                      soa.status === "Paid"
                        ? "bg-green-100 text-green-800"
                        : soa.status === "Partial"
                        ? "bg-amber-100 text-amber-800"
                        : soa.status === "Delinquent"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {soa.status}
                  </span>
                </div>
                <p className="font-['Poppins'] text-[11px] text-gray-500 mb-2">
                  {soa.propertyAddress}
                </p>
                <p className="font-['Poppins'] text-[14px] font-semibold text-[#059467]">
                  ₱{soa.balanceDue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}

                </p>
                {soa.approvalRequestId && (
                  <p className="font-['Poppins'] text-[10px] text-green-600 mt-1">
                    ✓ Treasurer Approved
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - SOA & Payment */}
      <div className="space-y-4">
        {selectedBilling ? (
          <>
            {/* Statement of Account */}
            <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900">
                  Statement of Account
                </h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-[11px] font-['Poppins'] font-medium">
                  {selectedBilling.id}
                </span>
              </div>

              {selectedBilling.approvalRequestId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="font-['Poppins'] text-[12px] text-green-800">
                    ✓ <span className="font-semibold">Treasurer Approved:</span> This SOA contains penalty adjustments approved by the Municipal Treasurer ({selectedBilling.approvalRequestId})
                  </p>
                </div>
              )}

              <div className="space-y-3 mb-4">
                <div>
                  <p className="font-['Poppins'] text-[12px] text-gray-600">Taxpayer Name</p>
                  <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">
                    {selectedBilling.taxpayer}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">PIN</p>
                    <p className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                      {selectedBilling.pin}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">Fiscal Year</p>
                    <p className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                      {selectedBilling.fiscalYear}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-['Poppins'] text-[12px] text-gray-600">Property Address</p>
                  <p className="font-['Poppins'] text-[13px] text-gray-900">
                    {selectedBilling.propertyAddress}
                  </p>
                </div>
                <div>
                  <p className="font-['Poppins'] text-[12px] text-gray-600">Assessed Value</p>
                  <p className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                    ₱{selectedBilling.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
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
                {selectedBilling.penalties > 0 && (
                  <div className="flex justify-between">
                    <span className="font-['Poppins'] text-[14px] text-red-600">Penalties</span>
                    <span className="font-['Poppins'] text-[14px] text-red-600 font-medium">
                      ₱{selectedBilling.penalties.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="font-['Poppins'] text-[14px] text-green-600">
                      Early Payment Discount ({discountType}%)
                    </span>
                    <span className="font-['Poppins'] text-[14px] text-green-600 font-medium">
                      -₱{discountAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="h-px bg-gray-300 my-2" />
                <div className="flex justify-between">
                  <span className="font-['Poppins'] font-bold text-[16px] text-gray-900">Total Amount Due</span>
                  <span className="font-['Poppins'] font-bold text-[18px] text-[#059467]">
                    ₱{(selectedBilling.balanceDue - discountAmount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}

                  </span>
                </div>
              </div>
            </div>

            {/* Payment Processing */}
            <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
              <h3 className="font-['Poppins'] font-semibold text-[18px] text-gray-900 mb-4">
                Process Payment
              </h3>

              <div className="space-y-4">
                {/* Early Payment Discount */}
                <div>
                  <label className="font-['Poppins'] text-[14px] text-gray-700 mb-2 block">
                    Early Payment Discount
                  </label>
                  <label className="sr-only" id="discount-type-label">Early payment discount</label>
                  <select
                    aria-labelledby="discount-type-label"
                    value={discountType}
                    onChange={(e) => handleDiscountChange(e.target.value as "none" | "10" | "20")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#059467] focus:border-transparent"
                  >
                    <option value="none">No Discount</option>
                    <option value="10">10% - Advance Payment (Before Q1)</option>
                    <option value="20">20% - Prompt Payment (Before Q2)</option>
                  </select>
                  {discountError && (
                    <p className="font-['Poppins'] text-[12px] text-red-600 mt-1">
                      {discountError}
                    </p>
                  )}
                  {selectedBilling && selectedBilling.penalties === 0 && discountType === "none" && (
                    <p className="font-['Poppins'] text-[12px] text-blue-600 mt-1">
                      This taxpayer is eligible for early payment discount
                    </p>
                  )}
                  {selectedBilling && selectedBilling.penalties > 0 && (
                    <p className="font-['Poppins'] text-[12px] text-amber-600 mt-1">
                      ⚠️ Discount not available due to penalties
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-['Poppins'] text-[14px] text-gray-700 mb-2 block">
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#059467] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="font-['Poppins'] text-[14px] text-gray-700 mb-2 block">
                    Payment Method
                  </label>
                  <input
                    type="text"
                    value="Cash"
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] text-[14px] bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <button
                  onClick={handleProcessPayment}
                  className="w-full bg-[#059467] text-white py-3 px-6 rounded-lg font-['Poppins'] font-medium text-[16px] hover:bg-[#048358] transition-colors"
                >
                  Process Payment & Generate Receipt
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="font-['Poppins'] text-[16px] text-gray-500">
              Select a taxpayer to view their Statement of Account
            </p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
