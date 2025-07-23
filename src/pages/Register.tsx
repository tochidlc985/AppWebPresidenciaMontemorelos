import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('usuario');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);
  const validatePassword = (password: string) => password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Correo electrónico inválido.');
      return;
    }
    if (!validatePassword(password)) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const payload = { nombre: name, email, password, rol: role };
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        throw new Error('Respuesta inválida o vacía del servidor.');
      }
      if (!res.ok) {
        const errorMessage = data && data.message ? data.message : 'Error al registrar. Inténtalo de nuevo.';
        throw new Error(errorMessage);
      }
      toast.success('Registro exitoso. Ahora puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 via-white to-green-500 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg width="100%" height="100%">
          <circle cx="15%" cy="20%" r="120" fill="#43a04733">
            <animate attributeName="r" values="120;140;120" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="85%" cy="80%" r="100" fill="#388e3c33">
            <animate attributeName="r" values="100;120;100" dur="5s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      <div className="relative z-10 w-full max-w-lg">
        <div className="rounded-3xl shadow-2xl bg-white/80 backdrop-blur-xl px-10 py-12 flex flex-col items-center border-2 border-green-400 animate-fade-in">
          <img
            src="/Montemorelos.jpg"
            alt="Montemorelos Logo"
            className="w-32 h-32 mb-6 rounded-full shadow-xl border-4 border-green-500 object-contain bg-white"
            style={{ background: 'white' }}
          />
          <h2 className="text-4xl font-extrabold mb-2 text-green-700 tracking-wide drop-shadow">Registro</h2>
          <p className="mb-8 text-green-600 text-base font-medium">Crea tu cuenta para continuar</p>
          <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="relative">
              <span className="absolute left-4 top-3 text-green-400">
                <svg width="24" height="24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path d="M4 20c0-4 16-4 16 0" stroke="currentColor" strokeWidth="2"/></svg>
              </span>
              <input
                type="text"
                placeholder="Nombre completo"
                className="pl-12 pr-4 py-3 rounded-xl border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition bg-white/90 text-green-900 font-semibold shadow"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                name="name"
              />
            </div>
            <div className="relative">
              <span className="absolute left-4 top-3 text-green-400">
                <svg width="24" height="24" fill="none"><rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="2"/></svg>
              </span>
              <input
                type="email"
                placeholder="Correo electrónico"
                className="pl-12 pr-4 py-3 rounded-xl border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition bg-white/90 text-green-900 font-semibold shadow"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                name="email"
              />
            </div>
            <div className="relative">
              <span className="absolute left-4 top-3 text-green-400">
                <svg width="24" height="24" fill="none"><rect x="6" y="10" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M12 14v2" stroke="currentColor" strokeWidth="2"/><path d="M8 10V8a4 4 0 118 0v2" stroke="currentColor" strokeWidth="2"/></svg>
              </span>
              <input
                type="password"
                placeholder="Contraseña"
                className="pl-12 pr-4 py-3 rounded-xl border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition bg-white/90 text-green-900 font-semibold shadow"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                name="password"
              />
            </div>
            <div className="relative">
              <span className="absolute left-4 top-3 text-green-400">
                <svg width="24" height="24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2"/></svg>
              </span>
              <select
                className="pl-12 pr-4 py-3 rounded-xl border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition bg-white/90 text-green-900 font-semibold shadow appearance-none"
                value={role}
                onChange={e => setRole(e.target.value)}
                name="role"
              >
                <option value="usuario">Usuario/a</option>
                <option value="administrador">Administrador</option>
                <option value="jefe">Jefe de Departamento</option>
                <option value="tecnico">Técnico</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-green-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 hover:from-green-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  Registrando...
                </span>
              ) : 'Registrarse'}
            </button>
          </form>
          <button
            className="mt-8 text-green-700 underline hover:text-green-900 font-semibold transition"
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            ¿Ya tienes cuenta? <span className="font-bold">Inicia sesión</span>
          </button>
        </div>
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 1s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
};

export default Register;