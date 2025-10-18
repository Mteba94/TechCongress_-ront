import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { environment as env } from '../../../../environments/environment.development';
import { ActividadPonenteResponse } from '../models/actvidadPonente.interface';

@Injectable({
  providedIn: 'root'
})
export class ActividadPonente {
  private readonly httpClient = inject(HttpClient);

  getAllActividadPonente(): Observable<BaseApiResponse<ActividadPonenteResponse[]>> {
    const requestUrl = `${env.api}${endpoint.LIST_ACTIVIDAD_PONENTE}?download=true`;
      
    return this.httpClient
      .get<BaseApiResponse<ActividadPonenteResponse[]>>(requestUrl)
      .pipe(
        map((resp) => {
          return resp
        })
      )
  }
}
