const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

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
    if (this.client && this.dbReportes && this.collection) return;
    if (!this.client) this.client = new MongoClient(this.MONGO_URI);
    if (!this.dbReportes) this.dbReportes = this.client.db(this.DB_NAME_REPORTES);
    if (!this.collection) this.collection = this.dbReportes.collection(this.COLLECTION_NAME);
    if (!this.client.topology?.isConnected()) await this.client.connect();
    console.log(`Conectado a MongoDB Atlas: DB=${this.DB_NAME_REPORTES}, Collection=${this.COLLECTION_NAME}`);
  }

  async conectarInternos() {
    if (this.client && this.dbInternos && this.usersCollection) return;
    if (!this.client) this.client = new MongoClient(this.MONGO_URI);
    if (!this.dbInternos) this.dbInternos = this.client.db(this.DB_NAME_INTERNOS);
    if (!this.usersCollection) this.usersCollection = this.dbInternos.collection(this.USERS_COLLECTION);
    if (!this.client.topology?.isConnected()) await this.client.connect();
    console.log(`Conectado a MongoDB Atlas: DB=${this.DB_NAME_INTERNOS}, Collection=${this.USERS_COLLECTION}`);
  }

  async guardarReporte(reporte) {
    try {
      await this.conectarReportes();
      if (!this.collection) throw new Error('No hay colección de MongoDB');
      await this.collection.insertOne(reporte);
      return true;
    } catch (error) {
      console.error('Error al guardar reporte:', error);
      return false;
    }
  }

  async obtenerReportes() {
    await this.conectarReportes();
    if (!this.collection) return [];
    return this.collection.find().sort({ timestamp: -1 }).toArray();
  }

  async actualizarReporte(id, update) {
    await this.conectarReportes();
    if (!this.collection) return false;
    const result = await this.collection.updateOne({ id }, { $set: update });
    return result.modifiedCount > 0;
  }

  async obtenerEstadisticas() {
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
  }

  async obtenerReportesPorDepartamento() {
    const reportes = await this.obtenerReportes();
    const departamentos = new Map();
    reportes.forEach(reporte => {
      (reporte.departamento || []).forEach(dept => {
        departamentos.set(dept, (departamentos.get(dept) || 0) + 1);
      });
    });
    return Array.from(departamentos.entries()).map(([name, count]) => ({
      name,
      reportes: count
    }));
  }

  async registrarUsuario({ nombre, email, password, rol }) {
    await this.conectarInternos();
    if (!this.usersCollection) throw new Error('No hay colección de usuarios');
    const existente = await this.usersCollection.findOne({ email });
    if (existente) throw new Error('El usuario ya existe');
    const hashedPassword = await bcrypt.hash(password, 10);
    const usuario = { nombre, email, password: hashedPassword, rol };
    await this.usersCollection.insertOne(usuario);
    const { password: _, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }

  async autenticarUsuario({ email, password }) {
    await this.conectarInternos();
    if (!this.usersCollection) throw new Error('No hay colección de usuarios');
    const usuario = await this.usersCollection.findOne({ email });
    if (!usuario) throw new Error('Usuario no encontrado');
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) throw new Error('Contraseña incorrecta');
    const { password: _, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }
}

exports.db = new DatabaseService();
