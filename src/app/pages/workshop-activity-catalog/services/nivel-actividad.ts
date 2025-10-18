import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { nivelActividadResponse } from '../models/nivel-actividad.interface';
import { environment as env } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class NivelActividad {
  private readonly httpClient = inject(HttpClient);

  getAllNivelActividad(): Observable<BaseApiResponse<nivelActividadResponse[]>> {
    const requestUrl = `${env.api}${endpoint.LIST_NIVEL_ACTIVIDAD}?download=true`;
      
    return this.httpClient
      .get<BaseApiResponse<nivelActividadResponse[]>>(requestUrl)
      .pipe(
        map((resp) => {
          return resp
        })
      )
  }
}
