import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, FileText, BarChart3, QrCode, Menu, X, User } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/home', label: 'Inicio', icon: Home, color: 'from-blue-600 to-blue-700' },
    { path: '/reporte', label: 'Nuevo Reporte', icon: FileText, color: 'from-green-600 to-green-700' },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3, color: 'from-purple-600 to-purple-700' },
    { path: '/qr', label: 'Código QR', icon: QrCode, color: 'from-orange-600 to-orange-700' },
    // Solo mostrar Perfil si está autenticado
    ...(Boolean(localStorage.getItem('usuario') || localStorage.getItem('token'))
      ? [{ path: '/profile', label: 'Perfil', icon: User, color: 'from-blue-400 to-blue-600' }]
      : []),
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isLoggedIn = Boolean(localStorage.getItem('usuario') || localStorage.getItem('token'));

  return (
    <nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-2xl border-b-4 border-yellow-400 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo y título */}
          <Link to="/" className="flex items-center space-x-4 group">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="bg-white p-2 rounded-full shadow-lg"
            >
              <img 
                src="/Montemorelos.jpg" 
                alt="Escudo de Montemorelos" 
                className="h-12 w-12 object-contain"
              />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-xl group-hover:text-yellow-300 transition-colors">
                MONTEMORELOS
              </h1>
              <p className="text-blue-200 text-sm">Departamento de Sistemas</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg backdrop-blur-sm`
                        : 'text-blue-200 hover:bg-white/10 hover:text-white hover:shadow-md'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
            {/* Auth Buttons */}
            {!isLoggedIn && (
            <>
            <Link to="/login">
              <motion.button
                type="button"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2 rounded border border-blue-400 bg-white text-blue-700 font-semibold shadow-sm hover:bg-blue-50 hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-150"
              >
                Login
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                type="button"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2 rounded border border-purple-400 bg-white text-purple-700 font-semibold shadow-sm hover:bg-purple-50 hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-150"
              >
                Register
              </motion.button>
            </Link>
            </>
            )}
            {isLoggedIn && (
            <Link to="/logout">
              <motion.button
                type="button"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2 rounded border border-red-400 bg-white text-red-700 font-semibold shadow-sm hover:bg-red-50 hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-150"
              >
                Logout
              </motion.button>
            </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleMobileMenu}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden pb-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                            : 'text-blue-200 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}
                {/* Auth Buttons Mobile */}
                {!isLoggedIn && (
                <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2 rounded border border-blue-400 bg-white text-blue-700 font-semibold shadow-sm hover:bg-blue-50 hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-150"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2 rounded border border-purple-400 bg-white text-purple-700 font-semibold shadow-sm hover:bg-purple-50 hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-150"
                  >
                    Register
                  </motion.button>
                </Link>
                </>
                )}
                {isLoggedIn && (
                <Link to="/logout" onClick={() => setIsMobileMenuOpen(false)}>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2 rounded border border-red-400 bg-white text-red-700 font-semibold shadow-sm hover:bg-red-50 hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-150"
                  >
                    Logout
                  </motion.button>
                </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;