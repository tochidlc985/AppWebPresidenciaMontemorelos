import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart, Legend
} from 'recharts';
import {
  Search, CheckCircle, Clock, TrendingUp, Users, FileText, RefreshCw, PieChart as PieChartIcon, Trash2, User, AlertTriangle
} from 'lucide-react';
import Papa from 'papaparse';

interface Reporte {
  id: string;
  departamento: string[];
  descripcion: string;
  tipoProblema: string;
  quienReporta: string;
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  asignadoA: string;
  status: 'Pendiente' | 'En Proceso' | 'Resuelto';
  timestamp: string;
}

interface FormReporte {
  departamento: string;
  descripcion: string;
  tipoProblema: string;
  quienReporta: string;
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  asignadoA: string;
}

// Constantes de estado y prioridades
const ESTADOS = [
  { name: 'Pendiente', color: '#f87171' },
  { name: 'En Proceso', color: '#fbbf24' },
  { name: 'Resuelto', color: '#10B981' },
];

const PRIORIDADES = [
  { name: 'Baja', color: '#60a5fa' },
  { name: 'Media', color: '#fbbf24' },
  { name: 'Alta', color: '#f87171' },
  { name: 'Crítica', color: '#a21caf' }
];

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const FILTROS_FECHA = [
  { value: 'todos', label: 'Todas las fechas' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'ayer', label: 'Ayer' },
  { value: 'estaSemana', label: 'Esta semana' },
  { value: 'semanaPasada', label: 'Semana pasada' },
  { value: 'ultimos7', label: 'Últimos 7 días' },
  { value: 'ultimos30', label: 'Últimos 30 días' },
  { value: 'mes', label: 'Este mes' },
  { value: 'mesPasado', label: 'Mes pasado' },
  { value: 'trimestre', label: 'Este trimestre' },
  { value: 'trimestrePasado', label: 'Trimestre pasado' },
  { value: 'añoActual', label: 'Este año' },
  { value: 'añoPasado', label: 'Año pasado' },
  { value: '2024', label: 'Año 2024' },
  { value: '2025', label: 'Año 2025' }
];

const API_URL = '/api/reportes';


const INTEGRANTES = [
  'Lic. Francisco Jahir Vazquez De Leon',
  'Ayudante Paco',
  'Roberto Carlos De La Cruz Gonzalez',
];

// Tipos de problema fijos para filtro y formulario
const tiposProblema = [
  'Hardware - Computadoras',
  'Hardware - Impresoras',
  'Hardware - Red/Internet',
  'Software - Instalación',
  'Software - Configuración',
  'Software - Licencias',
  'Sistemas - Base de datos',
  'Sistemas - Aplicaciones web',
  'Soporte - Capacitación',
  'Soporte - Mantenimiento',
  'Otro'
];

// Glassmorphism style classNames (ajustadas para más color e interactividad)
const glassCard = "bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8";
// Botones principales con variantes de color y efectos
const glassButton = "transition-all font-semibold shadow-lg border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2";
const btnPrimary = `${glassButton} bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-purple-600 hover:to-pink-500 hover:shadow-2xl active:scale-95`;
const btnSuccess = `${glassButton} bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 hover:shadow-2xl active:scale-95`;
const btnInfo = `${glassButton} bg-gradient-to-r from-cyan-400 to-blue-400 text-white hover:from-blue-500 hover:to-cyan-500 hover:shadow-2xl active:scale-95`;
const btnWarning = `${glassButton} bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 hover:from-yellow-400 hover:to-yellow-600 hover:shadow-2xl active:scale-95`;
const glassSelect = "bg-white/70 border border-purple-200 rounded-lg px-3 py-2 font-semibold shadow text-gray-700";
const glassKpi = "rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg border border-white/30";
const glassInput = "bg-white/70 border border-purple-200 rounded-lg px-3 py-2 font-semibold shadow text-gray-700";
const glassTable = "rounded-2xl overflow-hidden shadow-lg border border-white/30 bg-white/80 backdrop-blur-lg";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const Dashboard: React.FC = () => {
  // Estados principales
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState<string>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [form, setForm] = useState<FormReporte>({
    departamento: '', descripcion: '', tipoProblema: '', quienReporta: '', prioridad: 'Baja', asignadoA: INTEGRANTES[0],
  });
  const [creando, setCreando] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [editValues, setEditValues] = useState<Record<string, Partial<Reporte>>>({});

  const busquedaDebounced = useDebounce(busqueda, 300);

  // Función para cargar reportes
  const fetchReportes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Error al cargar los reportes');
      const data = await res.json();

      const adaptados: Reporte[] = data.map((r: any) => ({
        id: r._id || r.id || '',
        departamento: Array.isArray(r.departamento)
          ? r.departamento
          : typeof r.departamento === 'string'
            ? r.departamento.split(',').map((d: string) => d.trim()).filter(Boolean)
            : [],
        descripcion: r.descripcion || '',
        tipoProblema: r.tipoProblema || '',
        quienReporta: r.quienReporta || '',
        prioridad: r.prioridad || 'Baja',
        status: r.status || 'Pendiente',
        asignadoA: r.asignadoA || INTEGRANTES[0],
        timestamp: r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString(),
      })).filter((r: Reporte) => r.id);
      setReportes(adaptados);
    } catch (e) {
      console.error('Error al cargar reportes:', e);
      setFeedback('Error al cargar los reportes de la base de datos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportes();
    const interval = setInterval(fetchReportes, 30000); // cada 30 segundos
    return () => clearInterval(interval);
  }, [fetchReportes]);

  // Filtrado y búsqueda
  const reportesFiltrados = React.useMemo(() => {
    let temp = [...reportes];
    const now = new Date();

    // Filtrado por fecha
    if (filtroFecha !== 'todos') {
      temp = temp.filter(r => {
        const fecha = new Date(r.timestamp);
        const fechaSinHora = new Date(fecha);
        fechaSinHora.setHours(0, 0, 0, 0);
        const hoy = new Date(now);
        hoy.setHours(0, 0, 0, 0);

        switch (filtroFecha) {
          case 'hoy':
            return fechaSinHora.getTime() === hoy.getTime();
          case 'ayer': {
            const ayer = new Date(hoy);
            ayer.setDate(hoy.getDate() - 1);
            return fechaSinHora.getTime() === ayer.getTime();
          }
          case 'estaSemana': {
            const startOfWeek = new Date(hoy);
            const day = hoy.getDay() || 7;
            startOfWeek.setDate(hoy.getDate() - (day - 1));
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            return fecha >= startOfWeek && fecha <= endOfWeek;
          }
          case 'semanaPasada': {
            const day = hoy.getDay() || 7;
            const endOfLastWeek = new Date(hoy);
            endOfLastWeek.setDate(hoy.getDate() - day);
            endOfLastWeek.setHours(23, 59, 59, 999);
            const startOfLastWeek = new Date(endOfLastWeek);
            startOfLastWeek.setDate(endOfLastWeek.getDate() - 6);
            startOfLastWeek.setHours(0, 0, 0, 0);
            return fecha >= startOfLastWeek && fecha <= endOfLastWeek;
          }
          case 'ultimos7': {
            const sieteDiasAntes = new Date(hoy);
            sieteDiasAntes.setDate(hoy.getDate() - 6);
            sieteDiasAntes.setHours(0, 0, 0, 0);
            const finHoy = new Date(hoy);
            finHoy.setHours(23, 59, 59, 999);
            return fecha >= sieteDiasAntes && fecha <= finHoy;
          }
          case 'ultimos30': {
            const treintaDiasAntes = new Date(hoy);
            treintaDiasAntes.setDate(hoy.getDate() - 29);
            treintaDiasAntes.setHours(0, 0, 0, 0);
            const finHoy = new Date(hoy);
            finHoy.setHours(23, 59, 59, 999);
            return fecha >= treintaDiasAntes && fecha <= finHoy;
          }
          case 'mes':
            return fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear();
          case 'mesPasado': {
            const mesPasado = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return (
              fecha.getMonth() === mesPasado.getMonth() &&
              fecha.getFullYear() === mesPasado.getFullYear()
            );
          }
          case 'trimestre': {
            const trimestreActual = Math.floor(now.getMonth() / 3);
            return (
              Math.floor(fecha.getMonth() / 3) === trimestreActual &&
              fecha.getFullYear() === now.getFullYear()
            );
          }
          case 'trimestrePasado': {
            let mesUltimoTrimestre = now.getMonth() - 3;
            let year = now.getFullYear();
            if (mesUltimoTrimestre < 0) {
              mesUltimoTrimestre += 12;
              year -= 1;
            }
            const trimestrePasado = Math.floor(mesUltimoTrimestre / 3);
            return (
              Math.floor(fecha.getMonth() / 3) === trimestrePasado &&
              fecha.getFullYear() === year
            );
          }
          case 'añoActual':
            return fecha.getFullYear() === now.getFullYear();
          case 'añoPasado':
            return fecha.getFullYear() === now.getFullYear() - 1;
          case '2024':
            return fecha.getFullYear() === 2024;
          case '2025':
            return fecha.getFullYear() === 2025;
          default:
            return true;
        }
      });
    }

    // Otros filtros y búsqueda
    temp = temp.filter(r => {
      const busq = busquedaDebounced.toLowerCase();
      return (
        (filtroPrioridad === 'todos' || r.prioridad === filtroPrioridad) &&
        (filtroTipo === 'todos' || r.tipoProblema === filtroTipo) &&
        (busq === '' ||
          r.id.toLowerCase().includes(busq) ||
          r.departamento.join(', ').toLowerCase().includes(busq) ||
          r.descripcion.toLowerCase().includes(busq) ||
          r.tipoProblema.toLowerCase().includes(busq) ||
          r.quienReporta.toLowerCase().includes(busq) ||
          r.asignadoA.toLowerCase().includes(busq))
      );
    });
    return temp;
  }, [reportes, filtroFecha, filtroPrioridad, filtroTipo, busquedaDebounced]);

  // KPIs
  const kpis = React.useMemo(() => {
    const total = reportesFiltrados.length;
    const pendientes = reportesFiltrados.filter(r => r.status === 'Pendiente').length;
    const enProceso = reportesFiltrados.filter(r => r.status === 'En Proceso').length;
    const resueltos = reportesFiltrados.filter(r => r.status === 'Resuelto').length;
    const usuarios = Array.from(new Set(reportesFiltrados.map(r => r.quienReporta))).length;
    const tipos = Array.from(new Set(reportesFiltrados.map(r => r.tipoProblema))).length;
    return { total, pendientes, enProceso, resueltos, usuarios, tipos };
  }, [reportesFiltrados]);

  // Datos gráficos
  const reportesPorDepartamento = React.useMemo(() => {
    const depMap: Record<string, number> = {};
    reportesFiltrados.forEach(r => {
      r.departamento.forEach(dep => {
        depMap[dep] = (depMap[dep] || 0) + 1;
      });
    });
    return Object.entries(depMap).map(([name, reportes]) => ({ name, reportes }));
  }, [reportesFiltrados]);

  const reportesPorPrioridad = React.useMemo(() => {
    return PRIORIDADES.map(p => ({
      name: p.name,
      color: p.color,
      value: reportesFiltrados.filter(r => r.prioridad === p.name).length
    }));
  }, [reportesFiltrados]);

  const reportesPorTipo = React.useMemo(() => {
    const tiposMap: Record<string, number> = {};
    reportesFiltrados.forEach(r => {
      if (r.tipoProblema) tiposMap[r.tipoProblema] = (tiposMap[r.tipoProblema] || 0) + 1;
    });
    return Object.entries(tiposMap).map(([name, value]) => ({ name, value }));
  }, [reportesFiltrados]);

  const reportesPorUsuario = React.useMemo(() => {
    const usuariosMap: Record<string, number> = {};
    reportesFiltrados.forEach(r => {
      if (r.quienReporta) usuariosMap[r.quienReporta] = (usuariosMap[r.quienReporta] || 0) + 1;
    });
    return Object.entries(usuariosMap).map(([name, value]) => ({ name, value }));
  }, [reportesFiltrados]);

  const tendencia = React.useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const dataMap: Record<number, { mes: string; reportes: number; resueltos: number }> = {};
    for (let i = 0; i < 12; i++) {
      dataMap[i] = { mes: MESES[i], reportes: 0, resueltos: 0 };
    }
    reportesFiltrados.forEach(r => {
      const fecha = new Date(r.timestamp);
      // Determinar el año relevante
      let selectedYear = currentYear;
      if (filtroFecha.startsWith('202')) {
        selectedYear = parseInt(filtroFecha, 10);
      }
      if (fecha.getFullYear() === selectedYear) {
        const mes = fecha.getMonth();
        if (dataMap[mes]) {
          dataMap[mes].reportes += 1;
          if (r.status === 'Resuelto') dataMap[mes].resueltos += 1;
        }
      }
    });
    return Object.values(dataMap);
  }, [reportesFiltrados, filtroFecha]);

  // Reportes por día de la semana (Lunes a Viernes)
  const reportesPorDiaSemana = React.useMemo(() => {
    const diasMap: Record<string, number> = { Lunes: 0, Martes: 0, Miércoles: 0, Jueves: 0, Viernes: 0 };
    reportesFiltrados.forEach(r => {
      const fecha = new Date(r.timestamp);
      const diaIdx = fecha.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
      if (diaIdx >= 1 && diaIdx <= 5) {
        const index = diaIdx - 1;
        const diaNombre = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'][index];
        diasMap[diaNombre] = (diasMap[diaNombre] || 0) + 1;
      }
    });
    return Object.entries(diasMap).map(([dia, reportes]) => ({ dia, reportes }));
  }, [reportesFiltrados]);

  // Función para crear reporte
  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.departamento.trim() ||
      !form.descripcion.trim() ||
      !form.tipoProblema.trim() ||
      !form.quienReporta.trim()
    ) {
      setFeedback('Por favor, complete todos los campos obligatorios.');
      return;
    }
    setCreando(true);
    try {
      const nuevoReporte: Reporte = {
        id: '',
        departamento: form.departamento.split(',').map(d => d.trim()).filter(Boolean),
        descripcion: form.descripcion,
        tipoProblema: form.tipoProblema,
        quienReporta: form.quienReporta,
        prioridad: form.prioridad,
        asignadoA: INTEGRANTES[Math.floor(Math.random() * INTEGRANTES.length)],
        status: 'Pendiente',
        timestamp: new Date().toISOString(),
      };
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoReporte),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al crear el reporte.');
      }
      setFeedback('Reporte creado correctamente.');
      setForm({ departamento: '', descripcion: '', tipoProblema: '', quienReporta: '', prioridad: 'Baja', asignadoA: INTEGRANTES[0] });
      await fetchReportes();
    } catch (err: any) {
      console.error('Error al crear:', err);
      setFeedback(err.message || 'Hubo un error inesperado al crear el reporte.');
    } finally {
      setCreando(false);
    }
  };

  // Función para actualizar reporte
  const handleUpdate = useCallback(async (id: string, update: Partial<Reporte>) => {
    setFeedback('');
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al actualizar el reporte.');
      }
      setFeedback('Reporte actualizado correctamente.');
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.error('Error al actualizar:', err);
      setFeedback(err.message || 'Error al actualizar el reporte.');
      await fetchReportes();
    }
  }, [fetchReportes]);

  // Eliminar reporte
  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este reporte?')) return;
    setFeedback('');
    setIsLoading(true);
    setReportes(prev => prev.filter(r => r.id !== id));
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar el reporte.');
      }
      setFeedback('Reporte eliminado correctamente.');
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.error('Error al eliminar:', err);
      setFeedback(err.message || 'Error al eliminar el reporte.');
      await fetchReportes();
    } finally {
      setIsLoading(false);
    }
  }, [fetchReportes]);

  // Exportar CSV
  const exportarCSV = () => {
    const csv = Papa.unparse(reportesFiltrados);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reportes_municipales_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedback('Reportes exportados a CSV.');
  };

  // Exportar JSON
  const exportarJSON = () => {
    const json = JSON.stringify(reportesFiltrados, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reportes_municipales_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedback('Reportes exportados a JSON.');
  };

  // Importar CSV
  const importarCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeedback('Iniciando importación CSV...');
    setIsLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: any) => {
        const data = results.data;
        let successCount = 0;
        let failCount = 0;
        for (const r of data) {
          const rep: Reporte = {
            id: '',
            departamento: typeof r.departamento === 'string' ? r.departamento.split(',').map((d: string) => d.trim()).filter(Boolean) : [],
            descripcion: r.descripcion || '',
            tipoProblema: r.tipoProblema || '',
            quienReporta: r.quienReporta || '',
            prioridad: (r.prioridad as Reporte['prioridad']) || 'Baja',
            asignadoA: INTEGRANTES[Math.floor(Math.random() * INTEGRANTES.length)],
            status: 'Pendiente',
            timestamp: new Date().toISOString()
          };
          try {
            const res = await fetch(API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(rep),
            });
            if (res.ok) successCount++;
            else failCount++;
          } catch {
            failCount++;
          }
        }
        setFeedback(`Importación CSV terminada. Éxitos: ${successCount}, Fallos: ${failCount}.`);
        await fetchReportes();
        setIsLoading(false);
      },
      error: (err) => {
        setFeedback('Error al parsear CSV: ' + err.message);
        setIsLoading(false);
      }
    });
  };

  // Importar JSON
  const importarJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeedback('Iniciando importación JSON...');
    setIsLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error('El JSON debe contener un arreglo.');
      let successCount = 0;
      let failCount = 0;
      for (const rep of data) {
        const report: Reporte = {
          id: '',
          departamento: typeof rep.departamento === 'string'
            ? rep.departamento.split(',').map((d: string) => d.trim()).filter(Boolean)
            : Array.isArray(rep.departamento) ? rep.departamento : [],
          descripcion: rep.descripcion || '',
          tipoProblema: rep.tipoProblema || '',
          quienReporta: rep.quienReporta || '',
          prioridad: (rep.prioridad as Reporte['prioridad']) || 'Baja',
          asignadoA: INTEGRANTES[Math.floor(Math.random() * INTEGRANTES.length)],
          status: 'Pendiente',
          timestamp: rep.timestamp ? new Date(rep.timestamp).toISOString() : new Date().toISOString()
        };
        try {
          const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report),
          });
          if (res.ok) successCount++;
          else failCount++;
        } catch {
          failCount++;
        }
      }
      setFeedback(`Importación JSON terminada. Éxitos: ${successCount}, Fallos: ${failCount}.`);
      await fetchReportes();
    } catch (err: any) {
      setFeedback('Error al importar JSON: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizado
  return (
      <div className="relative z-10 space-y-10 px-4 sm:px-8 py-10">
        {/* Feedback / Notificación */}
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-4 right-4 z-50 bg-white/90 border border-purple-300 px-6 py-3 rounded-xl shadow-2xl text-purple-900 font-semibold text-lg flex items-center gap-2">
              <CheckCircle className="text-green-500 w-5 h-5" />
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cabecera */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className={glassCard + ' flex flex-col lg:flex-row lg:items-center lg:justify-between border-0 shadow-2xl'}>
          {/* Logo y título */}
          <div className="flex items-center space-x-6">
            <img src="/Montemorelos.jpg" alt="Escudo de Montemorelos" className="h-16 w-16 object-contain rounded-full shadow-2xl border-4 border-white/60" />
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-900 via-purple-700 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">Panel de Reportes</h1>
              <p className="text-gray-700 mt-2 text-lg font-medium">Monitoreo y análisis del sistema de reportes del municipio.</p>
              <p className="text-blue-900 mt-1 text-base font-semibold bg-blue-100/60 rounded px-2 inline-block">Horario de atención: Lunes a viernes de 8:00 am a 3:00 pm</p>
            </div>
          </div>
          {/* Acciones y filtros */}
          <div className="flex flex-wrap items-center gap-4 mt-6 lg:mt-0">
            <motion.button
              whileHover={{ scale: 1.08, boxShadow: "0 4px 24px 0 #6366f1aa" }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                document.getElementById('reportes-recientes')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={btnPrimary + ' flex items-center gap-2 relative overflow-hidden'}
              aria-label="Ir a reportes recientes"
            >
              <FileText className="h-5 w-5" />
              Ver Reportes Recientes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.08, boxShadow: "0 4px 24px 0 #10b981aa" }}
              whileTap={{ scale: 0.96 }}
              onClick={fetchReportes}
              aria-label="Actualizar reportes"
              className={btnSuccess + ' flex items-center gap-2 relative overflow-hidden'}
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </motion.button>
            {/* Filtros */}
            <select value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} className={glassSelect} aria-label="Filtrar por fecha">
              {FILTROS_FECHA.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <select value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)} className={glassSelect} aria-label="Filtrar por prioridad">
              <option value="todos">Todas las prioridades</option>
              {PRIORIDADES.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className={glassSelect} aria-label="Filtrar por tipo">
              <option value="todos">Todos los tipos</option>
              {tiposProblema.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* KPIs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-6">
          {/* Cada KPI */}
          <motion.div whileHover={{ scale: 1.08, y: -8 }} className={glassKpi + ' bg-gradient-to-br from-blue-200/60 to-blue-100/40'}>
            <FileText className="h-10 w-10 text-blue-700 mb-2 drop-shadow-lg" />
            <p className="text-gray-700 text-base font-semibold">Total Reportes</p>
            <p className="text-4xl font-extrabold text-blue-900 mt-1">{kpis.total}</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.08, y: -8 }} className={glassKpi + ' bg-gradient-to-br from-red-200/60 to-red-100/40'}>
            <Clock className="h-10 w-10 text-red-600 mb-2 drop-shadow-lg" />
            <p className="text-gray-700 text-base font-semibold">Pendientes</p>
            <p className="text-4xl font-extrabold text-red-700 mt-1">{kpis.pendientes}</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.08, y: -8 }} className={glassKpi + ' bg-gradient-to-br from-orange-200/60 to-orange-100/40'}>
            <TrendingUp className="h-10 w-10 text-orange-500 mb-2 drop-shadow-lg" />
            <p className="text-gray-700 text-base font-semibold">En Proceso</p>
            <p className="text-4xl font-extrabold text-orange-600 mt-1">{kpis.enProceso}</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.08, y: -8 }} className={glassKpi + ' bg-gradient-to-br from-green-200/60 to-green-100/40'}>
            <CheckCircle className="h-10 w-10 text-green-600 mb-2 drop-shadow-lg" />
            <p className="text-gray-700 text-base font-semibold">Resueltos</p>
            <p className="text-4xl font-extrabold text-green-700 mt-1">{kpis.resueltos}</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.08, y: -8 }} className={glassKpi + ' bg-gradient-to-br from-purple-200/60 to-purple-100/40'}>
            <User className="h-10 w-10 text-purple-700 mb-2 drop-shadow-lg" />
            <p className="text-gray-700 text-base font-semibold">Usuarios Únicos</p>
            <p className="text-4xl font-extrabold text-purple-800 mt-1">{kpis.usuarios}</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.08, y: -8 }} className={glassKpi + ' bg-gradient-to-br from-yellow-200/60 to-yellow-100/40'}>
            <AlertTriangle className="h-10 w-10 text-yellow-600 mb-2 drop-shadow-lg" />
            <p className="text-gray-700 text-base font-semibold">Tipos de Problema</p>
            <p className="text-4xl font-extrabold text-yellow-700 mt-1">{kpis.tipos}</p>
          </motion.div>
        </motion.div>

        {/* Gráficos: Reportes por departamento y demás */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
          {/* Reportes por departamento */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className={glassCard}>
            <h3 className="text-2xl font-extrabold text-blue-900 mb-6 flex items-center gap-2">
              <Users className="h-7 w-7 text-blue-600" />
              Reportes por Departamento
            </h3>
            <div className="overflow-x-auto w-full">
              <div className="min-w-[800px] mx-auto">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={reportesPorDepartamento} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#3730a3' }} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 13, fill: '#3730a3' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #a5b4fc', borderRadius: '12px', boxShadow: '0 4px 16px -1px rgba(59, 130, 246, 0.15)' }} labelStyle={{ fontWeight: 'bold' }} />
                    <Bar dataKey="reportes" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Reportes por prioridad en pastel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className={glassCard}>
            <h3 className="text-2xl font-extrabold text-pink-900 mb-6 flex items-center gap-2">
              <PieChartIcon className="h-7 w-7 text-pink-600" />
              Reportes por Prioridad
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={reportesPorPrioridad}
                  cx="50%" cy="50%"
                  innerRadius={70}
                  outerRadius={130}
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive
                  key={`prioridad-${refreshKey}`}
                >
                  {reportesPorPrioridad.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #a5b4fc',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px -1px rgba(59, 130, 246, 0.15)'
                  }}
                />
                <Legend verticalAlign="bottom" align="center" layout="horizontal" />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Reportes por Tipo y Tendencia */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
          {/* Reportes por tipo */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className={glassCard}>
            <h3 className="text-2xl font-extrabold text-blue-900 mb-6 flex items-center gap-2">
              <PieChartIcon className="h-7 w-7 text-blue-600" />
              Reportes por Tipo de Problema
            </h3>
            <div className="overflow-x-auto w-full">
              <div className="min-w-[800px] mx-auto">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={reportesPorTipo} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f472b6" />
                    <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#be185d' }} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 13, fill: '#be185d' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #f472b6', borderRadius: '12px', boxShadow: '0 4px 16px -1px rgba(236, 72, 153, 0.15)' }} labelStyle={{ fontWeight: 'bold' }} />
                    <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Reportes por usuario y tendencia mensual */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Reportes por usuario */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className={glassCard}>
              <h3 className="text-2xl font-extrabold text-green-900 mb-6 flex items-center gap-2">
                <PieChartIcon className="h-7 w-7 text-green-600" />
                Reportes por Usuario
              </h3>
              <div className="overflow-x-auto w-full">
                <div className="min-w-[800px] mx-auto">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={reportesPorUsuario} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#6ee7b7" />
                      <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#047857' }} angle={-30} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 13, fill: '#047857' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #6ee7b7',
                          borderRadius: '12px',
                          boxShadow: '0 4px 16px -1px rgba(16, 185, 129, 0.15)'
                        }}
                      />
                      <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Tendencia mensual */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className={glassCard}>
              <h3 className="text-2xl font-extrabold text-green-900 mb-6 flex items-center gap-2">
                <TrendingUp className="h-7 w-7 text-green-600" />
                Tendencia Mensual (Reportes Creados vs Resueltos)
              </h3>
              <div className="overflow-x-auto w-full">
                <div className="min-w-[800px] mx-auto">
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={tendencia} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#a7f3d0" />
                      <XAxis dataKey="mes" tick={{ fontSize: 13, fill: '#047857' }} />
                      <YAxis tick={{ fontSize: 13, fill: '#047857' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #a7f3d0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 16px -1px rgba(16, 185, 129, 0.15)'
                        }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Area type="monotone" dataKey="reportes" name="Reportes Creados" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="resueltos" name="Reportes Resueltos" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Reportes por día de semana (Lunes a Viernes) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
          <motion.div initial={{ opacity: 0, x: 0 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className={glassCard}>
            <h3 className="text-2xl font-extrabold text-indigo-900 mb-6 flex items-center gap-2">
              <BarChart className="h-7 w-7 text-indigo-600" />
              Reportes por Día de la Semana
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={reportesPorDiaSemana} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#a5b4fc" />
                <XAxis dataKey="dia" tick={{ fontSize: 13, fill: '#3730a3' }} />
                <YAxis tick={{ fontSize: 13, fill: '#3730a3' }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #a5b4fc', borderRadius: '12px' }} labelStyle={{ fontWeight: 'bold' }} />
                <Bar dataKey="reportes" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Tabla de reportes recientes y operaciones */}
        <motion.div id="reportes-recientes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className={glassTable + ' mt-10'}>
          {/* Encabezado y filtros */}
          <div className="bg-gradient-to-r from-white/80 to-blue-50/80 p-8 border-b border-white/30">
            {/* Opciones de importación/exportación */}
            <div className="flex flex-wrap gap-4 mb-4">
              <button onClick={exportarCSV} className={btnInfo} type="button">Exportar CSV</button>
              <button onClick={exportarJSON} className={btnInfo} type="button">Exportar JSON</button>
              <label className={btnWarning + ' flex items-center gap-2 cursor-pointer'}>
                Importar CSV
                <input type="file" accept=".csv" onChange={importarCSV} className="hidden" />
              </label>
              <label className={btnWarning + ' flex items-center gap-2 cursor-pointer'}>
                Importar JSON
                <input type="file" accept=".json" onChange={importarJSON} className="hidden" />
              </label>
            </div>
            {/* Filtros y búsqueda */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h3 className="text-2xl font-extrabold text-indigo-900 flex items-center gap-2">
                <FileText className="h-7 w-7 text-indigo-600" />
                Reportes Recientes
              </h3>
              <div className="flex flex-wrap items-start sm:items-center gap-4 mt-4 lg:mt-0">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por ID, Dpto., Descripción..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className={glassInput + ' pl-10 pr-4 w-full sm:w-64'}
                    aria-label="Buscar reportes"
                  />
                </div>
              </div>
            </div>
            {/* Formulario para crear reporte */}
            <form onSubmit={handleCrear} className="mt-8 grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
              <input
                type="text"
                required
                placeholder="Departamento(s) (separados por coma)"
                value={form.departamento}
                onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                className={glassInput}
                disabled={creando}
                aria-label="Departamento"
              />
              <input
                type="text"
                required
                placeholder="Descripción"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className={glassInput}
                disabled={creando}
                aria-label="Descripción"
              />
              <select
                required
                value={form.tipoProblema}
                onChange={(e) => setForm({ ...form, tipoProblema: e.target.value })}
                className={glassSelect}
                disabled={creando}
                aria-label="Tipo de problema"
              >
                <option value="">Selecciona tipo de problema</option>
                {tiposProblema.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Reportado por"
                value={form.quienReporta}
                onChange={(e) => setForm({ ...form, quienReporta: e.target.value })}
                className={glassInput}
                disabled={creando}
                aria-label="Reportado por"
              />
              <select
                value={form.prioridad}
                onChange={(e) => setForm({ ...form, prioridad: e.target.value as FormReporte['prioridad'] })}
                className={glassSelect}
                disabled={creando}
                aria-label="Prioridad"
              >
                {PRIORIDADES.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
              <select
                value={form.asignadoA}
                onChange={(e) => setForm({ ...form, asignadoA: e.target.value })}
                className={glassSelect}
                disabled={creando}
                aria-label="Asignado a"
              >
                {INTEGRANTES.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={creando}
                className={btnPrimary + ' flex items-center gap-2'}
                aria-label="Crear reporte"
              >
                {creando ? <RefreshCw className="animate-spin h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                {creando ? 'Creando...' : 'Crear'}
              </button>
            </form>
            {/* Tabla de reportes mejorada */}
            <div className="dashboard-table-wrapper overflow-x-auto rounded-2xl shadow-xl border border-purple-100 bg-white/90">
              <table className="min-w-full divide-y divide-purple-200">
                <thead className="bg-gradient-to-r from-blue-100 to-purple-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold text-purple-900 uppercase tracking-wider text-center">ID</th>
                    <th className="px-4 py-3 text-xs font-bold text-purple-900 uppercase tracking-wider text-center">Departamento</th>
                    <th className="px-4 py-3 text-xs font-bold text-purple-900 uppercase tracking-wider text-center">Descripción</th>
                    <th className="px-4 py-3 text-xs font-bold text-purple-900 uppercase tracking-wider text-center">Tipo</th>
                    <th className="px-4 py-3 text-xs font-bold text-purple-900 uppercase tracking-wider text-center">Reportado por</th>
                    <th className="px-4 py-3 text-xs font-bold text-purple-900 uppercase tracking-wider text-center">Prioridad</th>
                    <th className="px-4 py-3 text-xs font-bold text-purple-900 uppercase tracking-wider text-center">Estado</th>
                    <th className="px-4 py-3 text-xs font-bold text-purple-900 uppercase tracking-wider text-center">Asignado a</th>
                    <th className="px-4 py-3 text-xs font-bold text-purple-900 uppercase tracking-wider text-center">Fecha</th>
                    <th className="px-4 py-3 text-xs font-bold text-purple-900 uppercase tracking-wider text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {reportesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-8 text-gray-500 font-semibold">No hay reportes para mostrar.</td>
                    </tr>
                  ) : (
                    reportesFiltrados.map((r, idx) => (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={
                          (idx % 2 === 0 ? 'bg-white/80' : 'bg-purple-50/60') +
                          ' hover:bg-purple-200/80 hover:shadow-lg transition-colors duration-200 cursor-pointer'
                        }
                        whileHover={{ scale: 1.01, boxShadow: "0 4px 24px 0 #a78bfa55" }}
                      >
                        <td className="font-mono max-w-[120px] break-all px-4 py-2 text-xs text-center align-middle transition-colors duration-200">{r.id}</td>
                        <td className="max-w-[120px] px-4 py-2 text-xs text-center align-middle transition-colors duration-200">
                          <input
                            type="text"
                            value={editValues[r.id]?.departamento?.join(', ') ?? r.departamento.join(', ')}
                            onChange={(e) =>
                              setEditValues(prev => ({
                                ...prev,
                                [r.id]: {
                                  ...prev[r.id],
                                  departamento: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
                                }
                              }))
                            }
                            onBlur={() => handleUpdate(r.id, { departamento: editValues[r.id]?.departamento ?? r.departamento })}
                            className={glassInput + ' text-xs w-full text-center focus:ring-2 focus:ring-purple-400'}
                          />
                        </td>
                        <td className="max-w-[180px] px-4 py-2 text-xs text-center align-middle transition-colors duration-200">
                          <input
                            type="text"
                            value={editValues[r.id]?.descripcion ?? r.descripcion}
                            onChange={(e) =>
                              setEditValues(prev => ({
                                ...prev,
                                [r.id]: { ...prev[r.id], descripcion: e.target.value }
                              }))
                            }
                            onBlur={() => handleUpdate(r.id, { descripcion: editValues[r.id]?.descripcion ?? r.descripcion })}
                            className={glassInput + ' text-xs w-full text-center focus:ring-2 focus:ring-purple-400'}
                          />
                        </td>
                        <td className="max-w-[120px] px-4 py-2 text-xs text-center align-middle transition-colors duration-200">
                          <input
                            type="text"
                            value={editValues[r.id]?.tipoProblema ?? r.tipoProblema}
                            onChange={(e) =>
                              setEditValues(prev => ({
                                ...prev,
                                [r.id]: { ...prev[r.id], tipoProblema: e.target.value }
                              }))
                            }
                            onBlur={() => handleUpdate(r.id, { tipoProblema: editValues[r.id]?.tipoProblema ?? r.tipoProblema })}
                            className={glassInput + ' text-xs w-full text-center focus:ring-2 focus:ring-purple-400'}
                          />
                        </td>
                        <td className="max-w-[120px] px-4 py-2 text-xs text-center align-middle transition-colors duration-200">
                          <input
                            type="text"
                            value={editValues[r.id]?.quienReporta ?? r.quienReporta}
                            onChange={(e) =>
                              setEditValues(prev => ({
                                ...prev,
                                [r.id]: { ...prev[r.id], quienReporta: e.target.value }
                              }))
                            }
                            onBlur={() => handleUpdate(r.id, { quienReporta: editValues[r.id]?.quienReporta ?? r.quienReporta })}
                            className={glassInput + ' text-xs w-full text-center focus:ring-2 focus:ring-purple-400'}
                          />
                        </td>
                        <td className="px-4 py-2 text-xs text-center align-middle transition-colors duration-200">
                          <select
                            value={editValues[r.id]?.prioridad ?? r.prioridad}
                            onChange={(e) => {
                              setEditValues(prev => ({
                                ...prev,
                                [r.id]: { ...prev[r.id], prioridad: e.target.value as Reporte['prioridad'] }
                              }));
                              handleUpdate(r.id, { prioridad: e.target.value as Reporte['prioridad'] });
                            }}
                            className={glassSelect + ' text-xs w-full text-center focus:ring-2 focus:ring-purple-400'}
                          >
                            {PRIORIDADES.map(p => (
                              <option key={p.name} value={p.name}>{p.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2 text-xs text-center align-middle transition-colors duration-200">
                          <select
                            value={r.status}
                            onChange={async (e) => {
                              const nuevoEstado = e.target.value as Reporte['status'];
                              setReportes(prev => prev.map(rep => rep.id === r.id ? { ...rep, status: nuevoEstado } : rep));
                              await handleUpdate(r.id, { status: nuevoEstado });
                            }}
                            className={glassSelect + ' text-xs w-full text-center focus:ring-2 focus:ring-purple-400'}
                          >
                            {ESTADOS.map(e => (
                              <option key={e.name} value={e.name}>{e.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2 text-xs text-center align-middle transition-colors duration-200">{INTEGRANTES[Math.floor(Math.random() * INTEGRANTES.length)]}</td>
                        <td className="whitespace-nowrap px-4 py-2 text-xs text-center align-middle transition-colors duration-200">{new Date(r.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-2 text-xs text-center align-middle transition-colors duration-200">
                          <div className="flex gap-2 justify-center items-center">
                            {Object.keys(editValues[r.id] ?? {}).length > 0 && (
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.18, backgroundColor: '#bbf7d0' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleUpdate(r.id, editValues[r.id]!)}
                                className="text-green-700 hover:text-white p-1 rounded-full border border-green-400 bg-gradient-to-br from-green-200 to-green-400 hover:from-green-500 hover:to-green-700 shadow-lg transition-all"
                                title="Guardar cambios"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </motion.button>
                            )}
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.18, backgroundColor: '#fee2e2' }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(r.id)}
                              className="text-red-700 hover:text-white p-1 rounded-full border border-red-400 bg-gradient-to-br from-red-200 to-red-400 hover:from-red-500 hover:to-red-700 shadow-lg transition-all"
                              title="Eliminar reporte"
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
  );
};

export default Dashboard; 