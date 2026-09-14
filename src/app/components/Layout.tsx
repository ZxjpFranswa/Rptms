import { useState } from "react";
import { LogOut, Home, CreditCard, FileText, Menu, X, CheckSquare, DollarSign, ScrollText } from "lucide-react";
import img5306453411222291363761758256220130317233290553N2 from "../../imports/TreasurerDb/bf12f785c123e6062f357708cc78ef68d7a2917a.png";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "history", label: "Payment History", icon: FileText },
    { id: "approvals", label: "Treasurer Approvals", icon: CheckSquare },
    { id: "collections", label: "Daily Collections", icon: DollarSign },
    { id: "audit", label: "Audit Log", icon: ScrollText },
  ];

  return (
    <div className="flex h-screen bg-[#f5f7fa] overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col bg-[#14522d] w-[321px] flex-shrink-0">
        {/* Header */}
        <div className="border-b border-[rgba(255,255,255,0.13)] px-[21px] py-[12px] h-[82px] flex items-center gap-3">
          <img
            src={img5306453411222291363761758256220130317233290553N2}
            alt="Logo"
            className="w-[62px] h-[58px] object-cover"
          />
          <div>
            <h1 className="font-['Poppins'] font-bold text-white text-[18px] tracking-[0.9px]">
              Magarao Office
            </h1>
            <p className="font-['Poppins'] font-light text-white text-[15px] tracking-[0.75px]">
              Tax & Fees
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-[14px] pt-[35px]">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-4 px-[27px] py-[12px] rounded-[8px] transition-colors ${
                    currentPage === item.id
                      ? "bg-[#059467]"
                      : "hover:bg-[#059467]/20"
                  }`}
                >
                  <Icon className="w-[34px] h-[34px] text-white" />
                  <span className="font-['Poppins'] text-white text-[18px] tracking-[0.9px]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="px-[27px] pb-[67px]">
          <button className="w-[136px] h-[48px] bg-white border border-[#059467] rounded-[8px] flex items-center justify-center gap-2 hover:bg-[#059467]/10 transition-colors">
            <LogOut className="w-[17px] h-[17px] text-[#059467]" />
            <span className="font-['Poppins'] text-[#059467] text-[18px] tracking-[0.9px]">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 bg-[#14522d] w-[280px] flex flex-col">
            {/* Mobile Header */}
            <div className="border-b border-[rgba(255,255,255,0.13)] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={img5306453411222291363761758256220130317233290553N2}
                  alt="Logo"
                  className="w-[50px] h-[46px] object-cover"
                />
                <div>
                  <h1 className="font-['Poppins'] font-bold text-white text-[16px]">
                    Magarao Office
                  </h1>
                  <p className="font-['Poppins'] font-light text-white text-[13px]">
                    Tax & Fees
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-white p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-4 pt-6">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-[8px] transition-colors ${
                        currentPage === item.id
                          ? "bg-[#059467]"
                          : "hover:bg-[#059467]/20"
                      }`}
                    >
                      <Icon className="w-[28px] h-[28px] text-white" />
                      <span className="font-['Poppins'] text-white text-[16px]">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Mobile Logout */}
            <div className="px-4 pb-8">
              <button className="w-full h-[48px] bg-white border border-[#059467] rounded-[8px] flex items-center justify-center gap-2">
                <LogOut className="w-[17px] h-[17px] text-[#059467]" />
                <span className="font-['Poppins'] text-[#059467] text-[16px]">
                  Logout
                </span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-[#e5e7eb] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] h-[81px] flex items-center px-4 lg:px-8 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-4 text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="font-['Poppins'] font-semibold text-black text-[24px] lg:text-[32px] tracking-[1.6px]">
            {navItems.find(item => item.id === currentPage)?.label || "Dashboard"}
          </h2>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-[34px]">
          {children}
        </main>
      </div>
    </div>
  );
}
