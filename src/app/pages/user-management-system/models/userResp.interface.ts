export interface User {
  userId: number | string;
  pnombre: string;
  snombre?: string | null;
  papellido: string;
  sapellido?: string | null;
  name: string;
  tipoParticipanteId: number;
  tipoParticipanteDescripcion?: string | null;
  email: string;
  telefono?: string;
  role: string;
  estado: number;
  estadoDescripcion: string;
  school?: string | null;
  schoolId?: string | null;
  institution?: string;
  nivelAcademico?: number;
  nivelAcademicoId?: number;
  grade?: string | null;
  activitiesCount?: number;
  certificatesCount?: number;
  registrationDate?: string;
  lastLogin?: string | null;
  autogen?: string | null;
}

export interface UserApi {
  userId: number;
  pnombre: string;
  snombre?: string | null;
  papellido: string;
  sapellido?: string | null;
  tipoParticipanteId: number;
  tipoParticipanteDescripcion?: string | null;
  email: string;
  telefono?: string | null;
  fechaNacimiento: string; 
  tipoIdentificacionId: number;
  tipoIdentificacionDescripcion?: string | null;
  nivelAcademico?: number;
  semestre?: number;
  numeroIdentificacion?: string | null;
  estado: number;
  estadoDescripcion?: string | null;
  school?: number | null;
}


export interface InscriptionByUser{
  userId: number;
  inscriptionsCount: number;
}

export interface CertificatesByUser{
  userId: number;
  certificateCount: number;
}

export interface UserSummary{
  userId: number;
  userName: string;
  inscriptionsCount: number;
  certificatesCount: number;
}