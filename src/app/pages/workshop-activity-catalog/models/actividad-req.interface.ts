export interface ActividadResponse {
  actividadId: number;
  congresoId: number;
  titulo: string;
  descripcion: string;
  descripcionTotal: string;
  ponenteId: number;
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
  estadoActividad: string;
}