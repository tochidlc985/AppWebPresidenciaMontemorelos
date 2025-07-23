import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import { QrCode, Download, Share2, Copy, ExternalLink, Zap, AlertCircle } from 'lucide-react';

const QRGenerator = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getFormUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      const { protocol, host } = window.location;
      return `${protocol}//${host}/reportes`;
    }
    return '';
  }, []);

  const generateQR = useCallback(async (url: string) => {
    setIsGenerating(true);
    setErrorMessage('');
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
        color: {
          dark: '#1e40af',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
      setQrCodeUrl(qrDataUrl);
      return true;
    } catch (error) {
      console.error("Error generating QR code:", error);
      setQrCodeUrl('');
      setErrorMessage('Error al generar el código QR. Intenta de nuevo.');
      toast.error('Error al generar el código QR.');
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleGenerateQR = async () => {
    setShowQR(false);
    setQrCodeUrl('');
    setErrorMessage('');

    const url = getFormUrl();
    if (url) {
      toast.promise(
        generateQR(url).then(success => {
          if (success) {
            setShowQR(true);
            return 'Código QR generado con éxito';
          } else {
            throw new Error('Error de generación, consulta el error anterior.');
          }
        }),
        {
          loading: 'Generando Código QR...',
          success: (message) => message,
          error: (error) => `${error.message || 'Error desconocido'}`
        }
      );
    } else {
      toast.error('No se pudo obtener la URL del formulario.');
      setErrorMessage('La URL del formulario no está disponible.');
    }
  };

  const downloadQR = () => {
    if (!qrCodeUrl) {
      toast.error('No hay un código QR para descargar.');
      return;
    }
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'qr-formulario.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Código QR descargado exitosamente');
  };

  const copyToClipboard = async () => {
    try {
      const urlToCopy = getFormUrl();
      if (!urlToCopy) {
        toast.error('No hay una URL para copiar.');
        return;
      }
      await navigator.clipboard.writeText(urlToCopy);
      toast.success('URL copiada al portapapeles');
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error('Error al copiar la URL.');
    }
  };

  const shareQR = async () => {
    const urlToShare = getFormUrl();
    if (!urlToShare) {
      toast.error('No hay una URL para compartir.');
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Acceso al formulario de Montemorelos',
          text: 'Escanea este QR o haz clic en el enlace para acceder al formulario de reportes.',
          url: urlToShare
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          toast.error('Error al compartir.');
          console.error("Share error:", error);
        }
      }
    } else {
      toast('Tu navegador no soporta la función de compartir. Se copió la URL al portapapeles.', {
        icon: 'ℹ️'
      });
      copyToClipboard();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="flex justify-center mb-6">
          <motion.img
            src="/Montemorelos.jpg"
            alt="Escudo de Montemorelos"
            className="h-20 w-20 sm:h-24 sm:w-24 object-contain rounded-full border-4 border-blue-600 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-blue-900 to-purple-800 bg-clip-text text-transparent mb-4">
          Generador de Código QR Oficial
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
          Genera, descarga y comparte el Código QR para que cualquiera pueda acceder rápidamente
          al <span className="font-semibold text-blue-700">formulario oficial de reportes</span> con solo escanearlo.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-green-500 mx-auto mt-6 rounded-full"></div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-100 flex flex-col h-full"
        >
          <div className="text-center flex-grow flex flex-col">
            <div className="bg-gradient-to-r from-blue-900 via-purple-800 to-indigo-900 text-white p-6 rounded-lg mb-6 shadow-lg flex flex-col items-center">
              <QrCode className="h-10 w-10 mx-auto mb-3 text-blue-200" />
              <h2 className="text-2xl font-bold">Código QR del Formulario</h2>
              <p className="text-blue-200 text-sm mt-1">Escanea para acceder al formulario</p>
            </div>

            <div className="mb-6 flex flex-col items-center justify-center space-y-4">
              <motion.button
                whileHover={{ scale: 1.07, rotate: 2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGenerateQR}
                disabled={isGenerating}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-700 to-purple-700 text-white rounded-xl font-bold text-lg shadow-xl hover:from-blue-800 hover:to-purple-800 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Zap className="h-6 w-6 animate-pulse" />
                    Generando...
                  </>
                ) : (
                  <>
                    <QrCode className="h-6 w-6" />
                    Generar QR del Formulario
                  </>
                )}
              </motion.button>
              <p className="text-sm text-gray-500 mt-2 text-center max-w-md">
                Haz clic para crear un QR que dirigirá directamente al formulario de reportes.
              </p>
            </div>

            {isGenerating && !qrCodeUrl && (
              <div className="flex flex-col items-center justify-center flex-grow h-64 my-8">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <QrCode className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <p className="mt-4 text-blue-600 text-lg font-medium">Cargando...</p>
              </div>
            )}

            {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm text-sm my-6"
                >
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {errorMessage}
                </motion.div>
            )}

            {showQR && qrCodeUrl && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                className="space-y-6 flex-grow flex flex-col justify-center"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-inner border-4 border-blue-100 flex justify-center items-center overflow-hidden"
                >
                  <img
                    src={qrCodeUrl}
                    alt="Código QR para el formulario"
                    className="max-w-full h-auto rounded-lg shadow-md aspect-square object-contain"
                    onDragStart={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadQR}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md text-sm sm:text-base"
                  >
                    <Download className="h-5 w-5" />
                    <span>Descargar</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={shareQR}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md text-sm sm:text-base"
                  >
                    <Share2 className="h-5 w-5" />
                    <span>Compartir</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyToClipboard}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md text-sm sm:text-base"
                  >
                    <Copy className="h-5 w-5" />
                    <span>Copiar URL</span>
                  </motion.button>
                </div>
                <div className="text-gray-500 text-xs mt-4 text-center">
                    Asegúrate de que tu dispositivo esté conectado a internet al escanear.
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-100 flex flex-col justify-center h-full"
        >
          <h2 className="text-2xl font-bold text-blue-900 mb-5 flex items-center gap-3 border-b pb-3 border-blue-100">
            <Zap className="h-7 w-7 text-yellow-500" />
            Guía Rápida de Uso
          </h2>
          <ol className="list-decimal list-inside text-gray-700 mb-6 space-y-3 text-base leading-relaxed">
            <li>
              <span className="font-semibold text-blue-800">Haz clic en el botón</span> "Generar QR del Formulario" para crear el código QR.
            </li>
            <li>
              Una vez generado, <span className="font-semibold text-purple-800">podrás verlo y usarlo directamente</span> en esta página.
            </li>
            <li>
              Utiliza los botones de abajo para <span className="font-semibold text-green-700">Descargar</span> el código como imagen PNG, <span className="font-semibold text-blue-700">Compartirlo</span> por tus apps favoritas o <span className="font-semibold text-red-600">Copiar</span> su URL.
            </li>
            <li>
              <span className="font-semibold text-orange-600">Escanea el código QR</span> con la cámara de tu teléfono (la mayoría de smartphones lo hacen automáticamente) para acceder al formulario de forma instantánea.
            </li>
          </ol>
          <h3 className="text-xl font-semibold text-purple-800 mb-3 flex items-center gap-3 border-b pb-3 border-purple-100">
            <ExternalLink className="h-6 w-6 text-purple-500" />
            Ventajas Clave
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 text-base leading-relaxed">
            <li>
              <span className="font-medium">Acceso Simplificado:</span> Cualquier persona puede acceder al formulario sin tener que escribir una URL larga.
            </li>
            <li>
              <span className="font-medium">Difusión Efectiva:</span> Comparte el código en redes sociales, documentos o pantallas públicas para maximizar la visibilidad.
            </li>
            <li>
              <span className="font-medium">Soporte Universal:</span> Funciona con la cámara estándar de cualquier smartphone moderno y cualquier app de escaneo QR.
            </li>
            <li>
              <span className="font-medium">Ideal para Eventos:</span> Facilita la recolección de información en eventos, reuniones o puntos de interés.
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default QRGenerator;