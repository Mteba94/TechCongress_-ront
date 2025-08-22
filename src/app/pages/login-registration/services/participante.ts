import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ParticipanteRequest } from '../models/participante-req.interface';
import { map, Observable } from 'rxjs';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { environment as env } from '../../../../environments/environment.development';
import { endpoint } from '../../../shared/utils/endpoints.util';

@Injectable({
  providedIn: 'root'
})
export class Participante {
  private readonly httpClient = inject(HttpClient)

  PostCreate(request: ParticipanteRequest): Observable<BaseApiResponse<boolean>>{
    const requestUrl = `${env.api}${endpoint.CREATE_PARTICIPANTE}`;

    return this.httpClient.post<BaseApiResponse<boolean>>(requestUrl, request).pipe(
      map((response: BaseApiResponse<boolean>) => {
        return response;
      })
    )
  }
}
