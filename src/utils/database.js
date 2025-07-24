import { MongoClient, Db, Collection } from 'mongodb';

export interface ReportData {
  id: string;
  timestamp: string;
  email: string;
  telefono: string;
  departamento: string[];
  quienReporta: string;
  descripcion: string;
  prioridad: string;
  tipoProblema: string;
  imagenes: string[];
  status: 'Pendiente' | 'En Proceso' | 'Resuelto';
}

class DatabaseService {
  private readonly DB_NAME = 'Montemorelos';
  private readonly COLLECTION_NAME = 'reportes';
  private readonly MONGO_URI = 'mongodb+srv://RobertoCarlos:9sXvNyenlCepWq7n@almacenmultinacional.3zwaw.mongodb.net/?retryWrites=true&w=majority';
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection<ReportData> | null = null;

  private async conectar() {
    if (this.client && this.db && this.collection) return;
    this.client = new MongoClient(this.MONGO_URI);
    await this.client.connect();
    this.db = this.client.db(this.DB_NAME);
    this.collection = this.db.collection<ReportData>(this.COLLECTION_NAME);
    console.log(`Conectado a MongoDB Atlas: DB=${this.DB_NAME}, Collection=${this.COLLECTION_NAME}`);
  }

  async guardarReporte(reporte: ReportData): Promise<boolean> {
    try {
      await this.conectar();
      if (!this.collection) throw new Error('No hay colección de MongoDB');
      await this.collection.insertOne(reporte);
      return true;
    } catch (error) {
      console.error('Error al guardar reporte:', error);
      return false;
    }
  }

  async obtenerReportes(): Promise<ReportData[]> {
    await this.conectar();
    if (!this.collection) return [];
    return this.collection.find().sort({ timestamp: -1 }).toArray();
  }

  async actualizarReporte(id: string, update: Partial<ReportData>): Promise<boolean> {
    await this.conectar();
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
    const departamentos = new Map<string, number>();
    reportes.forEach(reporte => {
      reporte.departamento.forEach(dept => {
        departamentos.set(dept, (departamentos.get(dept) || 0) + 1);
      });
    });
    return Array.from(departamentos.entries()).map(([name, count]) => ({
      name,
      reportes: count
    }));
  }
}

export const db = new DatabaseService();
