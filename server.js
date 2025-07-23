import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { db } from './dist/utils/database.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));

// Configuración de multer para subir imágenes a /uploads
const uploadDir = path.resolve('./uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Nuevo endpoint para guardar un reporte con imágenes
app.post('/api/reportes', upload.array('imagenes', 10), async (req, res) => {
  try {
    // Los datos del reporte vienen en req.body (campos de texto)
    // Las imágenes subidas están en req.files
    const files = req.files || [];
    // Si el frontend envía un campo 'data' con el JSON del reporte, parsearlo
    let reporte;
    if (req.body.data) {
      reporte = JSON.parse(req.body.data);
    } else {
      reporte = req.body;
    }
    // Guardar los nombres de los archivos subidos
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

// Endpoint para obtener todos los reportes desde MongoDB
app.get('/api/reportes', async (req, res) => {
  try {
    const reportes = await db.obtenerReportes();
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Endpoint para actualizar prioridad y/o estado de un reporte
app.patch('/api/reportes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body; // { prioridad, status }
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

// Endpoint para eliminar un reporte
app.delete('/api/reportes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Usar el método del módulo db para eliminar (debe aceptar id personalizado o _id)
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

// Endpoint para registrar un usuario
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

// Endpoint para login de usuario
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

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});