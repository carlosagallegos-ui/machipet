import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Home, Search, PawPrint, ClipboardList, User, Shield } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Inicio" },
  { path: "/buscar", icon: Search, label: "Buscar" },
  { path: "/mis-mascotas", icon: PawPrint, label: "Mascotas" },
  { path: "/mis-servicios", icon: ClipboardList, label: "Servicios" },
  { path: "/perfil", icon: User, label: "Perfil" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const me = await base44.auth.me();
      setUsuario(me);
    } catch {}
  };

  const isAdmin = usuario?.role === "admin";

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F97316] rounded-xl flex items-center justify-center text-white font-black text-sm">M</div>
            <span className="font-black text-[#1A1A2E] text-lg">Machipet</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  location.pathname === item.path
                    ? "bg-orange-50 text-[#F97316]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#1A1A2E]"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  location.pathname.startsWith("/admin")
                    ? "bg-orange-50 text-[#F97316]"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Shield size={16} />
                Admin
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 z-40 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  active ? "text-[#F97316]" : "text-gray-400"
                }`}
              >
                <item.icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                location.pathname.startsWith("/admin") ? "text-[#F97316]" : "text-gray-400"
              }`}
            >
              <Shield size={20} />
              <span className="text-[10px] font-bold">Admin</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}