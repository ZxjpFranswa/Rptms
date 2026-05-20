import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, FileText } from "lucide-react";
import {
  ApprovalRequest,
  getAllApprovalRequests,
  updateApprovalRequestStatus,
  subscribeToApprovalUpdates,
} from "../utils/approvalRequests";

export default function TreasurerApprovals() {
  // NOTE: Approval requests are submitted by Revenue Clerks when they:
  // 1. Need to waive or reduce penalties for taxpayers with valid reasons
  // 2. Need to adjust tax amounts due to billing errors or corrections
  // Revenue Clerks use the "Request Treasurer Approval" button in the Generate SOA window

  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");

  // Load approval requests on mount and subscribe to updates
  useEffect(() => {
    setRequests(getAllApprovalRequests());

    // Subscribe to real-time updates
    const unsubscribe = subscribeToApprovalUpdates(() => {
      setRequests(getAllApprovalRequests());
    });

    return unsubscribe;
  }, []);

  const handleApprove = (requestId: string) => {
    if (!approvalNotes.trim()) {
      alert("Please provide approval notes");
      return;
    }

    const updated = updateApprovalRequestStatus(requestId, "Approved", approvalNotes);

    if (updated) {
      alert(`Request ${requestId} has been approved. The Revenue Clerk will be notified.`);
      setSelectedRequest(null);
      setApprovalNotes("");
    } else {
      alert("Error: Could not find the request");
    }
  };

  const handleReject = (requestId: string) => {
    if (!approvalNotes.trim()) {
      alert("Please provide rejection reason");
      return;
    }

    const updated = updateApprovalRequestStatus(requestId, "Rejected", approvalNotes);

    if (updated) {
      alert(`Request ${requestId} has been rejected. The Revenue Clerk will be notified.`);
      setSelectedRequest(null);
      setApprovalNotes("");
    } else {
      alert("Error: Could not find the request");
    }
  };

  const pendingRequests = requests.filter(r => r.status === "Pending");
  const processedRequests = requests.filter(r => r.status !== "Pending");

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="font-['Poppins'] text-[14px] text-blue-800">
          <span className="font-semibold">Approval Workflow:</span> Revenue Clerks submit requests when generating SOAs that require penalty waivers or tax adjustments. Review each request carefully before approving or rejecting.
        </p>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900">
            Pending Approvals
          </h3>
          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-['Poppins'] text-[14px] font-medium">
            {pendingRequests.length} Pending
          </span>
        </div>

        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <div
              key={request.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-[#059467] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <h4 className="font-['Poppins'] font-semibold text-[16px] text-gray-900">
                      {request.requestType}
                    </h4>
                    <span className="text-[12px] font-['Poppins'] text-gray-500">
                      {request.id}
                    </span>
                  </div>
                  <p className="font-['Poppins'] text-[14px] text-gray-700 mb-1">
                    <span className="font-medium">Taxpayer:</span> {request.taxpayer}
                  </p>
                  <p className="font-['Poppins'] text-[14px] text-gray-700 mb-1">
                    <span className="font-medium">PIN:</span> {request.pin}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-['Poppins'] text-[12px] text-gray-500">
                    {new Date(request.requestDate).toLocaleDateString('en-PH')}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">Current Amount</p>
                    <p className="font-['Poppins'] text-[16px] font-semibold text-gray-900">
                      ₱{request.currentAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">Proposed Amount</p>
                    <p className="font-['Poppins'] text-[16px] font-semibold text-[#059467]">
                      ₱{request.proposedAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Reason</p>
                  <p className="font-['Poppins'] text-[14px] text-gray-900">
                    {request.reason}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="font-['Poppins'] text-[12px] text-gray-600">
                  Requested by: {request.requestedBy}
                </p>
                <button
                  onClick={() => {
                    setSelectedRequest(request);
                    setApprovalNotes("");
                  }}
                  className="bg-[#059467] text-white px-4 py-2 rounded-lg font-['Poppins'] text-[14px] hover:bg-[#048358] transition-colors"
                >
                  Review Request
                </button>
              </div>
            </div>
          ))}

          {pendingRequests.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="font-['Poppins'] text-gray-500 text-[16px]">
                No pending approval requests
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Processed Requests */}
      <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
        <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900 mb-4">
          Recent Decisions
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Request ID
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Type
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Taxpayer
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Amount Adjustment
                </th>
                <th className="font-['Poppins'] text-left text-[14px] font-medium text-gray-600 pb-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {processedRequests.map((request) => (
                <tr key={request.id} className="border-b border-gray-100">
                  <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">
                    {request.id}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-600 py-4">
                    {request.requestType}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">
                    {request.taxpayer}
                  </td>
                  <td className="font-['Poppins'] text-[14px] text-gray-900 py-4">
                    ₱{request.currentAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} →{' '}
                    ₱{request.proposedAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-['Poppins'] font-medium ${
                        request.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-['Poppins'] font-bold text-[24px] text-gray-900">
                    Review Request
                  </h3>
                  <p className="font-['Poppins'] text-[14px] text-gray-600">
                    {selectedRequest.id}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setApprovalNotes("");
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    <h4 className="font-['Poppins'] font-semibold text-[16px] text-gray-900">
                      {selectedRequest.requestType}
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-['Poppins'] text-[12px] text-gray-600">Taxpayer</p>
                      <p className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                        {selectedRequest.taxpayer}
                      </p>
                    </div>
                    <div>
                      <p className="font-['Poppins'] text-[12px] text-gray-600">PIN</p>
                      <p className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                        {selectedRequest.pin}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Current Amount</p>
                    <p className="font-['Poppins'] text-[20px] font-semibold text-gray-900">
                      ₱{selectedRequest.currentAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="font-['Poppins'] text-[12px] text-gray-600 mb-1">Proposed Amount</p>
                    <p className="font-['Poppins'] text-[20px] font-semibold text-[#059467]">
                      ₱{selectedRequest.proposedAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-['Poppins'] text-[12px] text-gray-600 mb-2">Reason for Request</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-['Poppins'] text-[14px] text-gray-900">
                      {selectedRequest.reason}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">Requested By</p>
                    <p className="font-['Poppins'] text-[14px] text-gray-900">
                      {selectedRequest.requestedBy}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[12px] text-gray-600">Request Date</p>
                    <p className="font-['Poppins'] text-[14px] text-gray-900">
                      {new Date(selectedRequest.requestDate).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="font-['Poppins'] text-[14px] text-gray-700 mb-2 block">
                    Treasurer's Notes / Decision Remarks
                  </label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#059467] focus:border-transparent"
                    placeholder="Enter your decision notes and justification..."
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="flex-1 bg-[#059467] text-white py-3 px-6 rounded-lg font-['Poppins'] font-medium text-[16px] hover:bg-[#048358] transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Request
                </button>
                <button
                  onClick={() => handleReject(selectedRequest.id)}
                  className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-['Poppins'] font-medium text-[16px] hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
