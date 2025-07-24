import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

class DatabaseService {
  constructor() {
    this.DB_NAME_REPORTES = 'Montemorelos';
    this.DB_NAME_INTERNOS = 'Internos';
    this.COLLECTION_NAME = 'reportes';
    this.USERS_COLLECTION = 'usuarios';
    this.MONGO_URI = 'mongodb+srv://RobertoCarlos:9sXvNyenlCepWq7n@almacenmultinacional.3zwaw.mongodb.net/?retryWrites=true&w=majority';
    this.client = null;
    this.dbReportes = null;
    this.dbInternos = null;
    this.collection = null;
    this.usersCollection = null;
  }

  async conectarReportes() {
    if (this.client && this.dbReportes && this.collection && this.client.topology?.isConnected()) {
      return;
    }
    if (!this.client) {
      this.client = new MongoClient(this.MONGO_URI);
      await this.client.connect();
    } else if (!this.client.topology?.isConnected()) {
      await this.client.connect();
    }
    if (!this.dbReportes) {
      this.dbReportes = this.client.db(this.DB_NAME_REPORTES);
    }
    if (!this.collection) {
      this.collection = this.dbReportes.collection(this.COLLECTION_NAME);
    }
    console.log(`Conectado a MongoDB Atlas: DB=${this.DB_NAME_REPORTES}, Collection=${this.COLLECTION_NAME}`);
  }

  async conectarInternos() {
    if (this.client && this.dbInternos && this.usersCollection && this.client.topology?.isConnected()) {
      return;
    }
    if (!this.client) {
      this.client = new MongoClient(this.MONGO_URI);
      await this.client.connect();
    } else if (!this.client.topology?.isConnected()) {
      await this.client.connect();
    }
    if (!this.dbInternos) {
      this.dbInternos = this.client.db(this.DB_NAME_INTERNOS);
    }
    if (!this.usersCollection) {
      this.usersCollection = this.dbInternos.collection(this.USERS_COLLECTION);
    }
    console.log(`Conectado a MongoDB Atlas: DB=${this.DB_NAME_INTERNOS}, Collection=${this.USERS_COLLECTION}`);
  }

  async guardarReporte(reporte) {
    try {
      await this.conectarReportes();
      if (!this.collection) throw new Error('No hay colección de MongoDB');
      const result = await this.collection.insertOne(reporte);
      return result.acknowledged;
    } catch (error) {
      console.error('Error al guardar reporte:', error);
      return false;
    }
  }

  async obtenerReportes() {
    try {
      await this.conectarReportes();
      if (!this.collection) return [];
      return await this.collection.find().sort({ timestamp: -1 }).toArray();
    } catch (error) {
      console.error('Error al obtener reportes:', error);
      return [];
    }
  }

  async actualizarReporte(id, update) {
    try {
      await this.conectarReportes();
      if (!this.collection) return false;
      const result = await this.collection.updateOne({ id }, { $set: update });
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error al actualizar reporte:', error);
      return false;
    }
  }

  async obtenerEstadisticas() {
    try {
      const reportes = await this.obtenerReportes();
      const total = reportes.length;
      const pendientes = reportes.filter(r => r.status === 'Pendiente').length;
      const enProceso = reportes.filter(r => r.status === 'En Proceso').length;
      const resueltos = reportes.filter(r => r.status === 'Resuelto').length;
      return {
        total,
        pendientes,
        enProceso,
        resueltos,
        porcentajeResolucion: total > 0 ? Math.round((resueltos / total) * 100) : 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        total: 0,
        pendientes: 0,
        enProceso: 0,
        resueltos: 0,
        porcentajeResolucion: 0
      };
    }
  }

  async obtenerReportesPorDepartamento() {
    try {
      const reportes = await this.obtenerReportes();
      const departamentos = new Map();
      reportes.forEach(reporte => {
        const depts = Array.isArray(reporte.departamento) ? reporte.departamento : 
                      (typeof reporte.departamento === 'string' ? [reporte.departamento] : []);

        depts.forEach(dept => {
          if (dept) {
            departamentos.set(dept, (departamentos.get(dept) || 0) + 1);
          }
        });
      });
      return Array.from(departamentos.entries()).map(([name, count]) => ({
        name,
        reportes: count
      }));
    } catch (error) {
      console.error('Error al obtener reportes por departamento:', error);
      return [];
    }
  }

  async registrarUsuario({ nombre, email, password, rol }) {
    try {
      await this.conectarInternos();
      if (!this.usersCollection) throw new Error('No hay colección de usuarios');
      
      const existente = await this.usersCollection.findOne({ email });
      if (existente) {
        throw new new Error('El usuario ya existe'); // Fix: 'new new Error' to 'new Error'
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const usuario = { nombre, email, password: hashedPassword, rol };
      const result = await this.usersCollection.insertOne(usuario);
      
      if (result.acknowledged) {
        const { password: _, ...usuarioSinPassword } = usuario;
        return { success: true, user: usuarioSinPassword };
      } else {
        throw new Error('Error al insertar el usuario');
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      return { success: false, message: error.message };
    }
  }

  async autenticarUsuario({ email, password }) {
    try {
      await this.conectarInternos();
      if (!this.usersCollection) throw new Error('No hay colección de usuarios');
      
      const usuario = await this.usersCollection.findOne({ email });
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
      
      const passwordValida = await bcrypt.compare(password, usuario.password);
      if (!passwordValida) {
        throw new Error('Contraseña incorrecta');
      }
      
      const { password: _, ...usuarioSinPassword } = usuario;
      return { success: true, user: usuarioSinPassword };
    } catch (error) {
      console.error('Error al autenticar usuario:', error);
      return { success: false, message: error.message };
    }
  }

  async close() {
    if (this.client && this.client.topology?.isConnected()) {
      await this.client.close();
      this.client = null;
      this.dbReportes = null;
      this.dbInternos = null;
      this.collection = null;
      this.usersCollection = null;
      console.log('Conexión a MongoDB cerrada.');
    }
  }
}

// Para usar con 'import', el 'exports.db' debe cambiarse a 'export const db'
export const db = new DatabaseService(); 
