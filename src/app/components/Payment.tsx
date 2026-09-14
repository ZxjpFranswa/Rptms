import { useState } from "react";
import { Search, Printer, CheckCircle, Edit2 } from "lucide-react";

interface TaxBilling {
  pin: string;
  taxpayer: string;
  propertyAddress: string;
  assessedValue: number;
  basicRPT: number;
  sef: number;
  penalties: number;
  discount: number;
  totalDue: number;
  fiscalYear: string;
  status: "Unpaid" | "Paid" | "Partial" | "Delinquent";
}

interface TaxpayerListItem {
  pin: string;
  taxpayer: string;
  propertyAddress: string;
  status: "Unpaid" | "Paid" | "Partial" | "Delinquent";
  totalDue: number;
}

export default function Payment() {
  const [searchPIN, setSearchPIN] = useState("");
  const [selectedBilling, setSelectedBilling] = useState<TaxBilling | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [orNumber, setOrNumber] = useState("");

  // Manual input for penalties and discounts
  const [manualPenalties, setManualPenalties] = useState("");
  const [manualDiscount, setManualDiscount] = useState("");

  const allTaxpayers: TaxpayerListItem[] = [
    {
      pin: "001-2024-0045",
      taxpayer: "Juan Dela Cruz",
      propertyAddress: "Lot 5, Block 3, Magarao, Camarines Sur",
      status: "Unpaid",
      totalDue: 5250,
    },
    {
      pin: "001-2024-0123",
      taxpayer: "Maria Santos",
      propertyAddress: "Lot 12, Barangay San Juan, Magarao",
      status: "Unpaid",
      totalDue: 3400,
    },
    {
      pin: "001-2024-0089",
      taxpayer: "Pedro Reyes",
      propertyAddress: "Block 7, Poblacion, Magarao",
      status: "Delinquent",
      totalDue: 6850,
    },
    {
      pin: "001-2024-0234",
      taxpayer: "Ana Garcia",
      propertyAddress: "Lot 23, Barangay Centro, Magarao",
      status: "Unpaid",
      totalDue: 6750,
    },
    {
      pin: "001-2024-0156",
      taxpayer: "Roberto Cruz",
      propertyAddress: "Lot 8, Barangay San Pantaleon, Magarao",
      status: "Unpaid",
      totalDue: 4500,
    },
    {
      pin: "001-2024-0267",
      taxpayer: "Linda Bautista",
      propertyAddress: "Lot 15, Barangay San Miguel, Magarao",
      status: "Partial",
      totalDue: 2800,
    },
    {
      pin: "001-2024-0312",
      taxpayer: "Carlos Mendoza",
      propertyAddress: "Block 2, Poblacion, Magarao",
      status: "Unpaid",
      totalDue: 8200,
    },
    {
      pin: "001-2024-0098",
      taxpayer: "Elena Ramos",
      propertyAddress: "Lot 9, Barangay Sta. Cruz, Magarao",
      status: "Paid",
      totalDue: 0,
    },
  ];

  const mockBillings: TaxBilling[] = [
    {
      pin: "001-2024-0045",
      taxpayer: "Juan Dela Cruz",
      propertyAddress: "Lot 5, Block 3, Magarao, Camarines Sur",
      assessedValue: 250000,
      basicRPT: 2500,
      sef: 2500,
      penalties: 250,
      discount: 0,
      totalDue: 5250,
      fiscalYear: "2026",
      status: "Unpaid",
    },
    {
      pin: "001-2024-0123",
      taxpayer: "Maria Santos",
      propertyAddress: "Lot 12, Barangay San Juan, Magarao",
      assessedValue: 180000,
      basicRPT: 1800,
      sef: 1800,
      penalties: 0,
      discount: 200,
      totalDue: 3400,
      fiscalYear: "2026",
      status: "Unpaid",
    },
    {
      pin: "001-2024-0089",
      taxpayer: "Pedro Reyes",
      propertyAddress: "Block 7, Poblacion, Magarao",
      assessedValue: 320000,
      basicRPT: 3200,
      sef: 3200,
      penalties: 450,
      discount: 0,
      totalDue: 6850,
      fiscalYear: "2026",
      status: "Delinquent",
    },
    {
      pin: "001-2024-0234",
      taxpayer: "Ana Garcia",
      propertyAddress: "Lot 23, Barangay Centro, Magarao",
      assessedValue: 320000,
      basicRPT: 3200,
      sef: 3200,
      penalties: 350,
      discount: 0,
      totalDue: 6750,
      fiscalYear: "2026",
      status: "Unpaid",
    },
    {
      pin: "001-2024-0156",
      taxpayer: "Roberto Cruz",
      propertyAddress: "Lot 8, Barangay San Pantaleon, Magarao",
      assessedValue: 210000,
      basicRPT: 2100,
      sef: 2100,
      penalties: 0,
      discount: 300,
      totalDue: 3900,
      fiscalYear: "2026",
      status: "Unpaid",
    },
    {
      pin: "001-2024-0267",
      taxpayer: "Linda Bautista",
      propertyAddress: "Lot 15, Barangay San Miguel, Magarao",
      assessedValue: 150000,
      basicRPT: 1500,
      sef: 1500,
      penalties: 100,
      discount: 0,
      totalDue: 3100,
      fiscalYear: "2026",
      status: "Partial",
    },
    {
      pin: "001-2024-0312",
      taxpayer: "Carlos Mendoza",
      propertyAddress: "Block 2, Poblacion, Magarao",
      assessedValue: 400000,
      basicRPT: 4000,
      sef: 4000,
      penalties: 200,
      discount: 0,
      totalDue: 8200,
      fiscalYear: "2026",
      status: "Unpaid",
    },
  ];

  const handleSearch = () => {
    const found = mockBillings.find(b => b.pin === searchPIN);
    if (found) {
      setSelectedBilling(found);
      setManualPenalties(found.penalties.toString());
      setManualDiscount(found.discount.toString());
      calculateTotal(found, found.penalties.toString(), found.discount.toString());
    } else {
      alert("Property ID not found");
      setSelectedBilling(null);
    }
  };

  const handleSelectTaxpayer = (pin: string) => {
    setSearchPIN(pin);
    const found = mockBillings.find(b => b.pin === pin);
    if (found) {
      setSelectedBilling(found);
      setManualPenalties(found.penalties.toString());
      setManualDiscount(found.discount.toString());
      calculateTotal(found, found.penalties.toString(), found.discount.toString());
    }
  };

  const calculateTotal = (billing: TaxBilling, penalties: string, discount: string) => {
    const penaltyAmount = parseFloat(penalties) || 0;
    const discountAmount = parseFloat(discount) || 0;
    const total = billing.basicRPT + billing.sef + penaltyAmount - discountAmount;
    setPaymentAmount(total.toFixed(2));
  };

  const handlePenaltyChange = (value: string) => {
    setManualPenalties(value);
    if (selectedBilling) {
      calculateTotal(selectedBilling, value, manualDiscount);
    }
  };

  const handleDiscountChange = (value: string) => {
    setManualDiscount(value);
    if (selectedBilling) {
      calculateTotal(selectedBilling, manualPenalties, value);
    }
  };

  const handleProcessPayment = () => {
    if (!selectedBilling) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    const newORNumber = `OR-2026-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
    setOrNumber(newORNumber);
    setShowReceipt(true);
  };

const handlePrintReceipt = () => {
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
    setManualPenalties("");
    setManualDiscount("");
  };

if (showReceipt && selectedBilling) {
    const penaltyAmount = parseFloat(manualPenalties) || 0;
    const discountAmount = parseFloat(manualDiscount) || 0;

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

            <div className="mb-6">
              <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Property ID Number (PIN)</p>
              <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">
                {selectedBilling.pin}
              </p>
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
              {penaltyAmount > 0 && (
                <div className="flex justify-between">
                  <span className="font-['Poppins'] text-[14px] text-gray-600">Penalties</span>
                  <span className="font-['Poppins'] text-[14px] text-gray-900">
                    ₱{penaltyAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="font-['Poppins'] text-[14px] text-green-600">Discount</span>
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
              onClick={handlePrintReceipt}
              className="flex-1 bg-[#059467] text-white py-3 px-6 rounded-lg font-['Poppins'] font-medium text-[16px] hover:bg-[#048358] transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print Receipt
            </button>
            <button
              onClick={resetForm}
              className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-['Poppins'] font-medium text-[16px] hover:bg-gray-50 transition-colors"
            >
              New Transaction
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Section */}
      <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
        <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900 mb-4">
          Search Property
        </h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="font-['Poppins'] text-[14px] text-gray-700 mb-2 block">
              Property Identification Number (PIN)
            </label>
            <input
              type="text"
              value={searchPIN}
              onChange={(e) => setSearchPIN(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g., 001-2024-0045"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#059467] focus:border-transparent"
            />
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
          All Taxpayers
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  PIN
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Taxpayer Name
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Property Address
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Status
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Amount Due
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {allTaxpayers.map((taxpayer) => (
                <tr key={taxpayer.pin} className="border-b border-gray-100">
                  <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">
                    {taxpayer.pin}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">
                    {taxpayer.taxpayer}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-600 py-4">
                    {taxpayer.propertyAddress}
                  </td>
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
                      className="bg-[#059467] text-white px-4 py-2 rounded-lg text-[14px] font-['Poppins'] hover:bg-[#048358] transition-colors"
                      disabled={taxpayer.status === "Paid"}
                    >
                      {taxpayer.status === "Paid" ? "Paid" : "Select"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Billing Details */}
      {selectedBilling && (
        <>
          <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
            <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900 mb-4">
              Statement of Account
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Taxpayer Name</p>
                <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">
                  {selectedBilling.taxpayer}
                </p>
              </div>
              <div>
                <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">PIN</p>
                <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">
                  {selectedBilling.pin}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Property Address</p>
                <p className="font-['Poppins'] text-[14px] text-gray-900">
                  {selectedBilling.propertyAddress}
                </p>
              </div>
              <div>
                <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Fiscal Year</p>
                <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">
                  {selectedBilling.fiscalYear}
                </p>
              </div>
              <div>
                <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Assessed Value</p>
                <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">
                  ₱{selectedBilling.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
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

              {/* Manual Penalty Input */}
              <div className="flex justify-between items-center bg-white rounded p-3 border border-gray-200">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-red-600" />
                  <span className="font-['Poppins'] text-[14px] text-red-600">Penalties & Interest (Manual)</span>
                </div>
                <input
                  type="number"
                  value={manualPenalties}
                  onChange={(e) => handlePenaltyChange(e.target.value)}
                  step="0.01"
                  className="w-32 px-3 py-1 border border-gray-300 rounded font-['Poppins'] text-[14px] text-right focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0.00"
                />
              </div>

              {/* Manual Discount Input */}
              <div className="flex justify-between items-center bg-white rounded p-3 border border-gray-200">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-green-600" />
                  <span className="font-['Poppins'] text-[14px] text-green-600">Discount (Manual)</span>
                </div>
                <input
                  type="number"
                  value={manualDiscount}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  step="0.01"
                  className="w-32 px-3 py-1 border border-gray-300 rounded font-['Poppins'] text-[14px] text-right focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>

              <div className="h-px bg-gray-300 my-2" />
              <div className="flex justify-between">
                <span className="font-['Poppins'] font-bold text-[18px] text-gray-900">Total Amount Due</span>
                <span className="font-['Poppins'] font-bold text-[20px] text-[#059467]">
                  ₱{parseFloat(paymentAmount || "0").toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
            <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900 mb-4">
              Process Payment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
            </div>

            <button
              onClick={handleProcessPayment}
              className="w-full bg-[#059467] text-white py-3 px-6 rounded-lg font-['Poppins'] font-medium text-[16px] hover:bg-[#048358] transition-colors"
            >
              Process Payment & Generate Receipt
            </button>
          </div>
        </>
      )}
    </div>
  );
}
