import React, { useEffect, useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface Usuario {
  nombre?: string;
  email?: string;
  departamento?: string;
  roles?: string[] | string;
  foto?: string; // base64 o url
  fechaRegistro?: string;
  [key: string]: any;
}

const Profile: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<Usuario>({});
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('usuario');
    if (!stored) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      const user = JSON.parse(stored);
      setUsuario(user);
      setForm(user);
      setFotoPreview(user.foto || null);
    } catch {
      setUsuario(null);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoPreview(reader.result as string);
      setForm((prev) => ({ ...prev, foto: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setUsuario(form);
    localStorage.setItem('usuario', JSON.stringify(form));
    setEdit(false);
  };

  if (!usuario) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 py-10">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-200 px-10 py-12 flex flex-col items-center max-w-lg w-full animate-fade-in">
        <div className="relative mb-6">
          <img
            src={fotoPreview || '/Montemorelos.jpg'}
            alt="Foto de perfil"
            className="w-32 h-32 rounded-full shadow-xl border-4 border-blue-400 object-cover bg-white"
          />
          {edit && (
            <label className="absolute bottom-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs cursor-pointer shadow hover:bg-blue-800 transition">
              Cambiar
              <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
            </label>
          )}
        </div>
        <h2 className="text-3xl font-extrabold mb-2 text-blue-800 tracking-wide drop-shadow">Perfil de Usuario</h2>
        <p className="mb-8 text-blue-600 text-base font-medium">Información de tu cuenta registrada</p>
        <div className="w-full space-y-4">
          <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-4 shadow">
            <span className="font-bold text-blue-700 w-32">Nombre:</span>
            {edit ? (
              <input
                type="text"
                name="nombre"
                value={form.nombre || ''}
                onChange={handleInputChange}
                className="border border-blue-300 rounded px-3 py-1 w-full"
              />
            ) : (
              <span className="text-blue-900 font-medium">{usuario.nombre || usuario.name || 'No disponible'}</span>
            )}
          </div>
          <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-4 shadow">
            <span className="font-bold text-blue-700 w-32">Correo:</span>
            {edit ? (
              <input
                type="email"
                name="email"
                value={form.email || ''}
                onChange={handleInputChange}
                className="border border-blue-300 rounded px-3 py-1 w-full"
              />
            ) : (
              <span className="text-blue-900 font-medium">{usuario.email || 'No disponible'}</span>
            )}
          </div>
          <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-4 shadow">
            <span className="font-bold text-blue-700 w-32">Departamento:</span>
            {edit ? (
              <input
                type="text"
                name="departamento"
                value={form.departamento || ''}
                onChange={handleInputChange}
                className="border border-blue-300 rounded px-3 py-1 w-full"
              />
            ) : (
              <span className="text-blue-900 font-medium">{usuario.departamento || 'No disponible'}</span>
            )}
          </div>
          {usuario.roles && (
            <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-4 shadow">
              <span className="font-bold text-blue-700 w-32">Roles:</span>
              {edit ? (
                <input
                  type="text"
                  name="roles"
                  value={Array.isArray(form.roles) ? form.roles.join(', ') : form.roles || ''}
                  onChange={e => setForm(prev => ({ ...prev, roles: e.target.value.split(',').map(r => r.trim()) }))}
                  className="border border-blue-300 rounded px-3 py-1 w-full"
                />
              ) : (
                <span className="text-blue-900 font-medium">
                  {Array.isArray(usuario.roles)
                    ? usuario.roles.join(', ')
                    : usuario.roles}
                </span>
              )}
            </div>
          )}
          <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-4 shadow">
            <span className="font-bold text-blue-700 w-32">Fecha de registro:</span>
            {edit ? (
              <input
                type="date"
                name="fechaRegistro"
                value={form.fechaRegistro ? form.fechaRegistro.slice(0, 10) : ''}
                onChange={handleInputChange}
                className="border border-blue-300 rounded px-3 py-1 w-full"
              />
            ) : (
              <span className="text-blue-900 font-medium">{usuario.fechaRegistro ? new Date(usuario.fechaRegistro).toLocaleDateString() : 'No disponible'}</span>
            )}
          </div>
        </div>
        <div className="mt-10 text-center flex gap-4">
          {!edit ? (
            <button
              onClick={() => setEdit(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition"
            >
              Editar Perfil
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition"
              >
                Guardar Cambios
              </button>
              <button
                onClick={() => { setEdit(false); setForm(usuario!); setFotoPreview(usuario?.foto || null); }}
                className="bg-gray-400 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition"
              >
                Cancelar
              </button>
            </>
          )}
          <button
            onClick={() => navigate('/home')}
            className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition"
          >
            Ir al Inicio
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

export default Profile;
