import { useState } from "react";
import { FileText, DollarSign, Home as HomeIcon, CheckCircle, Download } from "lucide-react";

interface TaxBilling {
  pin: string;
  taxpayer: string;
  propertyAddress: string;
  assessedValue: number;
  basicRPT: number;
  sef: number;
  penalties: number;
  penaltyReason: string;
  discount: number;
  discountReason: string;
  totalDue: number;
  fiscalYear: string;
  status: "Unpaid" | "Paid" | "Partial" | "Delinquent";
  dueDate: string;
}

interface PaymentRecord {
  orNumber: string;
  amount: number;
  paymentDate: string;
  fiscalYear: string;
  basicRPT: number;
  sef: number;
  penalties: number;
  discount: number;
  status: string;
}

export default function TaxpayerPortal() {
  const [activeTab, setActiveTab] = useState<"billing" | "history" | "property">("billing");

  // Mock data - in real app, this would be fetched based on logged-in taxpayer
  const taxpayerInfo = {
    name: "Juan Dela Cruz",
    pin: "001-2024-0045",
    email: "juan.delacruz@email.com",
    propertyAddress: "Lot 5, Block 3, Magarao, Camarines Sur",
    assessedValue: 250000,
  };

  const currentBilling: TaxBilling = {
    pin: "001-2024-0045",
    taxpayer: "Juan Dela Cruz",
    propertyAddress: "Lot 5, Block 3, Magarao, Camarines Sur",
    assessedValue: 250000,
    basicRPT: 2500,
    sef: 2500,
    penalties: 250,
    penaltyReason: "Late payment - 2 months overdue",
    discount: 0,
    discountReason: "",
    totalDue: 5250,
    fiscalYear: "2026",
    status: "Unpaid",
    dueDate: "2026-06-30",
  };

  const paymentHistory: PaymentRecord[] = [
    {
      orNumber: "OR-2025-008923",
      amount: 4500,
      paymentDate: "2025-12-15T13:30:00",
      fiscalYear: "2025",
      basicRPT: 2100,
      sef: 2100,
      penalties: 0,
      discount: 300,
      status: "Cleared",
    },
    {
      orNumber: "OR-2024-007821",
      amount: 4200,
      paymentDate: "2024-11-20T10:15:00",
      fiscalYear: "2024",
      basicRPT: 2100,
      sef: 2100,
      penalties: 0,
      discount: 0,
      status: "Cleared",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#059467] to-[#14522d] rounded-lg p-6 text-white">
        <h2 className="font-['Poppins'] font-bold text-[28px] mb-2">
          Welcome, {taxpayerInfo.name}
        </h2>
        <p className="font-['Poppins'] text-[16px] opacity-90">
          Property ID: {taxpayerInfo.pin}
        </p>
        <p className="font-['Poppins'] text-[14px] opacity-75 mt-2">
          {taxpayerInfo.propertyAddress}
        </p>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-['Poppins'] text-[12px] text-gray-600">Current Balance</p>
              <p className="font-['Poppins'] font-bold text-[20px] text-red-600">
                ₱{currentBilling.totalDue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <p className="font-['Poppins'] text-[12px] text-gray-500">
            Due: {new Date(currentBilling.dueDate).toLocaleDateString('en-PH')}
          </p>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <HomeIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-['Poppins'] text-[12px] text-gray-600">Assessed Value</p>
              <p className="font-['Poppins'] font-bold text-[20px] text-gray-900">
                ₱{taxpayerInfo.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <p className="font-['Poppins'] text-[12px] text-gray-500">
            Fiscal Year {currentBilling.fiscalYear}
          </p>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-['Poppins'] text-[12px] text-gray-600">Payment Status</p>
              <p className="font-['Poppins'] font-bold text-[20px] text-amber-600">
                {currentBilling.status}
              </p>
            </div>
          </div>
          <p className="font-['Poppins'] text-[12px] text-gray-500">
            Last paid: Dec 15, 2025
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("billing")}
            className={`flex-1 px-6 py-4 font-['Poppins'] font-medium text-[16px] transition-colors ${
              activeTab === "billing"
                ? "bg-[#059467] text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FileText className="w-5 h-5 inline mr-2" />
            Billing Statement
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 px-6 py-4 font-['Poppins'] font-medium text-[16px] transition-colors ${
              activeTab === "history"
                ? "bg-[#059467] text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <DollarSign className="w-5 h-5 inline mr-2" />
            Payment History
          </button>
          <button
            onClick={() => setActiveTab("property")}
            className={`flex-1 px-6 py-4 font-['Poppins'] font-medium text-[16px] transition-colors ${
              activeTab === "property"
                ? "bg-[#059467] text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <HomeIcon className="w-5 h-5 inline mr-2" />
            Property Info
          </button>
        </div>

        <div className="p-6">
          {/* Billing Statement Tab */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900">
                  Statement of Account - FY {currentBilling.fiscalYear}
                </h3>
                <button className="flex items-center gap-2 text-[#059467] hover:text-[#048358] font-['Poppins'] font-medium">
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Taxpayer Name</p>
                    <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">
                      {currentBilling.taxpayer}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Property ID (PIN)</p>
                    <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">
                      {currentBilling.pin}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Property Address</p>
                    <p className="font-['Poppins'] text-[14px] text-gray-900">
                      {currentBilling.propertyAddress}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Assessed Value</p>
                    <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">
                      ₱{currentBilling.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Due Date</p>
                    <p className="font-['Poppins'] text-[16px] text-red-600 font-medium">
                      {new Date(currentBilling.dueDate).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-gray-300 my-4" />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-['Poppins'] text-[14px] text-gray-700">Basic RPT (1%)</span>
                    <span className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                      ₱{currentBilling.basicRPT.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-['Poppins'] text-[14px] text-gray-700">SEF Tax (1%)</span>
                    <span className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                      ₱{currentBilling.sef.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {currentBilling.penalties > 0 && (
                    <div>
                      <div className="flex justify-between">
                        <span className="font-['Poppins'] text-[14px] text-red-600">Penalties & Interest</span>
                        <span className="font-['Poppins'] text-[14px] text-red-600 font-medium">
                          ₱{currentBilling.penalties.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <p className="font-['Poppins'] text-[12px] text-gray-500 mt-1 italic">
                        {currentBilling.penaltyReason}
                      </p>
                    </div>
                  )}
                  {currentBilling.discount > 0 && (
                    <div>
                      <div className="flex justify-between">
                        <span className="font-['Poppins'] text-[14px] text-green-600">Discount</span>
                        <span className="font-['Poppins'] text-[14px] text-green-600 font-medium">
                          -₱{currentBilling.discount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <p className="font-['Poppins'] text-[12px] text-gray-500 mt-1 italic">
                        {currentBilling.discountReason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="h-px bg-gray-300 my-4" />

                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-['Poppins'] font-bold text-[20px] text-gray-900">
                      Total Amount Due
                    </span>
                    <span className="font-['Poppins'] font-bold text-[28px] text-[#059467]">
                      ₱{currentBilling.totalDue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-['Poppins'] text-[14px] text-blue-800">
                  <span className="font-semibold">Payment Instructions:</span> Please visit the Municipal Treasurer's Office during office hours (8:00 AM - 5:00 PM, Monday to Friday) to settle your tax dues. Bring this statement and a valid ID.
                </p>
              </div>
            </div>
          )}

          {/* Payment History Tab */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900 mb-4">
                Payment Transaction History
              </h3>

              {paymentHistory.map((payment) => (
                <div key={payment.orNumber} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="font-['Poppins'] font-semibold text-[16px] text-gray-900">
                          {payment.orNumber}
                        </p>
                      </div>
                      <p className="font-['Poppins'] text-[14px] text-gray-600">
                        Fiscal Year {payment.fiscalYear}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-['Poppins'] font-bold text-[20px] text-[#059467]">
                        ₱{payment.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="font-['Poppins'] text-[12px] text-gray-500">
                        {new Date(payment.paymentDate).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-300">
                    <div>
                      <p className="font-['Poppins'] text-[11px] text-gray-600">Basic RPT</p>
                      <p className="font-['Poppins'] text-[13px] text-gray-900 font-medium">
                        ₱{payment.basicRPT.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="font-['Poppins'] text-[11px] text-gray-600">SEF Tax</p>
                      <p className="font-['Poppins'] text-[13px] text-gray-900 font-medium">
                        ₱{payment.sef.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="font-['Poppins'] text-[11px] text-gray-600">Penalties</p>
                      <p className="font-['Poppins'] text-[13px] text-gray-900 font-medium">
                        ₱{payment.penalties.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="font-['Poppins'] text-[11px] text-gray-600">Status</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-['Poppins'] font-medium bg-green-100 text-green-800">
                        {payment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {paymentHistory.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="font-['Poppins'] text-gray-500 text-[16px]">
                    No payment history available
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Property Information Tab */}
          {activeTab === "property" && (
            <div className="space-y-6">
              <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900 mb-4">
                Property Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-['Poppins'] text-[12px] text-gray-600 mb-2">Property ID Number (PIN)</p>
                  <p className="font-['Poppins'] text-[18px] text-gray-900 font-semibold">
                    {taxpayerInfo.pin}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-['Poppins'] text-[12px] text-gray-600 mb-2">Owner Name</p>
                  <p className="font-['Poppins'] text-[18px] text-gray-900 font-semibold">
                    {taxpayerInfo.name}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                  <p className="font-['Poppins'] text-[12px] text-gray-600 mb-2">Property Address</p>
                  <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">
                    {taxpayerInfo.propertyAddress}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-['Poppins'] text-[12px] text-gray-600 mb-2">Assessed Value</p>
                  <p className="font-['Poppins'] text-[18px] text-gray-900 font-semibold">
                    ₱{taxpayerInfo.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-['Poppins'] text-[12px] text-gray-600 mb-2">Email Address</p>
                  <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">
                    {taxpayerInfo.email}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-['Poppins'] font-semibold text-[14px] text-green-800 mb-1">
                      Email Notifications Enabled
                    </p>
                    <p className="font-['Poppins'] text-[13px] text-green-700">
                      You will receive billing statements and payment confirmations at {taxpayerInfo.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
