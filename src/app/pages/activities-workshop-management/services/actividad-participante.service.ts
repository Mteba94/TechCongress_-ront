import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment as env } from '../../../../environments/environment.development';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';

// Interface for the participant data provided by the user
export interface ActivityParticipant {
  inscripcionId: number;
  userId: number;
  userName: string;
  userEmail: string;
  fechaInscripcion: string;
  puntaje: number;
  esGanador: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ActividadParticipanteService {
  private readonly httpClient = inject(HttpClient);

  /**
   * Fetches the list of participants for a specific activity.
   * @param actividadId The ID of the activity.
   * @returns An observable with the list of participants.
   */
  getParticipantsByActivityId(actividadId: number): Observable<BaseApiResponse<ActivityParticipant[]>> {
    const requestUrl = `${env.api}${endpoint.PARTICIPANTS_BY_ACTIVIDAD}${actividadId}/Participants`;
    return this.httpClient.get<BaseApiResponse<ActivityParticipant[]>>(requestUrl);
  }
}
