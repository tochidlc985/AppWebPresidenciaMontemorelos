import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, BarChart3, QrCode, Users, Clock, AlertTriangle, TrendingUp, CheckCircle, Loader2, Info, X, Eye } from 'lucide-react';

interface Reporte {
  id: string;
  departamento: string[];
  descripcion: string;
  prioridad: string;
  status: string;
  timestamp: string;
  quienReporta?: string;
  tipoProblema?: string;
}

interface ActividadReciente {
  id: string;
  dept: string;
  priority: string;
  issue: string;
  time: string;
  status: string;
  quienReporta?: string;
  tipoProblema?: string;
  color: string;
  descripcion?: string;
}

const KPI_TOOLTIPS: Record<string, string> = {
  'Reportes del Mes': 'Cantidad de reportes creados en el mes actual.',
  'Reportes Pendientes': 'Reportes que aún no han sido resueltos ni cerrados.',
  'Reportes Críticos': 'Reportes marcados con prioridad crítica.',
  'Departamentos Activos': 'Departamentos que han generado al menos un reporte este mes.'
};


const Home: React.FC = () => {
  const [stats, setStats] = useState<Array<{
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }>>([
    { label: 'Reportes del Mes', value: '...', icon: FileText, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Reportes Pendientes', value: '...', icon: Clock, color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-50' },
    { label: 'Reportes Críticos', value: '...', icon: AlertTriangle, color: 'from-red-500 to-red-600', bgColor: 'bg-red-50' },
    { label: 'Departamentos Activos', value: '...', icon: Users, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50' },
  ]);
  const [recentActivity, setRecentActivity] = useState<ActividadReciente[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalReportes, setTotalReportes] = useState<number>(0);
  const [resueltos, setResueltos] = useState<number>(0);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todos');
  const [detalleReporte, setDetalleReporte] = useState<ActividadReciente | null>(null);

  const quickActions = [
    {
      title: 'Crear Nuevo Reporte',
      description: 'Reporta un problema o solicitud del departamento',
      icon: FileText,
      link: '/reporte',
      color: 'from-blue-600 to-blue-700',
      hoverColor: 'hover:from-blue-700 hover:to-blue-800',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Ver Dashboard',
      description: 'Analiza estadísticas y métricas de reportes',
      icon: BarChart3,
      link: '/dashboard',
      color: 'from-green-600 to-green-700',
      hoverColor: 'hover:from-green-700 hover:to-green-800',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Generar QR',
      description: 'Crea códigos QR para acceso rápido al formulario',
      icon: QrCode,
      link: '/qr',
      color: 'from-purple-600 to-purple-700',
      hoverColor: 'hover:from-purple-700 hover:to-purple-800',
      bgColor: 'bg-purple-50'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:4000/api/Reportes');
        const reportes: Reporte[] = await res.json();
        if (!Array.isArray(reportes)) throw new Error('Respuesta inesperada del servidor');
        const now = new Date();
        const reportesMes = reportes.filter(r => {
          const fecha = new Date(r.timestamp);
          return fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear();
        });
        const pendientes = reportes.filter(r => r.status === 'Pendiente').length;
        const criticos = reportes.filter(r => r.prioridad === 'Crítica').length;
        const resueltosCount = reportes.filter(r => r.status === 'Resuelto').length;
        setTotalReportes(reportes.length);
        setResueltos(resueltosCount);
        const departamentosSet = new Set<string>();
        reportes.forEach(r => (Array.isArray(r.departamento) ? r.departamento : []).forEach((d: string) => departamentosSet.add(d)));
        setStats([
          { label: 'Reportes del Mes', value: reportesMes.length, icon: FileText, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
          { label: 'Reportes Pendientes', value: pendientes, icon: Clock, color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-50' },
          { label: 'Reportes Críticos', value: criticos, icon: AlertTriangle, color: criticos > 0 ? 'from-red-600 to-red-700' : 'from-red-500 to-red-600', bgColor: 'bg-red-50' },
          { label: 'Departamentos Activos', value: departamentosSet.size, icon: Users, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50' },
        ]);
        setRecentActivity(
          reportes
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 20)
            .map((r) => ({
              id: r.id,
              dept: Array.isArray(r.departamento) ? r.departamento.join(', ') : (r.departamento || ''),
              priority: r.prioridad,
              issue: r.descripcion,
              time: r.timestamp ? new Date(r.timestamp).toLocaleString() : '',
              status: r.status,
              quienReporta: r.quienReporta,
              tipoProblema: r.tipoProblema,
              descripcion: r.descripcion,
              color:
                r.status === 'Pendiente' ? 'bg-red-100 text-red-800' :
                r.status === 'En Proceso' ? 'bg-yellow-100 text-yellow-800' :
                r.status === 'Resuelto' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800',
            }))
        );
      } catch (err: any) {
        setError('Error al cargar los datos: ' + (err.message || ''));
        setStats([
          { label: 'Reportes del Mes', value: '-', icon: FileText, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
          { label: 'Reportes Pendientes', value: '-', icon: Clock, color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-50' },
          { label: 'Reportes Críticos', value: '-', icon: AlertTriangle, color: 'from-red-500 to-red-600', bgColor: 'bg-red-50' },
          { label: 'Departamentos Activos', value: '-', icon: Users, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50' },
        ]);
        setRecentActivity([]);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const estadosUnicos = Array.from(new Set(recentActivity.map(r => r.status))).filter(Boolean);
  const prioridadesUnicas = Array.from(new Set(recentActivity.map(r => r.priority))).filter(Boolean);
  const actividadFiltrada = recentActivity.filter(r =>
    (filtroEstado === 'todos' || r.status === filtroEstado) &&
    (filtroPrioridad === 'todos' || r.priority === filtroPrioridad)
  );

  return (
      <div className="relative z-10 space-y-12 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
        >
        <div className="flex justify-center mb-6">
        <img
        src="/Montemorelos.jpg"
        alt="Logo Montemorelos"
        className="h-32 w-32 sm:h-40 sm:w-40 object-contain rounded-full shadow-2xl border-4 border-blue-400 bg-white"
        style={{ background: 'white' }}
        />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-900 via-purple-700 to-pink-600 bg-clip-text text-transparent mb-4 drop-shadow-lg">
        Sistema de Reportes
        </h1>
        <p className="text-xl sm:text-2xl text-gray-700 max-w-3xl mx-auto font-medium">
        Departamento de Sistemas - Presidencia Municipal de Montemorelos
        </p>
        <div className="w-32 h-2 bg-gradient-to-r from-blue-600 via-yellow-400 to-green-500 mx-auto mt-6 rounded-full shadow-lg"></div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {stats.map((stat, _index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.08, y: -8 }}
                className={"glass-card rounded-2xl p-6 flex flex-col items-center justify-center border-2 border-white/40 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer " + stat.bgColor}
              >
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-gray-700 text-base font-semibold flex items-center gap-1">
                      {stat.label}
                      <span className="ml-1 cursor-pointer group relative">
                        <Info className="h-4 w-4 text-blue-400 inline-block" />
                        <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white/90 text-gray-700 text-xs rounded shadow-lg p-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {KPI_TOOLTIPS[stat.label]}
                        </span>
                      </span>
                    </p>
                    <p className={`text-3xl sm:text-4xl font-extrabold mt-1 ${stat.label === 'Reportes Críticos' && stat.value !== 0 ? 'text-red-600' : 'text-blue-900'}`}>{stat.value}</p>
                  </div>
                  <div className={`bg-gradient-to-r ${stat.color} p-4 rounded-xl shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {quickActions.map((action, _index) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} to={action.link} className="focus:outline-none">
                <motion.div
                  whileHover={{ scale: 1.08, y: -10 }}
                  whileTap={{ scale: 0.97 }}
                  className={"glass-card rounded-2xl p-8 flex flex-col items-center justify-center border-2 border-white/40 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer " + action.bgColor + ' group'}
                >
                  <div className={`bg-gradient-to-r ${action.color} ${action.hoverColor} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:scale-110 shadow-xl`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-2 group-hover:text-blue-800 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-gray-700 group-hover:text-gray-900 transition-colors text-lg">
                    {action.description}
                  </p>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>

        {/* KPIs adicionales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center border-2 border-white/40 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer bg-green-50">
            <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-2xl font-bold text-green-900">{resueltos}</span>
            <span className="text-gray-700 text-base">Reportes Resueltos</span>
          </div>
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center border-2 border-white/40 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer bg-blue-50">
            <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-2xl font-bold text-blue-900">{totalReportes}</span>
            <span className="text-gray-700 text-base">Total de Reportes</span>
          </div>
        </div>

        {/* Filtros de actividad reciente */}
        <div className="flex flex-wrap gap-4 items-center mt-8">
          <label className="text-base font-medium text-blue-900">Filtrar por estado:</label>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="glass-select w-48">
            <option value="todos">Todos</option>
            {estadosUnicos.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <label className="text-base font-medium text-blue-900 ml-4">Filtrar por prioridad:</label>
          <select value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)} className="glass-select w-48">
            <option value="todos">Todas</option>
            {prioridadesUnicas.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="glass-table mt-8"
        >
          <div className="bg-gradient-to-r from-white/80 to-blue-50/80 p-8 border-b border-white/30">
            <h2 className="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
              <TrendingUp className="h-7 w-7 text-blue-600" /> Actividad Reciente
            </h2>
          </div>
          <div className="p-8">
            <div className="space-y-6">
              {isLoading && (
                <div className="text-center py-8">
                  <span className="text-gray-500">Cargando actividad reciente...</span>
                </div>
              )}
              {error && (
                <div className="text-center py-8">
                  <span className="text-red-500">{error}</span>
                </div>
              )}
              {!isLoading && !error && actividadFiltrada.length === 0 && (
                <div className="text-center py-8">
                  <span className="text-gray-400">No hay actividad reciente.</span>
                </div>
              )}
              {actividadFiltrada.map((item, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gradient-to-r from-white/80 to-blue-50/80 rounded-xl hover:shadow-lg transition-all duration-300 border ${item.priority === 'Crítica' ? 'border-red-400' : 'border-transparent'}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-semibold text-blue-900">{item.dept}</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${
                        item.priority === 'Alta' ? 'bg-red-100 text-red-800' :
                        item.priority === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                        item.priority === 'Crítica' ? 'bg-red-200 text-red-900' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    {/* NUEVA INFORMACIÓN DETALLADA */}
                    <div className="text-xs text-gray-500 mb-1">
                      <span className="font-semibold">ID:</span> {item.id} <br />
                      <span className="font-semibold">Reportado por:</span> {item.quienReporta || 'N/A'} <br />
                      <span className="font-semibold">Tipo de Problema:</span> {item.tipoProblema || 'N/A'} <br />
                      <span className="font-semibold">Fecha:</span> {item.time}
                    </div>
                    <p className="text-gray-700 mb-1 text-lg font-medium">{item.issue}</p>
                    {/* Si quieres mostrar la descripción completa aquí, descomenta la siguiente línea */}
                    {/* <p className="text-gray-600 text-sm">{item.descripcion}</p> */}
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center gap-2">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${item.color} whitespace-nowrap shadow`}>{item.status}</span>
                    <button
                      className="ml-2 p-3 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition shadow"
                      title="Ver detalles"
                      onClick={() => setDetalleReporte(item)}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Modal de detalles */}
        <AnimatePresence>
          {detalleReporte && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="glass-card max-w-lg w-full relative border-0 shadow-2xl"
              >
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  onClick={() => setDetalleReporte(null)}
                  title="Cerrar"
                >
                  <X className="h-6 w-6" />
                </button>
                <h2 className="text-3xl font-extrabold mb-4 text-blue-900 flex items-center gap-2">
                  <FileText className="h-7 w-7 text-blue-600" /> Detalles del Reporte
                </h2>
                <div className="space-y-3 text-lg">
                  <div><span className="font-semibold">ID:</span> {detalleReporte.id}</div>
                  <div><span className="font-semibold">Departamento:</span> {detalleReporte.dept}</div>
                  <div><span className="font-semibold">Prioridad:</span> {detalleReporte.priority}</div>
                  <div><span className="font-semibold">Estado:</span> {detalleReporte.status}</div>
                  <div><span className="font-semibold">Tipo de Problema:</span> {detalleReporte.tipoProblema || 'N/A'}</div>
                  <div><span className="font-semibold">Reportado por:</span> {detalleReporte.quienReporta || 'N/A'}</div>
                  <div><span className="font-semibold">Fecha:</span> {detalleReporte.time}</div>
                  <div><span className="font-semibold">Descripción:</span> <span className="block text-gray-700 mt-1 whitespace-pre-line">{detalleReporte.descripcion}</span></div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón de reintentar si hay error */}
        {error && (
          <div className="text-center py-8">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Loader animado */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
            <span className="ml-4 text-xl text-blue-700 font-bold">Cargando...</span>
          </div>
        )}

        {/* Ayuda */}
        <div className="flex justify-end mt-8">
          <Link to="/ayuda" className="flex items-center text-blue-700 hover:underline font-medium text-lg">
            <Info className="h-5 w-5 mr-2" /> Ayuda y Preguntas Frecuentes
          </Link>
        </div>
      </div>
  );
};

export default Home;
