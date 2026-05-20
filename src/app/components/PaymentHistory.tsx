import { useState } from "react";
import { Search, Download, Filter, Eye } from "lucide-react";

interface PaymentRecord {
  id: string;
  orNumber: string;
  pin: string;
  taxpayer: string;
  propertyAddress: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  fiscalYear: string;
  cashier: string;
  basicRPT: number;
  sef: number;
  penalties: number;
  discount: number;
}

export default function PaymentHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  const paymentRecords: PaymentRecord[] = [
    {
      id: "1",
      orNumber: "OR-2026-001234",
      pin: "001-2024-0045",
      taxpayer: "Juan Dela Cruz",
      propertyAddress: "Lot 5, Block 3, Magarao, Camarines Sur",
      amount: 5250.00,
      paymentMethod: "Cash",
      paymentDate: "2026-05-12T10:30:00",
      fiscalYear: "2026",
      cashier: "Maria Santos",
      basicRPT: 2500,
      sef: 2500,
      penalties: 250,
      discount: 0,
    },
    {
      id: "2",
      orNumber: "OR-2026-001233",
      pin: "001-2024-0123",
      taxpayer: "Maria Santos",
      propertyAddress: "Lot 12, Barangay San Juan, Magarao",
      amount: 3400.00,
      paymentMethod: "Check",
      paymentDate: "2026-05-12T09:15:00",
      fiscalYear: "2026",
      cashier: "Pedro Reyes",
      basicRPT: 1800,
      sef: 1800,
      penalties: 0,
      discount: 200,
    },
    {
      id: "3",
      orNumber: "OR-2026-001232",
      pin: "001-2024-0089",
      taxpayer: "Pedro Reyes",
      propertyAddress: "Block 7, Poblacion, Magarao",
      amount: 2100.00,
      paymentMethod: "Cash",
      paymentDate: "2026-05-11T14:45:00",
      fiscalYear: "2026",
      cashier: "Maria Santos",
      basicRPT: 1000,
      sef: 1000,
      penalties: 100,
      discount: 0,
    },
    {
      id: "4",
      orNumber: "OR-2026-001231",
      pin: "001-2024-0234",
      taxpayer: "Ana Garcia",
      propertyAddress: "Lot 23, Barangay Centro, Magarao",
      amount: 6750.00,
      paymentMethod: "Cash",
      paymentDate: "2026-05-11T11:20:00",
      fiscalYear: "2026",
      cashier: "Pedro Reyes",
      basicRPT: 3200,
      sef: 3200,
      penalties: 350,
      discount: 0,
    },
    {
      id: "5",
      orNumber: "OR-2025-008923",
      pin: "001-2023-0456",
      taxpayer: "Roberto Cruz",
      propertyAddress: "Lot 8, Barangay San Pantaleon, Magarao",
      amount: 4500.00,
      paymentMethod: "Check",
      paymentDate: "2025-12-15T13:30:00",
      fiscalYear: "2025",
      cashier: "Maria Santos",
      basicRPT: 2100,
      sef: 2100,
      penalties: 0,
      discount: 300,
    },
  ];

  const filteredRecords = paymentRecords.filter(record => {
    const matchesSearch =
      record.orNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.pin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.taxpayer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesYear = filterYear === "all" || record.fiscalYear === filterYear;

    return matchesSearch && matchesYear;
  });

  const totalCollections = filteredRecords.reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="font-['Poppins'] text-[14px] text-gray-700 mb-2 block">
              Search Payments
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by OR Number, PIN, or Taxpayer Name"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#059467] focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="font-['Poppins'] text-[14px] text-gray-700 mb-2 block">
              Filter by Year
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#059467] focus:border-transparent appearance-none"
              >
                <option value="all">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
          <p className="font-['Poppins'] text-[14px] text-gray-600 mb-1">Total Transactions</p>
          <p className="font-['Poppins'] font-semibold text-[24px] text-gray-900">
            {filteredRecords.length}
          </p>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
          <p className="font-['Poppins'] text-[14px] text-gray-600 mb-1">Total Collections</p>
          <p className="font-['Poppins'] font-semibold text-[24px] text-[#059467]">
            ₱{totalCollections.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6 flex items-center justify-center">
          <button className="flex items-center gap-2 text-[#059467] hover:text-[#048358] font-['Poppins'] font-medium">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Payment Records Table */}
      <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 px-6 py-3">
                  OR Number
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 px-6 py-3">
                  PIN
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 px-6 py-3">
                  Taxpayer
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 px-6 py-3">
                  Amount
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 px-6 py-3">
                  Payment Method
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 px-6 py-3">
                  Date
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="font-['Poppins'] text-[14px] text-gray-900 px-6 py-4">
                    {record.orNumber}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-600 px-6 py-4">
                    {record.pin}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-900 px-6 py-4">
                    {record.taxpayer}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-900 px-6 py-4">
                    ₱{record.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-600 px-6 py-4">
                    {record.paymentMethod}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-600 px-6 py-4">
                    {new Date(record.paymentDate).toLocaleDateString('en-PH')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedPayment(record)}
                      className="text-[#059467] hover:text-[#048358] flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="font-['Poppins'] text-[14px]">View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <p className="font-['Poppins'] text-gray-500 text-[16px]">
              No payment records found
            </p>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-['Poppins'] font-bold text-[24px] text-gray-900">
                  Payment Details
                </h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">OR Number</p>
                    <p className="font-['Poppins'] text-[16px] text-[#059467] font-semibold">
                      {selectedPayment.orNumber}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">Payment Date</p>
                    <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">
                      {new Date(selectedPayment.paymentDate).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">PIN</p>
                    <p className="font-['Poppins'] text-[14px] text-gray-900">
                      {selectedPayment.pin}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">Fiscal Year</p>
                    <p className="font-['Poppins'] text-[14px] text-gray-900">
                      {selectedPayment.fiscalYear}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-['Poppins'] text-[12px] text-gray-600">Taxpayer Name</p>
                    <p className="font-['Poppins'] text-[16px] text-gray-900 font-medium">
                      {selectedPayment.taxpayer}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-['Poppins'] text-[12px] text-gray-600">Property Address</p>
                    <p className="font-['Poppins'] text-[14px] text-gray-900">
                      {selectedPayment.propertyAddress}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">Payment Method</p>
                    <p className="font-['Poppins'] text-[14px] text-gray-900">
                      {selectedPayment.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">Processed By</p>
                    <p className="font-['Poppins'] text-[14px] text-gray-900">
                      {selectedPayment.cashier}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2 mt-6">
                  <div className="flex justify-between">
                    <span className="font-['Poppins'] text-[14px] text-gray-600">Basic RPT</span>
                    <span className="font-['Poppins'] text-[14px] text-gray-900">
                      ₱{selectedPayment.basicRPT.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-['Poppins'] text-[14px] text-gray-600">SEF Tax</span>
                    <span className="font-['Poppins'] text-[14px] text-gray-900">
                      ₱{selectedPayment.sef.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {selectedPayment.penalties > 0 && (
                    <div className="flex justify-between">
                      <span className="font-['Poppins'] text-[14px] text-gray-600">Penalties</span>
                      <span className="font-['Poppins'] text-[14px] text-gray-900">
                        ₱{selectedPayment.penalties.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {selectedPayment.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="font-['Poppins'] text-[14px] text-green-600">Discount</span>
                      <span className="font-['Poppins'] text-[14px] text-green-600">
                        -₱{selectedPayment.discount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div className="h-px bg-gray-300 my-2" />
                  <div className="flex justify-between">
                    <span className="font-['Poppins'] font-bold text-[16px] text-gray-900">Total Amount</span>
                    <span className="font-['Poppins'] font-bold text-[18px] text-[#059467]">
                      ₱{selectedPayment.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button className="flex-1 bg-[#059467] text-white py-3 px-6 rounded-lg font-['Poppins'] font-medium text-[16px] hover:bg-[#048358] transition-colors">
                    Print Receipt
                  </button>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-['Poppins'] font-medium text-[16px] hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
