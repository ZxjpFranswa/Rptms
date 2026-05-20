import { TrendingUp, DollarSign, Users, AlertCircle, Target } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <h3 className="font-['Poppins'] text-gray-600 text-[14px] mb-2">{title}</h3>
      <p className="font-['Poppins'] font-semibold text-[28px] text-gray-900 mb-1">
        {value}
      </p>
      <p className="font-['Poppins'] text-[12px] text-gray-500">{subtitle}</p>
    </div>
  );
}

interface RecentPayment {
  id: string;
  pin: string;
  taxpayer: string;
  amount: number;
  date: string;
  status: "Paid" | "Partial" | "Delinquent";
}

export default function Dashboard() {
  const stats = [
    {
      title: "Today's Collections",
      value: "₱45,250.00",
      subtitle: "+12% from yesterday",
      icon: <DollarSign className="w-6 h-6 text-white" />,
      color: "bg-[#059467]",
    },
    {
      title: "Total Taxpayers",
      value: "1,247",
      subtitle: "Active accounts",
      icon: <Users className="w-6 h-6 text-white" />,
      color: "bg-blue-500",
    },
    {
      title: "Pending Payments",
      value: "₱128,500.00",
      subtitle: "Due this quarter",
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      color: "bg-amber-500",
    },
    {
      title: "Delinquent Accounts",
      value: "23",
      subtitle: "Requires attention",
      icon: <AlertCircle className="w-6 h-6 text-white" />,
      color: "bg-red-500",
    },
  ];

  const recentPayments: RecentPayment[] = [
    {
      id: "OR-2026-001234",
      pin: "001-2024-0045",
      taxpayer: "Juan Dela Cruz",
      amount: 5250.00,
      date: "2026-05-12",
      status: "Paid",
    },
    {
      id: "OR-2026-001233",
      pin: "001-2024-0123",
      taxpayer: "Maria Santos",
      amount: 3800.00,
      date: "2026-05-12",
      status: "Paid",
    },
    {
      id: "OR-2026-001232",
      pin: "001-2024-0089",
      taxpayer: "Pedro Reyes",
      amount: 2100.00,
      date: "2026-05-11",
      status: "Partial",
    },
    {
      id: "OR-2026-001231",
      pin: "001-2024-0234",
      taxpayer: "Ana Garcia",
      amount: 6750.00,
      date: "2026-05-11",
      status: "Paid",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
        <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900 mb-4">
          Recent Payments
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  OR Number
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  PIN
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Taxpayer
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Amount
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Date
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100">
                  <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">
                    {payment.id}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-600 py-4">
                    {payment.pin}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">
                    {payment.taxpayer}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">
                    ₱{payment.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-600 py-4">
                    {new Date(payment.date).toLocaleDateString('en-PH')}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-['Poppins'] font-medium ${
                        payment.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : payment.status === "Partial"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
          <h3 className="font-['Poppins'] font-semibold text-[18px] text-gray-900 mb-4">
            Collection Summary (This Month)
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-['Poppins'] text-[14px] text-gray-600">Basic RPT</span>
              <span className="font-['Poppins'] font-medium text-[14px] text-gray-900">₱285,000.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-['Poppins'] text-[14px] text-gray-600">SEF Tax</span>
              <span className="font-['Poppins'] font-medium text-[14px] text-gray-900">₱285,000.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-['Poppins'] text-[14px] text-gray-600">Penalties</span>
              <span className="font-['Poppins'] font-medium text-[14px] text-gray-900">₱12,500.00</span>
            </div>
            <div className="h-px bg-gray-200 my-2" />
            <div className="flex justify-between items-center">
              <span className="font-['Poppins'] font-semibold text-[16px] text-gray-900">Total</span>
              <span className="font-['Poppins'] font-semibold text-[16px] text-[#059467]">₱582,500.00</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
          <h3 className="font-['Poppins'] font-semibold text-[18px] text-gray-900 mb-4">
            Payment Methods
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-['Poppins'] text-[14px] text-gray-600">Cash</span>
              <span className="font-['Poppins'] font-medium text-[14px] text-gray-900">₱582,500.00 (100%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Target vs Actual */}
      <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-6 h-6 text-[#059467]" />
          <h3 className="font-['Poppins'] font-semibold text-[18px] text-gray-900">
            Real-Time Collection Dashboard - Actual vs Projected
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-['Poppins'] text-[14px] text-gray-600">Basic RPT</span>
                <span className="font-['Poppins'] text-[12px] text-gray-500">95% of target</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: '95%' }}></div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="font-['Poppins'] text-[12px] text-gray-600">Actual: ₱285,000</span>
                <span className="font-['Poppins'] text-[12px] text-gray-600">Target: ₱300,000</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-['Poppins'] text-[14px] text-gray-600">SEF Tax</span>
                <span className="font-['Poppins'] text-[12px] text-gray-500">95% of target</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-purple-500 h-3 rounded-full" style={{ width: '95%' }}></div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="font-['Poppins'] text-[12px] text-gray-600">Actual: ₱285,000</span>
                <span className="font-['Poppins'] text-[12px] text-gray-600">Target: ₱300,000</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-['Poppins'] text-[14px] text-gray-600">Total Revenue</span>
                <span className="font-['Poppins'] text-[12px] text-green-600 font-semibold">97% of target</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-[#059467] h-3 rounded-full" style={{ width: '97%' }}></div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="font-['Poppins'] text-[12px] text-gray-600">Actual: ₱582,500</span>
                <span className="font-['Poppins'] text-[12px] text-gray-600">Target: ₱600,000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="font-['Poppins'] text-[14px] text-green-800">
            <span className="font-semibold">On Track:</span> Revenue collection is 97% of monthly target with 18 days remaining. Projected to exceed target by 5%.
          </p>
        </div>
      </div>
    </div>
  );
}
