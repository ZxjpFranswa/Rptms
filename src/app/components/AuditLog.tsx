import { useState } from "react";
import { Search, Filter, FileText, AlertCircle } from "lucide-react";

interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: "Tax Bill" | "Payment" | "Exemption" | "Penalty Waiver" | "Tax Adjustment";
  entityId: string;
  changes: string;
  reason: string;
  ipAddress: string;
}

export default function AuditLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  const auditEntries: AuditEntry[] = [
    {
      id: "LOG-2026-001234",
      timestamp: "2026-05-12T14:30:15",
      userId: "USER-001",
      userName: "Maria Santos (Treasurer)",
      action: "Approved Tax Exemption",
      entityType: "Exemption",
      entityId: "REQ-2026-001",
      changes: "Tax amount reduced from ₱15,000.00 to ₱0.00",
      reason: "Government-owned land, exempt from property tax per LGC Section 234",
      ipAddress: "192.168.1.45",
    },
    {
      id: "LOG-2026-001235",
      timestamp: "2026-05-12T13:45:22",
      userId: "USER-002",
      userName: "Pedro Cruz (Cashier)",
      action: "Processed Payment",
      entityType: "Payment",
      entityId: "OR-2026-001234",
      changes: "Payment of ₱5,250.00 received for PIN 001-2024-0045",
      reason: "Regular payment transaction",
      ipAddress: "192.168.1.52",
    },
    {
      id: "LOG-2026-001236",
      timestamp: "2026-05-12T11:20:08",
      userId: "USER-003",
      userName: "Ana Lopez (Revenue Clerk)",
      action: "Manual Penalty Adjustment",
      entityType: "Penalty Waiver",
      entityId: "PIN-001-2024-0089",
      changes: "Penalty reduced from ₱450.00 to ₱100.00",
      reason: "Taxpayer was hospitalized during payment period",
      ipAddress: "192.168.1.38",
    },
    {
      id: "LOG-2026-001237",
      timestamp: "2026-05-12T10:15:33",
      userId: "USER-003",
      userName: "Ana Lopez (Revenue Clerk)",
      action: "Manual Discount Applied",
      entityType: "Tax Adjustment",
      entityId: "PIN-001-2024-0123",
      changes: "Early payment discount of ₱200.00 applied",
      reason: "Payment made within early bird incentive period",
      ipAddress: "192.168.1.38",
    },
    {
      id: "LOG-2026-001238",
      timestamp: "2026-05-11T16:45:12",
      userId: "USER-001",
      userName: "Maria Santos (Treasurer)",
      action: "Approved Penalty Waiver",
      entityType: "Penalty Waiver",
      entityId: "REQ-2026-002",
      changes: "Penalty reduced from ₱450.00 to ₱100.00 for PIN 001-2024-0089",
      reason: "Medical emergency documentation provided",
      ipAddress: "192.168.1.45",
    },
    {
      id: "LOG-2026-001239",
      timestamp: "2026-05-11T15:20:44",
      userId: "USER-003",
      userName: "Ana Lopez (Revenue Clerk)",
      action: "Tax Bill Correction",
      entityType: "Tax Adjustment",
      entityId: "PIN-001-2024-0234",
      changes: "Total due adjusted from ₱6,750.00 to ₱5,200.00",
      reason: "Historical billing error - property was double-assessed in 2025",
      ipAddress: "192.168.1.38",
    },
    {
      id: "LOG-2026-001240",
      timestamp: "2026-05-11T14:10:27",
      userId: "USER-002",
      userName: "Pedro Cruz (Cashier)",
      action: "Processed Payment",
      entityType: "Payment",
      entityId: "OR-2026-001232",
      changes: "Payment of ₱2,100.00 received for PIN 001-2024-0089",
      reason: "Partial payment transaction",
      ipAddress: "192.168.1.52",
    },
    {
      id: "LOG-2026-001241",
      timestamp: "2026-05-10T16:30:55",
      userId: "USER-001",
      userName: "Maria Santos (Treasurer)",
      action: "Rejected Tax Exemption",
      entityType: "Exemption",
      entityId: "REQ-2026-005",
      changes: "Tax exemption request denied, amount remains ₱12,000.00",
      reason: "Insufficient documentation for exemption claim",
      ipAddress: "192.168.1.45",
    },
  ];

  const filteredEntries = auditEntries.filter(entry => {
    const matchesSearch =
      entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.changes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterAction === "all" || entry.action === filterAction;

    return matchesSearch && matchesFilter;
  });

  const actionTypes = [...new Set(auditEntries.map(e => e.action))];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
        <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900 mb-4">
          Search & Filter Audit Logs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-['Poppins'] text-[14px] text-gray-700 mb-2 block">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by user, entity ID, action, or changes"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#059467] focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="font-['Poppins'] text-[14px] text-gray-700 mb-2 block">
              Filter by Action
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#059467] focus:border-transparent appearance-none"
              >
                <option value="all">All Actions</option>
                {actionTypes.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
          <p className="font-['Poppins'] text-[14px] text-gray-600 mb-1">Total Entries</p>
          <p className="font-['Poppins'] font-semibold text-[24px] text-gray-900">
            {filteredEntries.length}
          </p>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
          <p className="font-['Poppins'] text-[14px] text-gray-600 mb-1">Approvals</p>
          <p className="font-['Poppins'] font-semibold text-[24px] text-green-600">
            {auditEntries.filter(e => e.action.includes("Approved")).length}
          </p>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
          <p className="font-['Poppins'] text-[14px] text-gray-600 mb-1">Adjustments</p>
          <p className="font-['Poppins'] font-semibold text-[24px] text-amber-600">
            {auditEntries.filter(e => e.action.includes("Adjustment") || e.action.includes("Correction")).length}
          </p>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
          <p className="font-['Poppins'] text-[14px] text-gray-600 mb-1">Payments</p>
          <p className="font-['Poppins'] font-semibold text-[24px] text-blue-600">
            {auditEntries.filter(e => e.action.includes("Payment")).length}
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900">
            Change Log & Audit Trail
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 px-6 py-3">
                  Timestamp
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 px-6 py-3">
                  User
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 px-6 py-3">
                  Action
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 px-6 py-3">
                  Entity
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 px-6 py-3">
                  Changes
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 px-6 py-3">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="font-['Poppins'] text-[14px] text-gray-600 px-6 py-4">
                    {new Date(entry.timestamp).toLocaleString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-900 px-6 py-4">
                    <div>
                      <p className="font-medium">{entry.userName.split('(')[0].trim()}</p>
                      <p className="text-[12px] text-gray-500">{entry.userId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-['Poppins'] font-medium ${
                        entry.action.includes("Approved")
                          ? "bg-green-100 text-green-800"
                          : entry.action.includes("Rejected")
                          ? "bg-red-100 text-red-800"
                          : entry.action.includes("Adjustment") || entry.action.includes("Correction")
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {entry.action}
                    </span>
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-900 px-6 py-4">
                    <div>
                      <p className="font-medium">{entry.entityType}</p>
                      <p className="text-[12px] text-gray-500">{entry.entityId}</p>
                    </div>
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-700 px-6 py-4 max-w-xs">
                    <p className="truncate">{entry.changes}</p>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedEntry(entry)}
                      className="text-[#059467] hover:text-[#048358] flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="font-['Poppins'] text-[14px]">View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="font-['Poppins'] text-gray-500 text-[16px]">
              No audit entries found
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-['Poppins'] font-bold text-[24px] text-gray-900">
                    Audit Entry Details
                  </h3>
                  <p className="font-['Poppins'] text-[14px] text-gray-600">
                    {selectedEntry.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">Timestamp</p>
                    <p className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                      {new Date(selectedEntry.timestamp).toLocaleString('en-PH', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">User ID</p>
                    <p className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                      {selectedEntry.userId}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">User Name</p>
                    <p className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                      {selectedEntry.userName}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">IP Address</p>
                    <p className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                      {selectedEntry.ipAddress}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="font-['Poppins'] text-[12px] text-blue-600 mb-2">Action Performed</p>
                  <p className="font-['Poppins'] text-[18px] text-blue-900 font-semibold">
                    {selectedEntry.action}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">Entity Type</p>
                    <p className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                      {selectedEntry.entityType}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">Entity ID</p>
                    <p className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                      {selectedEntry.entityId}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-['Poppins'] text-[12px] text-gray-600 mb-2">Changes Made</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-['Poppins'] text-[14px] text-gray-900">
                      {selectedEntry.changes}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-['Poppins'] text-[12px] text-gray-600 mb-2">Reason / Justification</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-['Poppins'] text-[14px] text-gray-900">
                      {selectedEntry.reason}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-['Poppins'] font-medium text-[16px] hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
