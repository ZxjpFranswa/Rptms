import { useState } from "react";
import Login, { UserRole } from "./components/Login";
import RoleBasedLayout from "./components/RoleBasedLayout";
import Dashboard from "./components/Dashboard";
import CashierPayment from "./components/CashierPayment";
import ClerkSOA from "./components/ClerkSOA";
import ClerkApprovalNotifications from "./components/ClerkApprovalNotifications";
import PaymentHistory from "./components/PaymentHistory";
import TreasurerApprovals from "./components/TreasurerApprovals";
import DailyCollectionReport from "./components/DailyCollectionReport";
import AuditLog from "./components/AuditLog";
import TaxpayerPortal from "./components/TaxpayerPortal";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState("");
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [soaPrefillApprovalId, setSoaPrefillApprovalId] = useState<string | null>(null);

  const handleOpenSOAFromApproval = (approvalId: string) => {
    setSoaPrefillApprovalId(approvalId);
    setCurrentPage("soa");
  };

  const handleLogin = (role: UserRole, name: string) => {
    setUserRole(role);
    setUserName(name);
    setIsLoggedIn(true);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName("");
    setCurrentPage("dashboard");
  };

  const renderPage = () => {
    if (!userRole) return <Dashboard />;

    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;

      // Cashier pages
      case "payment":
        return userRole === "cashier" ? <CashierPayment /> : <Dashboard />;

      // Revenue Clerk pages
      case "soa":
        return userRole === "clerk" ? (
          <ClerkSOA
            prefillApprovalId={soaPrefillApprovalId}
            onPrefillConsumed={() => setSoaPrefillApprovalId(null)}
          />
        ) : (
          <Dashboard />
        );
      case "approvals-status":
        return userRole === "clerk" ? (
          <ClerkApprovalNotifications
            onOpenGenerateSOA={handleOpenSOAFromApproval}
            isActive={currentPage === "approvals-status"}
          />
        ) : (
          <Dashboard />
        );

      // Treasurer pages
      case "approvals":
        return userRole === "treasurer" ? <TreasurerApprovals /> : <Dashboard />;
      case "collections":
        return userRole === "treasurer" ? <DailyCollectionReport /> : <Dashboard />;
      case "audit":
        return userRole === "treasurer" ? <AuditLog /> : <Dashboard />;

      // Shared pages
      case "history":
        return <PaymentHistory />;

      default:
        return <Dashboard />;
    }
  };

  if (!isLoggedIn || !userRole) {
    return <Login onLogin={handleLogin} />;
  }

  // Taxpayer has a different portal UI
  if (userRole === "taxpayer") {
    return (
      <RoleBasedLayout
        currentPage="portal"
        onNavigate={setCurrentPage}
        userRole={userRole}
        userName={userName}
        onLogout={handleLogout}
      >
        <TaxpayerPortal />
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      userRole={userRole}
      userName={userName}
      onLogout={handleLogout}
    >
      {renderPage()}
    </RoleBasedLayout>
  );
}
