export interface PonenteResponse {
    ponenteId: number,
    nombrePonente: string,
    apellidoPonente: string,
    tituloPonente: string,
    empresaPonente: string,
    bioPonente: string,
    imagePonente: string,
    estado: number,
    estadoDescripcion: string
}

export interface SpeakerInterface {
  id: number;
  name: string;
  title: string;
  company: string;
  image: string | null;
  expertise: string[];
  bio: string;
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    dribbble?: string;
  };

}