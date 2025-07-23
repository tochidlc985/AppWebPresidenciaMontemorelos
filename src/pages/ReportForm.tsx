import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { Send, Upload, X, Phone, Mail, User, FileText, Image, Building, AlertCircle } from 'lucide-react';

interface ReportFormData {
  email: string;
  telefono: string;
  departamento: string[];
  quienReporta: string;
  descripcion: string;
  prioridad: string;
  tipoProblema: string;
  imagenes: File[];
}

const departamentosList = [
  'ADQUISICIONES', 'PASAPORTES', 'CATASTRO', 'DESARROLLO URBANO', 'EJECUTIVA',
  'TURISMO', 'CONTRALORÍA', 'DESARROLLO ECONÓMICO', 'ALCOHOLES', 'SINDICATOS',
  'INGRESOS', 'PATRIMONIO', 'TESORERÍA', 'CABILDO', 'AYUNTAMIENTO',
  'DESARROLLO SOCIAL', 'ESCUELA DE ARTES Y OFICIOS', 'SERVICIOS PÚBLICOS BÁSICOS',
  'TRÁNSITO', 'ECOLOGÍA', 'SEGURIDAD PÚBLICA', 'OBRAS PÚBLICAS', 'DIF',
  'OFICINA DEL ALCALDE', 'DEFENSORÍA', 'GUARDERÍA', 'ACADEMIA DE ARTES',
  'JURÍDICO', 'PROTECCIÓN CIVIL', 'Otro'
];

const aclaracionPreguntas: Record<string, string[]> = {
  'Hardware - Computadoras': [
    '¿Desde cuándo presenta la falla?',
    '¿El problema ocurre siempre o es intermitente?',
    '¿Ha intentado reiniciar la computadora?',
    '¿Aparece algún mensaje de error? ¿Cuál?',
    '¿Solo le ocurre a usted o a más personas?'
  ],
  'Hardware - Impresoras': [
    '¿Desde cuándo ocurre el problema?',
    '¿Es una impresora de red o personal?',
    '¿Quién más la usa?',
    '¿Ha intentado reiniciar la impresora?',
    '¿El problema ocurre al imprimir desde cualquier programa?'
  ],
  'Hardware - Red/Internet': [
    '¿Desde cuándo no tiene conexión?',
    '¿El problema es solo en su equipo o en toda el área?',
    '¿Ha probado reiniciar el módem o router?',
    '¿Puede acceder a otras páginas o servicios?'
  ],
  'Software - Instalación': [
    '¿Qué software necesita instalar?',
    '¿Ha intentado instalarlo usted mismo?',
    '¿Aparece algún mensaje de error? ¿Cuál?',
    '¿El software es licenciado o gratuito?'
  ],
  'Software - Configuración': [
    '¿Qué configuración necesita realizar?',
    '¿El software funcionaba antes correctamente?',
    '¿Ha cambiado algo recientemente en el sistema?'
  ],
  'Software - Licencias': [
    '¿Qué software requiere licencia?',
    '¿La licencia es nueva o renovación?',
    '¿Para cuántos usuarios/equipos es la licencia?'
  ],
  'Sistemas - Base de datos': [
    '¿Qué base de datos presenta el problema?',
    '¿Desde cuándo ocurre?',
    '¿Aparece algún mensaje de error? ¿Cuál?',
    '¿El sistema es interno o externo?'
  ],
  'Sistemas - Aplicaciones web': [
    '¿Qué aplicación web presenta el problema?',
    '¿Desde cuándo ocurre?',
    '¿Aparece algún mensaje de error? ¿Cuál?',
    '¿Ha probado en otro navegador?'
  ],
  'Soporte - Capacitación': [
    '¿Sobre qué tema o sistema requiere capacitación?',
    '¿Cuántas personas requieren la capacitación?',
    '¿Hay alguna fecha preferente?'
  ],
  'Soporte - Mantenimiento': [
    '¿Qué equipo requiere mantenimiento?',
    '¿Presenta alguna falla actualmente?',
    '¿Cuándo fue el último mantenimiento?'
  ],
  'Otro': [
    'Describa con detalle el problema y cualquier información relevante.'
  ]
};

const ReportForm = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ReportFormData>();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otroDepartamento, setOtroDepartamento] = useState('');
  const [aclaracionRespuestas, setAclaracionRespuestas] = useState<Record<number, string>>({});

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

  const prioridades = [
    { value: 'Baja', label: 'Baja', color: 'from-green-500 to-green-600' },
    { value: 'Media', label: 'Media', color: 'from-yellow-500 to-yellow-600' },
    { value: 'Alta', label: 'Alta', color: 'from-orange-500 to-orange-600' },
    { value: 'Crítica', label: 'Crítica', color: 'from-red-500 to-red-600' }
  ];

  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = [...uploadedFiles, ...acceptedFiles];
    setUploadedFiles(newFiles);
    setValue('imagenes', newFiles);
    toast.success(`${acceptedFiles.length} archivo(s) agregado(s)`);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 10485760, // 10MB
  });

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setValue('imagenes', newFiles);
  };

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    try {
      // Validar departamento
      let departamentosFinal = data.departamento;
      if (!departamentosFinal || departamentosFinal.length === 0) {
        toast.error('Selecciona al menos un departamento.');
        setIsSubmitting(false);
        return;
      }
      if (departamentosFinal.includes('Otro')) {
        if (otroDepartamento.trim() === '') {
          toast.error('Debes especificar el departamento si seleccionas "Otro".');
          setIsSubmitting(false);
          return;
        }
        departamentosFinal = departamentosFinal.filter(dep => dep !== 'Otro');
        departamentosFinal.push(otroDepartamento.trim());
      }

      const reportData = {
        ...data,
        departamento: departamentosFinal,
        timestamp: new Date().toISOString(),
        status: 'Pendiente',
        id: `R-${Date.now()}`,
        imagenes: uploadedFiles.map(file => file.name),
        aclaracionRespuestas: aclaracionRespuestas,
      };

      // Enviar a MongoDB (Express backend)
      const response = await fetch('http://192.168.137.230:4000/api/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      if (!response.ok) {
        toast.error('Error al guardar en MongoDB.');
        setIsSubmitting(false);
        return;
      }
      toast.success('¡Reporte guardado correctamente!');

      reset();
      setUploadedFiles([]);
      setOtroDepartamento('');
    } catch (error) {
      toast.error('Error al enviar el reporte. Intenta nuevamente.');
      console.error("ERROR AL ENVIAR REPORTE", error)
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validación visual de departamentos
  const departamentosSeleccionados = watch('departamento') || [];
  const showOtroInput = departamentosSeleccionados.includes('Otro');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 sm:p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img
                src="/Montemorelos.jpg"
                alt="Escudo de Montemorelos"
                className="h-16 w-16 sm:h-20 sm:w-20 object-contain bg-white rounded-full p-2"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">MONTEMORELOS</h1>
            <h2 className="text-lg sm:text-xl font-semibold mb-1">DEPARTAMENTO DE SISTEMAS</h2>
            <p className="text-blue-200">HOJA DE REPORTE</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-8">
          {/* Información de contacto */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-2 text-blue-600" />
                CORREO ELECTRÓNICO *
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'El correo electrónico es obligatorio',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Correo electrónico inválido'
                  }
                })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400"
                placeholder="ejemplo@montemorelos.gob.mx"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-2 text-green-600" />
                TELÉFONO *
              </label>
              <input
                type="tel"
                {...register('telefono', {
                  required: 'El teléfono es obligatorio',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Debe ser un número de 10 dígitos'
                  }
                })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-green-400"
                placeholder="8261234567"
              />
              {errors.telefono && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.telefono.message}
                </p>
              )}
            </motion.div>
          </div>

          {/* Quién reporta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-2 text-purple-600" />
              ¿QUIÉN REPORTA? *
            </label>
            <input
              type="text"
              {...register('quienReporta', { required: 'Este campo es obligatorio' })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-purple-400"
              placeholder="Nombre completo de quien reporta"
            />
            {errors.quienReporta && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.quienReporta.message}
              </p>
            )}
          </motion.div>

          {/* Departamento que reporta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <label className="block text-sm font-bold text-gray-700 mb-4">
              <Building className="inline h-4 w-4 mr-2 text-indigo-600" />
              DEPARTAMENTO QUE REPORTA *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
              {departamentosList.map((dept, idx) => (
                <label key={dept} className="flex items-center space-x-2 hover:bg-white p-2 rounded transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    value={dept}
                    {...register('departamento', { required: 'Selecciona al menos un departamento' })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{`${idx + 1}. ${dept}`}</span>
                </label>
              ))}
            </div>
            {/* Campo para especificar otro departamento */}
            {showOtroInput && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Especifica el departamento:
                </label>
                <input
                  type="text"
                  value={otroDepartamento}
                  onChange={e => setOtroDepartamento(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-400"
                  placeholder="Nombre del departamento"
                />
              </div>
            )}
            {errors.departamento && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.departamento.message}
              </p>
            )}
          </motion.div>

          {/* Tipo de problema y prioridad */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <label className="block text-sm font-bold text-gray-700 mb-2">
                TIPO DE PROBLEMA *
              </label>
              <select
                {...register('tipoProblema', { required: 'Selecciona el tipo de problema' })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Selecciona una opción</option>
                {tiposProblema.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              {errors.tipoProblema && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.tipoProblema.message}
                </p>
              )}
              {/* Preguntas aclaratorias según tipo de problema */}
              {aclaracionPreguntas[watch('tipoProblema')] && (
                <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <p className="font-semibold text-blue-700 mb-2">Por favor responde también:</p>
                  <ul className="list-disc pl-6 space-y-3">
                    {aclaracionPreguntas[watch('tipoProblema')].map((pregunta, idx) => (
                      <li key={idx} className="text-blue-800 text-sm mb-2">
                        <div className="mb-1">{pregunta}</div>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-blue-900 bg-white"
                          placeholder="Tu respuesta..."
                          value={aclaracionRespuestas[idx] || ''}
                          onChange={e => setAclaracionRespuestas(r => ({ ...r, [idx]: e.target.value }))}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <label className="block text-sm font-bold text-gray-700 mb-2">
                PRIORIDAD *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {prioridades.map((prioridad) => (
                  <label key={prioridad.value} className="cursor-pointer">
                    <input
                      type="radio"
                      value={prioridad.value}
                      {...register('prioridad', { required: 'Selecciona la prioridad' })}
                      className="sr-only"
                    />
                    <div className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                      watch('prioridad') === prioridad.value
                        ? `bg-gradient-to-r ${prioridad.color} text-white border-transparent shadow-lg`
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                    }`}>
                      <span className="font-medium text-sm">{prioridad.label}</span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.prioridad && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.prioridad.message}
                </p>
              )}
            </motion.div>
          </div>

          {/* Descripción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-2 text-orange-600" />
              DESCRIPCIÓN DE LA FALLA O SITUACIÓN *
            </label>
            <textarea
              {...register('descripcion', {
                required: 'La descripción es obligatoria',
                minLength: {
                  value: 10,
                  message: 'La descripción debe tener al menos 10 caracteres'
                }
              })}
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none hover:border-orange-400"
              placeholder="Describe detalladamente el problema o situación que necesita atención..."
            />
            {errors.descripcion && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.descripcion.message}
              </p>
            )}
          </motion.div>

          {/* Subida de imágenes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <Image className="inline h-4 w-4 mr-2 text-pink-600" />
              IMÁGENES (Opcional)
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                {isDragActive
                  ? 'Suelta las imágenes aquí...'
                  : 'Arrastra imágenes aquí o haz clic para seleccionar'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Archivos soportados: JPG, PNG, GIF, WEBP (máx. 10MB c/u)
              </p>
            </div>

            {/* Vista previa de archivos */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                    <div className="flex items-center space-x-3">
                      <Image className="h-5 w-5 text-pink-500" />
                      <span className="text-sm text-gray-700 font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-100 rounded transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Botón de enviar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="pt-6"
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center space-x-3 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 hover:from-blue-700 hover:via-purple-700 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              } text-white`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>ENVIANDO...</span>
                </>
              ) : (
                <>
                  <Send className="h-6 w-6" />
                  <span>ENVIAR REPORTE</span>
                </>
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default ReportForm;
