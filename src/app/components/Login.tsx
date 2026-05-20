import { useState } from "react";
import { LogIn } from "lucide-react";
import img5306453411222291363761758256220130317233290553N2 from "../../imports/TreasurerDb/bf12f785c123e6062f357708cc78ef68d7a2917a.png";

export type UserRole = "treasurer" | "clerk" | "cashier" | "taxpayer";

interface LoginProps {
  onLogin: (role: UserRole, name: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const roles: { value: UserRole; label: string }[] = [
    { value: "treasurer", label: "Municipal Treasurer" },
    { value: "clerk", label: "Revenue Clerk" },
    { value: "cashier", label: "Cashier" },
    { value: "taxpayer", label: "Taxpayer" },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole && username && password) {
      const name = username.charAt(0).toUpperCase() + username.slice(1);
      onLogin(selectedRole as UserRole, name);
    } else {
      alert("Please fill in all fields");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Green Background with Logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#14522d] relative overflow-hidden">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-[#14522d]/90 z-10" />

        {/* Background pattern or image - you can add a municipality building image here */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-[#059467] to-[#14522d]" />
        </div>

        {/* Content */}
        <div className="relative z-20 flex flex-col items-center justify-center w-full px-12">
          {/* Logo */}
          <div className="mb-8">
            <img
              src={img5306453411222291363761758256220130317233290553N2}
              alt="Municipality Logo"
              className="w-32 h-32 object-contain drop-shadow-lg"
            />
          </div>

          {/* Title */}
          <h1 className="font-['Poppins'] font-bold text-white text-[32px] text-center tracking-wider">
            MUNICIPALITY OF MAGARAO
          </h1>
          <p className="font-['Poppins'] text-white/80 text-[18px] text-center mt-4">
            Real Property Tax Management System
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo - Only visible on small screens */}
          <div className="lg:hidden text-center mb-8">
            <img
              src={img5306453411222291363761758256220130317233290553N2}
              alt="Municipality Logo"
              className="w-20 h-20 object-contain mx-auto mb-4"
            />
            <h1 className="font-['Poppins'] font-bold text-[#14522d] text-[24px]">
              MUNICIPALITY OF MAGARAO
            </h1>
            <p className="font-['Poppins'] text-gray-600 text-[14px] mt-2">
              Tax Management System
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Login As Dropdown */}
            <div>
              <label className="font-['Poppins'] text-[14px] text-gray-700 mb-2 block">
                Login As
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#059467] focus:border-transparent bg-white"
                required
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Username */}
            <div>
              <label className="font-['Poppins'] text-[14px] text-gray-700 mb-2 block">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#059467] focus:border-transparent"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="font-['Poppins'] text-[14px] text-gray-700 mb-2 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#059467] focus:border-transparent"
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-[#059467] text-white py-3 px-6 rounded-lg font-['Poppins'] font-medium text-[16px] hover:bg-[#048358] transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Login
            </button>
          </form>

          {/* Demo Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-['Poppins'] text-[12px] text-blue-800 text-center">
              <span className="font-semibold">Demo Mode:</span> Use any username and password to login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
