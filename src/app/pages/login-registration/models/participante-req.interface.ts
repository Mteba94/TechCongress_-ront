export interface ParticipanteRequest{
    pNombre: string,
    sNombre: string,
    pApellido: string,
    sApellido: string,
    tipoParticipanteId: number,
    email: string,
    telefono: string,
    fechaNacimiento: Date,
    tipoIdentificacionId: number,
    numeroIdentificacion: string,
    nivelAcademicoId: number,
    semestre: number,
    password: string,
    schoolId: number,
    schoolName: string
}