export interface Activity {
  id: string;
  category: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  instructor: string;
  instructorBio: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  location: string;
  capacity: number;
  enrolled: number;
  learningObjectives?: string[];
  prerequisites?: string;
  materials?: string[];
  conflictingActivities?: string[];
}

export interface ActividadResponse {
  actividadId: number;
  congresoId: number;
  titulo: string;
  descripcion: string;
  descripcionTotal: string;
  tipoActividadId: number;
  fechaActividad: string;
  horaInicio: string;
  horaFin: string;
  cuposDisponibles: number;
  cuposTotales: number;
  ubicacion?: string | null;
  requisitosPrevios?: string | null;
  nivelDificultadId: number;
  imagen?: string | null;
  estado: number;
  estadoDescripcion?: string | null;
}