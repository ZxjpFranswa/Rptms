import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, FileEdit } from "lucide-react";
import {
  ApprovalRequest,
  getAllApprovalRequests,
  getEffectivePenaltyAmount,
  subscribeToApprovalUpdates,
} from "../utils/approvalRequests";

interface ClerkApprovalNotificationsProps {
  onOpenGenerateSOA: (approvalId: string) => void;
  /** When true, poll the API so Treasurer actions appear without a manual refresh. */
  isActive?: boolean;
}

export default function ClerkApprovalNotifications({
  onOpenGenerateSOA,
  isActive = true,
}: ClerkApprovalNotificationsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<ApprovalRequest[]>([]);
  const [processedRequests, setProcessedRequests] = useState<ApprovalRequest[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const allRequests = await getAllApprovalRequests();
        if (cancelled) return;
        setLoadError(null);
        setPendingRequests(allRequests.filter(req => req.status === "Pending"));
        setProcessedRequests(
          allRequests
            .filter(req => req.status !== "Pending")
            .sort(
              (a, b) =>
                new Date(b.reviewDate ?? b.requestDate).getTime() -
                new Date(a.reviewDate ?? a.requestDate).getTime()
            )
        );
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : "Could not load approval requests"
        );
      }
    };

    void load();

    const unsubscribe = subscribeToApprovalUpdates(() => {
      void load();
    });

    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);

    let interval: ReturnType<typeof setInterval> | undefined;
    if (isActive) {
      interval = setInterval(() => {
        void load();
      }, 4000);
    }

    return () => {
      cancelled = true;
      unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  const handleNotificationClick = (notification: ApprovalRequest) => {
    if (notification.status === "Approved") {
      onOpenGenerateSOA(notification.id);
    }
  };

  const renderNotificationCard = (notification: ApprovalRequest) => {
    const approvedPenalty = getEffectivePenaltyAmount(notification);
    const isApproved = notification.status === "Approved";
    const isPending = notification.status === "Pending";

    return (
      <div
        key={notification.id}
        className={`bg-white border-2 rounded-lg overflow-hidden transition-colors ${
          isPending
            ? "border-amber-200"
            : notification.status === "Approved"
              ? "border-green-200"
              : "border-red-200"
        }`}
      >
        <div
          className={`p-4 ${
            isApproved ? "cursor-pointer hover:shadow-md" : ""
          } ${
            isPending
              ? "bg-amber-50"
              : notification.status === "Approved"
                ? "bg-green-50 hover:bg-green-100"
                : "bg-red-50"
          }`}
              onClick={() => handleNotificationClick(notification)}
              role={isApproved ? "button" : undefined}
              tabIndex={isApproved ? 0 : undefined}
              onKeyDown={(e) => {
                if (isApproved && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  handleNotificationClick(notification);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {isPending ? (
                    <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  ) : notification.status === "Approved" ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-['Poppins'] font-semibold text-[16px] text-gray-900">
                        {notification.taxpayer}
                      </span>
                      <span className="font-['Poppins'] text-[12px] text-gray-500">
                        ({notification.pin})
                      </span>
                    </div>
                    <p className="font-['Poppins'] text-[14px] text-gray-700">
                      {notification.requestType} Request {notification.id} —{" "}
                      <span
                        className={`font-semibold ${
                          isPending
                            ? "text-amber-700"
                            : notification.status === "Approved"
                              ? "text-green-700"
                              : "text-red-700"
                        }`}
                      >
                        {notification.status.toUpperCase()}
                      </span>
                    </p>
                    {isPending && (
                      <p className="font-['Poppins'] text-[14px] text-amber-800 font-medium mt-1">
                        Requested penalty: ₱
                        {notification.proposedAmount.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    )}
                    {isApproved && (
                      <p className="font-['Poppins'] text-[14px] text-green-800 font-medium mt-1">
                        Approved penalty: ₱
                        {approvedPenalty.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </p>
                    )}
                    {isApproved && (
                      <p className="font-['Poppins'] text-[12px] text-[#059467] mt-1 flex items-center gap-1">
                        <FileEdit className="w-4 h-4" />
                        Click to open Generate SOA with this amount
                      </p>
                    )}
                    <p className="font-['Poppins'] text-[12px] text-gray-500 mt-1">
                      {isPending ? (
                        <>
                          Submitted:{" "}
                          {new Date(notification.requestDate).toLocaleDateString("en-PH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </>
                      ) : (
                        <>
                          Reviewed:{" "}
                          {notification.reviewDate
                            ? new Date(notification.reviewDate).toLocaleDateString("en-PH", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => toggleExpand(e, notification.id)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  aria-label={expandedId === notification.id ? "Collapse details" : "Expand details"}
                >
                  {expandedId === notification.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {expandedId === notification.id && (
              <div className="p-4 border-t border-gray-200 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-['Poppins'] font-semibold text-[14px] text-gray-900 mb-2">
                    {notification.requestType}
                  </p>
                  <div className="grid grid-cols-3 gap-4 mb-2">
                    <div>
                      <p className="font-['Poppins'] text-[11px] text-gray-600">Original Penalty</p>
                      <p className="font-['Poppins'] text-[14px] text-gray-900 font-medium">
                        ₱
                        {notification.currentAmount.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="font-['Poppins'] text-[11px] text-gray-600">Requested Penalty</p>
                      <p className="font-['Poppins'] text-[14px] text-blue-600 font-medium">
                        ₱
                        {notification.proposedAmount.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="font-['Poppins'] text-[11px] text-gray-600">Treasurer-Approved</p>
                      <p
                        className={`font-['Poppins'] text-[14px] font-medium ${
                          notification.status === "Approved" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        ₱{approvedPenalty.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <p className="font-['Poppins'] text-[12px] text-gray-700 italic">
                    Reason: {notification.reason}
                  </p>
                </div>

                <div
                  className={`rounded-lg p-4 ${
                    notification.status === "Approved"
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <p className="font-['Poppins'] font-semibold text-[14px] text-gray-900 mb-2">
                    Treasurer&apos;s Notes
                  </p>
                  <p className="font-['Poppins'] text-[14px] text-gray-700">
                    {notification.treasurerNotes || "No additional notes provided"}
                  </p>
                </div>

                <div
                  className={`border-t pt-4 ${
                    notification.status === "Approved" ? "border-green-200" : "border-red-200"
                  }`}
                >
                  <p className="font-['Poppins'] text-[13px] text-gray-700">
                    {notification.status === "Approved" ? (
                      <>
                        <span className="font-semibold text-green-700">Approved:</span> Open Generate
                        SOA to create and email the bill using the approved penalty of ₱
                        {approvedPenalty.toLocaleString("en-PH", { minimumFractionDigits: 2 })}.
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-red-700">Rejected:</span> The original
                        amounts remain unchanged. Please review the Treasurer&apos;s notes and revise
                        if needed.
                      </>
                    )}
                  </p>
                  {isApproved && (
                    <button
                      type="button"
                      onClick={() => onOpenGenerateSOA(notification.id)}
                      className="mt-3 w-full bg-[#059467] text-white py-2.5 px-4 rounded-lg font-['Poppins'] text-[14px] font-medium hover:bg-[#048358] transition-colors flex items-center justify-center gap-2"
                    >
                      <FileEdit className="w-4 h-4" />
                      Open Generate SOA
                    </button>
                  )}
                </div>
              </div>
            )}
      </div>
    );
  };

  const totalCount = pendingRequests.length + processedRequests.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-['Poppins'] font-semibold text-[20px] text-gray-900">
          Approval Status
        </h3>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-['Poppins'] text-[14px] font-medium">
          {totalCount} Total
        </span>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="font-['Poppins'] text-[14px] text-red-800">
            <span className="font-semibold">Could not load approvals:</span> {loadError}. Make sure
            the API server is running (<span className="font-mono text-[13px]">npm run dev</span>).
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="font-['Poppins'] text-[14px] text-blue-800">
          <span className="font-semibold">Approved requests:</span> Click a green notification to open{" "}
          <span className="font-semibold">Generate SOA</span> with the Treasurer-approved penalty. This
          page refreshes automatically when the Treasurer decides.
        </p>
      </div>

      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-['Poppins'] font-semibold text-[16px] text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Awaiting Treasurer ({pendingRequests.length})
          </h4>
          {pendingRequests.map(renderNotificationCard)}
        </div>
      )}

      {processedRequests.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-['Poppins'] font-semibold text-[16px] text-gray-900">
            Treasurer Decisions ({processedRequests.length})
          </h4>
          {processedRequests.map(renderNotificationCard)}
        </div>
      )}

      {totalCount === 0 && !loadError && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-['Poppins'] text-gray-500 text-[16px]">
            No approval requests yet. Submit one from Generate SOA when a penalty needs Treasurer
            approval.
          </p>
        </div>
      )}
    </div>
  );
}
