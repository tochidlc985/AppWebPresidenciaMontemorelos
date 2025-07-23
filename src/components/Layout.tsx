import React from "react";
import Navigation from "./Navigation";
import { LogOut } from "lucide-react";

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface LayoutProps {
  children: React.ReactNode;
  backgroundImage?: string;
  user: User; // <-- Nuevo: usuario real
}

const Layout: React.FC<LayoutProps> = ({ children, backgroundImage, user }) => {
  const handleLogout = () => {
    alert("Sesión cerrada (simulado)");
  };

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: "linear-gradient(135deg, #e0e7ff 0%, #f5f3ff 50%, #fdf2f8 100%)",
        ...(backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage}), linear-gradient(135deg, #e0e7ff 0%, #f5f3ff 50%, #fdf2f8 100%)`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundBlendMode: "overlay",
            }
          : {}),
      }}
    >
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-full h-full bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 opacity-60 animate-gradient"></div>
      </div>

      {/* Perfil arriba del navbar */}
      <div className="w-full flex justify-end items-center px-6 py-3 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border-b border-purple-100 z-50">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img
              src={user.avatar}
              alt="Avatar usuario"
              className="h-12 w-12 rounded-full border-4 border-purple-300 object-cover shadow-lg transition-all group-hover:border-pink-400"
            />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity">
              {user.name}
            </span>
          </div>
          <div className="text-right">
            <div className="font-semibold text-purple-900 text-base">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="ml-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-200 to-pink-200 hover:from-pink-300 hover:to-purple-300 text-purple-700 font-semibold flex items-center gap-1 shadow transition-all duration-200 hover:scale-105"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>

      {/* Navbar principal */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg shadow-lg border-b border-purple-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3">
          <div className="flex items-center gap-3">
            <img
              src="/logo-montemorelos.png"
              alt="Logo Montemorelos"
              className="h-10 w-10 rounded-full border-2 border-purple-300 shadow-lg transition-transform hover:scale-110"
            />
            <span className="font-bold text-xl text-purple-700 tracking-wide drop-shadow">
              Presidencia Montemorelos
            </span>
          </div>
          <Navigation />
        </div>
      </nav>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 relative z-10">
        {children}
      </main>

      <footer className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 text-center py-6 text-purple-700 text-sm border-t border-purple-200 shadow-inner">
        <span className="font-semibold">© {new Date().getFullYear()} Presidencia Municipal de Montemorelos.</span>
        <span className="ml-2">Todos los derechos reservados.</span>
      </footer>

      <style>
        {`
          .animate-gradient {
            animation: gradientBG 8s ease-in-out infinite alternate;
          }
          @keyframes gradientBG {
            0% { opacity: 0.6; }
            100% { opacity: 0.8; }
          }
        `}
      </style>
    </div>
  );
};

export default Layout;

