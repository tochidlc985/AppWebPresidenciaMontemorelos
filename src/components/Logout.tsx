import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const backgroundUrl = '/Montemorelos.jpg'; // Cambia la ruta si quieres otra imagen de fondo

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 bg-white/90 rounded-3xl shadow-2xl px-10 py-12 flex flex-col items-center max-w-lg w-full"
      >
        <img
          src="/Montemorelos.jpg"
          alt="Logo Montemorelos"
          className="w-24 h-24 mb-6 rounded-full shadow-xl border-4 border-blue-400 object-contain bg-white"
        />
        <h2 className="text-3xl font-extrabold mb-2 text-blue-800 tracking-wide drop-shadow">¡Hasta pronto!</h2>
        <p className="mb-6 text-blue-700 text-lg font-medium text-center">Has cerrado sesión correctamente.<br />Te esperamos pronto de regreso.</p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <span className="text-blue-900 font-bold text-lg">Redirigiendo al login...</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Logout;
