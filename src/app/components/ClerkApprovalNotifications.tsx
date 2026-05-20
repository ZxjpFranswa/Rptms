import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import {
  ApprovalRequest,
  getAllApprovalRequests,
  subscribeToApprovalUpdates,
} from "../utils/approvalRequests";

export default function ClerkApprovalNotifications() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<ApprovalRequest[]>([]);

  // Load approval requests on mount and subscribe to updates
  useEffect(() => {
    // Only show processed requests (Approved or Rejected)
    const allRequests = getAllApprovalRequests();
    const processedRequests = allRequests.filter(req => req.status !== "Pending");
    setNotifications(processedRequests);

    // Subscribe to real-time updates
    const unsubscribe = subscribeToApprovalUpdates(() => {
      const updated = getAllApprovalRequests();
      const processed = updated.filter(req => req.status !== "Pending");
      setNotifications(processed);
    });

    return unsubscribe;
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900">
          Approval Notifications
        </h3>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-['Poppins'] text-[14px] font-medium">
          {notifications.length} Total
        </span>
      </div>

      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-white border-2 rounded-lg overflow-hidden transition-colors ${
            notification.status === "Approved"
              ? "border-green-200"
              : "border-red-200"
          }`}
        >
          {/* Header */}
          <div
            className={`p-4 cursor-pointer ${
              notification.status === "Approved"
                ? "bg-green-50 hover:bg-green-100"
                : "bg-red-50 hover:bg-red-100"
            }`}
            onClick={() => toggleExpand(notification.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {notification.status === "Approved" ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-['Poppins'] font-semibold text-[16px] text-gray-900">
                      {notification.taxpayer}
                    </span>
                    <span className="font-['Poppins'] text-[12px] text-gray-500">
                      ({notification.pin})
                    </span>
                  </div>
                  <p className="font-['Poppins'] text-[14px] text-gray-700">
                    {notification.requestType} Request {notification.id} -{" "}
                    <span
                      className={`font-semibold ${
                        notification.status === "Approved"
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {notification.status.toUpperCase()}
                    </span>
                  </p>
                  <p className="font-['Poppins'] text-[12px] text-gray-500 mt-1">
                    Reviewed: {notification.reviewDate ? new Date(notification.reviewDate).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Pending'}
                  </p>
                </div>
              </div>
              {expandedId === notification.id ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </div>

          {/* Expanded Details */}
          {expandedId === notification.id && (
            <div className="p-4 border-t border-gray-200 space-y-4">
              {/* Amount Adjustment */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-['Poppins'] font-semibold text-[14px] text-gray-900 mb-2">
                  {notification.requestType}
                </p>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div>
                    <p className="font-['Poppins'] text-[11px] text-gray-600">Original Amount</p>
                    <p className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                      ₱{notification.currentAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[11px] text-gray-600">Requested Amount</p>
                    <p className="font-['Poppins'] text-[14px] text-blue-600 font-medium">
                      ₱{notification.proposedAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[11px] text-gray-600">Final Amount</p>
                    <p className={`font-['Poppins'] text-[14px] font-medium ${
                      notification.status === "Approved" ? "text-green-600" : "text-red-600"
                    }`}>
                      {notification.status === "Approved"
                        ? `₱${notification.proposedAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                        : `₱${notification.currentAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                      }
                    </p>
                  </div>
                </div>
                <p className="font-['Poppins'] text-[12px] text-gray-700 italic">
                  Reason: {notification.reason}
                </p>
              </div>

              {/* Treasurer Notes */}
              <div className={`rounded-lg p-4 ${
                notification.status === "Approved"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}>
                <p className="font-['Poppins'] font-semibold text-[14px] text-gray-900 mb-2">
                  Treasurer's Notes
                </p>
                <p className="font-['Poppins'] text-[14px] text-gray-700">
                  {notification.treasurerNotes || 'No additional notes provided'}
                </p>
              </div>

              {/* Action Summary */}
              <div className={`border-t pt-4 ${
                notification.status === "Approved"
                  ? "border-green-200"
                  : "border-red-200"
              }`}>
                <p className="font-['Poppins'] text-[13px] text-gray-700">
                  {notification.status === "Approved" ? (
                    <>
                      <span className="font-semibold text-green-700">✓ Approved:</span> The adjusted amounts have been applied to the SOA. You can now send it to the taxpayer.
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-red-700">✗ Rejected:</span> The original amounts remain unchanged. Please review the Treasurer's notes and revise if needed.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}

      {notifications.length === 0 && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-['Poppins'] text-gray-500 text-[16px]">
            No approval notifications yet
          </p>
        </div>
      )}
    </div>
  );
}
