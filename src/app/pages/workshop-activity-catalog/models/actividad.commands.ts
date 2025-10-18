export interface CreateActividadCommand {
    CongresoId: number;
    Titulo: string;
    Descripcion: string;
    DescripcionTotal: string;
    TipoActividadId: number;
    Fecha: string;
    HoraInicio: string;
    HoraFin: string;
    CuposTotal: number;
    Ubicacion: string;
    Requisitos: string;
    NivelDificultadId: number;
    Imagen: File;
    ActividadPonente: string;
    ObjetivosActividad: string;
    MaterialesActividad: string;
}

export interface UpdateActividadCommand {
    actividadId: number;
    titulo: string;
    descripcion: string;
    descripcionTotal: string;
    tipoActividadId: number;
    fechaActividad: string;
    horaInicio: string;
    horaFin: string;
    cuposTotales: number;
    ubicacion: string;
    requisitosPrevios: string;
    nivelDificultadId: number;
    imagen?: string;
    orden?: number;
    permitirInscripcion?: number;
    estado?: number;
    ponentes?: number[];
    objetivos?: string[];
    materiales?: string[];
}