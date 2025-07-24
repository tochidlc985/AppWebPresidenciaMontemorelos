import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/utils/database.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Corrección para usar __dirname con módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware globales
app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));

// Configuración de multer
const uploadDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage });

/* ========================
   API: Reportes
======================== */

// Crear un nuevo reporte con imágenes
app.post('/api/reportes', upload.array('imagenes', 10), async (req, res) => {
  try {
    const files = req.files || [];
    const reporte = req.body.data ? JSON.parse(req.body.data) : req.body;
    reporte.imagenes = files.map(f => f.filename);

    const ok = await db.guardarReporte(reporte);
    if (ok) {
      res.status(201).json({ message: 'Reporte guardado correctamente' });
    } else {
      res.status(500).json({ message: 'Error al guardar el reporte' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Obtener todos los reportes
app.get('/api/reportes', async (req, res) => {
  try {
    const reportes = await db.obtenerReportes();
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Actualizar estado o prioridad del reporte
app.patch('/api/reportes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const ok = await db.actualizarReporte(id, update);

    if (ok) {
      res.json({ message: 'Reporte actualizado correctamente' });
    } else {
      res.status(404).json({ message: 'Reporte no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Eliminar reporte
app.delete('/api/reportes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await db.eliminarReporte(id);

    if (ok) {
      res.json({ message: 'Reporte eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Reporte no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

/* ========================
   API: Usuarios
======================== */

// Registrar usuario
app.post('/api/register', async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const usuario = await db.registrarUsuario({ nombre, email, password, rol });
    res.status(201).json({ message: 'Usuario registrado correctamente', usuario });
  } catch (error) {
    if (error.message === 'El usuario ya existe') {
      res.status(409).json({ message: 'El usuario ya existe' });
    } else {
      res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
  }
});

// Login usuario
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const usuario = await db.autenticarUsuario({ email, password });
    res.status(200).json({ message: 'Login exitoso', usuario });
  } catch (error) {
    if (error.message === 'Usuario no encontrado' || error.message === 'Contraseña incorrecta') {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error al autenticar usuario', error: error.message });
    }
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
