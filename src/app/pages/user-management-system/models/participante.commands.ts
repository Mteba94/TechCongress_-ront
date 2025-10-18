export interface CreateParticipanteCommand {
    pnombre: string;
    snombre?: string | null;
    papellido: string;
    sapellido?: string | null;
    tipoParticipanteId: number;
    email: string;
    telefono?: string;
    fechaNacimiento?: string;
    tipoIdentificacionId: number;
    numeroIdentificacion?: string;
    schoolId?: number | null;
    schoolName?: string | null;
    nivelAcademicoId?: number;
    semestre?: number | null;
    password?: string;
}

export interface UpdateParticipanteCommand {
    participanteId: number;
    pnombre: string;
    snombre?: string | null;
    papellido: string;
    sapellido?: string | null;
    tipoParticipanteId: number;
    email: string;
    telefono?: string;
    fechaNacimiento?: string;
    tipoIdentificacionId: number;
    numeroIdentificacion?: string;
    schoolId?: number | null;
    schoolName?: string | null;
    nivelAcademicoId?: number;
    semestre?: number | null;
}