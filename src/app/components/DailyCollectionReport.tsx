import { useState } from "react";
import { CheckCircle, Download, Calendar, DollarSign } from "lucide-react";

interface DailyCollection {
  date: string;
  basicRPT: number;
  sef: number;
  penalties: number;
  discounts: number;
  totalGross: number;
  totalNet: number;
  transactionCount: number;
  status: "Pending" | "Cleared";
}

interface TransactionDetail {
  orNumber: string;
  pin: string;
  taxpayer: string;
  basicRPT: number;
  sef: number;
  penalties: number;
  discount: number;
  total: number;
  time: string;
}

export default function DailyCollectionReport() {
  const [selectedDate, setSelectedDate] = useState("2026-05-12");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [dailyCollections, setDailyCollections] = useState<DailyCollection[]>([
    {
      date: "2026-05-12",
      basicRPT: 22500,
      sef: 22500,
      penalties: 1250,
      discounts: 500,
      totalGross: 46250,
      totalNet: 45750,
      transactionCount: 8,
      status: "Pending",
    },
    {
      date: "2026-05-11",
      basicRPT: 18200,
      sef: 18200,
      penalties: 950,
      discounts: 300,
      totalGross: 37350,
      totalNet: 37050,
      transactionCount: 6,
      status: "Cleared",
    },
    {
      date: "2026-05-10",
      basicRPT: 15800,
      sef: 15800,
      penalties: 650,
      discounts: 400,
      totalGross: 32250,
      totalNet: 31850,
      transactionCount: 5,
      status: "Cleared",
    },
  ]);

  const todayTransactions: TransactionDetail[] = [
    {
      orNumber: "OR-2026-001234",
      pin: "001-2024-0045",
      taxpayer: "Juan Dela Cruz",
      basicRPT: 2500,
      sef: 2500,
      penalties: 250,
      discount: 0,
      total: 5250,
      time: "10:30 AM",
    },
    {
      orNumber: "OR-2026-001235",
      pin: "001-2024-0123",
      taxpayer: "Maria Santos",
      basicRPT: 1800,
      sef: 1800,
      penalties: 0,
      discount: 200,
      total: 3400,
      time: "11:15 AM",
    },
    {
      orNumber: "OR-2026-001236",
      pin: "001-2024-0312",
      taxpayer: "Carlos Mendoza",
      basicRPT: 4000,
      sef: 4000,
      penalties: 200,
      discount: 0,
      total: 8200,
      time: "01:45 PM",
    },
    {
      orNumber: "OR-2026-001237",
      pin: "001-2024-0156",
      taxpayer: "Roberto Cruz",
      basicRPT: 2100,
      sef: 2100,
      penalties: 0,
      discount: 300,
      total: 3900,
      time: "02:30 PM",
    },
  ];

  const handleMarkAsCleared = () => {
    setDailyCollections(prev =>
      prev.map(col =>
        col.date === selectedDate ? { ...col, status: "Cleared" as const } : col
      )
    );
    setShowClearConfirm(false);
    alert(`Collections for ${selectedDate} have been marked as Cleared`);
  };

  const selectedCollection = dailyCollections.find(c => c.date === selectedDate);

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Calendar className="w-6 h-6 text-[#059467]" />
            <div>
              <label className="font-['Poppins'] text-[14px] text-gray-700 mb-2 block">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-['Poppins'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#059467] focus:border-transparent"
              />
            </div>
          </div>
          {selectedCollection && selectedCollection.status === "Pending" && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="bg-[#059467] text-white px-6 py-2 rounded-lg font-['Poppins'] font-medium text-[16px] hover:bg-[#048358] transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Mark as Cleared
            </button>
          )}
          {selectedCollection && selectedCollection.status === "Cleared" && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-['Poppins'] font-medium text-[14px] flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Cleared & Reconciled
            </div>
          )}
        </div>
      </div>

      {/* Daily Abstract Summary */}
      {selectedCollection && (
        <>
          <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900">
                Daily Abstract of Collections
              </h3>
              <button className="flex items-center gap-2 text-[#059467] hover:text-[#048358] font-['Poppins'] font-medium">
                <Download className="w-5 h-5" />
                Export PDF
              </button>
            </div>

            <div className="mb-6">
              <p className="font-['Poppins'] text-[14px] text-gray-600 mb-1">Report Date</p>
              <p className="font-['Poppins'] text-[18px] text-gray-900 font-semibold">
                {new Date(selectedCollection.date).toLocaleDateString('en-PH', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="font-['Poppins'] text-[12px] text-blue-600 mb-1">Basic RPT</p>
                <p className="font-['Poppins'] text-[20px] font-semibold text-blue-900">
                  ₱{selectedCollection.basicRPT.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="font-['Poppins'] text-[12px] text-purple-600 mb-1">SEF Tax</p>
                <p className="font-['Poppins'] text-[20px] font-semibold text-purple-900">
                  ₱{selectedCollection.sef.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="font-['Poppins'] text-[12px] text-red-600 mb-1">Penalties</p>
                <p className="font-['Poppins'] text-[20px] font-semibold text-red-900">
                  ₱{selectedCollection.penalties.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="font-['Poppins'] text-[12px] text-green-600 mb-1">Discounts</p>
                <p className="font-['Poppins'] text-[20px] font-semibold text-green-900">
                  -₱{selectedCollection.discounts.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="bg-[#059467]/10 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-['Poppins'] text-[14px] text-gray-600 mb-1">Gross Collections</p>
                  <p className="font-['Poppins'] text-[24px] font-bold text-gray-900">
                    ₱{selectedCollection.totalGross.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="font-['Poppins'] text-[14px] text-gray-600 mb-1">Net Collections</p>
                  <p className="font-['Poppins'] text-[24px] font-bold text-[#059467]">
                    ₱{selectedCollection.totalNet.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="font-['Poppins'] text-[14px] text-gray-600 mb-1">Total Transactions</p>
                  <p className="font-['Poppins'] text-[24px] font-bold text-gray-900">
                    {selectedCollection.transactionCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
            <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900 mb-4">
              Transaction Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                      Time
                    </th>
                    <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                      OR Number
                    </th>
                    <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                      Taxpayer
                    </th>
                    <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                      Basic RPT
                    </th>
                    <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                      SEF
                    </th>
                    <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                      Penalties
                    </th>
                    <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                      Discount
                    </th>
                    <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {todayTransactions.map((transaction) => (
                    <tr key={transaction.orNumber} className="border-b border-gray-100">
                      <td className="font-['Poppins'] text-[14px] text-gray-600 py-4">
                        {transaction.time}
                      </td>
                      <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">
                        {transaction.orNumber}
                      </td>
                      <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">
                        {transaction.taxpayer}
                      </td>
                      <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">
                        ₱{transaction.basicRPT.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">
                        ₱{transaction.sef.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">
                        ₱{transaction.penalties.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="font-['Poppins'] text-[14px] text-green-600 py-4">
                        {transaction.discount > 0 ? '-' : ''}₱{transaction.discount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="font-['Poppins'] text-[14px] text-gray-900 font-semibold py-4">
                        ₱{transaction.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Recent Collections History */}
      <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
        <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900 mb-4">
          Collections History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Date
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Basic RPT
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  SEF
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Penalties
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Net Total
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Transactions
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {dailyCollections.map((collection) => (
                <tr key={collection.date} className="border-b border-gray-100">
                  <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">
                    {new Date(collection.date).toLocaleDateString('en-PH')}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">
                    ₱{collection.basicRPT.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">
                    ₱{collection.sef.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">
                    ₱{collection.penalties.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-900 font-semibold py-4">
                    ₱{collection.totalNet.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-600 py-4">
                    {collection.transactionCount}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-['Poppins'] font-medium ${
                        collection.status === "Cleared"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {collection.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && selectedCollection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-8 h-8 text-[#059467]" />
              <h3 className="font-['Poppins'] font-bold text-[20px] text-gray-900">
                Mark as Cleared
              </h3>
            </div>
            <p className="font-['Poppins'] text-[14px] text-gray-700 mb-6">
              Are you sure you want to mark the collections for{' '}
              <span className="font-semibold">
                {new Date(selectedCollection.date).toLocaleDateString('en-PH')}
              </span>{' '}
              as cleared and reconciled? This action confirms that all transactions for this day have been verified.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="font-['Poppins'] text-[12px] text-gray-600 mb-2">Total Net Collections</p>
              <p className="font-['Poppins'] text-[24px] font-bold text-[#059467]">
                ₱{selectedCollection.totalNet.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleMarkAsCleared}
                className="flex-1 bg-[#059467] text-white py-3 px-6 rounded-lg font-['Poppins'] font-medium text-[16px] hover:bg-[#048358] transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
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
