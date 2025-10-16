import { PonenteResponse } from '../../homepage/models/ponente-response.interface';
import { ActividadResponse } from '../models/actividad-req.interface';
import { Activity } from '../models/activity.interface';

export function mapActividadResponseToActivity(
  response: ActividadResponse,
  categories: Map<number, string>,
  ponenteMap: Map<number, PonenteResponse>,
  actividadPonenteMap: Map<number, number>,
  nivelActividadMap: Map<number, string>,
  objetivoActividadMap: Map<number, string[]>,
  materialActividadMap: Map<number, string[]>
  ): Activity {
    
  const enrolled = response.cuposTotales - response.cuposDisponibles;

  const fecha = response.fechaActividad.split('T')[0];
  const horaInicio = response.horaInicio.split('T')[1];
  const horaFin = response.horaFin.split('T')[1];

  const startDateTime = new Date(`${fecha}T${horaInicio}`);
  const endDateTime = new Date(`${fecha}T${horaFin}`);

  // Helper to calculate duration
  const calculateDuration = (start: Date, end: Date): string => {
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'N/A';
    }
    const diffMinutes = (end.getTime() - start.getTime()) / 60000;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const mapDifficulty = (difficultyId: number): 'beginner' | 'intermediate' | 'advanced' => {
    switch (difficultyId) {
      case 1:
        return 'beginner';
      case 2:
        return 'intermediate';
      case 3:
        return 'advanced';
      default:
        return 'beginner';
    }
  };

  const ponenteId = actividadPonenteMap.get(response.actividadId);
  const ponente = ponenteId ? ponenteMap.get(ponenteId) : undefined;

  return {
    id: response.actividadId,
    title: response.titulo,
    description: response.descripcion,
    fullDescription: response.descripcionTotal,
    image: response.imagen || 'path/to/default/image.png',
    category: categories.get(response.tipoActividadId) || `Category ${response.tipoActividadId}`,
    difficulty: mapDifficulty(response.nivelDificultadId),
    prerequisites: response.requisitosPrevios || undefined,
    instructor: ponente ? `${ponente.nombrePonente} ${ponente.apellidoPonente}` : 'Instructor por definir',
    instructorBio: ponente ? ponente.bioPonente : 'Biografía por definir',
    date: startDateTime.toLocaleDateString(),
    startTime: startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    endTime: endDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    duration: calculateDuration(startDateTime, endDateTime),
    location: response.ubicacion || 'Ubicación por definir',
    capacity: response.cuposTotales,
    enrolled: enrolled,
    code: `ACT-${response.actividadId}`,
    learningObjectives: objetivoActividadMap.get(response.actividadId) || [],
    materials: materialActividadMap.get(response.actividadId) || [],
    conflictingActivities: [],
  };
}