export interface InscripcionRequest {
    idUsuario: number;
    idActividad: number;
}

export interface DiplomaReq{
    inscripcionId: number;
    nombrePersonalizado?: string;
}